# AvatarTalk — Production Deployment Notes (Vercel)

The frontend now ships its own Vercel Serverless API routes for the
three flows that historically broke on `avatartalk.co`:

| Route | Purpose |
|-------|---------|
| `GET /api/profile/by-username/[username]` | Public profile fetch (works for logged-out visitors, bypasses RLS via service-role). |
| `POST /api/payment/token-purchase/create-order` | Creates a Razorpay order + a `token_purchases` pending row. |
| `POST /api/payment/token-purchase/verify` | HMAC-verifies the payment, credits `profiles.token_balance`, audits via `token_events`. Idempotent. |
| `POST /api/payment/plan-checkout/create-order` | Creates a Razorpay order for a plan in `platform_pricing_plans`. |
| `POST /api/payment/plan-checkout/verify` | HMAC-verifies, upserts `user_platform_subscriptions`, credits monthly tokens × cycle, audits via `platform_plan_transactions`. Idempotent. |

## 1. Required Vercel Environment Variables

Set these under **Vercel → Project Settings → Environment Variables**
(Production AND Preview, sensitive = unchecked unless noted):

| Name | Type | Value (sample) |
|------|------|----------------|
| `SUPABASE_URL` | secret | `https://hnxnvdzrwbtmcohdptfq.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | `sb_secret_…` (Supabase → Settings → API → service_role → Reveal) |
| `SUPABASE_ANON_KEY` | secret | the same `sb_publishable_…` key already in `vercel.json` |
| `RAZORPAY_KEY_ID` | secret | `rzp_live_…` (Razorpay Dashboard → Settings → API Keys) |
| `RAZORPAY_KEY_SECRET` | **secret** | corresponding live secret |
| `VITE_RAZORPAY_KEY_ID` | plain | mirror of `RAZORPAY_KEY_ID` — used as a frontend fallback if the API response is missing `key_id` |

The `VITE_*` and `SUPABASE_URL` keys are already auto-injected from
`vercel.json` — you only need to add the secrets.

**Why**: Vercel Serverless Functions read `process.env.*` at runtime.
Without these the helpers throw a clear error (e.g. "RAZORPAY_KEY_ID /
RAZORPAY_KEY_SECRET env vars missing on Vercel").

## 2. Redeploy

```bash
git push origin main
```

That single push deploys the SPA AND the API routes in one atomic
release. No separate Supabase CLI deploy step.

## 3. Local Dev

`yarn dev` (Vite on `:3000`) now serves the same `/api/*` handlers via
a tiny middleware plugin in `frontend/vite-plugins/dev-api.ts`. It
reads secrets from `backend/.env` so the Emergent preview can exercise
the same code path as production. Node 20 needs the `ws` package as a
WebSocket polyfill for the supabase-js realtime constructor — already
in `package.json`.

## 4. Smoke-Test Endpoints

```bash
# public profile (no auth)
curl https://avatartalk.co/api/profile/by-username/entrepreneurkousik

# token purchase create-order (auth required)
TOKEN=<supabase access_token>
curl -X POST https://avatartalk.co/api/payment/token-purchase/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tokens":1000000,"amount_inr":100}'

# plan create-order
curl -X POST https://avatartalk.co/api/payment/plan-checkout/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"<plan-uuid>","billingCycleMonths":1,"currency":"INR"}'
```

A `200 OK` with `success: true` confirms the route + env vars are
wired correctly.
