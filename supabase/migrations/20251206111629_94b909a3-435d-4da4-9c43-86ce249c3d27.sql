-- Fix function search path for update_integration_updated_at
CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix function search path for update_subscription_plans_updated_at
CREATE OR REPLACE FUNCTION public.update_subscription_plans_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix function search path for handle_subscription_changes (SECURITY DEFINER - higher risk)
CREATE OR REPLACE FUNCTION public.handle_subscription_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- No need to check following_id, just handle the subscription
  RETURN NEW;
END;
$$;