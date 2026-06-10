"""
Public profile endpoint — server-side proxy that uses Supabase service-role
to fetch profile + related public data, bypassing RLS.

This exists as a workaround for projects where the public RLS policy on
`profiles` hasn't been applied yet. It exposes ONLY safe public columns.

Now includes an in-memory TTL cache (60s) so popular profile pages
(SEO crawlers, viral links, repeat visits) hit Supabase at most once
per minute.
"""
from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Any, Dict, Tuple

import httpx
from fastapi import APIRouter, HTTPException, Response

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

# ─── In-memory TTL cache ──────────────────────────────────────────────────
# key: lowercased username  → (expires_at_epoch, payload)
_CACHE: Dict[str, Tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = 60.0  # 1 min — long enough to absorb traffic spikes,
                           # short enough that profile edits feel fresh.

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


def _cache_get(key: str) -> dict | None:
    entry = _CACHE.get(key)
    if not entry:
        return None
    expires_at, payload = entry
    if time.time() > expires_at:
        _CACHE.pop(key, None)
        return None
    return payload


def _cache_set(key: str, payload: dict) -> None:
    _CACHE[key] = (time.time() + _CACHE_TTL_SECONDS, payload)
    # Best-effort eviction if cache grows unbounded.
    if len(_CACHE) > 500:
        # Drop the 100 oldest entries.
        for k in sorted(_CACHE.items(), key=lambda kv: kv[1][0])[:100]:
            _CACHE.pop(k[0], None)


@router.get("/by-username/{username}")
async def get_profile_by_username(username: str, response: Response):
    """
    Returns a public profile + all related public data (stats, products, events,
    active avatar config, social links) in a single response. Uses service-role
    so it works even when RLS isn't fixed yet.

    Cached in-memory for 60s per username to make repeat loads instant.
    """
    if not username or not username.strip():
        raise HTTPException(status_code=400, detail="Username required")

    uname = username.strip()
    cache_key = uname.lower()

    # Cache hit ⇒ instant response.
    cached = _cache_get(cache_key)
    if cached is not None:
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=60"
        return cached

    async with httpx.AsyncClient(timeout=15) as cx:
        # Profile lookup — try exact (fast), then case-insensitive (slower).
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

        # Fetch ALL related data in parallel — single round-trip.
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

    payload = {
        "profile": profile,
        "user_stats": _first(stats),
        "products": products if isinstance(products, list) else [],
        "events": events if isinstance(events, list) else [],
        "avatar_config": _first(avatar_cfg),
        "social_links": _first(social),
    }

    _cache_set(cache_key, payload)
    response.headers["X-Cache"] = "MISS"
    response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=60"
    return payload
