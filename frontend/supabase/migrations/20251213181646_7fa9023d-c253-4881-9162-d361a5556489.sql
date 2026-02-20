-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text UNIQUE NOT NULL,
  is_enabled boolean DEFAULT false,
  description text,
  affected_roles text[] DEFAULT ARRAY['user'],
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_table text,
  target_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create token_configuration table
CREATE TABLE IF NOT EXISTS public.token_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_system_limits table
CREATE TABLE IF NOT EXISTS public.ai_system_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  limit_key text UNIQUE NOT NULL,
  limit_value jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_system_limits ENABLE ROW LEVEL SECURITY;

-- Create is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = 'super_admin'
  )
$$;

-- RLS for platform_settings
CREATE POLICY "Super admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can view platform settings" ON public.platform_settings
  FOR SELECT TO authenticated USING (true);

-- RLS for feature_flags
CREATE POLICY "Super admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can view feature flags" ON public.feature_flags
  FOR SELECT TO authenticated USING (true);

-- RLS for admin_audit_logs
CREATE POLICY "Super admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (public.is_super_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.admin_audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS for token_configuration
CREATE POLICY "Super admins can manage token config" ON public.token_configuration
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can view token config" ON public.token_configuration
  FOR SELECT TO authenticated USING (true);

-- RLS for ai_system_limits
CREATE POLICY "Super admins can manage AI limits" ON public.ai_system_limits
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can view AI limits" ON public.ai_system_limits
  FOR SELECT TO authenticated USING (true);

-- Create log_admin_action function
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type text,
  p_target_table text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_table, target_id, old_value, new_value)
  VALUES (auth.uid(), p_action_type, p_target_table, p_target_id, p_old_value, p_new_value)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

-- Insert default feature flags
INSERT INTO public.feature_flags (flag_name, is_enabled, description, affected_roles)
VALUES 
  ('ai_chat_enabled', true, 'Enable AI chat functionality', ARRAY['user', 'admin', 'super_admin']),
  ('voice_chat_enabled', true, 'Enable voice chat functionality', ARRAY['user', 'admin', 'super_admin']),
  ('product_marketplace', true, 'Enable product marketplace', ARRAY['user', 'admin', 'super_admin']),
  ('virtual_collaboration', true, 'Enable virtual collaboration bookings', ARRAY['user', 'admin', 'super_admin']),
  ('subscription_system', true, 'Enable subscription system', ARRAY['user', 'admin', 'super_admin'])
ON CONFLICT (flag_name) DO NOTHING;

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES 
  ('platform_fees', '{"physical_product": 5, "digital_product": 10, "subscription": 50}', 'Platform fee percentages by product type'),
  ('default_token_balance', '{"amount": 1000}', 'Default token balance for new users'),
  ('supported_currencies', '{"currencies": ["INR", "USD", "EUR", "GBP"]}', 'Supported currencies for payments')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default AI limits
INSERT INTO public.ai_system_limits (limit_key, limit_value, description)
VALUES 
  ('max_tokens_per_message', '{"limit": 4000}', 'Maximum tokens per AI message'),
  ('max_messages_per_day', '{"limit": 1000}', 'Maximum messages per day per user'),
  ('rate_limit_per_minute', '{"limit": 20}', 'Rate limit for AI requests per minute')
ON CONFLICT (limit_key) DO NOTHING;

-- Insert default token configuration
INSERT INTO public.token_configuration (config_key, config_value, description)
VALUES 
  ('token_packages', '{"packages": [{"name": "Starter", "tokens": 5000, "price": 99}, {"name": "Pro", "tokens": 25000, "price": 399}, {"name": "Enterprise", "tokens": 100000, "price": 999}]}', 'Available token packages'),
  ('token_pricing', '{"per_1k_input": 0.5, "per_1k_output": 1.5}', 'Token pricing per 1000 tokens')
ON CONFLICT (config_key) DO NOTHING;

-- Assign super_admin role to the specified user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'kousik.dem@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;