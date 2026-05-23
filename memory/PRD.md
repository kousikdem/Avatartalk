# AvatarTalk — Product Requirements Document

## Original Problem Statement
- Token buy + paid plan purchase failed with **"failed to create payment order"**.
- User requested: full server-side payment system (collect payment → credit tokens / upgrade plan), with the broken Supabase Edge Functions removed.
- Public profile visibility (RLS) — known broken, requires SQL migrations to be applied to Supabase (user has not yet provided DB password or PAT to run `/app/ULTIMATE_FIX_SCRIPT.sql`).

## Tech Stack
- **Frontend**: React + Vite (TypeScript), Tailwind, shadcn/ui. Served from `/app/frontend` on port 3000.
- **Backend**: FastAPI on port 8001, exposed via Kubernetes ingress at `REACT_APP_BACKEND_URL`. All routes prefixed with `/api`.
- **Auth + DB**: Supabase (Postgres + Auth). Service-role key kept server-side only.
- **Payments**: Razorpay (test mode). Python SDK (`razorpay==2.0.1`).

## Implemented (2026-05-23)
### Full server-side payment system
- 4 FastAPI endpoints in `/app/backend/payment_routes.py`:
  - `POST /api/payment/token-purchase/create-order` — creates Razorpay order, multiplies INR×100 for paise. Supports BOTH slider mode (validates against `gift_token_price_per_million`) AND package mode (validates against `token_packages` row when `package_id` is sent). Inserts pending row in `custom_token_purchases`.
  - `POST /api/payment/token-purchase/verify` — verifies HMAC SHA-256 signature, calls `credit_user_tokens` RPC, marks purchase completed (idempotent on replay).
  - `POST /api/payment/plan-checkout/create-order` — fetches plan, resolves price by `billingCycleMonths` (1/3/6/12), creates Razorpay order, inserts pending `platform_plan_transactions` row.
  - `POST /api/payment/plan-checkout/verify` — verifies signature, upserts `user_platform_subscriptions` with expiry, credits first month's tokens via `credit_user_tokens` RPC.
- Auth: each route forwards user JWT to `{SUPABASE_URL}/auth/v1/user`.
- Backend `.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.

### Frontend — all token/plan flows now call FastAPI
- `src/lib/payment-api.ts` — shared helper. Backend URL resolution: `VITE_BACKEND_URL` → `VITE_API_URL` → `window.location.origin` (works same-origin on Emergent preview).
- `src/pages/BuyTokensPage.tsx` (slider buy)
- `src/components/PricingPage.tsx` (token add-on + plan subscribe)
- `src/components/onboarding/steps/PricingStep.tsx` (paid plan during onboarding)
- `src/hooks/useTokens.ts` + `src/components/TokenPurchaseModal.tsx` (legacy package-based purchase)

### Removed
Deleted obsolete Supabase Edge Function directories:
- `/app/supabase/functions/custom-token-purchase`
- `/app/supabase/functions/custom-token-verify`
- `/app/supabase/functions/platform-plan-checkout`
- `/app/supabase/functions/platform-plan-verify`
- `/app/supabase/functions/token-purchase-create-order`
- `/app/supabase/functions/token-purchase-verify`

### Tests
`/app/backend/tests/test_payment_routes.py` — **19/19 passing** (run via `pytest /app/backend/tests/test_payment_routes.py -v`). Covers health, auth gating, validation, real Razorpay order creation (test mode), HMAC signature verify (positive + negative), idempotency, plan 404 path.

## File Map (Payment Feature)
- `/app/backend/payment_routes.py` — all 4 endpoints + Supabase REST helpers.
- `/app/backend/server.py` — wires `payment_router`.
- `/app/frontend/src/lib/payment-api.ts` — `callPaymentApi()` helper.
- `/app/frontend/src/pages/BuyTokensPage.tsx`
- `/app/frontend/src/components/PricingPage.tsx`
- `/app/frontend/src/components/onboarding/steps/PricingStep.tsx`
- `/app/frontend/src/hooks/useTokens.ts`
- `/app/frontend/src/components/TokenPurchaseModal.tsx`
- `/app/backend/tests/test_payment_routes.py`

## P0 / Backlog
- **P1** — **Apply `/app/ULTIMATE_FIX_SCRIPT.sql` to Supabase**. Public profile visibility, multi-month plan price columns, and `credit_user_tokens` RPC must exist. User has been asked for DB password / PAT / manual run — pending response.
- **P2** — Migrate the OTHER Razorpay flows still on Supabase Edge Functions (out of scope for this fix): gift tokens (`gift-token-verify`), paid posts (`EnhancedPostCardWithLocks.tsx` → `razorpay-create-order/razorpay-verify-payment`), creator subscribe (`SubscribeButton.tsx`), virtual collab (`VirtualCollaborationCard.tsx`).
- **P2** — Razorpay webhook endpoint (`/api/payment/webhook`) as fallback if user closes the checkout modal after paying.
- **P3** — Convert `_get_user_from_token` to a FastAPI `Depends(...)` so 401 fires before Pydantic 422 on malformed bodies.

## Test Credentials
See `/app/memory/test_credentials.md`. Razorpay test card: `4111 1111 1111 1111` (any future expiry, any CVV).
