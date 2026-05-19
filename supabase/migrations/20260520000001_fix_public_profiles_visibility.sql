-- =====================================================================
-- FIX: Public profile visibility for all visitors (logged-in or not)
-- =====================================================================

-- 1. SECURITY DEFINER function bypasses RLS safely — only exposes safe columns
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

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;

-- 2. Username-based lookup (used by frontend to avoid Step 1 RLS block)
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

GRANT EXECUTE ON FUNCTION public.get_public_profile_by_username(text) TO anon, authenticated;

-- 3. RLS: allow anon + authenticated to read safe public columns
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
CREATE POLICY "Anyone can view public profile fields"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (username IS NOT NULL);

-- 4. Column-level grants for direct table reads (e.g. related data fetches)
GRANT SELECT (
  id, username, display_name, full_name, bio, profession,
  avatar_id, avatar_url, profile_pic_url, country, location,
  website, followers_count, following_count, created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- 5. Related tables: ensure anon can read public data
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

-- 6. Also expose ai_training_settings welcome message for the AI chat widget
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
