"""End-to-end backend tests for Razorpay payment routes.

Covers:
- Auth gating on all /api/payment/* endpoints
- Token purchase create-order + verify (HMAC math + idempotency)
- Plan-checkout create-order (404 for unknown plan)
- Health check
"""
import hashlib
import hmac
import os
import secrets
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://supabase-connect-46.preview.emergentagent.com"
).rstrip("/")

SUPABASE_URL = "https://hnxnvdzrwbtmcohdptfq.supabase.co"
SUPABASE_ANON = "sb_publishable_uaL-zelOHdGlOlvaWuIa1A_wtL7mx3p"
RAZORPAY_KEY_SECRET = "M6KojcTOczx4RyLz5JI1uu6B"

# Endpoint paths with a minimal-but-valid body so Pydantic validation passes
# and the auth check inside the handler is actually exercised.
PAYMENT_ENDPOINTS = [
    (
        "/api/payment/token-purchase/create-order",
        {"tokens": 1_000_000, "amount_inr": 1000},
    ),
    (
        "/api/payment/token-purchase/verify",
        {
            "razorpay_order_id": "order_x",
            "razorpay_payment_id": "pay_x",
            "razorpay_signature": "x" * 64,
        },
    ),
    (
        "/api/payment/plan-checkout/create-order",
        {"planId": "11111111-1111-1111-1111-111111111111", "billingCycleMonths": 1},
    ),
    (
        "/api/payment/plan-checkout/verify",
        {
            "razorpay_order_id": "order_x",
            "razorpay_payment_id": "pay_x",
            "razorpay_signature": "x" * 64,
            "planId": "11111111-1111-1111-1111-111111111111",
            "billingCycleMonths": 1,
        },
    ),
]


# ─── Fixtures ─────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def access_token():
    """Sign up a fresh Supabase user and return its access_token."""
    email = f"e2e+{secrets.token_hex(6)}@avatartalk-test.io"
    password = "TestPassword123!"
    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=20,
    )
    if r.status_code != 200:
        pytest.skip(f"Signup failed {r.status_code}: {r.text}")
    data = r.json()
    token = data.get("access_token")
    if not token:
        # Email confirmation required - try login
        rl = requests.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={"apikey": SUPABASE_ANON, "Content-Type": "application/json"},
            json={"email": email, "password": password},
            timeout=20,
        )
        if rl.status_code == 200 and rl.json().get("access_token"):
            token = rl.json()["access_token"]
        else:
            pytest.skip(
                f"Email confirmation likely required. signup={data}; login={rl.status_code}:{rl.text}"
            )
    return token


@pytest.fixture(scope="session")
def auth_headers(access_token):
    return {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}


# ─── Health ───────────────────────────────────────────────────────────────
def test_health():
    r = requests.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("status") == "healthy"


# ─── Auth gating ──────────────────────────────────────────────────────────
@pytest.mark.parametrize("path,body", PAYMENT_ENDPOINTS)
def test_payment_requires_bearer(path, body):
    r = requests.post(f"{BASE_URL}{path}", json=body, timeout=15)
    assert r.status_code == 401, f"{path} should require auth, got {r.status_code}: {r.text}"


@pytest.mark.parametrize("path,body", PAYMENT_ENDPOINTS)
def test_payment_rejects_invalid_token(path, body):
    r = requests.post(
        f"{BASE_URL}{path}",
        headers={"Authorization": "Bearer invalid.token.here"},
        json=body,
        timeout=15,
    )
    assert r.status_code == 401, f"{path} invalid token, got {r.status_code}: {r.text}"


# ─── Token create-order validation ────────────────────────────────────────
class TestTokenCreateOrder:
    URL = f"{BASE_URL}/api/payment/token-purchase/create-order"

    def test_tokens_too_low(self, auth_headers):
        r = requests.post(
            self.URL, headers=auth_headers, json={"tokens": 1000, "amount_inr": 1000}, timeout=20
        )
        assert r.status_code == 400
        assert "between" in r.json().get("detail", "").lower()

    def test_tokens_too_high(self, auth_headers):
        r = requests.post(
            self.URL,
            headers=auth_headers,
            json={"tokens": 200_000_000, "amount_inr": 200000},
            timeout=20,
        )
        assert r.status_code == 400

    def test_amount_below_minimum(self, auth_headers):
        # Tokens valid range but amount below ₹10 - must validate amount BEFORE price match
        r = requests.post(
            self.URL, headers=auth_headers, json={"tokens": 200_000, "amount_inr": 5}, timeout=20
        )
        assert r.status_code == 400
        assert "minimum" in r.json().get("detail", "").lower() or "₹" in r.json().get("detail", "")

    def test_price_mismatch(self, auth_headers):
        # 1M tokens expected ~₹1000, pass ₹50 - should reject as mismatch
        r = requests.post(
            self.URL,
            headers=auth_headers,
            json={"tokens": 1_000_000, "amount_inr": 50},
            timeout=20,
        )
        assert r.status_code == 400
        assert "mismatch" in r.json().get("detail", "").lower()

    def test_valid_create_order(self, auth_headers):
        r = requests.post(
            self.URL,
            headers=auth_headers,
            json={"tokens": 1_000_000, "amount_inr": 1000},
            timeout=30,
        )
        assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
        body = r.json()
        assert body["success"] is True
        assert body["order_id"].startswith("order_")
        assert body["amount"] == 100000  # 1000 INR * 100 paise
        assert body["currency"] == "INR"
        assert body["key_id"] == "rzp_test_T1aQ71lQOJYCaZ"
        assert body["tokens"] == 1_000_000
        # purchase_id may be None if insert failed but order should still be present
        # Stash order_id for verify test
        pytest.token_order_id = body["order_id"]


# ─── Token verify ─────────────────────────────────────────────────────────
class TestTokenVerify:
    URL = f"{BASE_URL}/api/payment/token-purchase/verify"

    def test_invalid_signature(self, auth_headers):
        order_id = getattr(pytest, "token_order_id", None)
        if not order_id:
            pytest.skip("No order_id from create-order test")
        r = requests.post(
            self.URL,
            headers=auth_headers,
            json={
                "razorpay_order_id": order_id,
                "razorpay_payment_id": "pay_TEST123",
                "razorpay_signature": "deadbeef" * 8,
            },
            timeout=20,
        )
        assert r.status_code == 400
        assert "signature" in r.json().get("detail", "").lower()

    def test_valid_signature_credits_tokens(self, auth_headers):
        order_id = getattr(pytest, "token_order_id", None)
        if not order_id:
            pytest.skip("No order_id from create-order test")
        payment_id = "pay_TEST" + secrets.token_hex(6)
        payload = f"{order_id}|{payment_id}".encode()
        sig = hmac.new(RAZORPAY_KEY_SECRET.encode(), payload, hashlib.sha256).hexdigest()
        r = requests.post(
            self.URL,
            headers=auth_headers,
            json={
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": sig,
            },
            timeout=30,
        )
        assert r.status_code == 200, f"verify failed {r.status_code}: {r.text}"
        body = r.json()
        assert body["success"] is True
        assert body.get("tokens_credited", 0) > 0

    def test_idempotency_already_processed(self, auth_headers):
        order_id = getattr(pytest, "token_order_id", None)
        if not order_id:
            pytest.skip("No order_id")
        payment_id = "pay_TEST" + secrets.token_hex(6)
        payload = f"{order_id}|{payment_id}".encode()
        sig = hmac.new(RAZORPAY_KEY_SECRET.encode(), payload, hashlib.sha256).hexdigest()
        r = requests.post(
            self.URL,
            headers=auth_headers,
            json={
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": sig,
            },
            timeout=20,
        )
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert "already" in (body.get("message") or "").lower()


# ─── Plan checkout ────────────────────────────────────────────────────────
class TestPlanCheckout:
    CREATE_URL = f"{BASE_URL}/api/payment/plan-checkout/create-order"
    VERIFY_URL = f"{BASE_URL}/api/payment/plan-checkout/verify"

    def test_unknown_plan_returns_404(self, auth_headers):
        random_id = str(uuid.uuid4())
        r = requests.post(
            self.CREATE_URL,
            headers=auth_headers,
            json={"planId": random_id, "billingCycleMonths": 1, "currency": "INR"},
            timeout=20,
        )
        assert r.status_code == 404
        assert "plan not found" in r.json().get("detail", "").lower()

    def test_verify_invalid_signature(self, auth_headers):
        r = requests.post(
            self.VERIFY_URL,
            headers=auth_headers,
            json={
                "razorpay_order_id": "order_FAKE123",
                "razorpay_payment_id": "pay_FAKE",
                "razorpay_signature": "x" * 64,
                "planId": str(uuid.uuid4()),
                "billingCycleMonths": 1,
            },
            timeout=20,
        )
        assert r.status_code == 400
        assert "signature" in r.json().get("detail", "").lower()
