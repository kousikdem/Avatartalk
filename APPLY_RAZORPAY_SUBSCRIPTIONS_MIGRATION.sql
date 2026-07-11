-- ════════════════════════════════════════════════════════════════════════
-- Razorpay Subscriptions + UPI Autopay
-- Paste into Supabase SQL Editor and click RUN. Safe to re-run.
-- ════════════════════════════════════════════════════════════════════════

-- 1. Extend platform_pricing_plans with Razorpay Plan IDs (card + UPI variants)
ALTER TABLE public.platform_pricing_plans
  ADD COLUMN IF NOT EXISTS razorpay_plan_id      text,
  ADD COLUMN IF NOT EXISTS razorpay_plan_id_upi  text;

-- 2. razorpay_subscriptions table (per-user subscription tracking)
CREATE TABLE IF NOT EXISTS public.razorpay_subscriptions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_plan_key         text NOT NULL,
  razorpay_subscription_id  text NOT NULL UNIQUE,
  razorpay_plan_id          text NOT NULL,
  payment_method            text NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card','upi','netbanking','wallet')),
  status                    text NOT NULL DEFAULT 'created',  -- created / authenticated / active / halted / paused / cancelled / completed
  total_count               int  NOT NULL DEFAULT 12,
  paid_count                int  DEFAULT 0,
  current_start             bigint,   -- unix ts
  current_end               bigint,
  short_url                 text,
  last_error                text,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rz_subs_user     ON public.razorpay_subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_rz_subs_sub_id   ON public.razorpay_subscriptions (razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_rz_subs_status   ON public.razorpay_subscriptions (status);

ALTER TABLE public.razorpay_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rz_subs_owner_select" ON public.razorpay_subscriptions;
CREATE POLICY "rz_subs_owner_select"
  ON public.razorpay_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rz_subs_service_all" ON public.razorpay_subscriptions;
CREATE POLICY "rz_subs_service_all"
  ON public.razorpay_subscriptions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 3. credit_platform_plan_tokens RPC (idempotent by payment_id)
CREATE OR REPLACE FUNCTION public.credit_platform_plan_tokens(
  p_user_id    uuid,
  p_plan_key   text,
  p_tokens     bigint,
  p_payment_id text,
  p_period     text DEFAULT 'monthly'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_now         timestamptz := now();
BEGIN
  -- Idempotency: skip if we already credited this Razorpay payment_id
  SELECT id INTO v_existing_id
  FROM public.token_ledger
  WHERE reference_id = p_payment_id AND user_id = p_user_id
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'skipped', true, 'reason', 'already_credited');
  END IF;

  -- Insert ledger row
  BEGIN
    INSERT INTO public.token_ledger (user_id, delta, reason, reference_id, metadata, created_at)
    VALUES (
      p_user_id,
      p_tokens,
      'plan_subscription_charge',
      p_payment_id,
      jsonb_build_object('plan_key', p_plan_key, 'period', p_period),
      v_now
    );
  EXCEPTION WHEN undefined_table THEN
    -- token_ledger not present; fall through and only bump the balance
    NULL;
  END;

  -- Update platform subscription record (extend expiry by 1 month per charge)
  INSERT INTO public.user_platform_subscriptions (user_id, plan_key, status, expires_at, updated_at)
  VALUES (p_user_id, p_plan_key, 'active', v_now + interval '35 days', v_now)
  ON CONFLICT (user_id) DO UPDATE
    SET plan_key   = EXCLUDED.plan_key,
        status     = 'active',
        expires_at = GREATEST(COALESCE(public.user_platform_subscriptions.expires_at, v_now), v_now) + interval '35 days',
        updated_at = v_now;

  RETURN jsonb_build_object('ok', true, 'credited', p_tokens);
END $$;

GRANT EXECUTE ON FUNCTION public.credit_platform_plan_tokens(uuid, text, bigint, text, text) TO service_role;

-- 4. Verify
SELECT
  'razorpay_subscriptions' AS artifact, count(*) AS rows FROM public.razorpay_subscriptions
UNION ALL
SELECT 'platform_pricing_plans.razorpay_plan_id',
       count(*) FROM public.platform_pricing_plans WHERE razorpay_plan_id IS NOT NULL
UNION ALL
SELECT 'platform_pricing_plans.razorpay_plan_id_upi',
       count(*) FROM public.platform_pricing_plans WHERE razorpay_plan_id_upi IS NOT NULL;
