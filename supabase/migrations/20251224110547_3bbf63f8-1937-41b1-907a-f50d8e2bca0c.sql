-- Create table for tracking token gifts
CREATE TABLE public.token_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  amount_paid NUMERIC(10,2) NOT NULL CHECK (amount_paid >= 10),
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.token_gifts ENABLE ROW LEVEL SECURITY;

-- RLS policies for token_gifts
CREATE POLICY "Users can view gifts they sent or received"
ON public.token_gifts
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can create gift orders"
ON public.token_gifts
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "System can update gift status"
ON public.token_gifts
FOR UPDATE
USING (true);

-- Create index for performance
CREATE INDEX idx_token_gifts_sender ON public.token_gifts(sender_id);
CREATE INDEX idx_token_gifts_receiver ON public.token_gifts(receiver_id);
CREATE INDEX idx_token_gifts_created ON public.token_gifts(created_at DESC);

-- Create function to process token gift (credits receiver and logs event)
CREATE OR REPLACE FUNCTION public.process_token_gift(
  p_gift_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT
) RETURNS JSONB AS $$
DECLARE
  v_gift RECORD;
  v_new_balance BIGINT;
BEGIN
  -- Get the gift record
  SELECT * INTO v_gift FROM public.token_gifts WHERE id = p_gift_id;
  
  IF v_gift IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift not found');
  END IF;
  
  IF v_gift.status = 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift already processed');
  END IF;
  
  -- Update gift status
  UPDATE public.token_gifts
  SET 
    status = 'completed',
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    completed_at = now()
  WHERE id = p_gift_id;
  
  -- Credit tokens to receiver
  UPDATE public.profiles
  SET token_balance = COALESCE(token_balance, 0) + v_gift.amount,
      updated_at = now()
  WHERE id = v_gift.receiver_id
  RETURNING token_balance INTO v_new_balance;
  
  -- Log the token event for receiver
  INSERT INTO public.token_events (user_id, change, balance_after, reason, metadata)
  VALUES (
    v_gift.receiver_id,
    v_gift.amount,
    v_new_balance,
    'gift_received',
    jsonb_build_object('gift_id', p_gift_id, 'sender_id', v_gift.sender_id)
  );
  
  RETURN jsonb_build_object('success', true, 'tokens_credited', v_gift.amount, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;