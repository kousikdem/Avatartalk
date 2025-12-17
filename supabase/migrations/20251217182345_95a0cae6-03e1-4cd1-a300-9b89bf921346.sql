
-- Create table for managing platform integration secrets
CREATE TABLE IF NOT EXISTS public.platform_integration_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  secret_value TEXT, -- Encrypted in production
  environment TEXT NOT NULL DEFAULT 'live' CHECK (environment IN ('test', 'live')),
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(integration_name, secret_key, environment)
);

-- Create table for webhook logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for payment failure logs
CREATE TABLE IF NOT EXISTS public.payment_failure_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  failure_reason TEXT,
  error_code TEXT,
  error_description TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'INR',
  user_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for refund overrides
CREATE TABLE IF NOT EXISTS public.refund_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  razorpay_payment_id TEXT,
  original_amount NUMERIC NOT NULL,
  refund_amount NUMERIC NOT NULL,
  refund_reason TEXT,
  override_reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  razorpay_refund_id TEXT,
  initiated_by UUID REFERENCES auth.users(id) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for settlement/payout logs
CREATE TABLE IF NOT EXISTS public.settlement_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  utr TEXT,
  settlement_type TEXT,
  fees NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  net_amount NUMERIC,
  settlement_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for GST/VAT configuration
CREATE TABLE IF NOT EXISTS public.tax_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  tax_type TEXT NOT NULL,
  tax_rate NUMERIC NOT NULL,
  tax_name TEXT NOT NULL,
  is_inclusive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  effective_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(country_code, tax_type)
);

-- Create table for country-wise payment rules
CREATE TABLE IF NOT EXISTS public.country_payment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  payment_enabled BOOLEAN DEFAULT true,
  allowed_methods JSONB DEFAULT '["razorpay", "cod"]'::jsonb,
  min_order_amount NUMERIC DEFAULT 0,
  max_order_amount NUMERIC,
  currency TEXT NOT NULL,
  requires_kyc BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for site settings (metadata, SEO, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(setting_category, setting_key)
);

-- Enable RLS
ALTER TABLE public.platform_integration_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_failure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_payment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Super Admin only access
CREATE POLICY "Super admins can manage integration secrets"
  ON public.platform_integration_secrets
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage webhook logs"
  ON public.webhook_logs
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage payment failure logs"
  ON public.payment_failure_logs
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage refund overrides"
  ON public.refund_overrides
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage settlement logs"
  ON public.settlement_logs
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage tax configurations"
  ON public.tax_configurations
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage country payment rules"
  ON public.country_payment_rules
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage site settings"
  ON public.site_settings
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Public can read public site settings"
  ON public.site_settings
  FOR SELECT
  USING (is_public = true);

-- Insert default tax configurations
INSERT INTO public.tax_configurations (country_code, country_name, tax_type, tax_rate, tax_name) VALUES
  ('IN', 'India', 'GST', 18, 'GST 18%'),
  ('US', 'United States', 'SALES_TAX', 0, 'Sales Tax (Varies by state)'),
  ('GB', 'United Kingdom', 'VAT', 20, 'VAT 20%'),
  ('DE', 'Germany', 'VAT', 19, 'VAT 19%'),
  ('FR', 'France', 'VAT', 20, 'VAT 20%'),
  ('CA', 'Canada', 'GST', 5, 'GST 5%'),
  ('AU', 'Australia', 'GST', 10, 'GST 10%'),
  ('JP', 'Japan', 'CT', 10, 'Consumption Tax 10%'),
  ('SG', 'Singapore', 'GST', 8, 'GST 8%'),
  ('AE', 'UAE', 'VAT', 5, 'VAT 5%')
ON CONFLICT (country_code, tax_type) DO NOTHING;

-- Insert default country payment rules
INSERT INTO public.country_payment_rules (country_code, country_name, currency, payment_enabled) VALUES
  ('IN', 'India', 'INR', true),
  ('US', 'United States', 'USD', true),
  ('GB', 'United Kingdom', 'GBP', true),
  ('DE', 'Germany', 'EUR', true),
  ('FR', 'France', 'EUR', true),
  ('CA', 'Canada', 'CAD', true),
  ('AU', 'Australia', 'AUD', true),
  ('JP', 'Japan', 'JPY', true),
  ('SG', 'Singapore', 'SGD', true),
  ('AE', 'UAE', 'AED', true)
ON CONFLICT (country_code) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (setting_category, setting_key, setting_value, description, is_public) VALUES
  ('seo', 'meta_title', '"AvatarTalk.Co - AI Powered Avatar Platform"', 'Site meta title', true),
  ('seo', 'meta_description', '"Create your personalized AI avatar and engage with your audience through interactive conversations"', 'Site meta description', true),
  ('seo', 'meta_keywords', '["avatar", "AI", "chatbot", "personalized AI", "virtual collaboration"]', 'Site meta keywords', true),
  ('seo', 'og_image', '""', 'Open Graph image URL', true),
  ('seo', 'twitter_card', '"summary_large_image"', 'Twitter card type', true),
  ('analytics', 'google_analytics_id', '""', 'Google Analytics tracking ID', false),
  ('analytics', 'google_search_console_verification', '""', 'Google Search Console verification code', false),
  ('general', 'site_name', '"AvatarTalk.Co"', 'Site name', true),
  ('general', 'support_email', '"support@avatartalk.co"', 'Support email', true),
  ('general', 'payments_enabled', 'true', 'Global payments toggle', false)
ON CONFLICT (setting_category, setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_platform_secrets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_platform_integration_secrets_updated_at
  BEFORE UPDATE ON public.platform_integration_secrets
  FOR EACH ROW EXECUTE FUNCTION update_platform_secrets_updated_at();

CREATE TRIGGER update_tax_configurations_updated_at
  BEFORE UPDATE ON public.tax_configurations
  FOR EACH ROW EXECUTE FUNCTION update_platform_secrets_updated_at();

CREATE TRIGGER update_country_payment_rules_updated_at
  BEFORE UPDATE ON public.country_payment_rules
  FOR EACH ROW EXECUTE FUNCTION update_platform_secrets_updated_at();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_platform_secrets_updated_at();
