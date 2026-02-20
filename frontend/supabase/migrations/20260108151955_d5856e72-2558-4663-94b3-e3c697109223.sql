-- Update Free plan features to include product/collaboration limits
UPDATE platform_pricing_plans
SET features_list = jsonb_build_array(
  jsonb_build_object('icon', 'User', 'text', 'Public Profile Page'),
  jsonb_build_object('icon', 'Bot', 'text', 'Basic AI Chatbot'),
  jsonb_build_object('icon', 'UserCircle', 'text', 'Default Avatar'),
  jsonb_build_object('icon', 'Coins', 'text', '10K AI Tokens (text+voice)'),
  jsonb_build_object('icon', 'Package', 'text', '2 Products'),
  jsonb_build_object('icon', 'Video', 'text', '2 Virtual Collaborations'),
  jsonb_build_object('icon', 'FileText', 'text', 'Upload docs up to 2MB'),
  jsonb_build_object('icon', 'BarChart2', 'text', 'Basic Analytics'),
  jsonb_build_object('icon', 'Link', 'text', 'Social Links'),
  jsonb_build_object('icon', 'Users', 'text', 'Follow/Following system'),
  jsonb_build_object('icon', 'Gift', 'text', 'Token Gifts from fans')
)
WHERE plan_key = 'free';

-- Update Creator plan features to include product/collaboration limits
UPDATE platform_pricing_plans
SET features_list = jsonb_build_array(
  jsonb_build_object('icon', 'Sparkles', 'text', 'Everything in Free, plus:'),
  jsonb_build_object('icon', 'Bot', 'text', '1M AI Tokens (voice+text)'),
  jsonb_build_object('icon', 'Package', 'text', '20 Products'),
  jsonb_build_object('icon', 'Video', 'text', '20 Virtual Collaborations'),
  jsonb_build_object('icon', 'MessageCircle', 'text', 'Talking Avatar (Basic)'),
  jsonb_build_object('icon', 'Mic', 'text', 'Voice replies (60 min/month)'),
  jsonb_build_object('icon', 'Brain', 'text', 'Custom AI persona & response tone'),
  jsonb_build_object('icon', 'FileUp', 'text', 'Upload docs up to 50MB'),
  jsonb_build_object('icon', 'CreditCard', 'text', 'Accept Payments (Razorpay)'),
  jsonb_build_object('icon', 'Tag', 'text', 'Promo codes'),
  jsonb_build_object('icon', 'Star', 'text', 'Subscription button on profile'),
  jsonb_build_object('icon', 'BarChart3', 'text', 'Profile & chat analytics'),
  jsonb_build_object('icon', 'Calendar', 'text', 'Zoom integration'),
  jsonb_build_object('icon', 'CalendarDays', 'text', 'Google Calendar (view-only)')
)
WHERE plan_key = 'creator';

-- Update Pro plan features to include product/collaboration limits
UPDATE platform_pricing_plans
SET features_list = jsonb_build_array(
  jsonb_build_object('icon', 'Sparkles', 'text', 'Everything in Creator, plus:'),
  jsonb_build_object('icon', 'Bot', 'text', '2M AI Tokens (voice+text)'),
  jsonb_build_object('icon', 'Package', 'text', '50 Products'),
  jsonb_build_object('icon', 'Video', 'text', '50 Virtual Collaborations'),
  jsonb_build_object('icon', 'Brain', 'text', 'Fully trained AI (Docs + Web + Q&A)'),
  jsonb_build_object('icon', 'FileUp', 'text', 'Up to 200MB training data'),
  jsonb_build_object('icon', 'Globe', 'text', 'Multilingual AI replies', 'coming_soon', true),
  jsonb_build_object('icon', 'MessageSquare', 'text', 'Custom follow-up questions'),
  jsonb_build_object('icon', 'User', 'text', '3D Avatar'),
  jsonb_build_object('icon', 'Mic2', 'text', 'Lip-sync talking avatar'),
  jsonb_build_object('icon', 'AudioLines', 'text', 'Voice cloning (limited)'),
  jsonb_build_object('icon', 'CalendarDays', 'text', 'Events & Virtual Meetings'),
  jsonb_build_object('icon', 'Link2', 'text', 'Auto-generate meeting links'),
  jsonb_build_object('icon', 'Calendar', 'text', 'Calendar sync (2-way)'),
  jsonb_build_object('icon', 'TrendingUp', 'text', 'Chat → conversion tracking'),
  jsonb_build_object('icon', 'DollarSign', 'text', 'Earnings analytics')
)
WHERE plan_key = 'pro';

-- Update Business plan features to include unlimited products/collaborations
UPDATE platform_pricing_plans
SET features_list = jsonb_build_array(
  jsonb_build_object('icon', 'Sparkles', 'text', 'Everything in Pro, plus:'),
  jsonb_build_object('icon', 'Bot', 'text', '5M AI Tokens (voice+text)'),
  jsonb_build_object('icon', 'Package', 'text', 'Unlimited Products'),
  jsonb_build_object('icon', 'Video', 'text', 'Unlimited Virtual Collaborations'),
  jsonb_build_object('icon', 'Users', 'text', 'Team System', 'coming_soon', true),
  jsonb_build_object('icon', 'UserCog', 'text', 'Multiple admins'),
  jsonb_build_object('icon', 'Shield', 'text', 'Role-based access'),
  jsonb_build_object('icon', 'Infinity', 'text', 'Unlimited AI training sources'),
  jsonb_build_object('icon', 'Zap', 'text', 'Priority AI processing'),
  jsonb_build_object('icon', 'Code', 'text', 'API access', 'coming_soon', true),
  jsonb_build_object('icon', 'Mic2', 'text', 'Advanced voice cloning'),
  jsonb_build_object('icon', 'Users2', 'text', 'Multiple avatars per profile'),
  jsonb_build_object('icon', 'Building2', 'text', 'Brand voice consistency'),
  jsonb_build_object('icon', 'Handshake', 'text', 'Brand collaborations'),
  jsonb_build_object('icon', 'Ticket', 'text', 'Paid events'),
  jsonb_build_object('icon', 'Receipt', 'text', 'Physical products & Tax settings'),
  jsonb_build_object('icon', 'Globe', 'text', 'Multi-currency support'),
  jsonb_build_object('icon', 'ShoppingBag', 'text', 'Shopify integration', 'coming_soon', true)
)
WHERE plan_key = 'business';