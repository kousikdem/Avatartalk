-- ============================================================================
-- COMPREHENSIVE DATABASE FIX & DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to fix all profile access issues
-- ============================================================================

-- ============================================================================
-- PART 1: DIAGNOSTIC - Check Current State
-- ============================================================================

-- Check 1: Do profiles exist?
SELECT 'CHECK 1: Profiles in database' as check_name;
SELECT COUNT(*) as total_profiles, 
       COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as profiles_with_username
FROM public.profiles;

-- Check 2: List some example usernames
SELECT 'CHECK 2: Example usernames' as check_name;
SELECT username, display_name, id, created_at 
FROM public.profiles 
WHERE username IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- Check 3: Current RLS policies on profiles
SELECT 'CHECK 3: Current RLS policies on profiles table' as check_name;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check 4: Check grants on profiles table
SELECT 'CHECK 4: Grants on profiles table' as check_name;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND grantee IN ('anon', 'authenticated', 'service_role');

-- Check 5: Check if RPC functions exist
SELECT 'CHECK 5: Existing RPC functions for profiles' as check_name;
SELECT proname, proargnames, prosrc 
FROM pg_proc 
WHERE proname LIKE '%public_profile%';

-- ============================================================================
-- PART 2: FIX - Apply All Necessary Changes
-- ============================================================================

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new public access policy
CREATE POLICY "public_profile_read_access"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL AND username != '');

-- Grant SELECT on safe columns to anon and authenticated users
GRANT SELECT (
  id, username, display_name, full_name, bio, profession,
  avatar_id, avatar_url, profile_pic_url, country, location,
  website, followers_count, following_count, created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- Grant full SELECT to service_role (for admin operations)
GRANT SELECT ON public.profiles TO service_role;

-- ============================================================================
-- PART 3: RELATED TABLES - Enable Public Access
-- ============================================================================

-- User Stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats;
DROP POLICY IF EXISTS "Public stats access" ON public.user_stats;
CREATE POLICY "public_stats_read_access"
  ON public.user_stats FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.user_stats TO anon, authenticated;

-- Products (published only)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
DROP POLICY IF EXISTS "Public products access" ON public.products;
CREATE POLICY "public_products_read_access"
  ON public.products FOR SELECT TO anon, authenticated 
  USING (status = 'published');
GRANT SELECT ON public.products TO anon, authenticated;

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Public events access" ON public.events;
CREATE POLICY "public_events_read_access"
  ON public.events FOR SELECT TO anon, authenticated
  USING (status IN ('published', 'upcoming'));
GRANT SELECT ON public.events TO anon, authenticated;

-- Avatar Configurations
ALTER TABLE public.avatar_configurations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active avatars" ON public.avatar_configurations;
DROP POLICY IF EXISTS "Public avatars access" ON public.avatar_configurations;
CREATE POLICY "public_avatars_read_access"
  ON public.avatar_configurations FOR SELECT TO anon, authenticated
  USING (is_active = true);
GRANT SELECT ON public.avatar_configurations TO anon, authenticated;

-- Social Links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links;
DROP POLICY IF EXISTS "Public social links access" ON public.social_links;
CREATE POLICY "public_social_links_read_access"
  ON public.social_links FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.social_links TO anon, authenticated;

-- AI Training Settings (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'ai_training_settings') THEN
    EXECUTE 'ALTER TABLE public.ai_training_settings ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view ai welcome settings" ON public.ai_training_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Public ai settings access" ON public.ai_training_settings';
    EXECUTE 'CREATE POLICY "public_ai_settings_read_access" ON public.ai_training_settings FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'GRANT SELECT ON public.ai_training_settings TO anon, authenticated';
  END IF;
END $$;

-- Posts (if you want them public)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'posts') THEN
    EXECUTE 'ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public posts access" ON public.posts';
    EXECUTE 'CREATE POLICY "public_posts_read_access" ON public.posts FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'GRANT SELECT ON public.posts TO anon, authenticated';
  END IF;
END $$;

-- ============================================================================
-- PART 4: CREATE RPC FUNCTION (Optional but Recommended)
-- ============================================================================

-- Create optimized RPC function for profile lookup
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

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_public_profile_by_username(text) TO anon, authenticated, service_role;

-- Create function for ID-based lookup (legacy support)
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
-- PART 5: VERIFICATION - Test Everything Works
-- ============================================================================

-- Test 1: Can anon role select from profiles?
SELECT 'TEST 1: Anon can read profiles' as test_name;
SET ROLE anon;
SELECT COUNT(*) as accessible_profiles FROM public.profiles WHERE username IS NOT NULL;
RESET ROLE;

-- Test 2: Can RPC function be called?
SELECT 'TEST 2: RPC function works' as test_name;
SELECT * FROM public.get_public_profile_by_username(
  (SELECT username FROM public.profiles WHERE username IS NOT NULL LIMIT 1)
) LIMIT 1;

-- Test 3: List valid usernames for testing
SELECT 'TEST 3: Valid usernames for testing' as test_name;
SELECT username, display_name, 
       'https://avatartalk.co/' || username as profile_url
FROM public.profiles 
WHERE username IS NOT NULL AND username != ''
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================================================
-- FINAL MESSAGE
-- ============================================================================

SELECT 
  '✅ DATABASE FIX COMPLETE!' as status,
  'Profiles should now be accessible to all visitors.' as message,
  'Test URLs are shown above. Open any in incognito mode.' as next_step;
