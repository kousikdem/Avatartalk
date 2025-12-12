-- Add token_balance to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS token_balance BIGINT DEFAULT 1000,
ADD COLUMN IF NOT EXISTS monthly_token_quota BIGINT DEFAULT 5000;

-- Create token_events ledger table
CREATE TABLE public.token_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID,
  change BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('consumption', 'topup', 'refund', 'bonus', 'subscription')),
  model TEXT,
  input_tokens INT,
  output_tokens INT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create token_packages for purchase options
CREATE TABLE public.token_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tokens BIGINT NOT NULL,
  price_inr NUMERIC NOT NULL,
  price_usd NUMERIC,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  bonus_tokens BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create token_purchases for tracking purchases
CREATE TABLE public.token_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.token_packages(id),
  tokens_purchased BIGINT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily token usage aggregates
CREATE TABLE public.daily_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  input_tokens BIGINT DEFAULT 0,
  output_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  message_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, day)
);

-- Enable RLS
ALTER TABLE public.token_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for token_events
CREATE POLICY "Users can view their own token events"
ON public.token_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert token events"
ON public.token_events FOR INSERT
WITH CHECK (true);

-- RLS Policies for token_packages (public read)
CREATE POLICY "Anyone can view active token packages"
ON public.token_packages FOR SELECT
USING (is_active = true);

-- RLS Policies for token_purchases
CREATE POLICY "Users can view their own purchases"
ON public.token_purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage purchases"
ON public.token_purchases FOR ALL
WITH CHECK (true);

-- RLS Policies for daily_token_usage
CREATE POLICY "Users can view their own usage"
ON public.daily_token_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage"
ON public.daily_token_usage FOR ALL
WITH CHECK (true);

-- Insert default token packages
INSERT INTO public.token_packages (name, tokens, price_inr, price_usd, is_popular, bonus_tokens) VALUES
('Starter', 5000, 99, 1.19, false, 0),
('Basic', 15000, 249, 2.99, false, 500),
('Popular', 50000, 699, 8.49, true, 5000),
('Pro', 150000, 1799, 21.99, false, 20000),
('Enterprise', 500000, 4999, 59.99, false, 100000);

-- Create function to debit tokens
CREATE OR REPLACE FUNCTION public.debit_user_tokens(
  p_user_id UUID,
  p_tokens BIGINT,
  p_reason TEXT,
  p_model TEXT DEFAULT NULL,
  p_input_tokens INT DEFAULT NULL,
  p_output_tokens INT DEFAULT NULL,
  p_message_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_current_balance BIGINT;
  v_new_balance BIGINT;
BEGIN
  -- Get current balance with lock
  SELECT token_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  IF v_current_balance < p_tokens THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient tokens', 'balance', v_current_balance, 'required', p_tokens);
  END IF;
  
  v_new_balance := v_current_balance - p_tokens;
  
  -- Update balance
  UPDATE public.profiles
  SET token_balance = v_new_balance, updated_at = now()
  WHERE id = p_user_id;
  
  -- Log event
  INSERT INTO public.token_events (user_id, message_id, change, balance_after, reason, model, input_tokens, output_tokens)
  VALUES (p_user_id, p_message_id, -p_tokens, v_new_balance, p_reason, p_model, p_input_tokens, p_output_tokens);
  
  -- Update daily usage
  INSERT INTO public.daily_token_usage (user_id, day, input_tokens, output_tokens, total_tokens, message_count)
  VALUES (p_user_id, CURRENT_DATE, COALESCE(p_input_tokens, 0), COALESCE(p_output_tokens, 0), p_tokens, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET
    input_tokens = daily_token_usage.input_tokens + COALESCE(EXCLUDED.input_tokens, 0),
    output_tokens = daily_token_usage.output_tokens + COALESCE(EXCLUDED.output_tokens, 0),
    total_tokens = daily_token_usage.total_tokens + EXCLUDED.total_tokens,
    message_count = daily_token_usage.message_count + 1;
  
  RETURN jsonb_build_object('success', true, 'balance', v_new_balance, 'debited', p_tokens);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to credit tokens
CREATE OR REPLACE FUNCTION public.credit_user_tokens(
  p_user_id UUID,
  p_tokens BIGINT,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_new_balance BIGINT;
BEGIN
  UPDATE public.profiles
  SET token_balance = COALESCE(token_balance, 0) + p_tokens, updated_at = now()
  WHERE id = p_user_id
  RETURNING token_balance INTO v_new_balance;
  
  IF v_new_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Log event
  INSERT INTO public.token_events (user_id, change, balance_after, reason)
  VALUES (p_user_id, p_tokens, v_new_balance, p_reason);
  
  RETURN jsonb_build_object('success', true, 'balance', v_new_balance, 'credited', p_tokens);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;