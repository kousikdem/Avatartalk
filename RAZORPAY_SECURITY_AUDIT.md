# AvatarTalk — Razorpay Payment Security Audit

**Date:** 2026-07
**Scope:** Razorpay payment flow security review across all 4 payment paths
(plan subscriptions, token packs, product checkout, paid-post unlocks)
**Verdict:** ✅ **SECURE — no architecture changes required.**

---

## Executive Summary

The original request stated three security requirements:

> 1. Razorpay Key Secret MUST NEVER be in frontend code.
> 2. Order creation MUST happen on the server.
> 3. Payment signature MUST be verified on server before granting access.

I performed a code-level audit. **All three requirements are already met** by the
current Supabase Edge Function implementation. The FastAPI backend
(`backend/server.py`) does not currently handle payments and does not need to —
the Supabase Edge Functions are server-side Deno workers running inside
Supabase's infrastructure (out of reach of the public).

No code changes are required.

---

## 1. Razorpay Key Secret is NOT in the frontend bundle ✅

I searched every TypeScript / JavaScript / HTML / env / config file for
`RAZORPAY_KEY_SECRET` or any variant. The only matches are in two places:

| Location | Context | Risk |
|---|---|---|
| `supabase/functions/*/index.ts` (16 files) | Read via `Deno.env.get('RAZORPAY_KEY_SECRET')` inside Edge Functions. These run on Supabase's servers in Deno, **not in the browser**. | None |
| `src/components/super-admin/IntegrationOAuthManager.tsx:120` | A string literal `'RAZORPAY_KEY_SECRET'` used as an env-var **name label** in the admin UI for the super-admin to know which secret to set in Supabase Dashboard. | None — it's a label, not a value |

**Crucial absences (also verified):**
- `.env`, `.env.example`, `vite.config.*`, `vercel.json` — no `RAZORPAY_KEY_SECRET`, no `VITE_RAZORPAY_*`, no `REACT_APP_RAZORPAY_*`.
- No `process.env.RAZORPAY_KEY_SECRET` / `import.meta.env.RAZORPAY_KEY_SECRET` in any browser-bundled file.

→ Vite/CRA bundlers only expose env vars prefixed with `VITE_` or
`REACT_APP_`. Because no such prefixed Razorpay secret exists, **it is
physically impossible for the secret to end up in the JS bundle**.

What IS exposed to the frontend (and intentionally so) is `RAZORPAY_KEY_ID` —
the **public** Razorpay key, which is safe to ship (it's printed inside the
checkout widget itself and used only to identify the merchant; Razorpay
explicitly designates this as the public half of the key pair).

---

## 2. Order creation happens on the server ✅

All four payment paths route through a Supabase Edge Function that holds
`RAZORPAY_KEY_SECRET` in its environment and signs requests to
`https://api.razorpay.com/v1/orders` with HTTP Basic auth.
The frontend never talks to Razorpay's order API directly.

| Frontend caller | Server-side function (Supabase Edge) | Razorpay API call |
|---|---|---|
| `PricingPage.tsx`, `PricingStep.tsx` (plan checkout) | `platform-plan-checkout/index.ts` | `POST /v1/orders` |
| `BuyTokensPage.tsx`, `PricingPage.tsx` (token packs) | `custom-token-purchase/index.ts`, `token-purchase-create-order/index.ts` | `POST /v1/orders` |
| `CheckoutModal.tsx` (product purchase) | `product-checkout/index.ts` | `POST /v1/orders` |
| `EnhancedPostCardWithLocks.tsx` (paid-post unlock) | `razorpay-create-order/index.ts` | `POST /v1/orders` |
| Gift tokens | `gift-token-create-order/index.ts` | `POST /v1/orders` |

Each Edge Function also authenticates the **caller** before creating an order
— it reads the `Authorization: Bearer <Supabase JWT>` header sent by the
frontend, calls `supabase.auth.getUser(token)`, and rejects unauthenticated
or expired calls (HTTP 401).

E.g. `razorpay-create-order/index.ts`:
```ts
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) return new Response(JSON.stringify({error:'Invalid token'}), {status:401});
```

→ A user cannot create an order on behalf of someone else — `buyerId` from
the request body is cross-checked against `user.id` from the JWT, and a 403
is returned on mismatch.

---

## 3. Payment signatures are verified on the server ✅

After Razorpay's checkout widget completes, the frontend posts
`{razorpay_order_id, razorpay_payment_id, razorpay_signature}` to a server-side
verify function. The function recomputes the HMAC-SHA256 of
`order_id|payment_id` using `RAZORPAY_KEY_SECRET` and rejects the request if
the recomputed digest does not match the one supplied.

| Verify function | Algorithm | Effect on mismatch |
|---|---|---|
| `platform-plan-verify/index.ts` | HMAC-SHA256 via `crypto.subtle.importKey` + `crypto.subtle.sign` | HTTP 400, no DB write, no plan activation |
| `product-payment-verify/index.ts` | HMAC-SHA256 via Web Crypto API | HTTP 400, order stays `pending` |
| `custom-token-verify/index.ts` | HMAC-SHA256 via Web Crypto API | HTTP 400, no tokens credited |
| `token-purchase-verify/index.ts` | HMAC-SHA256 | HTTP 400 |
| `razorpay-verify-payment/index.ts` | HMAC-SHA256 | HTTP 400 |
| `gift-token-verify/index.ts` | HMAC-SHA256 | HTTP 400, no gift delivered |

Excerpt from `platform-plan-verify/index.ts`:
```ts
const cryptoKey = await crypto.subtle.importKey(
  "raw",
  encoder.encode(RAZORPAY_KEY_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false, ["sign"]
);
const sig = await crypto.subtle.sign("HMAC", cryptoKey,
  encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`));
const expected = bufToHex(sig);
if (expected !== razorpay_signature) throw new Error('Invalid signature');
```

→ Forging a payment with a wrong signature is mathematically infeasible
without the secret.

---

## 4. Defense-in-depth checks

| Threat | Mitigation in place |
|---|---|
| Replay attack with a captured `(order_id, payment_id, signature)` | Each `razorpay_order_id` is single-use — the verify functions check `status` on `platform_plan_transactions` / `orders` and refuse to re-credit if already `completed`. |
| Tampering with `amount` client-side | The amount is **re-derived server-side** from `platform_pricing_plans` table / `products.price` — the client-supplied amount is ignored for charging. |
| Buyer impersonation | Authenticated user.id from the Supabase JWT overrides any `buyerId` in the request body (and 403 is returned on explicit mismatch). |
| Cross-currency tampering | Currency is also looked up server-side; the client cannot pick an arbitrary cheap currency. |
| Missing CORS controls | Each Edge Function only allows the two whitelisted methods (`POST`, `OPTIONS`) and rejects requests without `Authorization` header. |
| Token bypass via direct profile mutation | RLS policies on `profiles` and `user_platform_subscriptions` allow `service_role` only to write `token_balance` and `plan` fields. The Edge Function uses the service-role key, the frontend cannot. |
| Logs containing PII / keys | `RAZORPAY_KEY_SECRET` is never logged in any verify or create-order function (only `razorpay_order_id` and truncated user ID). |

---

## 5. Things you should still verify in production (one-time check)

These are configuration-side checks I cannot make for you from the codebase
alone. Please confirm in your Supabase Dashboard:

1. **Supabase Dashboard → Project Settings → Edge Functions → Secrets**
   should contain:
   ```
   RAZORPAY_KEY_ID            = rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET        = (32+ char secret)
   RAZORPAY_WEBHOOK_SECRET    = (set if you've enabled webhooks)
   ```
   These should appear **only here**, not in the frontend deployment env
   (Vercel/Netlify/etc.).

2. **Vercel / Netlify / hosting provider env vars** — confirm only the
   *public* variables are set there:
   ```
   VITE_SUPABASE_PROJECT_ID
   VITE_SUPABASE_PUBLISHABLE_KEY     (a.k.a. anon key — safe to expose)
   VITE_SUPABASE_URL
   ```
   No `RAZORPAY_*`, no `SUPABASE_SERVICE_ROLE_KEY`, no `SUPABASE_JWT_SECRET`.

3. **Razorpay Dashboard → Settings → Webhooks** — make sure webhook secret
   is set, and the webhook URL points at a server-side function
   (`https://<project>.functions.supabase.co/razorpay-webhook` if you add
   one) — NOT at the frontend.

4. **Browser DevTools sanity check (5-second test):**
   - Open your deployed site, F12 → Sources tab.
   - Search the bundled JS for `RAZORPAY_KEY_SECRET`. Expected result: **0
     matches**. If matches appear, raise it as a P0.

5. **Git history audit (one-off):** run
   ```bash
   git log --all -p -S "RAZORPAY_KEY_SECRET" | head -200
   ```
   If a real secret was ever committed (even in an old `.env` you've since
   removed), rotate the key in Razorpay Dashboard immediately.

---

## 6. Conclusion

The original architecture diagram you shared:

```
Frontend → POST /api/payments/create-order (with JWT)
        → Backend verifies JWT → creates Razorpay order
        → Frontend shows Razorpay checkout widget
        → User pays → server verifies signature → updates DB
```

…is *exactly* what AvatarTalk already does, except `/api/payments/...` is
implemented as Supabase Edge Functions (`supabase.functions.invoke('platform-plan-checkout', …)`
etc.) instead of FastAPI routes on `backend/server.py`. Both are valid
server-side hosting choices; the security properties are identical.

**No code changes recommended.** If you ever want to migrate from
Supabase Edge Functions to FastAPI for operational reasons (cold-start
performance, observability, etc.), that's a separate, larger refactor —
not a security fix.

---

### Appendix A — File-by-file confirmation

```
Search: RAZORPAY_KEY_SECRET in any frontend bundle target
  frontend/src/**/*.ts*       0 matches  ✅
  src/**/*.ts* (legacy)       1 match    (label only, line 120 of
                                          IntegrationOAuthManager.tsx — string
                                          literal of the env-var NAME, not the
                                          value)  ✅
  index.html                  0 matches  ✅
  vite.config.ts              0 matches  ✅
  package.json                0 matches  ✅
  frontend/.env*              0 matches  ✅

Search: VITE_RAZORPAY_* / REACT_APP_RAZORPAY_*
  Entire repo                 0 matches  ✅
```

### Appendix B — Server-side payment functions (read-only inventory)

```
supabase/functions/
├── razorpay-create-order/index.ts          # generic order creation (gift, post unlocks)
├── razorpay-verify-payment/index.ts        # generic signature verify
├── product-checkout/index.ts               # product purchase order
├── product-payment-verify/index.ts         # product signature verify + order completion
├── platform-plan-checkout/index.ts         # plan subscription order
├── platform-plan-verify/index.ts           # plan signature verify + monthly token credit
├── custom-token-purchase/index.ts          # variable-amount token purchase order
├── custom-token-verify/index.ts            # token signature verify + credit
├── token-purchase-create-order/index.ts    # fixed-pack token order
├── token-purchase-verify/index.ts          # fixed-pack token verify
├── gift-token-create-order/index.ts        # gift-to-user order
└── gift-token-verify/index.ts              # gift signature verify + transfer
```

All 12 functions are server-side (Deno on Supabase infrastructure). None of
them are reachable to read `RAZORPAY_KEY_SECRET` from outside the Supabase
project — only the function code itself has access via `Deno.env.get(...)`.
