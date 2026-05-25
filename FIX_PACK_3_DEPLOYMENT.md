# Fix Pack #3 — Deployment Steps

## What was broken
Three production issues, all caused by the same root cause:

| Issue | Symptom |
|---|---|
| Public profiles | "Profile not found" for logged-out visitors |
| Buy Tokens | Razorpay checkout never opens |
| Pricing / Plan purchase | "Failed to start checkout" toast before Razorpay opens |

## Root cause
The frontend was calling `/api/payment/*` and `/api/profile/by-username/*` via
**FastAPI fetch**. FastAPI is ONLY available in the Emergent preview (via the
Kubernetes ingress). On Vercel production, the SPA rewrite `(.*) -> /index.html`
intercepts these URLs and returns the HTML shell — so `res.json()` either throws
or `key_id` / `order_id` come back undefined and Razorpay never opens.

## What was changed (code)
1. **`frontend/src/lib/payment-api.ts`** — `callPaymentApi()` now routes every
   `/api/payment/*` path to the equivalent **Supabase Edge Function** via
   `supabase.functions.invoke()`. Automatically picks the right function based
   on the request body (slider purchase vs predefined package).

2. **`frontend/src/components/ProfilePage.tsx`** — removed the FastAPI bypass
   (METHOD 0). Now uses the SECURITY DEFINER RPC
   `get_public_profile_by_username` directly, which works for anon users via
   the RLS migration you already applied. Fallback direct-table query is now
   case-insensitive (`.ilike` instead of `.eq`).

3. **Edge functions hardened**:
   - `custom-token-verify` and `token-purchase-verify` now derive `user_id`
     from the JWT instead of trusting client-provided value (security fix —
     was a signature-bypass risk).

4. **`frontend/supabase/config.toml`** — removed duplicate `[functions.X]`
   entries that left `verify_jwt` in an undefined state.

## What YOU need to do

### 1. Redeploy edge functions
```bash
cd frontend
supabase functions deploy custom-token-purchase \
                          custom-token-verify \
                          token-purchase-verify \
                          platform-plan-checkout \
                          platform-plan-verify \
                          --project-ref hnxnvdzrwbtmcohdptfq
```

### 2. Verify Supabase secrets are set (re-check)
```bash
supabase secrets list --project-ref hnxnvdzrwbtmcohdptfq
```
Must include:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### 3. Deploy frontend to Vercel
Just push to your main branch — Vercel auto-deploys.
**`VITE_RAZORPAY_KEY_ID` is NOT required on Vercel** — the edge functions
return `key_id` from the server-side `RAZORPAY_KEY_ID` secret.

### 4. Verify (after deploy)
- Open `https://avatartalk.co/kousik` in an incognito window (logged out) →
  profile should render.
- Sign in → go to Buy Tokens → click any preset or use slider → Razorpay
  modal should open with the order amount.
- Go to Pricing → click any plan → Razorpay modal should open.

## What if something still fails

Open the browser DevTools **Network** tab and look at the call to
`https://hnxnvdzrwbtmcohdptfq.supabase.co/functions/v1/<function-name>`.
Inspect the response body — the real Razorpay / DB error reason is now
surfaced verbatim (no more generic "Failed to create order"). Share that
exact error text and we can fix it in one more turn.
