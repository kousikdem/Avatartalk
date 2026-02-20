-- Update default token balance to 100,000 for new users
ALTER TABLE public.profiles 
ALTER COLUMN token_balance SET DEFAULT 100000;

-- Update existing users with low token balance to 100k
UPDATE public.profiles 
SET token_balance = 100000 
WHERE token_balance < 100000;

-- Create table for custom token purchases (no fixed packages)
CREATE TABLE IF NOT EXISTS public.custom_token_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tokens_requested BIGINT NOT NULL,
  amount_inr NUMERIC(10,2) NOT NULL,
  amount_usd NUMERIC(10,2),
  price_per_million_tokens NUMERIC(10,4) DEFAULT 420, -- ₹5 per 1M = ₹420 in INR
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.custom_token_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for custom purchases
CREATE POLICY "Users can view own purchases" ON public.custom_token_purchases
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases" ON public.custom_token_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add token usage info to token_events if not exists
DO $$ BEGIN
  ALTER TABLE public.token_events ADD COLUMN IF NOT EXISTS message_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_custom_token_purchases_user ON public.custom_token_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_token_purchases_status ON public.custom_token_purchases(status);
CREATE INDEX IF NOT EXISTS idx_token_events_message ON public.token_events(message_id);

-- Add realtime for token events
ALTER PUBLICATION supabase_realtime ADD TABLE public.token_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_token_usage;