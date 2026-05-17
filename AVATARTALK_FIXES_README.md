# AvatarTalk Fix Pack — Deployment Steps

This patch fixes:

1. **"Failed to save social link"** in onboarding popup & Settings.
2. **Monthly token allocation** for yearly (multi-month) plans (Creator, Pro, Business).
3. **Earnings currency conversion** (mixed-currency sales now aggregate correctly).
4. **"Failed to create order"** errors — real Razorpay reasons now surfaced.
5. **"Payment failed"** errors — show actual failure reason, not blank toast.

---

## ✅ Step 1 — Apply the DB migration

Open the Supabase **SQL Editor** for project `hnxnvdzrwbtmcohdptfq` and run the file:

```
supabase/migrations/20260301000000_avatartalk_fixes.sql
```

This will:
- Add `custom_links jsonb` column to `social_links` (fixes social link save bug).
- Add `monthly_token_amount`, `last_monthly_credit_at`, `next_monthly_credit_at`, `months_credited` columns to `user_platform_subscriptions`.
- Install helper SQL functions `monthly_plan_tokens()` and `credit_monthly_plan_tokens()` used by the monthly drip.

> Until this migration is applied the social-link form will **still save** the standard platforms — the code now gracefully falls back when the `custom_links` column is missing.

## ✅ Step 2 — Deploy the updated Edge Functions

```
supabase functions deploy razorpay-create-order
supabase functions deploy product-checkout
supabase functions deploy platform-plan-checkout
supabase functions deploy platform-plan-verify
supabase functions deploy monthly-token-credit   # NEW
```

## ✅ Step 3 — Schedule the monthly drip job

Pick ONE of the options below.

### Option A — pg_cron (recommended, runs entirely inside Supabase)

```sql
-- one-time setup (requires Supabase Pro or higher)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- run every hour; the function itself filters which subscriptions are due
SELECT cron.schedule(
  'credit-monthly-plan-tokens',
  '15 * * * *',
  $$ SELECT public.credit_monthly_plan_tokens(); $$
);
```

### Option B — External cron hitting the new Edge Function

Schedule `cron-job.org`, GitHub Actions, etc. to POST hourly to:

```
POST https://hnxnvdzrwbtmcohdptfq.functions.supabase.co/monthly-token-credit
Headers: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

## ✅ Step 4 — Verify

1. Buy a Creator plan with a 3-month billing cycle.
2. Check `profiles.token_balance` increases by **1,000,000** (just the first month).
3. Check `user_platform_subscriptions` for the user — confirm `next_monthly_credit_at` is set to ~30 days later.
4. Manually trigger the drip (for testing) by running `SELECT public.credit_monthly_plan_tokens();` — balance should go up by another 1,000,000, `months_credited = 2`, `next_monthly_credit_at` pushed another 30 days. Function won't credit past `billing_cycle_months`.

---

## Per-plan monthly drip amounts

| Plan      | Monthly tokens |
|-----------|----------------|
| Creator   | 1,000,000      |
| Pro       | 2,000,000      |
| Business  | 5,000,000      |

For a 12-month plan the user receives the monthly amount up-front on purchase and then once every 30 days for the remaining 11 months.
