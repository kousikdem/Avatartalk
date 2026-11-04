#!/usr/bin/env python3
"""
Black-box RLS / GRANT audit for the AvatarTalk Supabase project.

Runs only NON-DESTRUCTIVE probes through PostgREST:
  * SELECT   – count rows visible to anon / authenticated vs service_role
  * UPDATE   – no-op update (id = id) on a row NOT owned by the probe user
  * INSERT   – intentionally invalid row (duplicate PK / missing NOT NULL),
               so Postgres evaluates the RLS WITH CHECK first and then
               rejects the row on a constraint. 42501 => blocked (good);
               23xxx => RLS let it through (bad). If a row is ever actually
               inserted it is deleted immediately with the service role.
  * RPC      – sensitive SECURITY DEFINER functions with harmless args.

Usage:
  python3 scripts/rls_audit.py            # reads backend/.env
Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
     RLS_AUDIT_EMAIL, RLS_AUDIT_PASSWORD (test user)
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def load_env():
    for p in (Path(__file__).resolve().parent.parent / "backend" / ".env",):
        if p.exists():
            for line in p.read_text().splitlines():
                if "=" in line and not line.lstrip().startswith("#"):
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
U = os.environ["SUPABASE_URL"].rstrip("/")
ANON = os.environ["SUPABASE_ANON_KEY"]
SRV = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
EMAIL = os.environ.get("RLS_AUDIT_EMAIL", "avatartalk_test@example.com")
PWD = os.environ.get("RLS_AUDIT_PASSWORD", "")
ZERO = "00000000-0000-4000-8000-000000000999"

# Tables that are *meant* to be readable by anonymous visitors.
PUBLIC_READ_OK = {
    "platform_pricing_plans", "subscription_plans", "token_packages", "posts", "products",
    "events", "site_settings", "public_profiles", "social_links", "user_stats",
    "avatar_configurations", "likes", "comments", "product_reviews", "feature_flags",
    "public_chat_settings", "virtual_products", "virtual_product_slots", "follows",
    "ai_training_settings", "token_configuration", "country_payment_rules", "tax_configurations",
}
# Tables where an anonymous INSERT is intentional (analytics / visitor chat).
PUBLIC_INSERT_OK = {"profile_visitors", "post_link_clicks", "visitor_chat_usage", "ai_chat_history"}


def req(method, path, key, bearer=None, body=None, headers=None):
    h = {"apikey": key, "Authorization": "Bearer " + (bearer or key), "Content-Type": "application/json"}
    h.update(headers or {})
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(3):
        r = urllib.request.Request(U + path, data=data, method=method, headers=h)
        try:
            with urllib.request.urlopen(r, timeout=25) as x:
                raw = x.read()
                return x.status, (json.loads(raw) if raw else None), dict(x.headers)
        except urllib.error.HTTPError as e:
            raw = e.read()
            try:
                return e.code, json.loads(raw), dict(e.headers)
            except Exception:
                return e.code, raw.decode()[:200], dict(e.headers)
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if attempt == 2:
                return 599, {"message": f"network error: {e}"}, {}
            time.sleep(1.5 * (attempt + 1))


def login():
    if not PWD:
        return None, None
    s, b, _ = req("POST", "/auth/v1/token?grant_type=password", ANON, body={"email": EMAIL, "password": PWD})
    if s != 200:
        print("WARN: test-user login failed", s, b)
        return None, None
    return b["access_token"], b["user"]["id"]


def count(t, key, bearer=None):
    s, _, h = req("GET", f"/rest/v1/{t}?select=*&limit=1", key, bearer, headers={"Prefer": "count=exact"})
    if s >= 400:
        return f"ERR{s}"
    return (h.get("Content-Range") or "*/?").split("/")[-1]


def classify(status, body):
    code = body.get("code") if isinstance(body, dict) else None
    msg = (body.get("message") if isinstance(body, dict) else str(body)) or ""
    if code == "42501" or "row-level security" in msg or "permission denied" in msg:
        return "BLOCKED"
    if status in (200, 201, 204):
        return "ALLOWED"
    if code and code.startswith("23"):
        return "ALLOWED(constraint)"
    if code == "PGRST116" or status == 406:
        return "BLOCKED"
    return f"?{status}:{code}"


def probe_table(t, defs, jwt, uid):
    cols = list(defs.get(t, {}).get("properties", {}).keys())
    has_id = "id" in cols
    total = count(t, SRV)
    out = {"table": t, "total": total, "anon_read": count(t, ANON), "auth_read": count(t, ANON, jwt) if jwt else "-"}

    # Pick a row that is not owned by the probe user (for UPDATE / dup-PK probes)
    victim = None
    if has_id and total not in ("0",) and not str(total).startswith("ERR"):
        owner_cols = [c for c in ("user_id", "profile_id", "buyer_id", "sender_id", "subscriber_id", "admin_id") if c in cols]
        q = f"/rest/v1/{t}?select=id&limit=1"
        if t == "profiles" and uid:
            q += f"&id=neq.{uid}"
        elif owner_cols and uid:
            q += f"&{owner_cols[0]}=neq.{uid}"
        s, b, _ = req("GET", q, SRV)
        if s == 200 and b:
            victim = b[0]["id"]

    for role, bearer in (("anon", None), ("auth", jwt)):
        if role == "auth" and not jwt:
            continue
        # INSERT probe
        body = {"id": victim} if victim else {}
        s, b, _ = req("POST", f"/rest/v1/{t}", ANON, bearer, body=body, headers={"Prefer": "return=representation"})
        res = classify(s, b)
        if s == 201 and isinstance(b, list) and b and "id" in b[0]:
            req("DELETE", f"/rest/v1/{t}?id=eq.{b[0]['id']}", SRV)  # cleanup
            res = "ALLOWED(inserted+cleaned)"
        out[f"{role}_insert"] = res
        # UPDATE probe (no-op) on someone else's row
        if victim:
            s, b, _ = req("PATCH", f"/rest/v1/{t}?id=eq.{victim}", ANON, bearer, body={"id": victim},
                          headers={"Prefer": "return=representation"})
            out[f"{role}_update_other"] = "ALLOWED" if (s == 200 and b) else ("BLOCKED" if s < 500 else f"?{s}")
    return out


RPC_PROBES = {
    "credit_user_tokens": {"p_user_id": ZERO, "p_tokens": 0, "p_reason": "rls_audit_probe"},
    "debit_user_tokens": {"p_user_id": ZERO, "p_tokens": 0, "p_reason": "rls_audit_probe"},
    "decrypt_secret": {"p_ciphertext": "x", "p_encryption_key": "x"},
    "process_token_gift": {"p_gift_id": ZERO, "p_razorpay_payment_id": "x", "p_razorpay_signature": "x"},
    "decrement_product_inventory": {"p_product_id": ZERO, "p_quantity": 0, "p_variant_id": None},
    "calculate_user_engagement_score": {"p_user_id": ZERO},
}


def main():
    jwt, uid = login()
    oas = req("GET", "/rest/v1/", SRV)[1]
    defs = oas.get("definitions", {})
    tables = sorted(p[1:] for p in oas["paths"] if p != "/" and not p.startswith("/rpc/"))
    with ThreadPoolExecutor(8) as ex:
        rows = list(ex.map(lambda t: probe_table(t, defs, jwt, uid), tables))

    issues = []
    for r in rows:
        t = r["table"]
        if t not in PUBLIC_READ_OK and r["anon_read"] not in ("0",) and not str(r["anon_read"]).startswith("ERR"):
            issues.append(f"[READ ] anon can read {r['anon_read']}/{r['total']} rows of {t}")
        if r.get("anon_insert", "").startswith("ALLOWED") and t not in PUBLIC_INSERT_OK:
            issues.append(f"[WRITE] anon can INSERT into {t} ({r['anon_insert']})")
        if r.get("auth_insert", "").startswith("ALLOWED") and t not in PUBLIC_INSERT_OK and r.get("auth_insert") != "ALLOWED(constraint)-own":
            issues.append(f"[WRITE] any logged-in user can INSERT arbitrary rows into {t} ({r['auth_insert']})")
        for role in ("anon", "auth"):
            if r.get(f"{role}_update_other") == "ALLOWED":
                issues.append(f"[WRITE] {role} can UPDATE another user's row in {t}")

    for fn, args in RPC_PROBES.items():
        for role, bearer in (("anon", None), ("auth", jwt)):
            if role == "auth" and not jwt:
                continue
            s, b, _ = req("POST", f"/rest/v1/rpc/{fn}", ANON, bearer, body=args)
            if classify(s, b) != "BLOCKED" and s != 404:
                issues.append(f"[RPC  ] {role} can EXECUTE {fn} -> {str(b)[:80]}")

    # Column-level: can a user raise their own token_balance / plan?
    if jwt:
        s, b, _ = req("GET", f"/rest/v1/profiles?id=eq.{uid}&select=token_balance", ANON, jwt)
        if s == 200 and b:
            bal = b[0]["token_balance"] or 0
            s, b, _ = req("PATCH", f"/rest/v1/profiles?id=eq.{uid}", ANON, jwt, body={"token_balance": bal + 1},
                          headers={"Prefer": "return=representation"})
            if s == 200 and b:
                req("PATCH", f"/rest/v1/profiles?id=eq.{uid}", SRV, body={"token_balance": bal})  # restore
                issues.append("[COL  ] user can write their own profiles.token_balance (self-mint tokens)")
        # Self-activate a paid plan (duplicate PK => nothing is ever written)
        s, b, _ = req("GET", f"/rest/v1/user_platform_subscriptions?select=id&limit=1", SRV)
        dup = b[0]["id"] if s == 200 and b else ZERO
        s, b, _ = req("POST", "/rest/v1/user_platform_subscriptions", ANON, jwt,
                      body={"id": dup, "user_id": uid, "plan_key": "business", "status": "active"})
        if classify(s, b) != "BLOCKED":
            issues.append("[COL  ] user can self-activate a paid platform plan")

    json.dump(rows, open("/tmp/rls_audit.json", "w"), indent=1)
    print(f"Scanned {len(tables)} tables, {len(RPC_PROBES)} RPCs. Raw results: /tmp/rls_audit.json")
    print(f"{len(issues)} issue(s):")
    for i in issues:
        print("  " + i)
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
