"""Regression tests: ensure demo_mode and demo_order_ logic is fully removed
from all Razorpay payment routes.

Per review request:
- Responses for create-order MUST NOT contain the field `demo_mode`
- Responses MUST NOT contain `demo_order_` string anywhere
- With invalid Razorpay creds (env keys return Authentication failed),
  endpoints must return clean 400/502 with the surfaced Razorpay error,
  NOT a 500, and NOT a synthetic demo order.
- razorpay-verify-payment must reject orders starting with `demo_order_`.
"""
import json
import os

import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://avatar-ui-refactor.preview.emergentagent.com"
).rstrip("/")
SUPABASE_URL = "https://hnxnvdzrwbtmcohdptfq.supabase.co"
SUPABASE_ANON = "sb_publishable_uaL-zelOHdGlOlvaWuIa1A_wtL7mx3p"
TEST_EMAIL = "avatartalk_test@example.com"
TEST_PASSWORD = "TestPassword!234"
# Real Creator plan UUID from platform_pricing_plans
PLAN_ID = "7bf6d169-4b85-4f33-bb85-7730009dd720"


@pytest.fixture(scope="session")
def access_token():
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, f"Supabase login failed: {r.status_code} {r.text}"
    token = r.json().get("access_token")
    assert token, "No access_token returned by Supabase"
    return token


@pytest.fixture(scope="session")
def auth_headers(access_token):
    return {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}


def _assert_clean_response(resp, label):
    """Assert response is NOT 500 and contains NO demo_mode / demo_order_ markers."""
    assert resp.status_code != 500, f"{label}: got 500 (server error)\n{resp.text}"
    body_text = resp.text
    # No demo_mode field anywhere (whether true or false)
    assert '"demo_mode"' not in body_text, (
        f"{label}: response contains demo_mode field — regression!\n{body_text}"
    )
    assert "demo_order_" not in body_text, (
        f"{label}: response contains demo_order_ string — regression!\n{body_text}"
    )
    # Parseable JSON
    try:
        return resp.json()
    except json.JSONDecodeError:
        pytest.fail(f"{label}: response not valid JSON\n{body_text}")


# ─── Health ───────────────────────────────────────────────────────────────
def test_backend_health():
    r = requests.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("status") == "healthy"


# ─── razorpay-create-order (universal/legacy) ─────────────────────────────
def test_razorpay_create_order_no_demo(auth_headers):
    """With invalid Razorpay creds, expect clean 400 with Razorpay auth-fail msg.
    NO demo_mode in payload, NO demo_order_ string."""
    r = requests.post(
        f"{BASE_URL}/api/payment/razorpay-create-order",
        headers=auth_headers,
        json={"amount": 10000, "currency": "INR", "planId": "regression-test"},
        timeout=30,
    )
    body = _assert_clean_response(r, "razorpay-create-order")

    # Either succeeded (real order) or surfaced a clean 4xx/5xx Razorpay error
    if r.status_code == 200:
        # Real order — must NOT be demo_order_
        oid = body.get("order_id") or body.get("orderId") or ""
        assert oid.startswith("order_") and not oid.startswith("demo_order_"), (
            f"order_id looks like a demo order: {oid}"
        )
    else:
        assert r.status_code in (400, 401, 402, 502), (
            f"Unexpected status {r.status_code}: {body}"
        )
        detail = (body.get("detail") or "").lower()
        # Must surface Razorpay error — current env returns "Authentication failed"
        assert "authentication failed" in detail or "failed to create order" in detail, (
            f"Expected Razorpay error surfaced, got: {detail}"
        )


# ─── token-purchase/create-order ──────────────────────────────────────────
def test_token_purchase_create_order_no_demo(auth_headers):
    r = requests.post(
        f"{BASE_URL}/api/payment/token-purchase/create-order",
        headers=auth_headers,
        json={"tokens": 100_000, "amount_inr": 100},
        timeout=30,
    )
    body = _assert_clean_response(r, "token-purchase/create-order")

    if r.status_code == 200:
        oid = body.get("order_id", "")
        assert oid.startswith("order_") and not oid.startswith("demo_order_"), (
            f"demo order leaked: {oid}"
        )
        # success path should still NOT contain demo_mode
        assert "demo_mode" not in body
    else:
        assert r.status_code in (400, 401, 402, 502)
        detail = (body.get("detail") or "").lower()
        assert "authentication failed" in detail or "failed to create" in detail, (
            f"Expected Razorpay error surfaced, got: {detail}"
        )


# ─── plan-checkout/create-order ───────────────────────────────────────────
def test_plan_checkout_create_order_no_demo(auth_headers):
    r = requests.post(
        f"{BASE_URL}/api/payment/plan-checkout/create-order",
        headers=auth_headers,
        json={"planId": PLAN_ID, "billingCycleMonths": 1, "currency": "INR"},
        timeout=30,
    )
    body = _assert_clean_response(r, "plan-checkout/create-order")

    if r.status_code == 200:
        oid = body.get("orderId") or body.get("order_id", "")
        assert oid.startswith("order_") and not oid.startswith("demo_order_")
        assert "demo_mode" not in body
    else:
        assert r.status_code in (400, 401, 402, 502)
        detail = (body.get("detail") or "").lower()
        assert "authentication failed" in detail or "failed to create" in detail, (
            f"Expected Razorpay error surfaced, got: {detail}"
        )


# ─── verify rejects demo_order_ prefixes (bypass removed) ─────────────────
def test_verify_rejects_demo_order_prefix(auth_headers):
    r = requests.post(
        f"{BASE_URL}/api/payment/razorpay-verify-payment",
        headers=auth_headers,
        json={
            "razorpay_order_id": "demo_order_regression",
            "razorpay_payment_id": "pay_demo_test",
            "razorpay_signature": "x" * 64,
        },
        timeout=20,
    )
    assert r.status_code == 400, f"demo_order_ should be rejected, got {r.status_code}: {r.text}"
    body = r.json()
    assert "demo_mode" not in r.text
    detail = (body.get("detail") or "").lower()
    assert "signature" in detail or "invalid" in detail, (
        f"Expected signature/invalid error for demo_order_, got: {detail}"
    )


def test_token_verify_rejects_demo_order_prefix(auth_headers):
    r = requests.post(
        f"{BASE_URL}/api/payment/token-purchase/verify",
        headers=auth_headers,
        json={
            "razorpay_order_id": "demo_order_regression_token",
            "razorpay_payment_id": "pay_demo",
            "razorpay_signature": "x" * 64,
        },
        timeout=20,
    )
    assert r.status_code in (400, 404), f"got {r.status_code}: {r.text}"
    assert "demo_mode" not in r.text
    assert "demo_order_" not in (r.json().get("order_id", "") if r.headers.get("content-type", "").startswith("application/json") else "")


def test_plan_verify_rejects_demo_order_prefix(auth_headers):
    r = requests.post(
        f"{BASE_URL}/api/payment/plan-checkout/verify",
        headers=auth_headers,
        json={
            "razorpay_order_id": "demo_order_regression_plan",
            "razorpay_payment_id": "pay_demo",
            "razorpay_signature": "x" * 64,
            "planId": PLAN_ID,
            "billingCycleMonths": 1,
        },
        timeout=20,
    )
    assert r.status_code in (400, 404)
    assert "demo_mode" not in r.text
