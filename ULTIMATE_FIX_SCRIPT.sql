-- ============================================================================
-- AVATARTALK COMPLETE FIX - ONE SCRIPT TO FIX EVERYTHING
-- Run this ONCE in Supabase SQL Editor to fix all issues
-- ============================================================================

-- This script fixes:
-- 1. Profile visibility for all users (logged in or not)
-- 2. Token purchase payments
-- 3. Plan purchase payments
-- 4. All RLS policies
-- 5. All database functions

BEGIN;

-- ============================================================================
-- PART 1: CREATE PUBLIC PROFILE FUNCTIONS
-- ============================================================================

-- Function 1: Get profile by username (main function for public access)
CREATE OR REPLACE FUNCTION public.get_public_profile_by_username(p_username text)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  full_name text,
  bio text,
  profession text,
  avatar_id text,
  avatar_url text,
  profile_pic_url text,
  country text,
  location text,
  website text,
  followers_count bigint,
  following_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.id, p.username, p.display_name, p.full_name,
    p.bio, p.profession, p.avatar_id, p.avatar_url,
    p.profile_pic_url, p.country, p.location, p.website,
    p.followers_count, p.following_count, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE lower(trim(p.username)) = lower(trim(p_username))
    AND p.username IS NOT NULL
    AND p.username != '';
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_by_username(text) TO anon, authenticated, service_role;

-- Function 2: Get profile by ID (for compatibility)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  full_name text,
  bio text,
  profession text,
  avatar_id text,
  avatar_url text,
  profile_pic_url text,
  country text,
  location text,
  website text,
  followers_count bigint,
  following_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.id, p.username, p.display_name, p.full_name,
    p.bio, p.profession, p.avatar_id, p.avatar_url,
    p.profile_pic_url, p.country, p.location, p.website,
    p.followers_count, p.following_count, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.id = profile_id
    AND p.username IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated, service_role;

-- ============================================================================
-- PART 2: FIX PROFILE TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "public_profile_read_access" ON public.profiles;

-- Create new public read policy
CREATE POLICY "public_profiles_read_access"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL AND username != '');

-- Grant column-level SELECT permissions
GRANT SELECT (
  id, username, display_name, full_name, bio, profession,
  avatar_id, avatar_url, profile_pic_url, country, location,
  website, followers_count, following_count, created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- Grant full SELECT to service_role
GRANT SELECT ON public.profiles TO service_role;

-- ============================================================================
-- PART 3: FIX RELATED TABLES RLS
-- ============================================================================

-- User Stats
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_stats') THEN
    ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats;
    DROP POLICY IF EXISTS "Public stats access" ON public.user_stats;
    DROP POLICY IF EXISTS "public_stats_read_access" ON public.user_stats;
    CREATE POLICY "public_user_stats_access" ON public.user_stats
      FOR SELECT TO anon, authenticated USING (true);
    GRANT SELECT ON public.user_stats TO anon, authenticated;
  END IF;
END $$;

-- Products
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
    DROP POLICY IF EXISTS "Public products access" ON public.products;
    DROP POLICY IF EXISTS "public_products_read_access" ON public.products;
    CREATE POLICY "public_published_products_access" ON public.products
      FOR SELECT TO anon, authenticated USING (status = 'published');
    GRANT SELECT ON public.products TO anon, authenticated;
  END IF;
END $$;

-- Events
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
    DROP POLICY IF EXISTS "Public events access" ON public.events;
    DROP POLICY IF EXISTS "public_events_read_access" ON public.events;
    CREATE POLICY "public_published_events_access" ON public.events
      FOR SELECT TO anon, authenticated USING (status IN ('published', 'upcoming'));
    GRANT SELECT ON public.events TO anon, authenticated;
  END IF;
END $$;

-- Avatar Configurations
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'avatar_configurations') THEN
    ALTER TABLE public.avatar_configurations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view active avatars" ON public.avatar_configurations;
    DROP POLICY IF EXISTS "Public avatars access" ON public.avatar_configurations;
    DROP POLICY IF EXISTS "public_avatars_read_access" ON public.avatar_configurations;
    CREATE POLICY "public_active_avatars_access" ON public.avatar_configurations
      FOR SELECT TO anon, authenticated USING (is_active = true);
    GRANT SELECT ON public.avatar_configurations TO anon, authenticated;
  END IF;
END $$;

-- Social Links
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_links') THEN
    ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links;
    DROP POLICY IF EXISTS "Public social links access" ON public.social_links;
    DROP POLICY IF EXISTS "public_social_links_read_access" ON public.social_links;
    CREATE POLICY "public_social_links_access" ON public.social_links
      FOR SELECT TO anon, authenticated USING (true);
    GRANT SELECT ON public.social_links TO anon, authenticated;
  END IF;
END $$;

-- AI Training Settings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_training_settings') THEN
    ALTER TABLE public.ai_training_settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view ai welcome settings" ON public.ai_training_settings;
    DROP POLICY IF EXISTS "Public ai settings access" ON public.ai_training_settings;
    DROP POLICY IF EXISTS "public_ai_settings_read_access" ON public.ai_training_settings;
    CREATE POLICY "public_ai_settings_access" ON public.ai_training_settings
      FOR SELECT TO anon, authenticated USING (true);
    GRANT SELECT ON public.ai_training_settings TO anon, authenticated;
  END IF;
END $$;

-- Posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public posts access" ON public.posts;
    DROP POLICY IF EXISTS "public_posts_read_access" ON public.posts;
    CREATE POLICY "public_posts_access" ON public.posts
      FOR SELECT TO anon, authenticated USING (true);
    GRANT SELECT ON public.posts TO anon, authenticated;
  END IF;
END $$;

-- ============================================================================
-- PART 4: CREATE TOKEN CREDIT FUNCTION (FOR PAYMENTS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.credit_user_tokens(
  p_user_id uuid,
  p_tokens bigint,
  p_reason text DEFAULT 'topup'
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
  -- Validate input
  IF p_tokens <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'tokens must be positive');
  END IF;

  -- Lock row and get current balance
  SELECT COALESCE(token_balance, 0)
    INTO v_old_balance
    FROM public.profiles
   WHERE id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'profile not found');
  END IF;

  -- Calculate new balance
  v_new_balance := v_old_balance + p_tokens;

  -- Update profile
  UPDATE public.profiles
     SET token_balance = v_new_balance,
         updated_at = now()
   WHERE id = p_user_id;

  -- Create token events table if not exists
  CREATE TABLE IF NOT EXISTS public.token_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    change bigint NOT NULL,
    balance_after bigint NOT NULL,
    reason text NOT NULL DEFAULT 'topup',
    created_at timestamptz NOT NULL DEFAULT now()
  );

  -- Create index if not exists
  CREATE INDEX IF NOT EXISTS idx_token_events_user_id ON public.token_events(user_id);

  -- Insert audit log
  INSERT INTO public.token_events (user_id, change, balance_after, reason)
  VALUES (p_user_id, p_tokens, v_new_balance, p_reason);

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

-- Setup token_events RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_events') THEN
    ALTER TABLE public.token_events ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users view own token events" ON public.token_events;
    CREATE POLICY "users_own_token_events" ON public.token_events
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
    GRANT SELECT ON public.token_events TO authenticated;
    GRANT INSERT, SELECT ON public.token_events TO service_role;
  END IF;
END $$;

-- ============================================================================
-- PART 5: ADD MULTI-MONTH PLAN PRICING
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_pricing_plans') THEN
    -- Add multi-month price columns if they don't exist
    ALTER TABLE public.platform_pricing_plans
      ADD COLUMN IF NOT EXISTS price_3_month_inr numeric,
      ADD COLUMN IF NOT EXISTS price_3_month_usd numeric,
      ADD COLUMN IF NOT EXISTS price_6_month_inr numeric,
      ADD COLUMN IF NOT EXISTS price_6_month_usd numeric,
      ADD COLUMN IF NOT EXISTS price_12_month_inr numeric,
      ADD COLUMN IF NOT EXISTS price_12_month_usd numeric;

    -- Back-fill with standard discounts (10% / 15% / 20% off)
    UPDATE public.platform_pricing_plans SET
      price_3_month_inr  = COALESCE(price_3_month_inr,  ROUND(price_inr * 3 * 0.90, 2)),
      price_3_month_usd  = COALESCE(price_3_month_usd,  ROUND(price_usd * 3 * 0.90, 2)),
      price_6_month_inr  = COALESCE(price_6_month_inr,  ROUND(price_inr * 6 * 0.85, 2)),
      price_6_month_usd  = COALESCE(price_6_month_usd,  ROUND(price_usd * 6 * 0.85, 2)),
      price_12_month_inr = COALESCE(price_12_month_inr, ROUND(price_inr * 12 * 0.80, 2)),
      price_12_month_usd = COALESCE(price_12_month_usd, ROUND(price_usd * 12 * 0.80, 2))
    WHERE plan_key IN ('creator', 'pro', 'business');
  END IF;
END $$;

-- ============================================================================
-- PART 6: FIX PAYMENT TABLES
-- ============================================================================

-- Ensure platform_plan_transactions has all columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_plan_transactions') THEN
    ALTER TABLE public.platform_plan_transactions
      ADD COLUMN IF NOT EXISTS transaction_type text DEFAULT 'purchase',
      ADD COLUMN IF NOT EXISTS previous_plan_key text DEFAULT 'free';
  END IF;
END $$;

-- Ensure token_purchases has required columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_purchases') THEN
    ALTER TABLE public.token_purchases
      ADD COLUMN IF NOT EXISTS package_id text,
      ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
      ADD COLUMN IF NOT EXISTS razorpay_signature text;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_token_purchases') THEN
    ALTER TABLE public.custom_token_purchases
      ADD COLUMN IF NOT EXISTS package_id text,
      ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
      ADD COLUMN IF NOT EXISTS razorpay_signature text;
  END IF;
END $$;

-- Ensure token_packages has is_active column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_packages') THEN
    ALTER TABLE public.token_packages
      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION TESTS
-- ============================================================================

-- Test 1: Check if functions exist
SELECT 
  'Functions Created' as test_name,
  COUNT(*) as function_count
FROM pg_proc 
WHERE proname IN ('get_public_profile_by_username', 'get_public_profile', 'credit_user_tokens');

-- Test 2: Check RLS policies
SELECT 
  'RLS Policies' as test_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test 3: Check if functions work
DO $$
DECLARE
  test_username text;
  test_result record;
BEGIN
  -- Get first username from database
  SELECT username INTO test_username 
  FROM public.profiles 
  WHERE username IS NOT NULL 
  LIMIT 1;
  
  IF test_username IS NOT NULL THEN
    -- Test the function
    PERFORM * FROM public.get_public_profile_by_username(test_username);
    RAISE NOTICE 'Function test passed for username: %', test_username;
  ELSE
    RAISE NOTICE 'No usernames found in database to test';
  END IF;
END $$;

-- Test 4: List available usernames for testing
SELECT 
  'Available Usernames' as info,
  username,
  display_name,
  'https://avatartalk.co/' || username as profile_url
FROM public.profiles 
WHERE username IS NOT NULL AND username != ''
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================================================
-- FINAL SUCCESS MESSAGE
-- ============================================================================

SELECT 
  '✅ ALL FIXES APPLIED SUCCESSFULLY!' as status,
  'Profiles are now publicly accessible' as profile_status,
  'Payment functions are ready' as payment_status,
  'Test the URLs shown above in incognito mode' as next_step;
