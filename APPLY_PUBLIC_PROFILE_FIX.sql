-- =====================================================================
--  AvatarTalk — Public Profile Visibility Fix (idempotent, copy-paste safe)
-- =====================================================================
--  Run this in the Supabase SQL Editor for project hnxnvdzrwbtmcohdptfq.
--  It is safe to run multiple times — every statement is idempotent.
--
--  After running, the SELECT at the bottom prints a verification report
--  so you can confirm the function + policies are actually present.
-- =====================================================================

-- 1. SECURITY DEFINER function — bypasses RLS but only exposes safe cols
CREATE OR REPLACE FUNCTION public.get_public_profile_by_username(p_username text)
RETURNS TABLE (
  id              uuid,
  username        text,
  display_name    text,
  full_name       text,
  bio             text,
  profession      text,
  avatar_id       text,
  avatar_url      text,
  profile_pic_url text,
  country         text,
  location        text,
  website         text,
  followers_count bigint,
  following_count bigint,
  created_at      timestamptz,
  updated_at      timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.username, p.display_name, p.full_name,
    p.bio, p.profession, p.avatar_id, p.avatar_url,
    p.profile_pic_url, p.country, p.location, p.website,
    p.followers_count, p.following_count, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE lower(p.username) = lower(p_username)
    AND p.username IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_by_username(text)
  TO anon, authenticated;

-- 2. Also expose by-id variant (used by some legacy code paths)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id              uuid,
  username        text,
  display_name    text,
  full_name       text,
  bio             text,
  profession      text,
  avatar_id       text,
  avatar_url      text,
  profile_pic_url text,
  country         text,
  location        text,
  website         text,
  followers_count bigint,
  following_count bigint,
  created_at      timestamptz,
  updated_at      timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid)
  TO anon, authenticated;

-- 3. RLS policy — allow anon + authenticated to read public profiles
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
CREATE POLICY "Anyone can view public profile fields"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (username IS NOT NULL);

-- 4. Column-level grants — required even with the policy above
GRANT SELECT (
  id, username, display_name, full_name, bio, profession,
  avatar_id, avatar_url, profile_pic_url, country, location,
  website, followers_count, following_count, created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- 5. Related tables — anon needs SELECT for the public subset
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

-- 6. ai_training_settings (only if the table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_training_settings'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view ai welcome settings" ON public.ai_training_settings';
    EXECUTE $sql$
      CREATE POLICY "Anyone can view ai welcome settings"
      ON public.ai_training_settings FOR SELECT TO anon, authenticated USING (true)
    $sql$;
    EXECUTE 'GRANT SELECT ON public.ai_training_settings TO anon, authenticated';
  END IF;
END $$;

-- =====================================================================
-- VERIFICATION REPORT — read the rows this returns
-- =====================================================================
WITH checks AS (
  SELECT
    'function get_public_profile_by_username'::text AS item,
    EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'get_public_profile_by_username'
    ) AS ok
  UNION ALL
  SELECT
    'function get_public_profile'::text,
    EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'get_public_profile'
    )
  UNION ALL
  SELECT
    'policy: profiles "Anyone can view public profile fields"'::text,
    EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Anyone can view public profile fields'
    )
  UNION ALL
  SELECT
    'policy: products "Anyone can view published products"'::text,
    EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'products'
        AND policyname = 'Anyone can view published products'
    )
  UNION ALL
  SELECT
    'demo user "kousik" exists with username set'::text,
    EXISTS (
      SELECT 1 FROM public.profiles WHERE lower(username) = 'kousik'
    )
)
SELECT item, CASE WHEN ok THEN '✅ OK' ELSE '❌ MISSING' END AS status
FROM checks;
