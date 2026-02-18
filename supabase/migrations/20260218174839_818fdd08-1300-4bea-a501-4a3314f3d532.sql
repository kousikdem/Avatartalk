-- Fix: Replace permissive token_events INSERT policy with deny-all
-- Token events should ONLY be created by SECURITY DEFINER functions 
-- (debit_user_tokens, credit_user_tokens, transfer_tokens, process_token_gift)
-- which bypass RLS anyway.

DROP POLICY IF EXISTS "System can insert token events" ON public.token_events;

CREATE POLICY "Deny direct token event inserts"
ON public.token_events FOR INSERT
WITH CHECK (false);