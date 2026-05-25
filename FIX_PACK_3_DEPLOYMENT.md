# Fix Pack #3 + #4 — Final Deployment Guide

## Quick summary
| Bug | Symptom | Code-side fix | Action you need to take |
|---|---|---|---|
| #1 | Public profile "Not Found" for logged-out users | Removed FastAPI bypass; resilient RPC + fallback; case-insensitive match | **Run `APPLY_PUBLIC_PROFILE_FIX.sql` in Supabase SQL editor** |
| #2 | "Razorpay checkout doesn't open" (Buy Tokens) | Centralised `ensureRazorpayLoaded()` + properly awaited; routes to Supabase Edge Functions | **Redeploy edge functions** (see below) |
| #3 | "Failed to start checkout" (Pricing) | Same fix as #2 (was using the same FastAPI path) | Same |

---

## ❗ Why this kept failing in production

The console log from the live site told us the actual cause:

```
GET https://hnxnvdzrwbtmcohdptfq.supabase.co/rest/v1/rpc/get_public_profile_by_username
→ 404 PGRST202
  "Could not find the function public.get_public_profile_by_username(p_username)
   in the schema cache"
```

**The Supabase function and RLS policies are NOT in your database** — the migration files exist in the repo but were never executed against project `hnxnvdzrwbtmcohdptfq`. The Supabase CLI `db push` was either skipped, or pointed at a different project, or someone reset the DB.

For payments, the symptom looks similar but the cause is different: the frontend was calling `/api/payment/*` (FastAPI), but FastAPI is only available in the Emergent preview via the K8s ingress — on Vercel, the SPA rewrite returns the HTML shell for that URL, so `key_id` / `order_id` come back undefined and Razorpay never opens.

---

## Step 1 — Apply the database fix

Open the Supabase SQL Editor for your project (https://supabase.com/dashboard/project/hnxnvdzrwbtmcohdptfq/sql/new) and paste the entire contents of:

```
/app/APPLY_PUBLIC_PROFILE_FIX.sql
```

It's idempotent — safe to run multiple times. The last `SELECT` prints a verification report. Every row must show `✅ OK`. If `demo user "kousik" exists` is `❌ MISSING`, the issue isn't your code — there's literally no user with that username in your database. Sign up a fresh test user and set their username to "kousik" via the onboarding flow.

---

## Step 2 — Redeploy the edge functions

```bash
cd frontend
supabase functions deploy custom-token-purchase \
                          custom-token-verify \
                          token-purchase-verify \
                          platform-plan-checkout \
                          platform-plan-verify \
                          --project-ref hnxnvdzrwbtmcohdptfq
```

Verify Razorpay secrets are set on the Supabase side (they're consumed by the edge functions, NOT by the Vite frontend):

```bash
supabase secrets list --project-ref hnxnvdzrwbtmcohdptfq
# Must include RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
```

> **You do NOT need `VITE_RAZORPAY_KEY_ID` on Vercel.** The edge function returns `key_id` from the server-side `RAZORPAY_KEY_ID` secret in its response, and the frontend uses that. Adding `VITE_RAZORPAY_KEY_ID` is harmless but unnecessary.

---

## Step 3 — Deploy the frontend

Push to `main` → Vercel auto-deploys. The new bundle includes:

- `frontend/src/lib/razorpay-loader.ts` — module-level promise cache that loads `checkout.razorpay.com/v1/checkout.js` exactly once, dedupes concurrent callers, has a 15-second timeout safety net, and lets retries succeed after a failed load.
- `frontend/src/lib/payment-api.ts` — `callPaymentApi()` now routes `/api/payment/*` paths to Supabase Edge Functions via `supabase.functions.invoke()` and surfaces the real Razorpay error description (no more generic "Failed to create order").
- `frontend/src/components/ProfilePage.tsx` — no more FastAPI bypass; RPC → fallback direct query (case-insensitive); robust error surfacing.
- `frontend/src/components/PricingPage.tsx`, `BuyTokensPage.tsx`, `CheckoutModal.tsx`, `onboarding/steps/PricingStep.tsx` — all use the shared `ensureRazorpayLoaded()` and properly `await` it before constructing `new window.Razorpay(...)`.
- Hardened edge functions `custom-token-verify` and `token-purchase-verify` — `user_id` is now derived from the JWT instead of being trusted from the request body (closes a signature-bypass vulnerability).

---

## Step 4 — Verify in incognito

1. Open `https://avatartalk.co/kousik` in an incognito window — profile must render without "Profile Not Found".
2. Sign in → Buy Tokens → pick any amount → Razorpay modal must open within 1 second.
3. Pricing page → click "Subscribe" on Starter plan → Razorpay modal must open.

If anything still fails, open DevTools → Network tab → find the call to `https://hnxnvdzrwbtmcohdptfq.supabase.co/functions/v1/<function-name>` and paste the response body — the **exact** Razorpay reason is now in there (e.g. `"International transactions are disabled for this account"`, `"Amount must be at least 100 paise"`, etc.).

---

## Files changed in this fix pack

```
frontend/src/lib/razorpay-loader.ts                        (NEW)
frontend/src/lib/payment-api.ts                            (rewritten)
frontend/src/components/ProfilePage.tsx                    (fetchProfile rewritten)
frontend/src/components/PricingPage.tsx                    (Razorpay loader + script removal)
frontend/src/components/CheckoutModal.tsx                  (uses loader)
frontend/src/components/onboarding/steps/PricingStep.tsx   (uses loader)
frontend/src/pages/BuyTokensPage.tsx                       (uses loader)
frontend/supabase/functions/custom-token-verify/index.ts   (JWT-derived user_id)
frontend/supabase/functions/token-purchase-verify/index.ts (JWT-derived user_id)
frontend/supabase/config.toml                              (dedup verify_jwt entries)
APPLY_PUBLIC_PROFILE_FIX.sql                               (NEW — run in SQL Editor)
```

Yarn build passes ✅.
