-- ============================================================================
-- QUICK FIX: Apply this single SQL script to enable public profile access
-- Copy everything below and paste into Supabase SQL Editor, then click RUN
-- ============================================================================

-- Create the username-based lookup function
CREATE OR REPLACE FUNCTION public.get_public_profile_by_username(p_username text)
RETURNS TABLE (
  id uuid, username text, display_name text, full_name text,
  bio text, profession text, avatar_id text, avatar_url text,
  profile_pic_url text, country text, location text, website text,
  followers_count bigint, following_count bigint,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.username, p.display_name, p.full_name, p.bio, p.profession,
         p.avatar_id, p.avatar_url, p.profile_pic_url, p.country, p.location,
         p.website, p.followers_count, p.following_count, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE lower(p.username) = lower(p_username) AND p.username IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_by_username(text) TO anon, authenticated;

-- Enable public read access to profiles (safe columns only)
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
CREATE POLICY "Anyone can view public profile fields" ON public.profiles
  FOR SELECT TO anon, authenticated USING (username IS NOT NULL);

GRANT SELECT (id, username, display_name, full_name, bio, profession, avatar_id,
              avatar_url, profile_pic_url, country, location, website,
              followers_count, following_count, created_at, updated_at)
ON public.profiles TO anon, authenticated;

-- Enable public access to related tables
DO $$ 
BEGIN
  -- User stats
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats';
  EXECUTE 'CREATE POLICY "Anyone can view user stats" ON public.user_stats FOR SELECT TO anon, authenticated USING (true)';
  EXECUTE 'GRANT SELECT ON public.user_stats TO anon, authenticated';
  
  -- Products (published only)
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can view published products" ON public.products';
  EXECUTE 'CREATE POLICY "Anyone can view published products" ON public.products FOR SELECT TO anon, authenticated USING (status = ''published'')';
  EXECUTE 'GRANT SELECT ON public.products TO anon, authenticated';
  
  -- Events
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can view published events" ON public.events';
  EXECUTE 'CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT TO anon, authenticated USING (status IN (''published'', ''upcoming''))';
  EXECUTE 'GRANT SELECT ON public.events TO anon, authenticated';
  
  -- Avatar configs
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active avatars" ON public.avatar_configurations';
  EXECUTE 'CREATE POLICY "Anyone can view active avatars" ON public.avatar_configurations FOR SELECT TO anon, authenticated USING (is_active = true)';
  EXECUTE 'GRANT SELECT ON public.avatar_configurations TO anon, authenticated';
  
  -- Social links
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links';
  EXECUTE 'CREATE POLICY "Anyone can view social links" ON public.social_links FOR SELECT TO anon, authenticated USING (true)';
  EXECUTE 'GRANT SELECT ON public.social_links TO anon, authenticated';
END $$;

-- Test the function (replace 'fosik' with an existing username)
SELECT 'Migration applied successfully! Test with: SELECT * FROM get_public_profile_by_username(''your_username'');' as message;
