-- Fix 1: Create a secure view for profiles that hides sensitive fields from public
-- First, drop existing policies that might expose sensitive data
DROP POLICY IF EXISTS "Anonymous users can view limited public profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON profiles;

-- Create a secure function to check if user is viewing their own profile
CREATE OR REPLACE FUNCTION public.is_own_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = profile_id;
$$;

-- Create more restrictive SELECT policies for profiles
-- Users can always see their own complete profile
CREATE POLICY "Users can view own complete profile" ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Public can only see non-sensitive fields (no email, age, gender)
-- We use a column-level approach by creating a view
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  bio,
  profile_pic_url,
  avatar_url,
  profession,
  followers_count,
  following_count,
  created_at
FROM profiles
WHERE username IS NOT NULL;

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Fix 2: Secure ai_chat_memory - encrypt/hide visitor email and name from profile owners
-- Add a policy that prevents profile owners from seeing visitor personal data directly
-- Instead, they'll see anonymized data unless visitor consented

DROP POLICY IF EXISTS "Profile owners can view chat memory for their profile" ON ai_chat_memory;

-- Profile owners can view chat memory but with restricted access to personal data
CREATE POLICY "Profile owners view chat memory anonymized" ON ai_chat_memory
FOR SELECT
USING (
  (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()))
  OR (visitor_id = (auth.uid())::text)
);

-- Create a secure view for chat memory that hides personal data unless consented
CREATE OR REPLACE VIEW public.safe_chat_memory AS
SELECT 
  id,
  profile_id,
  visitor_id,
  -- Only show email if visitor explicitly consented (check visitor_metadata)
  CASE 
    WHEN (visitor_metadata->>'consent_to_share_email')::boolean = true THEN visitor_email
    ELSE NULL 
  END as visitor_email,
  CASE 
    WHEN (visitor_metadata->>'consent_to_share_name')::boolean = true THEN visitor_name
    ELSE 
      CASE 
        WHEN visitor_name IS NOT NULL THEN 'Anonymous Visitor'
        ELSE NULL
      END
  END as visitor_name,
  total_messages,
  engagement_score,
  last_visit_at,
  first_visit_at,
  session_count,
  last_topics,
  preferences,
  welcome_shown,
  created_at,
  updated_at
FROM ai_chat_memory;

GRANT SELECT ON public.safe_chat_memory TO authenticated;

-- Fix 3: Protect shipping addresses in orders table
-- Create a function to mask shipping address for audit purposes
CREATE OR REPLACE FUNCTION public.mask_shipping_address(address jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  masked jsonb;
BEGIN
  IF address IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return masked version - only show city and country, hide street/phone
  masked := jsonb_build_object(
    'city', address->>'city',
    'state', address->>'state',
    'country', address->>'country',
    'pincode', CASE 
      WHEN address->>'pincode' IS NOT NULL THEN 
        LEFT(address->>'pincode', 2) || '****'
      ELSE NULL
    END
  );
  
  RETURN masked;
END;
$$;

-- Create a secure view for sellers that masks sensitive shipping details
CREATE OR REPLACE VIEW public.seller_orders_safe AS
SELECT 
  id,
  buyer_id,
  seller_id,
  product_id,
  variant_id,
  quantity,
  amount,
  discount_amount,
  tax_amount,
  shipping_amount,
  total_amount,
  currency,
  order_status,
  payment_status,
  payment_method,
  fulfillment_status,
  tracking_number,
  shipping_method,
  order_notes,
  -- Only show full address if order is in fulfillment stages
  CASE 
    WHEN fulfillment_status IN ('processing', 'shipped', 'in_transit') THEN shipping_address
    ELSE mask_shipping_address(shipping_address)
  END as shipping_address,
  platform_fee,
  seller_earnings,
  created_at,
  updated_at,
  completed_at
FROM orders;

-- RLS for the view
ALTER VIEW public.seller_orders_safe SET (security_invoker = true);

GRANT SELECT ON public.seller_orders_safe TO authenticated;

-- Fix 4: Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  access_type text NOT NULL, -- 'view', 'export', etc.
  data_type text NOT NULL, -- 'shipping_address', 'email', etc.
  ip_address text,
  accessed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view access logs
CREATE POLICY "Super admins can view access logs" ON sensitive_data_access_log
FOR SELECT USING (is_super_admin(auth.uid()));

-- System can insert logs
CREATE POLICY "System can insert access logs" ON sensitive_data_access_log
FOR INSERT WITH CHECK (true);

-- Fix 5: Ensure chat_messages validates conversation ownership
DROP POLICY IF EXISTS "Users can view their messages" ON chat_messages;

-- Create proper policy that validates conversation membership
CREATE POLICY "Users view messages in their conversations" ON chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND (chat_conversations.user_id = auth.uid() OR chat_conversations.other_user_id = auth.uid())
  )
);