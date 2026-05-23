"""
Razorpay payment endpoints (token purchase + platform plan checkout).

Architecture:
- Frontend calls FastAPI (here) instead of Supabase Edge Functions.
- We authenticate the caller by passing their Supabase access token to
  Supabase's `/auth/v1/user` endpoint (no JWT secret needed).
- We use the Supabase service_role key to read/write tables via PostgREST
  (RLS-bypassing, server-side only).
- Razorpay order creation / signature verification use the Python SDK.
"""
from __future__ import annotations

import hmac
import hashlib
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import httpx
import razorpay
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID = os.environ["RAZORPAY_KEY_ID"]
RAZORPAY_KEY_SECRET = os.environ["RAZORPAY_KEY_SECRET"]
SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", SUPABASE_SERVICE_ROLE_KEY)

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

SERVICE_HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

DEFAULT_PRICE_PER_MILLION_INR = 1000
MIN_TOKENS = 100_000
MAX_TOKENS = 100_000_000
MIN_AMOUNT_INR = 10

PLAN_TOKENS_PER_MONTH = {
    "free": 10_000,
    "creator": 1_000_000,
    "pro": 2_000_000,
    "business": 5_000_000,
}

router = APIRouter(prefix="/api/payment", tags=["payment"])


# ─── Helpers ──────────────────────────────────────────────────────────────
async def _get_user_from_token(authorization: Optional[str]) -> dict:
    """Validate bearer token by calling Supabase /auth/v1/user."""
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


async def _supabase_get(path: str, params: dict | None = None) -> Any:
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=SERVICE_HEADERS, params=params)
    if r.status_code >= 400:
        logger.error("Supabase GET %s failed: %s", path, r.text)
        raise HTTPException(status_code=500, detail=f"Supabase error: {r.text}")
    return r.json()


async def _supabase_post(path: str, body: Any, prefer: str = "return=representation") -> Any:
    headers = {**SERVICE_HEADERS, "Prefer": prefer}
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.post(f"{SUPABASE_URL}/rest/v1/{path}", headers=headers, json=body)
    if r.status_code >= 400:
        logger.error("Supabase POST %s failed: %s", path, r.text)
        raise HTTPException(status_code=500, detail=f"Supabase error: {r.text}")
    return r.json() if r.text else None


async def _supabase_patch(path: str, body: Any, params: dict | None = None) -> Any:
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.patch(
            f"{SUPABASE_URL}/rest/v1/{path}", headers=SERVICE_HEADERS, json=body, params=params
        )
    if r.status_code >= 400:
        logger.error("Supabase PATCH %s failed: %s", path, r.text)
        raise HTTPException(status_code=500, detail=f"Supabase error: {r.text}")
    return r.json() if r.text else None


async def _supabase_rpc(fn: str, body: dict) -> Any:
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.post(f"{SUPABASE_URL}/rest/v1/rpc/{fn}", headers=SERVICE_HEADERS, json=body)
    if r.status_code >= 400:
        logger.error("Supabase RPC %s failed: %s", fn, r.text)
        raise HTTPException(status_code=500, detail=f"Supabase RPC error: {r.text}")
    return r.json() if r.text else None


def _verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    payload = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature.strip().lower())


# ─── Token Purchase ───────────────────────────────────────────────────────
class TokenOrderRequest(BaseModel):
    tokens: int = Field(..., gt=0)
    amount_inr: float = Field(..., gt=0)
    package_id: Optional[str] = None


class TokenVerifyRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    purchase_id: Optional[str] = None


@router.post("/token-purchase/create-order")
async def token_create_order(
    body: TokenOrderRequest, authorization: Optional[str] = Header(None)
):
    user = await _get_user_from_token(authorization)
    user_id = user["id"]
    tokens = body.tokens
    amount_inr = body.amount_inr

    if tokens < MIN_TOKENS or tokens > MAX_TOKENS:
        raise HTTPException(
            status_code=400,
            detail=f"Token amount must be between {MIN_TOKENS:,} and {MAX_TOKENS:,}",
        )
    if amount_inr < MIN_AMOUNT_INR:
        raise HTTPException(status_code=400, detail=f"Minimum purchase is ₹{MIN_AMOUNT_INR}")

    # Validate price. If package_id is provided, trust the package row.
    # Otherwise use the per-million slider formula.
    if body.package_id:
        pkg_rows = await _supabase_get(
            "token_packages",
            params={"select": "*", "id": f"eq.{body.package_id}", "is_active": "eq.true"},
        )
        if not pkg_rows:
            raise HTTPException(status_code=404, detail="Token package not found")
        pkg = pkg_rows[0]
        expected_tokens = (pkg.get("tokens") or 0) + (pkg.get("bonus_tokens") or 0)
        expected_price = float(pkg.get("price_inr") or 0)
        if tokens != expected_tokens:
            raise HTTPException(status_code=400, detail="Package token count mismatch")
        if abs(amount_inr - expected_price) > 1:
            raise HTTPException(status_code=400, detail="Package price mismatch")
    else:
        # Fetch price per million from DB
        price_per_million = DEFAULT_PRICE_PER_MILLION_INR
        try:
            rows = await _supabase_get(
                "ai_system_limits",
                params={"select": "limit_value", "limit_key": "eq.gift_token_price_per_million"},
            )
            if rows and isinstance(rows[0].get("limit_value"), dict):
                limit = rows[0]["limit_value"].get("limit")
                if isinstance(limit, (int, float)) and limit > 0:
                    price_per_million = float(limit)
        except Exception as e:
            logger.warning("Failed to fetch price_per_million, using default: %s", e)

        expected = (tokens / 1_000_000) * price_per_million
        tolerance = max(expected * 0.05, 1)
        if abs(amount_inr - expected) > tolerance:
            raise HTTPException(
                status_code=400,
                detail=f"Price mismatch. Expected ~₹{expected:.0f} for {tokens:,} tokens",
            )

    # Ensure profile exists
    profile = await _supabase_get(
        "profiles", params={"select": "id", "id": f"eq.{user_id}"}
    )
    if not profile:
        try:
            await _supabase_post(
                "profiles",
                {
                    "id": user_id,
                    "email": user.get("email"),
                    "display_name": (user.get("user_metadata") or {}).get("full_name"),
                },
            )
        except HTTPException as e:
            logger.error("Failed to create profile: %s", e.detail)
            raise HTTPException(
                status_code=500,
                detail="User profile not initialized. Please log out and log in again.",
            )

    amount_in_paise = round(amount_inr * 100)

    try:
        order = razorpay_client.order.create(
            {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"custom_token_{int(datetime.now().timestamp())}",
                "notes": {
                    "user_id": user_id,
                    "tokens": str(tokens),
                    "amount_inr": str(amount_inr),
                    "type": "custom_token_purchase",
                },
            }
        )
    except razorpay.errors.BadRequestError as e:
        logger.error("Razorpay BadRequest: %s", e)
        raise HTTPException(status_code=400, detail=f"Failed to create payment order: {e}")
    except Exception as e:
        logger.exception("Razorpay order failed")
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {e}")

    purchase_id = None
    try:
        result = await _supabase_post(
            "custom_token_purchases",
            {
                "user_id": user_id,
                "tokens_requested": tokens,
                "amount_inr": amount_inr,
                "amount_usd": round(amount_inr / 84, 2),
                "razorpay_order_id": order["id"],
                "status": "pending",
            },
        )
        if result and isinstance(result, list) and result:
            purchase_id = result[0].get("id")
    except Exception as e:
        logger.error("Failed to insert custom_token_purchases: %s", e)

    return {
        "success": True,
        "order_id": order["id"],
        "purchase_id": purchase_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
        "tokens": tokens,
    }


@router.post("/token-purchase/verify")
async def token_verify(body: TokenVerifyRequest, authorization: Optional[str] = Header(None)):
    user = await _get_user_from_token(authorization)
    user_id = user["id"]

    if not _verify_razorpay_signature(
        body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature
    ):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    rows = await _supabase_get(
        "custom_token_purchases",
        params={
            "select": "*",
            "razorpay_order_id": f"eq.{body.razorpay_order_id}",
            "user_id": f"eq.{user_id}",
        },
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    purchase = rows[0]

    if purchase.get("status") == "completed":
        return {
            "success": True,
            "tokens_credited": purchase.get("tokens_requested", 0),
            "message": "Already processed",
        }

    tokens_to_credit = int(purchase.get("tokens_requested") or 0)
    if tokens_to_credit <= 0:
        raise HTTPException(status_code=400, detail="Invalid token amount in purchase record")

    credit_result = await _supabase_rpc(
        "credit_user_tokens",
        {"p_user_id": user_id, "p_tokens": tokens_to_credit, "p_reason": "topup"},
    )
    if not credit_result or not credit_result.get("success"):
        err = (credit_result or {}).get("error", "unknown")
        logger.error("credit_user_tokens failed: %s", err)
        raise HTTPException(status_code=500, detail=f"Failed to credit tokens: {err}")

    await _supabase_patch(
        "custom_token_purchases",
        {
            "razorpay_payment_id": body.razorpay_payment_id,
            "razorpay_signature": body.razorpay_signature,
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        },
        params={"razorpay_order_id": f"eq.{body.razorpay_order_id}"},
    )

    # Best-effort notification
    try:
        await _supabase_post(
            "notifications",
            {
                "user_id": user_id,
                "type": "system",
                "title": "💰 Tokens Purchased!",
                "message": f"{tokens_to_credit:,} tokens have been added to your account.",
                "data": {
                    "tokens_credited": tokens_to_credit,
                    "new_balance": credit_result.get("balance"),
                },
            },
            prefer="return=minimal",
        )
    except Exception as e:
        logger.warning("Notification insert failed (non-fatal): %s", e)

    return {
        "success": True,
        "tokens_credited": tokens_to_credit,
        "new_balance": credit_result.get("balance"),
        "message": "Tokens credited successfully",
    }


# ─── Platform Plan Checkout ───────────────────────────────────────────────
class PlanCheckoutRequest(BaseModel):
    planId: str
    billingCycleMonths: int = Field(..., gt=0)
    currency: str = "INR"


class PlanVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    planId: str
    billingCycleMonths: int = Field(..., gt=0)


def _resolve_plan_price(plan: dict, months: int, currency: str) -> float:
    is_inr = currency.upper() == "INR"
    if months == 3:
        return plan.get("price_3_month_inr" if is_inr else "price_3_month_usd") or 0
    if months == 6:
        return plan.get("price_6_month_inr" if is_inr else "price_6_month_usd") or 0
    if months == 12:
        return plan.get("price_12_month_inr" if is_inr else "price_12_month_usd") or 0
    return plan.get("price_inr" if is_inr else "price_usd") or 0


@router.post("/plan-checkout/create-order")
async def plan_create_order(
    body: PlanCheckoutRequest, authorization: Optional[str] = Header(None)
):
    user = await _get_user_from_token(authorization)
    user_id = user["id"]

    plans = await _supabase_get(
        "platform_pricing_plans", params={"select": "*", "id": f"eq.{body.planId}"}
    )
    if not plans:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan = plans[0]

    amount = _resolve_plan_price(plan, body.billingCycleMonths, body.currency)
    if not amount or amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid plan price configuration")

    amount_in_subunits = int(round(float(amount) * 100))

    try:
        order = razorpay_client.order.create(
            {
                "amount": amount_in_subunits,
                "currency": body.currency,
                "receipt": f"plan_{plan['plan_key']}_{user_id[:8]}_{int(datetime.now().timestamp())}",
                "notes": {
                    "user_id": user_id,
                    "plan_id": body.planId,
                    "plan_key": plan["plan_key"],
                    "billing_cycle_months": str(body.billingCycleMonths),
                },
            }
        )
    except Exception as e:
        logger.exception("Razorpay order failed (plan)")
        raise HTTPException(status_code=400, detail=f"Failed to create order: {e}")

    existing = await _supabase_get(
        "user_platform_subscriptions",
        params={"select": "plan_key", "user_id": f"eq.{user_id}"},
    )
    prev_plan_key = existing[0]["plan_key"] if existing else "free"

    try:
        await _supabase_post(
            "platform_plan_transactions",
            {
                "user_id": user_id,
                "plan_id": body.planId,
                "plan_key": plan["plan_key"],
                "amount": float(amount),
                "currency": body.currency,
                "billing_cycle_months": body.billingCycleMonths,
                "razorpay_order_id": order["id"],
                "status": "pending",
                "previous_plan_key": prev_plan_key,
                "transaction_type": "upgrade" if existing else "purchase",
            },
            prefer="return=minimal",
        )
    except Exception as e:
        logger.error("Failed to insert platform_plan_transactions: %s", e)

    return {
        "success": True,
        "orderId": order["id"],
        "amount": float(amount),
        "currency": body.currency,
        "keyId": RAZORPAY_KEY_ID,
        "planName": plan["plan_name"],
        "billingCycleMonths": body.billingCycleMonths,
    }


@router.post("/plan-checkout/verify")
async def plan_verify(body: PlanVerifyRequest, authorization: Optional[str] = Header(None)):
    user = await _get_user_from_token(authorization)
    user_id = user["id"]

    if not _verify_razorpay_signature(
        body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature
    ):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    plans = await _supabase_get(
        "platform_pricing_plans", params={"select": "*", "id": f"eq.{body.planId}"}
    )
    if not plans:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan = plans[0]

    months = body.billingCycleMonths
    expires_at = datetime.now(timezone.utc) + timedelta(days=30 * months)
    now_iso = datetime.now(timezone.utc).isoformat()
    next_credit_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

    price_paid = _resolve_plan_price(plan, months, "INR") or (plan.get("price_inr") or 0) * months

    existing = await _supabase_get(
        "user_platform_subscriptions",
        params={"select": "*", "user_id": f"eq.{user_id}"},
    )

    monthly_tokens = PLAN_TOKENS_PER_MONTH.get(plan["plan_key"], plan.get("ai_tokens_monthly") or 0)

    sub_data = {
        "user_id": user_id,
        "plan_id": body.planId,
        "plan_key": plan["plan_key"],
        "status": "active",
        "billing_cycle_months": months,
        "price_paid": float(price_paid),
        "currency": "INR",
        "starts_at": now_iso,
        "expires_at": expires_at.isoformat(),
        "razorpay_order_id": body.razorpay_order_id,
        "razorpay_payment_id": body.razorpay_payment_id,
        "razorpay_signature": body.razorpay_signature,
        "monthly_token_amount": monthly_tokens,
        "last_monthly_credit_at": now_iso,
        "next_monthly_credit_at": next_credit_at,
        "months_credited": 1,
    }

    if existing:
        await _supabase_patch(
            "user_platform_subscriptions",
            sub_data,
            params={"id": f"eq.{existing[0]['id']}"},
        )
    else:
        await _supabase_post("user_platform_subscriptions", sub_data, prefer="return=minimal")

    await _supabase_patch(
        "platform_plan_transactions",
        {
            "status": "completed",
            "razorpay_payment_id": body.razorpay_payment_id,
            "razorpay_signature": body.razorpay_signature,
        },
        params={"razorpay_order_id": f"eq.{body.razorpay_order_id}"},
    )

    # Credit first month's tokens
    if monthly_tokens > 0:
        try:
            await _supabase_rpc(
                "credit_user_tokens",
                {
                    "p_user_id": user_id,
                    "p_tokens": monthly_tokens,
                    "p_reason": f"plan_purchase_{plan['plan_key']}_month_1_of_{months}",
                },
            )
        except Exception as e:
            logger.error("Failed to credit plan tokens: %s", e)

    return {
        "success": True,
        "message": "Subscription activated successfully",
        "planName": plan["plan_name"],
        "expiresAt": expires_at.isoformat(),
    }
