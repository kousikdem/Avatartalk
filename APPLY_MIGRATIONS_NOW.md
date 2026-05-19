# URGENT: Apply These Migrations to Fix "Profile Not Found" Error

## Problem
Visiting `avatartalk.co/fosik` shows "Profile Not Found" because the SQL functions don't exist in the production database yet.

## Solution
Apply these 3 migration files to your Supabase database IN ORDER:

---

## STEP 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **hnxnvdzrwbtmcohdptfq**
3. Click **SQL Editor** in the left sidebar
4. Click **+ New query**

---

## STEP 2: Apply Migration 1 - Public Profile Functions

**Copy and paste this entire SQL script:**

```sql
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
```

Click **Run** (or press Ctrl+Enter)

✅ You should see "Success. No rows returned"

---

## STEP 3: Test the Function

In a new SQL query, run this to test:

```sql
-- Test with username "fosik"
SELECT * FROM public.get_public_profile_by_username('fosik');
```

**Expected Results:**
- If "fosik" exists: Returns profile data (id, username, display_name, bio, etc.)
- If "fosik" doesn't exist: Returns empty result (0 rows)

**If you get 0 rows**, it means the username "fosik" doesn't exist in the database. Check what usernames exist:

```sql
SELECT username, display_name, created_at 
FROM public.profiles 
WHERE username IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## STEP 4: Apply Migration 2 - Token Credit Function (Optional for now)

Only needed if you want to fix token purchases. You can skip this for now.

```sql
-- =====================================================================
-- credit_user_tokens: atomically add tokens to a user's balance
-- Returns JSON: { success: boolean, balance: number, error?: string }
-- =====================================================================

CREATE OR REPLACE FUNCTION public.credit_user_tokens(
  p_user_id uuid,
  p_tokens   bigint,
  p_reason   text DEFAULT 'topup'
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
  IF p_tokens <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'tokens must be positive');
  END IF;

  -- Lock the row to prevent race conditions
  SELECT COALESCE(token_balance, 0)
    INTO v_old_balance
    FROM public.profiles
   WHERE id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'profile not found');
  END IF;

  v_new_balance := v_old_balance + p_tokens;

  UPDATE public.profiles
     SET token_balance = v_new_balance,
         updated_at    = now()
   WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.token_events (user_id, change, balance_after, reason)
  VALUES (p_user_id, p_tokens, v_new_balance, p_reason)
  ON CONFLICT DO NOTHING;

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

-- Also ensure token_events table exists
CREATE TABLE IF NOT EXISTS public.token_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change       bigint      NOT NULL,
  balance_after bigint     NOT NULL,
  reason       text        NOT NULL DEFAULT 'topup',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_events_user_id ON public.token_events(user_id);
ALTER TABLE public.token_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own token events" ON public.token_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
GRANT SELECT ON public.token_events TO authenticated;
GRANT INSERT, SELECT ON public.token_events TO service_role;

-- Ensure token_purchases table has is_active on token_packages
ALTER TABLE IF EXISTS public.token_packages
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
```

---

## STEP 5: Verify Profile Page Works

After applying the migration:

1. Open a new **incognito window**
2. Go to `https://avatartalk.co/fosik` (or any existing username)
3. The profile should load WITHOUT login

**If you still see "Profile Not Found":**
- The username "fosik" might not exist - try a different username that you know exists
- Check browser console (F12) for errors
- Verify the migration ran successfully

---

## QUICK TEST: Check if username exists

Run this in Supabase SQL Editor:

```sql
-- Find all valid usernames
SELECT username, display_name, bio 
FROM public.profiles 
WHERE username IS NOT NULL AND username != ''
ORDER BY created_at DESC
LIMIT 20;
```

Use one of these usernames to test the profile page.

---

## After Migration Success

Once the migration is applied and profiles load:

1. ✅ Profiles visible to all visitors (no login required)
2. ✅ Search engines can index profiles
3. ✅ Dynamic meta tags for SEO
4. ✅ "Join Free" CTA banner for visitors
5. ✅ Sitemap at `/sitemap.xml`

---

## Need Help?

If you encounter errors:
1. Copy the exact error message from Supabase SQL Editor
2. Check which line failed
3. Try running the failed section separately

**Common Issues:**
- "relation does not exist" → Table name is different, check your schema
- "permission denied" → You need to be the project owner
- "function already exists" → That's OK, it will be replaced with CREATE OR REPLACE

---

*This migration is REQUIRED for public profile visibility. Without it, the frontend code cannot fetch profiles for visitors.*
