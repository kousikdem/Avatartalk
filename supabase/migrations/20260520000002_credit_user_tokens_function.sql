-- =====================================================================
-- credit_user_tokens: atomically add tokens to a user's balance
-- Returns JSON: { success: boolean, balance: number, error?: string }
-- =====================================================================

CREATE OR REPLACE FUNCTION public.credit_user_tokens(
  p_user_id uuid,
  p_tokens   bigint,
  p_reason   text DEFAULT 'topup'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_balance bigint;
  v_new_balance bigint;
BEGIN
  IF p_tokens <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'tokens must be positive');
  END IF;

  -- Lock the row to prevent race conditions
  SELECT COALESCE(token_balance, 0)
    INTO v_old_balance
    FROM public.profiles
   WHERE id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'profile not found');
  END IF;

  v_new_balance := v_old_balance + p_tokens;

  UPDATE public.profiles
     SET token_balance = v_new_balance,
         updated_at    = now()
   WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.token_events (user_id, change, balance_after, reason)
  VALUES (p_user_id, p_tokens, v_new_balance, p_reason)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'credited', p_tokens
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.credit_user_tokens(uuid, bigint, text) TO service_role;

-- Also ensure token_events table exists
CREATE TABLE IF NOT EXISTS public.token_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change       bigint      NOT NULL,
  balance_after bigint     NOT NULL,
  reason       text        NOT NULL DEFAULT 'topup',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_events_user_id ON public.token_events(user_id);
ALTER TABLE public.token_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own token events" ON public.token_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
GRANT SELECT ON public.token_events TO authenticated;
GRANT INSERT, SELECT ON public.token_events TO service_role;

-- Ensure token_purchases table has is_active on token_packages
ALTER TABLE IF EXISTS public.token_packages
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
