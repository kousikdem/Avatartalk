"""
Razorpay Subscriptions + UPI Autopay integration.

Endpoints:
  POST /api/subscription/ensure-plans          → admin: create Razorpay Plans for all paid platform plans (idempotent)
  POST /api/subscription/create                → create a Razorpay Subscription for the current user & given platform plan_key + optional payment_method="upi"
  POST /api/subscription/verify                → server-side verify the authentication payment signature after checkout
  POST /api/subscription/cancel                → cancel current user's active subscription
  POST /api/subscription/pause                 → pause
  POST /api/subscription/resume                → resume
  GET  /api/subscription/status                → current user's active subscription details (next charge, method, etc)
  POST /api/subscription/webhook               → single webhook endpoint for all subscription.* + payment.* events
                                                 verifies X-Razorpay-Signature using RAZORPAY_WEBHOOK_SECRET
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
import razorpay
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel

logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", SUPABASE_SERVICE_ROLE_KEY)

_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID else None

SERVICE_HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# Plan tokens per month (must stay in sync with payment_routes)
PLAN_TOKENS_PER_MONTH = {
    "free": 10_000,
    "creator": 1_000_000,
    "pro": 2_000_000,
    "business": 5_000_000,
}
# Fallback prices (INR) used only when platform_pricing_plans row is missing.
FALLBACK_PLAN_PRICE_INR = {
    "creator": 999,
    "pro": 1999,
    "business": 4999,
}

router = APIRouter(prefix="/api/subscription", tags=["subscription"])


# ─── helpers ────────────────────────────────────────────────────────────────
def _require_razorpay():
    if not _client or not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Razorpay is not configured on the server")


async def _get_user_from_token(authorization: Optional[str]) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.split(" ", 1)[1].strip()
    async with httpx.AsyncClient(timeout=10) as cx:
        r = await cx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return r.json()


async def _sb_get(path: str, params: Optional[dict] = None) -> Any:
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=SERVICE_HEADERS, params=params or {})
    if r.status_code >= 400:
        logger.error("SB GET %s failed (%s): %s", path, r.status_code, r.text[:200])
        return None
    try:
        return r.json()
    except Exception:
        return None


async def _sb_post(path: str, body: Any) -> Any:
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.post(f"{SUPABASE_URL}/rest/v1/{path}", headers=SERVICE_HEADERS, json=body)
    if r.status_code >= 400:
        logger.error("SB POST %s failed (%s): %s", path, r.status_code, r.text[:300])
        raise HTTPException(status_code=500, detail=f"Supabase write failed: {r.text[:200]}")
    return r.json() if r.text else None


async def _sb_patch(path: str, params: dict, body: dict) -> Any:
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.patch(f"{SUPABASE_URL}/rest/v1/{path}", headers=SERVICE_HEADERS, params=params, json=body)
    if r.status_code >= 400:
        logger.error("SB PATCH %s failed (%s): %s", path, r.status_code, r.text[:300])
        raise HTTPException(status_code=500, detail=f"Supabase update failed: {r.text[:200]}")
    return r.json() if r.text else None


async def _get_platform_plan(plan_key: str) -> Optional[dict]:
    rows = await _sb_get(
        "platform_pricing_plans",
        {"select": "id,plan_key,plan_name,price_inr,razorpay_plan_id,razorpay_plan_id_upi", "plan_key": f"eq.{plan_key}", "limit": 1},
    )
    return rows[0] if rows else None


# ─── ensure Razorpay Plans exist (idempotent) ──────────────────────────────
class EnsurePlansBody(BaseModel):
    """Optional overrides — otherwise pulls prices from platform_pricing_plans."""
    prices: Optional[dict] = None  # {"creator": 999, "pro": 1999, "business": 4999}


@router.post("/ensure-plans")
async def ensure_plans(body: EnsurePlansBody = EnsurePlansBody(), x_admin_key: Optional[str] = Header(None)):
    """Create Razorpay Plans (card + UPI) for creator/pro/business if missing."""
    if not x_admin_key or x_admin_key != SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    _require_razorpay()

    prices = body.prices or {}
    results = []

    for plan_key in ("creator", "pro", "business"):
        row = await _get_platform_plan(plan_key)
        price_inr = int(prices.get(plan_key) or (row.get("price_inr") if row else None) or FALLBACK_PLAN_PRICE_INR[plan_key])

        needs_card = not (row and row.get("razorpay_plan_id"))
        needs_upi = not (row and row.get("razorpay_plan_id_upi"))
        update: dict = {}

        if needs_card:
            try:
                created = _client.plan.create({
                    "period": "monthly",
                    "interval": 1,
                    "item": {
                        "name": f"AvatarTalk {plan_key.title()} Monthly",
                        "amount": price_inr * 100,
                        "currency": "INR",
                        "description": f"Monthly {plan_key.title()} plan — {PLAN_TOKENS_PER_MONTH[plan_key]:,} tokens/mo",
                    },
                    "notes": {"platform_plan_key": plan_key, "method": "card"},
                })
                update["razorpay_plan_id"] = created["id"]
                logger.info("Razorpay card plan created for %s → %s", plan_key, created["id"])
            except Exception as e:
                logger.exception("Failed to create card plan for %s", plan_key)
                results.append({"plan_key": plan_key, "type": "card", "error": str(e)[:200]})

        if needs_upi:
            try:
                created = _client.plan.create({
                    "period": "monthly",
                    "interval": 1,
                    "item": {
                        "name": f"AvatarTalk {plan_key.title()} Monthly (UPI Autopay)",
                        "amount": price_inr * 100,
                        "currency": "INR",
                        "description": f"UPI Autopay {plan_key.title()} — {PLAN_TOKENS_PER_MONTH[plan_key]:,} tokens/mo",
                    },
                    "notes": {"platform_plan_key": plan_key, "method": "upi"},
                })
                update["razorpay_plan_id_upi"] = created["id"]
                logger.info("Razorpay UPI plan created for %s → %s", plan_key, created["id"])
            except Exception as e:
                logger.exception("Failed to create UPI plan for %s", plan_key)
                results.append({"plan_key": plan_key, "type": "upi", "error": str(e)[:200]})

        if update and row:
            await _sb_patch("platform_pricing_plans", {"id": f"eq.{row['id']}"}, update)

        results.append({
            "plan_key": plan_key,
            "price_inr": price_inr,
            "razorpay_plan_id": (update.get("razorpay_plan_id") or (row.get("razorpay_plan_id") if row else None)),
            "razorpay_plan_id_upi": (update.get("razorpay_plan_id_upi") or (row.get("razorpay_plan_id_upi") if row else None)),
        })

    return {"success": True, "plans": results}


# ─── Create subscription ────────────────────────────────────────────────────
class CreateSubBody(BaseModel):
    plan_key: str  # creator | pro | business
    payment_method: str = "card"  # card | upi
    total_count: int = 12  # months to bill (Razorpay requires a total_count; use 12 for annual, 60 for 5-year "ongoing")
    notify_customer: bool = True


@router.post("/create")
async def create_subscription(body: CreateSubBody, authorization: Optional[str] = Header(None)):
    _require_razorpay()
    user = await _get_user_from_token(authorization)
    user_id = user["id"]

    if body.plan_key not in ("creator", "pro", "business"):
        raise HTTPException(status_code=400, detail="Invalid plan_key")

    row = await _get_platform_plan(body.plan_key)
    if not row:
        raise HTTPException(status_code=404, detail=f"Platform plan '{body.plan_key}' not found")

    method = "upi" if body.payment_method.lower() == "upi" else "card"
    rp_plan_id = row.get("razorpay_plan_id_upi") if method == "upi" else row.get("razorpay_plan_id")
    if not rp_plan_id:
        raise HTTPException(
            status_code=503,
            detail=f"Razorpay {method} plan not created yet — admin must call POST /api/subscription/ensure-plans first",
        )

    try:
        sub = _client.subscription.create({
            "plan_id": rp_plan_id,
            "total_count": int(body.total_count),
            "quantity": 1,
            "customer_notify": 1 if body.notify_customer else 0,
            "notes": {
                "user_id": user_id,
                "platform_plan_key": body.plan_key,
                "method": method,
            },
        })
    except Exception as e:
        msg = str(e)
        # Detect Razorpay auth failures gracefully
        if "Authentication failed" in msg or "BAD_REQUEST_ERROR" in msg:
            raise HTTPException(status_code=502, detail="Razorpay authentication failed — please re-check RAZORPAY_KEY_ID / KEY_SECRET")
        logger.exception("subscription.create failed")
        raise HTTPException(status_code=502, detail=f"Razorpay error: {msg[:200]}")

    # Persist locally (idempotent — insert new row; webhook will update status)
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "platform_plan_key": body.plan_key,
        "razorpay_subscription_id": sub["id"],
        "razorpay_plan_id": rp_plan_id,
        "payment_method": method,
        "status": sub.get("status", "created"),
        "total_count": int(body.total_count),
        "paid_count": sub.get("paid_count", 0),
        "current_start": sub.get("current_start"),
        "current_end": sub.get("current_end"),
        "short_url": sub.get("short_url"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await _sb_post("razorpay_subscriptions", record)
    except HTTPException as e:
        logger.warning("Could not persist subscription %s: %s", sub["id"], e.detail)

    return {
        "success": True,
        "subscription_id": sub["id"],
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "short_url": sub.get("short_url"),
        "status": sub.get("status"),
        "method": method,
        "plan_key": body.plan_key,
    }


# ─── Verify authentication payment (client-side signature) ──────────────────
class VerifyBody(BaseModel):
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str


@router.post("/verify")
async def verify_subscription_payment(body: VerifyBody, authorization: Optional[str] = Header(None)):
    """After Razorpay checkout completes for a subscription, the frontend receives
    razorpay_payment_id, razorpay_subscription_id, razorpay_signature.
    Verify HMAC-SHA256(payment_id + '|' + subscription_id) == signature.
    """
    _require_razorpay()
    user = await _get_user_from_token(authorization)
    user_id = user["id"]

    payload = f"{body.razorpay_payment_id}|{body.razorpay_subscription_id}"
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, body.razorpay_signature):
        logger.warning("Signature mismatch for sub %s (user %s)", body.razorpay_subscription_id, user_id)
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Update local record
    await _sb_patch(
        "razorpay_subscriptions",
        {"razorpay_subscription_id": f"eq.{body.razorpay_subscription_id}", "user_id": f"eq.{user_id}"},
        {"status": "authenticated", "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    return {"success": True, "verified": True}


# ─── Status / Cancel / Pause / Resume ───────────────────────────────────────
@router.get("/status")
async def status(authorization: Optional[str] = Header(None)):
    user = await _get_user_from_token(authorization)
    user_id = user["id"]
    rows = await _sb_get(
        "razorpay_subscriptions",
        {
            "select": "*",
            "user_id": f"eq.{user_id}",
            "order": "created_at.desc",
            "limit": 5,
        },
    ) or []
    active = next((r for r in rows if r.get("status") in ("active", "authenticated", "pending")), None)
    return {"active": active, "history": rows}


class SubActionBody(BaseModel):
    razorpay_subscription_id: str
    cancel_at_cycle_end: bool = True  # cancel at end of paid cycle


@router.post("/cancel")
async def cancel_subscription(body: SubActionBody, authorization: Optional[str] = Header(None)):
    _require_razorpay()
    user = await _get_user_from_token(authorization)
    user_id = user["id"]

    # Verify ownership
    rows = await _sb_get(
        "razorpay_subscriptions",
        {"select": "id,user_id", "razorpay_subscription_id": f"eq.{body.razorpay_subscription_id}", "limit": 1},
    ) or []
    if not rows or rows[0].get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")

    try:
        result = _client.subscription.cancel(
            body.razorpay_subscription_id,
            {"cancel_at_cycle_end": 1 if body.cancel_at_cycle_end else 0},
        )
    except Exception as e:
        logger.exception("subscription.cancel failed")
        raise HTTPException(status_code=502, detail=f"Razorpay error: {str(e)[:200]}")

    await _sb_patch(
        "razorpay_subscriptions",
        {"razorpay_subscription_id": f"eq.{body.razorpay_subscription_id}"},
        {"status": result.get("status", "cancelled"), "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    return {"success": True, "status": result.get("status"), "cancel_at_cycle_end": body.cancel_at_cycle_end}


@router.post("/pause")
async def pause_subscription(body: SubActionBody, authorization: Optional[str] = Header(None)):
    _require_razorpay()
    user = await _get_user_from_token(authorization)
    user_id = user["id"]
    rows = await _sb_get(
        "razorpay_subscriptions",
        {"select": "id,user_id", "razorpay_subscription_id": f"eq.{body.razorpay_subscription_id}", "limit": 1},
    ) or []
    if not rows or rows[0].get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    try:
        result = _client.subscription.pause(body.razorpay_subscription_id, {"pause_at": "now"})
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Razorpay error: {str(e)[:200]}")
    await _sb_patch(
        "razorpay_subscriptions",
        {"razorpay_subscription_id": f"eq.{body.razorpay_subscription_id}"},
        {"status": result.get("status", "paused"), "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    return {"success": True, "status": result.get("status")}


@router.post("/resume")
async def resume_subscription(body: SubActionBody, authorization: Optional[str] = Header(None)):
    _require_razorpay()
    user = await _get_user_from_token(authorization)
    user_id = user["id"]
    rows = await _sb_get(
        "razorpay_subscriptions",
        {"select": "id,user_id", "razorpay_subscription_id": f"eq.{body.razorpay_subscription_id}", "limit": 1},
    ) or []
    if not rows or rows[0].get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    try:
        result = _client.subscription.resume(body.razorpay_subscription_id, {"resume_at": "now"})
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Razorpay error: {str(e)[:200]}")
    await _sb_patch(
        "razorpay_subscriptions",
        {"razorpay_subscription_id": f"eq.{body.razorpay_subscription_id}"},
        {"status": result.get("status", "active"), "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    return {"success": True, "status": result.get("status")}


# ─── Webhook (server-side verification of Razorpay events) ──────────────────
@router.post("/webhook")
async def subscription_webhook(request: Request):
    """Razorpay posts subscription.* + payment.* events here.
    We verify X-Razorpay-Signature via HMAC-SHA256(body, RAZORPAY_WEBHOOK_SECRET)."""
    raw = await request.body()
    sig = request.headers.get("x-razorpay-signature", "")

    if not RAZORPAY_WEBHOOK_SECRET:
        logger.error("RAZORPAY_WEBHOOK_SECRET not set — refusing webhook")
        raise HTTPException(status_code=503, detail="Webhook not configured")

    expected = hmac.new(RAZORPAY_WEBHOOK_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        logger.warning("Webhook signature mismatch (got %s...)", sig[:8])
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        payload = json.loads(raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("event", "")
    entity = payload.get("payload", {}) or {}
    subscription = (entity.get("subscription") or {}).get("entity") or {}
    payment = (entity.get("payment") or {}).get("entity") or {}
    sub_id = subscription.get("id") or payment.get("subscription_id")

    logger.info("Razorpay webhook: %s (sub=%s pay=%s)", event, sub_id, payment.get("id"))

    now_iso = datetime.now(timezone.utc).isoformat()

    if event.startswith("subscription."):
        status = event.split(".", 1)[1]  # activated / charged / cancelled / halted / completed / paused / resumed / authenticated
        # Normalise 'authenticated' event
        status_map = {
            "activated": "active",
            "authenticated": "authenticated",
            "charged": "active",
            "completed": "completed",
            "cancelled": "cancelled",
            "halted": "halted",
            "paused": "paused",
            "resumed": "active",
        }
        new_status = status_map.get(status, status)
        if sub_id:
            update: dict = {
                "status": new_status,
                "paid_count": subscription.get("paid_count"),
                "current_start": subscription.get("current_start"),
                "current_end": subscription.get("current_end"),
                "updated_at": now_iso,
            }
            # Strip None values
            update = {k: v for k, v in update.items() if v is not None}
            try:
                await _sb_patch(
                    "razorpay_subscriptions",
                    {"razorpay_subscription_id": f"eq.{sub_id}"},
                    update,
                )
            except HTTPException as e:
                logger.error("Failed to update sub %s: %s", sub_id, e.detail)

            # On successful charge, provision tokens + activate platform plan
            if event == "subscription.charged":
                # Look up local record → user_id + plan_key
                rows = await _sb_get(
                    "razorpay_subscriptions",
                    {"select": "user_id,platform_plan_key", "razorpay_subscription_id": f"eq.{sub_id}", "limit": 1},
                ) or []
                if rows:
                    r = rows[0]
                    user_id = r["user_id"]
                    plan_key = r["platform_plan_key"]
                    tokens = PLAN_TOKENS_PER_MONTH.get(plan_key, 0)
                    # Credit tokens via existing RPC (idempotent per payment_id)
                    try:
                        async with httpx.AsyncClient(timeout=15) as cx:
                            await cx.post(
                                f"{SUPABASE_URL}/rest/v1/rpc/credit_platform_plan_tokens",
                                headers=SERVICE_HEADERS,
                                json={
                                    "p_user_id": user_id,
                                    "p_plan_key": plan_key,
                                    "p_tokens": tokens,
                                    "p_payment_id": payment.get("id") or sub_id,
                                    "p_period": "monthly",
                                },
                            )
                    except Exception:
                        logger.exception("Failed to credit tokens for sub %s", sub_id)

    elif event == "payment.failed":
        if sub_id:
            await _sb_patch(
                "razorpay_subscriptions",
                {"razorpay_subscription_id": f"eq.{sub_id}"},
                {"status": "halted", "last_error": (payment.get("error_description") or "")[:200], "updated_at": now_iso},
            )

    return {"received": True, "event": event}
