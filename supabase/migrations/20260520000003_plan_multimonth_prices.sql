-- Add multi-month price columns to platform_pricing_plans if missing
ALTER TABLE public.platform_pricing_plans
  ADD COLUMN IF NOT EXISTS price_3_month_inr  numeric,
  ADD COLUMN IF NOT EXISTS price_3_month_usd  numeric,
  ADD COLUMN IF NOT EXISTS price_6_month_inr  numeric,
  ADD COLUMN IF NOT EXISTS price_6_month_usd  numeric,
  ADD COLUMN IF NOT EXISTS price_12_month_inr numeric,
  ADD COLUMN IF NOT EXISTS price_12_month_usd numeric;

-- Back-fill with standard discounts (10% / 15% / 20% off)
UPDATE public.platform_pricing_plans SET
  price_3_month_inr  = COALESCE(price_3_month_inr,  ROUND(price_inr * 3 * 0.90, 2)),
  price_3_month_usd  = COALESCE(price_3_month_usd,  ROUND(price_usd * 3 * 0.90, 2)),
  price_6_month_inr  = COALESCE(price_6_month_inr,  ROUND(price_inr * 6 * 0.85, 2)),
  price_6_month_usd  = COALESCE(price_6_month_usd,  ROUND(price_usd * 6 * 0.85, 2)),
  price_12_month_inr = COALESCE(price_12_month_inr, ROUND(price_inr * 12 * 0.80, 2)),
  price_12_month_usd = COALESCE(price_12_month_usd, ROUND(price_usd * 12 * 0.80, 2))
WHERE plan_key IN ('creator', 'pro', 'business');

-- Ensure platform_plan_transactions has all columns
ALTER TABLE public.platform_plan_transactions
  ADD COLUMN IF NOT EXISTS transaction_type  text DEFAULT 'purchase',
  ADD COLUMN IF NOT EXISTS previous_plan_key text DEFAULT 'free';

-- Ensure token_purchases has required columns
ALTER TABLE public.token_purchases
  ADD COLUMN IF NOT EXISTS package_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  ADD COLUMN IF NOT EXISTS razorpay_signature text;
