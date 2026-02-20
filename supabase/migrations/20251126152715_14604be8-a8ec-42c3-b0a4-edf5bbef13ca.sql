-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price_amount INTEGER NOT NULL, -- Amount in smallest currency unit (paise for INR)
  currency TEXT NOT NULL DEFAULT 'INR',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'one-time'
  trial_days INTEGER DEFAULT 0,
  require_follow BOOLEAN DEFAULT true,
  benefits JSONB DEFAULT '[]'::jsonb,
  badge JSONB DEFAULT '{"text": "Subscriber", "color": "#6366f1"}'::jsonb,
  active BOOLEAN DEFAULT true,
  proration_policy TEXT DEFAULT 'new_only', -- 'new_only' or 'all_subscribers'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'created', -- 'created', 'paid', 'failed', 'refunded'
  refund_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'INR',
  platform_commission_percent NUMERIC DEFAULT 10,
  enabled BOOLEAN DEFAULT false,
  require_follow BOOLEAN DEFAULT true,
  default_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  allowed_currencies JSONB DEFAULT '["INR", "USD", "EUR"]'::jsonb,
  taxes JSONB DEFAULT '{}'::jsonb,
  refund_policy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update existing subscriptions table with new fields
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_profile_id ON public.subscription_plans(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(active);
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_payment_id ON public.transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_order_id ON public.transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscriber_id ON public.transactions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_transactions_profile_id ON public.transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_subscription_id ON public.subscriptions(razorpay_subscription_id);

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (active = true);

CREATE POLICY "Profile owners can manage their plans"
  ON public.subscription_plans FOR ALL
  USING (auth.uid() = profile_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = subscriber_id OR auth.uid() = profile_id);

CREATE POLICY "System can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for payment_settings
CREATE POLICY "Anyone can view enabled payment settings"
  ON public.payment_settings FOR SELECT
  USING (enabled = true);

CREATE POLICY "Profile owners can manage their payment settings"
  ON public.payment_settings FOR ALL
  USING (auth.uid() = profile_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_timestamp
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_plans_updated_at();

CREATE TRIGGER update_payment_settings_timestamp
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_timestamp
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();