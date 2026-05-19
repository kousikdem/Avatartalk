-- ============================================================================
-- EMERGENCY FIX: Enable public profile access WITHOUT requiring RPC function
-- This allows profiles to work immediately while you apply the full migration
-- ============================================================================

-- Step 1: Enable public read access to profiles table
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
CREATE POLICY "Anyone can view public profile fields"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL);

-- Step 2: Grant column-level permissions (safe columns only - no email, phone, etc.)
GRANT SELECT (
  id, username, display_name, full_name, bio, profession,
  avatar_id, avatar_url, profile_pic_url, country, location,
  website, followers_count, following_count, created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- Step 3: Enable access to related tables
DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats;
CREATE POLICY "Anyone can view user stats"
  ON public.user_stats FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.user_stats TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
CREATE POLICY "Anyone can view published products"
  ON public.products FOR SELECT TO anon, authenticated USING (status = 'published');
GRANT SELECT ON public.products TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT TO anon, authenticated
  USING (status IN ('published', 'upcoming'));
GRANT SELECT ON public.events TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view active avatars" ON public.avatar_configurations;
CREATE POLICY "Anyone can view active avatars"
  ON public.avatar_configurations FOR SELECT TO anon, authenticated USING (is_active = true);
GRANT SELECT ON public.avatar_configurations TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links;
CREATE POLICY "Anyone can view social links"
  ON public.social_links FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.social_links TO anon, authenticated;

-- Step 4: Test it works
SELECT 'Emergency fix applied! Profiles should now load. Test with username from query below:' as message;

-- Find valid usernames to test
SELECT username, display_name FROM public.profiles 
WHERE username IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;
