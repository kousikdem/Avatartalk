# AvatarTalk Test Credentials

> Backend uses Supabase Auth. There is no seeded public test user,
> but the fork agent created a working dev account that can be
> reused for automated tests.

## Pre-created Test Account (Supabase Auth)

| Field | Value |
|-------|-------|
| Email | `avatartalk_test@example.com` |
| Password | `TestPassword!234` |
| User ID | `215a438c-135f-401e-b2f8-9ab889584af1` |

Email is already confirmed via the Supabase admin API, so login works
immediately on both the Emergent preview and the production Vercel
URL.

## How to login programmatically

```bash
TOKEN=$(curl -s -X POST \
  "https://hnxnvdzrwbtmcohdptfq.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: sb_publishable_uaL-zelOHdGlOlvaWuIa1A_wtL7mx3p" \
  -H "Content-Type: application/json" \
  -d '{"email":"avatartalk_test@example.com","password":"TestPassword!234"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))")
```

Use `Authorization: Bearer $TOKEN` on any `/api/payment/*` call.

## Public Profile Test Username

`entrepreneurkousik` — real profile, used to verify the public profile
flow renders for logged-out visitors.

## Manual Razorpay Test Cards

- **Success**: `4111 1111 1111 1111` — any future expiry, any CVV.
- **Failure**: `4000 0000 0000 0002` — to verify the new payment.failed toast.

## Notes

- Razorpay keys in pod env (UPDATED 2026-06-15): `RAZORPAY_KEY_ID=rzp_test_T20oJ6nrpmfzIp`, `RAZORPAY_KEY_SECRET=Klh1GTpbLsd4eOSl4KU0oFa4`. **Live-stress-tested 10/10 OK** against api.razorpay.com. Production Vercel needs the same pair set in Project Settings → Environment Variables.
- Webhook secret: `RAZORPAY_WEBHOOK_SECRET=whsec_test_avatartalk_e2e` (placeholder — replace with the secret you set in Razorpay Dashboard → Settings → Webhooks → Edit Webhook → Secret).
- **Pod-bootstrap gotcha (testing-agent flagged 2026-06-15)**: on fresh pod fork, run `cd /app && npm install` once. The dev-api Vite plugin SSR-loads `/app/api/*.ts` which imports `@supabase/supabase-js` declared in `/app/package.json` — without `/app/node_modules` it 500s with "Cannot find module @supabase/supabase-js". Vercel production auto-installs, so prod is fine. Only the Emergent preview needs this.
- On the Emergent preview the `/api/*` routes are served by FastAPI
  (port 8001). On Vercel production they are served by the new
  Vercel Serverless Functions under `/app/api/`.
- Both implementations were verified against the same database
  schema (`token_purchases`, `platform_pricing_plans`,
  `user_platform_subscriptions`).
