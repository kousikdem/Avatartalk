-- =====================================================================
-- AvatarTalk Fixes Migration (2026-03-01)
-- =====================================================================
-- This migration addresses several issues:
--   1. Social Links: add `custom_links` jsonb column so onboarding popup
--      can save custom links without failing.
--   2. Subscriptions: add columns to support monthly token drip credit
--      for yearly / multi-month plans (Creator, Pro, Business).
--   3. Optional: helper function `credit_monthly_plan_tokens()` so cron
--      can grant the per-plan monthly token allotment.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) social_links.custom_links  (jsonb)
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.social_links
  ADD COLUMN IF NOT EXISTS custom_links jsonb DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------------------
-- 2) user_platform_subscriptions: monthly drip columns
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS public.user_platform_subscriptions
  ADD COLUMN IF NOT EXISTS monthly_token_amount bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_monthly_credit_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_monthly_credit_at timestamptz,
  ADD COLUMN IF NOT EXISTS months_credited integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_platform_subs_next_credit
  ON public.user_platform_subscriptions (next_monthly_credit_at)
  WHERE status = 'active';

-- ---------------------------------------------------------------------
-- 3) Helper function: monthly_plan_tokens()
--    Returns the per-month token allotment for a given plan_key.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.monthly_plan_tokens(plan_key_in text)
RETURNS bigint
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(plan_key_in)
    WHEN 'free'     THEN 10000::bigint        -- 10K (one-time, on signup elsewhere)
    WHEN 'creator'  THEN 1000000::bigint      -- 1M / month
    WHEN 'pro'      THEN 2000000::bigint      -- 2M / month
    WHEN 'business' THEN 5000000::bigint      -- 5M / month
    ELSE 0::bigint
  END;
$$;

-- ---------------------------------------------------------------------
-- 4) Helper function: credit_monthly_plan_tokens()
--    Iterates over active subscriptions whose next_monthly_credit_at is
--    due, credits the monthly amount, advances next_monthly_credit_at.
--    Designed to be called periodically (pg_cron, edge function, etc.).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_monthly_plan_tokens()
RETURNS TABLE (
  user_id uuid,
  plan_key text,
  tokens_credited bigint,
  next_credit timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub RECORD;
  v_tokens bigint;
  v_new_balance bigint;
  v_current_balance bigint;
BEGIN
  FOR sub IN
    SELECT s.*
    FROM public.user_platform_subscriptions s
    WHERE s.status = 'active'
      AND s.plan_key IN ('creator','pro','business')
      AND COALESCE(s.expires_at, now() + interval '100 years') > now()
      AND COALESCE(s.next_monthly_credit_at, now() - interval '1 day') <= now()
      AND COALESCE(s.months_credited, 0) < COALESCE(s.billing_cycle_months, 1)
  LOOP
    v_tokens := COALESCE(NULLIF(sub.monthly_token_amount, 0), public.monthly_plan_tokens(sub.plan_key));

    IF v_tokens <= 0 THEN
      CONTINUE;
    END IF;

    SELECT COALESCE(p.token_balance, 0) INTO v_current_balance
    FROM public.profiles p
    WHERE p.id = sub.user_id;

    v_new_balance := COALESCE(v_current_balance, 0) + v_tokens;

    UPDATE public.profiles
       SET token_balance = v_new_balance,
           updated_at = now()
     WHERE id = sub.user_id;

    INSERT INTO public.token_events (user_id, change, balance_after, reason)
    VALUES (
      sub.user_id,
      v_tokens,
      v_new_balance,
      'monthly_drip_' || sub.plan_key || '_month_' || (COALESCE(sub.months_credited,0) + 1)
    );

    UPDATE public.user_platform_subscriptions
       SET last_monthly_credit_at = now(),
           next_monthly_credit_at = now() + interval '30 days',
           months_credited        = COALESCE(months_credited, 0) + 1,
           updated_at             = now()
     WHERE id = sub.id;

    user_id := sub.user_id;
    plan_key := sub.plan_key;
    tokens_credited := v_tokens;
    next_credit := now() + interval '30 days';
    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.credit_monthly_plan_tokens() TO service_role;

-- ---------------------------------------------------------------------
-- (Optional) Schedule via pg_cron — uncomment after enabling pg_cron:
--
-- SELECT cron.schedule(
--   'credit-monthly-plan-tokens',
--   '0 * * * *', -- every hour
--   $$ SELECT public.credit_monthly_plan_tokens(); $$
-- );
-- ---------------------------------------------------------------------
