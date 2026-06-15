# AvatarTalk — Product Requirements Document

## Original Problem Statement
- Token buy + paid plan purchase failed with **"failed to create payment order"**.
- User requested: full server-side payment system (collect payment → credit tokens / upgrade plan), with the broken Supabase Edge Functions removed.
- Public profile visibility (RLS) — known broken, requires SQL migrations to be applied to Supabase (user has not yet provided DB password or PAT to run `/app/ULTIMATE_FIX_SCRIPT.sql`).
- **2026-05-26 follow-up** — On the deployed Vercel site (`avatartalk.co`) the three flows still broke because the FastAPI backend doesn't exist there. Public profile URLs returned "Not Found" / refresh-logout, "Buy Tokens" never opened Razorpay, plan checkout threw "Failed to start checkout".

## Tech Stack
- **Frontend**: React + Vite (TypeScript), Tailwind, shadcn/ui. Served from `/app/frontend` on port 3000.
- **Backend (Emergent preview)**: FastAPI on port 8001, exposed via Kubernetes ingress at `REACT_APP_BACKEND_URL`. All routes prefixed with `/api`.
- **Backend (Vercel production)**: Vercel Serverless Functions in `/app/api/*.ts` — same `/api/*` URL surface, deployed atomically with the SPA on every `git push`.
- **Auth + DB**: Supabase (Postgres + Auth). Service-role key kept server-side only.
- **Payments**: Razorpay. Python SDK on FastAPI, raw `fetch` to `api.razorpay.com/v1/orders` on Vercel.

## Implemented (2026-05-26) — Vercel Serverless API parity
### New Vercel routes (`/app/api/`)
- `GET  /api/profile/by-username/[username]` — service-role profile fetch + related (user_stats, products, events, avatar_configurations, social_links). Used by `ProfilePage.tsx` TIER-0 path.
- `POST /api/payment/token-purchase/create-order` — creates Razorpay order, inserts pending row in `token_purchases` with the verified live-DB schema (`tokens_purchased`, `amount`, `currency`, `razorpay_order_id`, `status`, `package_id`).
- `POST /api/payment/token-purchase/verify` — HMAC verify, read-modify-write `profiles.token_balance`, audit row in `token_events`, marks purchase completed. **Idempotent**.
- `POST /api/payment/plan-checkout/create-order` — queries `platform_pricing_plans` with real columns (`price_inr`, `price_3_month_inr`, `price_6_month_inr`, `price_12_month_inr`, `ai_tokens_monthly`), supports INR + USD currency (USD converted to INR at flat 83). Returns `{orderId, amount (rupees), keyId, planName, planKey, billingCycleMonths}`.
- `POST /api/payment/plan-checkout/verify` — upserts `user_platform_subscriptions` (active, expires_at = now + cycle), credits `ai_tokens_monthly × cycle` to `profiles.token_balance`, audit row in `platform_plan_transactions`. **Idempotent on `razorpay_order_id`**.
- Shared helpers in `/app/api/_lib/helpers.ts`: CORS, Supabase admin client (with Node-20 `ws` WebSocket polyfill), JWT auth, Razorpay order create, signature verify, error responder.

### Local Vite dev plugin
- `/app/frontend/vite-plugins/dev-api.ts` — middleware that serves `/api/*` Vercel handlers from the Vite dev server, reading secrets from `backend/.env`. Lets the Emergent preview exercise the same Vercel code paths.
- `vite.config.ts` wired with `devApiPlugin()` and `server.fs.allow: ['..']` so the plugin can ssrLoadModule from `/app/api`.

### Documentation
- `/app/VERCEL_API_ROUTES_GUIDE.md` — env-var checklist for the Vercel project, smoke-test curls, redeploy notes.
- `/app/memory/test_credentials.md` — pre-created Supabase user `avatartalk_test@example.com` / `TestPassword!234` (email already confirmed).

## Implemented (2026-05-23) — FastAPI baseline (still in use on Emergent preview)
[unchanged content below]

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
- **P1** — Add a Razorpay webhook endpoint (`POST /api/payment/webhook`) on Vercel as a server-side fallback if the user closes the checkout modal after the payment is captured but before `/verify` is called.
- **P1** — Apply `/app/ULTIMATE_FIX_SCRIPT.sql` to Supabase (only needed if the Supabase RLS migration is the long-term answer; the Vercel route now bypasses RLS so this is **optional** for the public-profile bug).
- **P2** — Add `data-testid` attributes to `Pay ₹X`, `Buy Now`, `Subscribe Now` buttons (testing agent flagged this — brittle text selectors today).
- **P2** — Fix the `realtime:token-balance-changes` channel ordering bug (`.on()` invoked after `.subscribe()` → unhandled rejection in console).
- **P2** — Make the `WelcomeWizard` onboarding modal one-click-dismissable; today every Skip advances one step and blocks deep links like `/settings/buy-tokens`.
- **P2** — Migrate the OTHER Razorpay flows still on Supabase Edge Functions (out of scope for this fix): gift tokens (`gift-token-verify`), paid posts (`EnhancedPostCardWithLocks.tsx`), creator subscribe (`SubscribeButton.tsx`), virtual collab (`VirtualCollaborationCard.tsx`).
- **P3** — Convert `_get_user_from_token` (FastAPI) to a `Depends(...)` so 401 fires before Pydantic 422 on malformed bodies.

## Test Credentials
See `/app/memory/test_credentials.md`. Razorpay test card: `4111 1111 1111 1111` (any future expiry, any CVV).

## Implemented (2026-02-10) — Profile crash fix
- **FollowButton React Hooks order fix** (`/app/frontend/src/components/FollowButton.tsx`): moved all hook calls (`useFollows`, `useState`, `useEffect`) above the conditional early-return for `currentUserId === targetUserId` and `!currentUserId`. Previously the component threw `Rendered more hooks than during the previous render` when a logged-in visitor viewed another user's profile, which tripped `ProfileErrorBoundary` → "Profile temporarily unavailable".
- **Verification**: Screenshot of `/entrepreneurkousik` on the preview environment renders the full profile (avatar, bio, follow button, posts/chat/product tabs). No error boundary, no React hooks error in console.

## Known caveats (carried over from prior session)
- Razorpay test key `rzp_test_SpjjvTzWU5fO6F` returns `Authentication failed` from Razorpay API. Operator must supply fresh working test Key ID + Secret in `/app/backend/.env` and restart backend to enable real payments.

## Implemented (2026-02-12) — Demo Mode fully removed
- Removed demo-mode fallback from `/app/api/_lib/helpers.ts` (`createRazorpayOrder` now throws on Razorpay errors; `verifyRazorpaySignature` no longer skips HMAC for `demo_order_*` IDs; `DEMO_ORDER_PREFIX` / `isDemoOrder` deleted).
- Removed demo-mode fallback from `/app/backend/payment_routes.py` (all 4 create-order/verify endpoints: `razorpay-create-order`, `token-purchase/create-order`, `plan-checkout/create-order`, plus their verify counterparts). No more `demo_mode` field in any response; verify endpoints HMAC-check every signature unconditionally.
- Frontend `DemoCheckoutModal`/`DemoCheckoutPortal` and the razorpay-interceptor were removed in an earlier pass; the SubscribeButton catch-block now surfaces `error.message` (the real Razorpay reason) instead of a generic toast.
- Regression suite: `/app/backend/tests/test_demo_mode_removal.py` (7/7 passing) — verifies all 4 endpoints return clean 400 errors with the Razorpay reason and that no response body contains `demo_mode` or `demo_order_`.

## Implemented (2026-06-15) — Share Smart Link-In-Bio strip on every dashboard page
- New row added inside `/app/frontend/src/components/DashboardHeaderStrip.tsx` (sticky under the main header) — label "Share Smart Link-In-Bio" on the left, Copy + Share buttons on the right. Test IDs: `share-bio-strip`, `share-bio-copy-button`, `share-bio-share-button`, `share-bio-url`.
- Because `DashboardHeaderStrip` is rendered by `DashboardPageLayout`, the strip appears on every dashboard page automatically (dashboard, avatar, tokens, social-links, account, earnings, …).
- Copy: `navigator.clipboard.writeText(profileUrl)` with `execCommand('copy')` textarea fallback for older mobile WebViews; success toast "Link copied" shows the URL.
- Share: reuses the existing `ShareModal` component (same modal triggered by the top-right Share button — by design, sharing single state).
- Testing agent verified 100% — 6/6 routes show the strip, Copy populates the clipboard with `http://localhost:3000/avatartalktest`, Share opens ShareModal with the URL pre-filled (see `/app/test_reports/iteration_5.json`).

## Implemented (2026-06-15) — Step-by-step server-side checkout UX
- `BuyTokensPage.tsx` + `PricingPage.tsx` Pay buttons now log `step 1/4 → 4/4` to the console on click.
- "Authentication failed" from Razorpay surfaces an unambiguous toast: "Razorpay keys are invalid — regenerate at dashboard.razorpay.com → Settings → API Keys".
- Razorpay modal config explicitly enables `card / netbanking / upi / wallet / paylater / emi`; card-network detection is handled natively by Razorpay (BIN → Visa/Mastercard/Amex/RuPay/Discover/Diners). Works with both test (`rzp_test_*`) and live (`rzp_live_*`) keys.
- Removed the secondary "Pay via Razorpay (hosted page)" button on `BuyTokensPage.tsx`.


- `/app/api/_lib/helpers.ts::createRazorpayOrder` wraps every `POST /v1/orders` call in an exponential-backoff retry loop (4 attempts, 400ms × attempt). Retries on transient signatures only — `Authentication failed`, `api key`, `try again`, `timeout`, HTTP 5xx/408/429. Real 400 validation failures surface on the first attempt. Mirrors the FastAPI-side wrapper.
- `/app/api/payment/diagnostics.ts` switched its probe from `GET /v1/payments` to `POST /v1/orders` with up to 3 retries — matches FastAPI.
- `/app/backend/tests/test_vercel_razorpay_retry.js` Node smoke (transpiles `helpers.ts` with esbuild, stubs `global.fetch`).

## Implemented (2026-06-15) — Server-side checkout hardening: webhook + hosted Payment-Link fallback
**Trigger:** User reported persistent "Failed to create order" / "Authentication failed" on the Buy Tokens + Pricing Pay buttons even after retry logic was added. Live stress test of the Razorpay test keys returned **401 on 10/10 attempts** — the keys are flat-out invalid (not flaky). No code change can authenticate dead credentials, so this iteration shipped two server-side guarantees so a working key set unlocks the full flow with zero further code changes:

### A. Razorpay Webhook (server-to-server completion)
- FastAPI: `POST /api/payment/webhook` (`/app/backend/payment_routes.py`). Verifies `X-Razorpay-Signature` HMAC SHA-256 against the raw body using `RAZORPAY_WEBHOOK_SECRET`. Handles `payment.captured` + `payment_link.paid`. Dispatches by `notes.type` (`custom_token_purchase` / `plan_purchase`) and looks up the row by `notes.purchase_id` / `notes.transaction_id` (with fallback to `razorpay_order_id`). **Idempotent** — completing an already-completed row is a no-op.
- Vercel: `POST /api/payment/webhook` (`/app/api/payment/webhook.ts`). Same logic; uses `bodyParser: false` so we can read raw bytes for HMAC. Mirrors FastAPI behaviour.
- Shared completion helpers in FastAPI: `_credit_token_purchase_by_id`, `_activate_plan_by_transaction_id`. Both webhook + `/verify` go through these, so token-credit / plan-activate logic is the single source of truth.

### B. Razorpay Payment Link (hosted-checkout fallback)
- FastAPI: `POST /api/payment/token-purchase/payment-link` + `POST /api/payment/plan-checkout/payment-link`. Pre-inserts a pending row with our internal `purchase_id` / `transaction_id` in `notes`, calls `razorpay_client.payment_link.create` (with the same retry/backoff as orders), returns `{ payment_link_url, payment_link_id, purchase_id|transaction_id }`.
- Vercel: same routes (`/app/api/payment/token-purchase/payment-link.ts`, `.../plan-checkout/payment-link.ts`) calling the new `createRazorpayPaymentLink` helper in `/app/api/_lib/helpers.ts`.
- Frontend: `BuyTokensPage.tsx` now has a visible **"Pay via Razorpay (hosted page) — no popup required"** secondary button (`data-testid="open-hosted-checkout-fallback"`) below the primary Pay button. Opens the returned URL in a new tab; webhook credits tokens once Razorpay fires `payment_link.paid`.

### Tests
- `/app/backend/tests/test_webhook_and_payment_links.py` (pytest, **9/9 pass**) — webhook signature accept/reject (missing/invalid/wrong-body sigs), unknown event ignored, unknown notes.type ignored, no-matching-purchase fallback path, payment-link endpoints auth-gated.
- `/app/backend/tests/test_vercel_razorpay_retry.js` (node, **13/13 pass**) — original 8 + 3 webhook-signature parity (accept/reject/no-secret) + 2 payment-link helper retry tests.
- `/app/backend/tests/test_payment_routes.py` regression — **31/32 pass** (the one failure is `test_valid_create_order` which makes a live Razorpay call and surfaces the dead test-keys; not a regression).

### Operator setup checklist (when a working key set is provided)
1. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` on both `/app/backend/.env` and Vercel Project Settings → Environment Variables.
2. Razorpay Dashboard → Settings → Webhooks → **Add New Webhook**:
   - URL: `https://avatartalk.co/api/payment/webhook` (production) or the preview URL `/api/payment/webhook`
   - Active Events: `payment.captured`, `payment_link.paid` (others are ack'd as ignored)
   - Secret: copy a strong random string into both Razorpay UI AND `RAZORPAY_WEBHOOK_SECRET` in `.env` / Vercel env
3. (Optional) Add `VITE_RAZORPAY_KEY_ID` to Vercel frontend env as a redundant fallback (`BuyTokensPage.tsx` uses it if `key_id` is missing from API response).

### Why both halves?
- Webhook = catches the case where the user closes the modal *after* capture but *before* `/verify` runs (silent money loss otherwise).
- Payment Link = bypass for ad-blockers, restrictive CSPs, mobile in-app browsers, transient JS-SDK failures. User gets a server-side guarantee that the checkout will reach Razorpay.
- `/app/api/_lib/helpers.ts::createRazorpayOrder` now wraps every Razorpay `POST /v1/orders` call in an exponential-backoff retry loop (4 attempts, 400ms × attempt delay). Retries on transient signatures only — `Authentication failed`, `api key`, `try again`, `timeout`, HTTP 5xx, 408, 429. Real 400 validation failures (bad amount/currency) surface on the first attempt. This mirrors the FastAPI-side `_create_razorpay_order` wrapper added in the previous iteration so the Emergent preview and the Vercel production deploy behave identically against the flaky test-key 401s (~30% rate observed).
- `/app/api/payment/diagnostics.ts` switched its probe from `GET /v1/payments` to `POST /v1/orders` (₹1 test order) with up to 3 retries — matches FastAPI. Old probe falsely reported `razorpay_auth_ok:false` on accounts that have `orders.create` scope but no `payments.read` scope.
- New regression suite `/app/backend/tests/test_vercel_razorpay_retry.js` (Node, 8/8 passing) — transpiles `helpers.ts` with esbuild, stubs `global.fetch`, and verifies: happy path, retry-on-401-then-success, no-retry-on-400, give-up-after-maxAttempts, retry-on-5xx, HMAC accept/reject/malformed.
- `/app/backend/tests/test_payment_routes.py` regression — still 19/19 passing (the live-Razorpay test still goes through, proving the FastAPI retry wrapper masks the flaky 401s).
- UI verified: Buy Tokens page → `data-testid="buy-tokens-button"` → POST `/api/payment/token-purchase/create-order` returns 200 → real Razorpay test-mode modal opens with the correct order_id + amount.
