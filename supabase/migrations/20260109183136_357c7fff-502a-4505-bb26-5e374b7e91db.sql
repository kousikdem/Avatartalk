-- Fix the transfer_tokens function to include amount_paid field
CREATE OR REPLACE FUNCTION public.transfer_tokens(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount integer,
  p_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_balance integer;
  v_min_retain integer := 15000;
  v_gift_id uuid;
  v_price_per_million integer := 1000;
  v_amount_paid numeric;
BEGIN
  -- Get minimum retain limit from settings
  SELECT (limit_value->>'limit')::integer INTO v_min_retain
  FROM public.ai_system_limits
  WHERE limit_key = 'visitor_gift_minimum_tokens';
  
  IF v_min_retain IS NULL THEN
    v_min_retain := 15000;
  END IF;

  -- Get price per million for calculating equivalent INR value
  SELECT (limit_value->>'limit')::integer INTO v_price_per_million
  FROM public.ai_system_limits
  WHERE limit_key = 'gift_token_price_per_million';
  
  IF v_price_per_million IS NULL OR v_price_per_million <= 0 THEN
    v_price_per_million := 1000;
  END IF;

  -- Calculate equivalent INR value for the gift
  v_amount_paid := (p_amount::numeric / 1000000) * v_price_per_million;

  -- Check sender balance
  SELECT token_balance INTO v_sender_balance
  FROM public.profiles
  WHERE id = p_sender_id
  FOR UPDATE;

  IF v_sender_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
  END IF;

  IF v_sender_balance - p_amount < v_min_retain THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance. You must retain at least ' || v_min_retain || ' tokens.');
  END IF;

  -- Deduct from sender
  UPDATE public.profiles
  SET token_balance = token_balance - p_amount
  WHERE id = p_sender_id;

  -- Credit to receiver
  UPDATE public.profiles
  SET token_balance = COALESCE(token_balance, 0) + p_amount
  WHERE id = p_receiver_id;

  -- Log sender debit
  INSERT INTO public.token_events (user_id, change, balance_after, reason)
  VALUES (p_sender_id, -p_amount, v_sender_balance - p_amount, 'gift_sent');

  -- Log receiver credit
  INSERT INTO public.token_events (user_id, change, balance_after, reason)
  SELECT p_receiver_id, p_amount, token_balance, 'gift_received'
  FROM public.profiles WHERE id = p_receiver_id;

  -- Create gift record with amount_paid
  INSERT INTO public.token_gifts (sender_id, receiver_id, amount, amount_paid, currency, message, status, completed_at)
  VALUES (p_sender_id, p_receiver_id, p_amount, v_amount_paid, 'INR', p_message, 'completed', now())
  RETURNING id INTO v_gift_id;

  -- Create notification for receiver
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT p_receiver_id, 'token_gift', 'Token Gift Received!',
    'You received ' || p_amount || ' tokens from ' || COALESCE(p.display_name, p.username, 'a supporter') || '!',
    jsonb_build_object('gift_id', v_gift_id, 'sender_id', p_sender_id, 'amount', p_amount)
  FROM public.profiles p WHERE p.id = p_sender_id;

  RETURN jsonb_build_object('success', true, 'gift_id', v_gift_id);
END;
$$;