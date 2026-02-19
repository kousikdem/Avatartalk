-- Create platform_pricing_plans table for AvatarTalk subscription tiers
CREATE TABLE IF NOT EXISTS public.platform_pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_key TEXT NOT NULL UNIQUE, -- free, creator, pro, business
  plan_name TEXT NOT NULL,
  tagline TEXT,
  price_inr INTEGER NOT NULL DEFAULT 0,
  price_usd INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  -- Billing cycle multipliers (for 3, 6, 12 month pricing)
  price_3_month_inr INTEGER,
  price_6_month_inr INTEGER,
  price_12_month_inr INTEGER,
  price_3_month_usd INTEGER,
  price_6_month_usd INTEGER,
  price_12_month_usd INTEGER,
  
  -- Discounts for longer periods
  discount_3_month INTEGER DEFAULT 10,
  discount_6_month INTEGER DEFAULT 15,
  discount_12_month INTEGER DEFAULT 20,
  
  -- AI Token limits
  ai_tokens_monthly BIGINT DEFAULT 0,
  
  -- Avatar features
  avatar_type TEXT DEFAULT 'default', -- default, talking, 3d, advanced_3d
  voice_minutes_monthly INTEGER DEFAULT 0,
  voice_clone_enabled BOOLEAN DEFAULT FALSE,
  custom_voice_enabled BOOLEAN DEFAULT FALSE,
  
  -- Training limits
  training_storage_mb INTEGER DEFAULT 0,
  doc_upload_enabled BOOLEAN DEFAULT FALSE,
  web_training_enabled BOOLEAN DEFAULT FALSE,
  qa_training_enabled BOOLEAN DEFAULT FALSE,
  
  -- Monetization features
  digital_products_enabled BOOLEAN DEFAULT FALSE,
  physical_products_enabled BOOLEAN DEFAULT FALSE,
  payments_enabled BOOLEAN DEFAULT FALSE,
  promo_codes_enabled BOOLEAN DEFAULT FALSE,
  subscription_button_enabled BOOLEAN DEFAULT FALSE,
  multi_currency_enabled BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  basic_analytics BOOLEAN DEFAULT TRUE,
  advanced_analytics BOOLEAN DEFAULT FALSE,
  earnings_analytics BOOLEAN DEFAULT FALSE,
  
  -- Integrations
  zoom_integration BOOLEAN DEFAULT FALSE,
  google_calendar_readonly BOOLEAN DEFAULT FALSE,
  google_calendar_full BOOLEAN DEFAULT FALSE,
  google_meet_integration BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  shopify_integration BOOLEAN DEFAULT FALSE,
  
  -- Collaboration
  virtual_meetings_enabled BOOLEAN DEFAULT FALSE,
  events_enabled BOOLEAN DEFAULT FALSE,
  brand_collaborations BOOLEAN DEFAULT FALSE,
  paid_events_enabled BOOLEAN DEFAULT FALSE,
  
  -- Team features
  team_enabled BOOLEAN DEFAULT FALSE,
  multiple_admins BOOLEAN DEFAULT FALSE,
  max_team_members INTEGER DEFAULT 1,
  
  -- Special limits
  multilingual_ai BOOLEAN DEFAULT FALSE,
  priority_ai_processing BOOLEAN DEFAULT FALSE,
  unlimited_training_sources BOOLEAN DEFAULT FALSE,
  multiple_avatars_per_profile BOOLEAN DEFAULT FALSE,
  max_avatars INTEGER DEFAULT 1,
  
  -- Feature list for display (JSON array of {icon, text, coming_soon})
  features_list JSONB DEFAULT '[]'::jsonb,
  
  -- Offer/promo settings
  offer_text TEXT,
  offer_badge TEXT,
  offer_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_platform_subscriptions to track user's active plan
CREATE TABLE IF NOT EXISTS public.user_platform_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.platform_pricing_plans(id),
  plan_key TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
  billing_cycle_months INTEGER DEFAULT 1, -- 1, 3, 6, 12
  price_paid INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT FALSE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  razorpay_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for plan purchase history
CREATE TABLE IF NOT EXISTS public.platform_plan_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id UUID REFERENCES public.platform_pricing_plans(id),
  plan_key TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  billing_cycle_months INTEGER DEFAULT 1,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  previous_plan_key TEXT,
  transaction_type TEXT DEFAULT 'purchase', -- purchase, upgrade, renewal
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_plan_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_pricing_plans (everyone can view active plans)
CREATE POLICY "Anyone can view active plans" 
ON public.platform_pricing_plans 
FOR SELECT 
USING (is_active = true);

-- Super admin can manage plans
CREATE POLICY "Super admins can manage plans" 
ON public.platform_pricing_plans 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- RLS Policies for user_platform_subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.user_platform_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.user_platform_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
ON public.user_platform_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all subscriptions" 
ON public.user_platform_subscriptions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- RLS Policies for platform_plan_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.platform_plan_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.platform_plan_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all transactions" 
ON public.platform_plan_transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Insert default plans
INSERT INTO public.platform_pricing_plans (
  plan_key, plan_name, tagline, price_inr, price_usd, display_order, is_popular,
  price_3_month_inr, price_6_month_inr, price_12_month_inr,
  price_3_month_usd, price_6_month_usd, price_12_month_usd,
  ai_tokens_monthly, avatar_type, voice_minutes_monthly, voice_clone_enabled, custom_voice_enabled,
  training_storage_mb, doc_upload_enabled, web_training_enabled, qa_training_enabled,
  digital_products_enabled, physical_products_enabled, payments_enabled, promo_codes_enabled, subscription_button_enabled, multi_currency_enabled,
  basic_analytics, advanced_analytics, earnings_analytics,
  zoom_integration, google_calendar_readonly, google_calendar_full, google_meet_integration, api_access, shopify_integration,
  virtual_meetings_enabled, events_enabled, brand_collaborations, paid_events_enabled,
  team_enabled, multiple_admins, max_team_members,
  multilingual_ai, priority_ai_processing, unlimited_training_sources, multiple_avatars_per_profile, max_avatars,
  features_list
) VALUES
-- FREE Plan
('free', 'Free', 'Starter Identity', 0, 0, 1, false,
  0, 0, 0, 0, 0, 0,
  10000, 'default', 0, false, false,
  2, true, false, false,
  false, false, false, false, false, false,
  true, false, false,
  false, false, false, false, false, false,
  false, false, false, false,
  false, false, 1,
  false, false, false, false, 1,
  '[
    {"icon": "User", "text": "Public Profile Page"},
    {"icon": "Bot", "text": "Basic AI Chatbot"},
    {"icon": "UserCircle", "text": "Default Avatar"},
    {"icon": "Coins", "text": "10K AI Tokens (text+voice)"},
    {"icon": "FileText", "text": "Upload docs up to 2MB"},
    {"icon": "BarChart2", "text": "Basic Analytics"},
    {"icon": "Link", "text": "Social Links"},
    {"icon": "Users", "text": "Follow/Following system"},
    {"icon": "Gift", "text": "Token Gifts from fans"}
  ]'::jsonb
),
-- CREATOR Plan
('creator', 'Creator', 'Personal Brand Builder', 999, 12, 2, true,
  2697, 5094, 9590, 32, 61, 115,
  1000000, 'talking', 60, false, true,
  50, true, false, true,
  true, false, true, true, true, false,
  true, true, false,
  true, true, false, false, false, false,
  false, false, false, false,
  false, false, 1,
  false, false, false, false, 1,
  '[
    {"icon": "Sparkles", "text": "Everything in Free, plus:"},
    {"icon": "Bot", "text": "1M AI Tokens (voice+text)"},
    {"icon": "MessageCircle", "text": "Talking Avatar (Basic)"},
    {"icon": "Mic", "text": "Voice replies (60 min/month)"},
    {"icon": "Brain", "text": "Custom AI persona & response tone"},
    {"icon": "FileUp", "text": "Upload docs up to 50MB"},
    {"icon": "Package", "text": "Add Digital Products"},
    {"icon": "CreditCard", "text": "Accept Payments (Razorpay)"},
    {"icon": "Tag", "text": "Promo codes"},
    {"icon": "Star", "text": "Subscription button on profile"},
    {"icon": "BarChart3", "text": "Profile & chat analytics"},
    {"icon": "Video", "text": "Zoom integration"},
    {"icon": "Calendar", "text": "Google Calendar (view-only)"}
  ]'::jsonb
),
-- PRO Plan
('pro', 'Pro', 'Professional & Coaches', 1699, 19, 3, false,
  4587, 8663, 16310, 51, 97, 182,
  2000000, '3d', 180, true, true,
  200, true, true, true,
  true, false, true, true, true, false,
  true, true, true,
  true, true, true, true, false, false,
  true, true, false, false,
  false, false, 1,
  true, false, false, false, 1,
  '[
    {"icon": "Sparkles", "text": "Everything in Creator, plus:"},
    {"icon": "Bot", "text": "2M AI Tokens (voice+text)"},
    {"icon": "Brain", "text": "Fully trained AI (Docs + Web + Q&A)"},
    {"icon": "FileUp", "text": "Up to 200MB training data"},
    {"icon": "Globe", "text": "Multilingual AI replies", "coming_soon": true},
    {"icon": "MessageSquare", "text": "Custom follow-up questions"},
    {"icon": "User", "text": "3D Avatar"},
    {"icon": "Mic2", "text": "Lip-sync talking avatar"},
    {"icon": "AudioLines", "text": "Voice cloning (limited)"},
    {"icon": "Video", "text": "Virtual Meetings"},
    {"icon": "CalendarDays", "text": "Events"},
    {"icon": "Link2", "text": "Auto-generate meeting links"},
    {"icon": "Calendar", "text": "Calendar sync (2-way)"},
    {"icon": "TrendingUp", "text": "Chat → conversion tracking"},
    {"icon": "DollarSign", "text": "Earnings analytics"}
  ]'::jsonb
),
-- BUSINESS Plan
('business', 'Business', 'Teams & Brands', 2999, 49, 4, false,
  8097, 15294, 28790, 132, 250, 470,
  5000000, 'advanced_3d', 0, true, true,
  0, true, true, true,
  true, true, true, true, true, true,
  true, true, true,
  true, true, true, true, true, true,
  true, true, true, true,
  true, true, 10,
  true, true, true, true, 5,
  '[
    {"icon": "Sparkles", "text": "Everything in Pro, plus:"},
    {"icon": "Bot", "text": "5M AI Tokens (voice+text)"},
    {"icon": "Users", "text": "Team System", "coming_soon": true},
    {"icon": "UserCog", "text": "Multiple admins"},
    {"icon": "Shield", "text": "Role-based access"},
    {"icon": "Infinity", "text": "Unlimited AI training sources"},
    {"icon": "Zap", "text": "Priority AI processing"},
    {"icon": "Code", "text": "API access", "coming_soon": true},
    {"icon": "Mic2", "text": "Advanced voice cloning"},
    {"icon": "Users2", "text": "Multiple avatars per profile"},
    {"icon": "Building2", "text": "Brand voice consistency"},
    {"icon": "Handshake", "text": "Brand collaborations"},
    {"icon": "Ticket", "text": "Paid events"},
    {"icon": "Package", "text": "Physical products"},
    {"icon": "Receipt", "text": "Tax & GST settings"},
    {"icon": "Globe", "text": "Multi-currency support"},
    {"icon": "ShoppingBag", "text": "Shopify integration", "coming_soon": true}
  ]'::jsonb
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_platform_pricing_plans_updated_at
BEFORE UPDATE ON public.platform_pricing_plans
FOR EACH ROW
EXECUTE FUNCTION update_platform_plans_updated_at();

CREATE TRIGGER update_user_platform_subscriptions_updated_at
BEFORE UPDATE ON public.user_platform_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_platform_plans_updated_at();

-- Create indexes for performance
CREATE INDEX idx_platform_pricing_plans_key ON public.platform_pricing_plans(plan_key);
CREATE INDEX idx_platform_pricing_plans_active ON public.platform_pricing_plans(is_active);
CREATE INDEX idx_user_platform_subscriptions_user ON public.user_platform_subscriptions(user_id);
CREATE INDEX idx_user_platform_subscriptions_status ON public.user_platform_subscriptions(status);
CREATE INDEX idx_platform_plan_transactions_user ON public.platform_plan_transactions(user_id);
CREATE INDEX idx_platform_plan_transactions_status ON public.platform_plan_transactions(status);