# AvatarTalk — Product Requirements Document

## Original Problem Statement
- Token buy + Paid Plan purchase failed with **"failed to create payment order"**.
- User requested: add Razorpay API Key/Secret to environment variables and build the full payment-collection and order-verification system (purchase → payment collect → credit tokens / upgrade plan).
- Public profile visibility (RLS) was also reported earlier but deferred (user said "forget old context first").

## Tech Stack
- **Frontend**: React + Vite (TypeScript), Tailwind, shadcn/ui. Served from `/app/frontend` on port 3000.
- **Backend**: FastAPI on port 8001, exposed via Kubernetes ingress at `REACT_APP_BACKEND_URL`. All routes prefixed with `/api`.
- **Auth + DB**: Supabase (Postgres + Auth). Service-role key kept server-side only.
- **Payments**: Razorpay (Indian payments). Test keys configured.

## Implemented (2026-05-20)
- Migrated Razorpay payment logic from broken Supabase Edge Functions → FastAPI:
  - `POST /api/payment/token-purchase/create-order` — creates Razorpay order, multiplies INR×100 for paise, validates token bounds & price match, inserts pending row in `custom_token_purchases`.
  - `POST /api/payment/token-purchase/verify` — verifies HMAC SHA-256 signature against `RAZORPAY_KEY_SECRET`, calls `credit_user_tokens` RPC, marks purchase completed, idempotent on replay.
  - `POST /api/payment/plan-checkout/create-order` — fetches plan, resolves price by billingCycleMonths (1/3/6/12), creates Razorpay order, inserts pending `platform_plan_transactions` row.
  - `POST /api/payment/plan-checkout/verify` — verifies signature, upserts `user_platform_subscriptions` with expiry, credits first month's tokens via `credit_user_tokens` RPC.
- Authentication: each route forwards user JWT to `{SUPABASE_URL}/auth/v1/user` for verification.
- Frontend `BuyTokensPage.tsx` and `PricingPage.tsx` now call FastAPI via new helper `lib/payment-api.ts` (uses `import.meta.env.VITE_BACKEND_URL` + user's Supabase access token).
- Backend `.env` keys: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.
- Tests: `/app/backend/tests/test_payment_routes.py` (19 tests, 100% pass) — created real Razorpay test orders, validated HMAC math both ways, validated idempotency, validated 401/400/404 error paths.

## File Map (Payment Feature)
- `/app/backend/payment_routes.py` — all 4 endpoints + Supabase REST helpers.
- `/app/backend/server.py` — `app.include_router(payment_router)`.
- `/app/frontend/src/lib/payment-api.ts` — `callPaymentApi()` helper.
- `/app/frontend/src/pages/BuyTokensPage.tsx` — token-buy page (settings → buy tokens).
- `/app/frontend/src/components/PricingPage.tsx` — pricing page (token add-on + plan checkout).
- `/app/backend/tests/test_payment_routes.py` — pytest suite.

## P0 / Backlog
- **P1** — Public profile visibility: run `/app/ULTIMATE_FIX_SCRIPT.sql` (or migrations `20260301000001_public_profiles_and_rls.sql`, `20260520000001_fix_public_profiles_visibility.sql`) against Supabase. Unauthenticated visitors currently see "Profile Not Found".
- **P2** — Razorpay webhook endpoint (`/api/payment/webhook`) as a fallback for verification when user closes the checkout modal after paying.
- **P2** — Refactor: convert `_get_user_from_token` to a FastAPI `Depends(...)` dependency so 401 fires before Pydantic 422 on malformed bodies.
- **P3** — Surface DB-insert failures in `/token-purchase/create-order` instead of returning `purchase_id=null` (currently swallowed). Subsequent verify will 404 confusingly.

## Test Credentials
See `/app/memory/test_credentials.md` — no seeded user; sign up via UI or pytest fixture creates `e2e+<hex>@avatartalk-test.io`.
