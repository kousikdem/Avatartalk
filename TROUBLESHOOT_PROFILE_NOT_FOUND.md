# 🚨 TROUBLESHOOTING: "Profile Not Found" Error

## The Problem You're Seeing

Visiting `avatartalk.co/fosik` shows:
```
Profile Not Found
The requested profile could not be found.
```

## Root Cause

The SQL migration hasn't been applied to your **production Supabase database** yet. The frontend code is trying to call a function `get_public_profile_by_username()` that doesn't exist.

---

## ✅ SOLUTION: Apply Migration in 5 Minutes

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/hnxnvdzrwbtmcohdptfq
2. Click **SQL Editor** in left sidebar
3. Click **+ New query** button

### Step 2: Copy & Paste This SQL

```sql
-- Username-based public profile lookup
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

-- Allow public access to profiles table (safe columns only)
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
CREATE POLICY "Anyone can view public profile fields"
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (username IS NOT NULL);

GRANT SELECT (
  id, username, display_name, full_name, bio, profession,
  avatar_id, avatar_url, profile_pic_url, country, location,
  website, followers_count, following_count, created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- Allow public access to related tables
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
```

### Step 3: Click **RUN** (or press Ctrl+Enter)

You should see: ✅ **"Success. No rows returned"**

---

## Step 4: Test the Function

In a new SQL query, run:

```sql
-- Check if "fosik" username exists
SELECT * FROM public.get_public_profile_by_username('fosik');
```

**Result A**: Returns profile data → ✅ Great! The user exists.

**Result B**: Returns 0 rows → The username "fosik" doesn't exist in your database.

### If "fosik" doesn't exist, find a username that does:

```sql
SELECT username, display_name, created_at 
FROM public.profiles 
WHERE username IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;
```

Use one of these usernames to test the profile page.

---

## Step 5: Test in Browser

1. Open **incognito/private window** (to test as a visitor)
2. Go to: `https://avatartalk.co/{username}` (use an existing username)
3. Profile should load without login!

---

## 🔍 Debug If Still Not Working

### Check Browser Console

1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for errors starting with `[ProfilePage]`

**Common errors:**

**Error**: `function public.get_public_profile_by_username(text) does not exist`
**Fix**: The migration didn't run. Go back to Step 2.

**Error**: `Profile not found`
**Fix**: The username doesn't exist. Use Step 4 to find valid usernames.

**Error**: `permission denied for function`
**Fix**: Run the `GRANT EXECUTE` line again in SQL Editor.

---

## 📋 Quick Checklist

- [ ] Applied SQL migration in Supabase Dashboard
- [ ] Ran test query to verify function exists
- [ ] Found a valid username from database
- [ ] Tested profile URL in incognito window
- [ ] Profile loads without login
- [ ] Checked browser console for errors

---

## 🎯 Expected Behavior After Fix

✅ **Public Access**: Anyone can view profiles without login
✅ **SEO**: Search engines can crawl and index profiles
✅ **CTA Banner**: Non-logged-in visitors see "Join Free" banner
✅ **No Errors**: Profile loads smoothly in incognito mode

---

## 📞 Still Having Issues?

### Check these common problems:

1. **Wrong Supabase Project**
   - Verify you're in project: `hnxnvdzrwbtmcohdptfq`
   - Check URL bar in Supabase dashboard

2. **RLS Still Blocking**
   - Run this to check policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Function Doesn't Exist**
   - Run this to verify:
   ```sql
   SELECT proname FROM pg_proc WHERE proname LIKE '%public_profile%';
   ```
   - Should return: `get_public_profile_by_username`

4. **Frontend Not Updated**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+F5)

---

## 🚀 After This Works

Once profiles are visible, you can:
1. Submit sitemap to Google Search Console
2. Monitor organic traffic to profiles
3. Track "Join Free" CTA conversions
4. Add more profile URLs to sitemap.xml

---

*This is the CRITICAL step to make profiles public. The frontend code is already correct - it just needs the database function to exist.*
