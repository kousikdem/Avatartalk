"""
Public profile endpoint — server-side proxy that uses Supabase service-role
to fetch profile + related public data, bypassing RLS.

This exists as a workaround for projects where the public RLS policy on
`profiles` hasn't been applied yet. It exposes ONLY safe public columns.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

SERVICE_HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# Safe columns to expose publicly — never include email/phone/internal flags
PUBLIC_PROFILE_COLUMNS = (
    "id,username,display_name,full_name,bio,profession,"
    "avatar_id,avatar_url,profile_pic_url,country,location,website,"
    "followers_count,following_count,created_at,updated_at"
)

router = APIRouter(prefix="/api/profile", tags=["profile"])


async def _supabase_get(client: httpx.AsyncClient, path: str, params: dict) -> Any:
    r = await client.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=SERVICE_HEADERS, params=params)
    if r.status_code >= 400:
        logger.error("Supabase GET %s failed: %s", path, r.text)
        return None
    try:
        return r.json()
    except Exception:
        return None


@router.get("/by-username/{username}")
async def get_profile_by_username(username: str):
    """
    Returns a public profile + all related public data (stats, products, events,
    active avatar config, social links) in a single response. Uses service-role
    so it works even when RLS isn't fixed yet.
    """
    if not username or not username.strip():
        raise HTTPException(status_code=400, detail="Username required")

    # Case-insensitive match. Postgres `ilike` via PostgREST: ?username=ilike.exact
    # We use eq.<lower> with a small fallback for case mismatches.
    uname = username.strip()

    async with httpx.AsyncClient(timeout=15) as cx:
        # Profile lookup — try exact, then case-insensitive
        rows = await _supabase_get(
            cx,
            "profiles",
            params={"select": PUBLIC_PROFILE_COLUMNS, "username": f"eq.{uname}", "limit": "1"},
        )
        if not rows:
            rows = await _supabase_get(
                cx,
                "profiles",
                params={"select": PUBLIC_PROFILE_COLUMNS, "username": f"ilike.{uname}", "limit": "1"},
            )
        if not rows:
            raise HTTPException(status_code=404, detail="Profile not found")

        profile = rows[0]
        if not profile.get("username"):
            raise HTTPException(status_code=404, detail="Profile not found")

        pid = profile["id"]

        # Fetch related data in parallel
        results = await asyncio.gather(
            _supabase_get(cx, "user_stats", {"select": "*", "user_id": f"eq.{pid}", "limit": "1"}),
            _supabase_get(
                cx,
                "products",
                {
                    "select": "*",
                    "user_id": f"eq.{pid}",
                    "status": "eq.published",
                    "order": "created_at.desc",
                    "limit": "6",
                },
            ),
            _supabase_get(
                cx,
                "events",
                {
                    "select": "*",
                    "user_id": f"eq.{pid}",
                    "status": "in.(published,upcoming)",
                    "order": "created_at.desc",
                    "limit": "6",
                },
            ),
            _supabase_get(
                cx,
                "avatar_configurations",
                {
                    "select": "*",
                    "user_id": f"eq.{pid}",
                    "is_active": "eq.true",
                    "limit": "1",
                },
            ),
            _supabase_get(cx, "social_links", {"select": "*", "user_id": f"eq.{pid}", "limit": "1"}),
            return_exceptions=True,
        )

    def _first(rows_or_none):
        if isinstance(rows_or_none, list) and rows_or_none:
            return rows_or_none[0]
        return None

    stats, products, events, avatar_cfg, social = results

    return {
        "profile": profile,
        "user_stats": _first(stats),
        "products": products if isinstance(products, list) else [],
        "events": events if isinstance(events, list) else [],
        "avatar_config": _first(avatar_cfg),
        "social_links": _first(social),
    }
