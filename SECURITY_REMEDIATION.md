# Security remediation — 2026-09 (gitleaks + RLS/GRANT audit)

## 1. Leaked secrets (gitleaks `detect --log-opts="--all"`, 1036 commits)
| Secret | Where it leaked | Status in current files | Required action |
|---|---|---|---|
| Supabase **service_role** JWT (project `hnxnvdzrwbtmcohdptfq`) | `vercel.json` (commit 24bae9f) | removed | **Rotate** (see below) |
| Razorpay key secret `Klh1…` | vercel.json, api/_lib/helpers.ts, 6 edge functions, tests, docs | removed / redacted | **Regenerate** in Razorpay |
| Razorpay key secrets `M6Ko…`, `9MTk…`, `Zd9B…` | old vercel.json / tests | gone | Regenerate (delete old keys) |
| `sb_publishable_…`, anon JWTs, `rzp_test_…` key IDs | many files | kept | Public by design (protected by RLS) — allow-listed in `.gitleaks.toml` |
| `sk_live_abc123…` | docs | kept | Placeholder, not a real key |

Git history still contains the old values (this agent cannot rewrite git history),
so **rotation is the only real fix** — a rotated key in history is harmless.

### Rotate
1. **Razorpay** → Dashboard → Account & Settings → API Keys → *Regenerate* (test and live).
2. **Supabase service_role** → Dashboard → Project Settings → API Keys:
   create a new **secret key** (`sb_secret_…`) and **disable the legacy JWT keys**
   (or rotate the legacy JWT secret — this also changes the anon key).
3. Put the new values in: Vercel → Project → Settings → Environment Variables
   (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`),
   Supabase → Edge Functions → Secrets, and `backend/.env` for the preview.
   Secrets are **no longer read from `vercel.json`** or hard-coded fallbacks.

### Prevent
- `.gitignore` consolidated: every `.env*` at any depth, keys/certs, credential JSON,
  Supabase CLI state, gitleaks reports (`.env.example` / `.env.production` allowed).
- `.gitleaks.toml` + `.github/workflows/gitleaks.yml` fail CI on any new secret.
- Re-scan any time: `gitleaks detect --log-opts="--all" -v` on a fresh clone.

## 2. Database RLS / GRANT fixes
Migration: `supabase/migrations/20260901000000_security_hardening_rls_grants.sql`
(idempotent; dry-run tested on PostgreSQL 15 with Supabase-style roles).

| Issue (confirmed live) | Fix |
|---|---|
| anon / any user could call `credit_user_tokens` (mint tokens) | Wrapped: only service_role or super admin |
| anon / any user could call `debit_user_tokens`, `decrypt_secret`, `encrypt_secret`, `process_token_gift`, `decrement_product_inventory`, `calculate_user_engagement_score` | EXECUTE → service_role only |
| users could write their own `profiles.token_balance` / `monthly_token_quota` | BEFORE INSERT/UPDATE guard trigger |
| users could self-activate any paid plan in `user_platform_subscriptions` | Guard trigger: browser may only pick *free* or cancel |
| anon could read all `post_unlocks` (`auth.uid() IS NULL` policy) | Buyer / post creator / super admin only |
| TRUNCATE/TRIGGER/REFERENCES granted to anon+authenticated | Revoked |
| admin, secrets & ledger tables granted to anon | Revoked from anon |
| RLS not guaranteed on every table | Enabled on all `public` tables |

**Status: APPLIED to the live project and verified (`rls_audit.py`: 14 issues → 0).**

Re-apply elsewhere: Supabase Dashboard → SQL Editor → paste the file → Run
(or `supabase db push`). Verify: `python3 scripts/rls_audit.py` (needs
`RLS_AUDIT_PASSWORD` for the test user) → expect `0 issue(s)`.

Edge function to redeploy: `product-payment-verify` (now uses the service client
for the inventory RPC): `supabase functions deploy product-payment-verify`.

## 3. Known remaining (next round — server-side payment verification)
Browser can still insert its own `post_unlocks`, `orders` (as paid/completed),
creator `subscriptions`, `token_gifts`, `transactions` and purchase rows without paying.
Plan: add verify endpoints (FastAPI + Vercel) that check the Razorpay signature,
then restrict those INSERT policies to free items only.
