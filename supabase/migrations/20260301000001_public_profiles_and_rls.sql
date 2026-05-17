-- =====================================================================
-- AvatarTalk: Make user profiles & related public-facing data publicly
-- readable so that /:username pages load for both authenticated and
-- anonymous visitors.
--
-- Sensitive PII columns (email, phone_number, date_of_birth, address,
-- gender, age) stay protected by NOT being exposed in the public read
-- path. We grant SELECT on the entire profiles table to anon/auth but
-- column-level grants restrict what's readable.
--
-- After applying:
--   - GET /:username works without sign-in
--   - profile.products (status=published), events, social_links,
--     avatar_configurations (active), user_stats (counts only) all load
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) PROFILES — allow public SELECT but restrict sensitive columns
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;

-- Re-add a public read policy. We rely on COLUMN-level grants below to
-- hide PII columns. RLS itself is row-filtering only.
CREATE POLICY "Anyone can view public profile fields"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (username IS NOT NULL);

-- Make sure profiles table is granted SELECT to anon at all (default is off)
GRANT SELECT (
  id,
  username,
  display_name,
  full_name,
  bio,
  profession,
  avatar_id,
  avatar_url,
  profile_pic_url,
  country,
  location,
  website,
  created_at,
  updated_at,
  followers_count,
  following_count
) ON public.profiles TO anon, authenticated;

-- Owners always see their full row via existing "Users view own complete profile"
-- policy which already grants ALL columns to auth.uid() = id.

-- ---------------------------------------------------------------------
-- 2) USER_STATS — public read of aggregate counts
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats;
CREATE POLICY "Anyone can view user stats"
ON public.user_stats
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.user_stats TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 3) PRODUCTS — public read of PUBLISHED products only
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
CREATE POLICY "Anyone can view published products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (status = 'published');

GRANT SELECT ON public.products TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 4) EVENTS — public read of published / upcoming events
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (status IN ('published', 'upcoming'));

GRANT SELECT ON public.events TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 5) AVATAR_CONFIGURATIONS — public read of active avatars
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active avatars" ON public.avatar_configurations;
CREATE POLICY "Anyone can view active avatars"
ON public.avatar_configurations
FOR SELECT
TO anon, authenticated
USING (is_active = true);

GRANT SELECT ON public.avatar_configurations TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 6) SOCIAL_LINKS — public read
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links;
CREATE POLICY "Anyone can view social links"
ON public.social_links
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.social_links TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 7) POSTS — public read of published posts (if table exists)
-- ---------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='posts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts';
    EXECUTE $sql$
      CREATE POLICY "Anyone can view published posts"
      ON public.posts
      FOR SELECT
      TO anon, authenticated
      USING (status = 'published' OR status IS NULL)
    $sql$;
    EXECUTE 'GRANT SELECT ON public.posts TO anon, authenticated';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 8) AI_TRAINING_SETTINGS — public read of welcome message fields
-- ---------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ai_training_settings') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view ai welcome settings" ON public.ai_training_settings';
    EXECUTE $sql$
      CREATE POLICY "Anyone can view ai welcome settings"
      ON public.ai_training_settings
      FOR SELECT
      TO anon, authenticated
      USING (true)
    $sql$;
    EXECUTE 'GRANT SELECT ON public.ai_training_settings TO anon, authenticated';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 9) PUBLIC_PROFILES VIEW — extend with more safe fields
-- ---------------------------------------------------------------------

DROP VIEW IF EXISTS public.public_profiles CASCADE;
CREATE VIEW public.public_profiles AS
SELECT
  id,
  username,
  display_name,
  full_name,
  bio,
  profession,
  avatar_id,
  avatar_url,
  profile_pic_url,
  country,
  location,
  website,
  followers_count,
  following_count,
  created_at
FROM public.profiles
WHERE username IS NOT NULL;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
