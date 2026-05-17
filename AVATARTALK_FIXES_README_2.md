# AvatarTalk Fix Pack #2 — Deployment Steps

## What's Fixed

| # | Issue | Status |
|---|---|---|
| 1 | Onboarding popup → "Save Profile" → "Failed to update profile" toast | ✅ Code-fix only |
| 2 | User profiles not visible to logged-out / non-owner visitors (`/:username` blank) | ✅ Needs DB migration |
| 3 | Dashboard Products page slow / not showing my products | ✅ Code-fix only |
| 4 | Dashboard Token Buy → "Failed to create order" (generic toast) | ✅ Real reason now surfaced |
| 5 | Dashboard Plan buy/upgrade → "Edge Function returned non-2xx" | ✅ Real reason now surfaced |

---

## ✅ Step 1 — Apply the new SQL migration

In **Supabase Dashboard → SQL Editor**, run the contents of:

```
supabase/migrations/20260301000001_public_profiles_and_rls.sql
```

This grants public SELECT on the safe columns of `profiles`, `user_stats`,
`products` (published), `events` (published/upcoming),
`avatar_configurations` (active), `social_links`, `posts` (published) and
`ai_training_settings`, plus recreates the `public_profiles` VIEW.

It does **NOT** expose: `email`, `phone_number`, `date_of_birth`, `address`,
`gender`, `age`, `monthly_token_quota`, `token_balance`.

> If you've already applied `20260301000000_avatartalk_fixes.sql` from
> the previous fix-pack — apply this new one in addition (they don't conflict).

## ✅ Step 2 — Re-deploy edge functions

Only one edge function changed in this pack:

```
supabase functions deploy custom-token-purchase
```

(Optional, only if you want updated error logging) you can also redeploy:
```
supabase functions deploy platform-plan-checkout
supabase functions deploy razorpay-create-order
supabase functions deploy product-checkout
supabase functions deploy platform-plan-verify
```

These were already updated in fix-pack #1.

## ✅ Step 3 — Verify

### Test 1 — Onboarding save
1. Log in as a new user, fill the onboarding popup.
2. Leave "Date of birth" empty, fill name + username.
3. Click "Save Profile" → should succeed (previously errored).
4. Try a duplicate username → clear error: "That username is already taken."

### Test 2 — Public profile
1. Sign out completely.
2. Visit `https://yoursite.com/<some_username>` → profile renders, products
   (only `status=published`) and events visible.
3. Visit while logged in as a different user → same.

### Test 3 — Products page
1. Log in → `/settings/products` → loads only YOUR products in <2 s.
2. Create a new product → appears immediately via realtime.

### Test 4 — Token Buy
1. Dashboard → Buy Tokens → pick an amount → "Buy".
2. If Razorpay rejects (e.g. test key in live mode), toast now shows the
   real reason ("International cards are not enabled", etc.) instead of
   generic "Failed to create order".

### Test 5 — Plan Buy/Upgrade
1. Dashboard → Pricing → pick Creator/Pro/Business.
2. Click "Upgrade" → if something fails, the toast now shows the real
   reason ("Plan not found", "Razorpay: ...", etc.) instead of the cryptic
   "Edge Function returned a non-2xx status code".

---

## Notes

- Existing payment flows still go through Supabase Edge Functions
  (`platform-plan-checkout`, `platform-plan-verify`, `custom-token-purchase`,
  `custom-token-verify`). The architecture (no key-secret in frontend,
  HMAC-SHA256 signature verification server-side) is unchanged and remains
  secure — see `RAZORPAY_SECURITY_AUDIT.md`.

- The new `lib/supabase-errors.ts::extractFunctionsError()` helper is now
  used by Buy Tokens, Buy Plan (PricingPage) and onboarding Plan Step
  (PricingStep). If you have other places that call
  `supabase.functions.invoke(...)` and want the same clear errors, import
  it there too:

  ```ts
  import { extractFunctionsError } from '@/lib/supabase-errors';
  // ...
  const { data, error } = await supabase.functions.invoke('name', { body });
  if (error || data?.error) {
    const reason = await extractFunctionsError(error, data);
    throw new Error(reason);
  }
  ```
