# 🔧 COMPLETE DATABASE SYNC & FIX GUIDE

## Problem Summary
User profiles showing "Profile Not Found" error when accessed by visitors without login.

## Root Cause
1. RLS (Row Level Security) policies blocking anonymous access to profiles table
2. Missing RPC function `get_public_profile_by_username()`
3. Insufficient grants for `anon` role on related tables

---

## 🚀 SOLUTION (Choose One Method)

### METHOD 1: Automated Test & Fix (Recommended)

#### Step 1: Run Database Test Page
1. Open your browser
2. Navigate to: `https://avatartalk.co/db-test` (or `localhost:3000/db-test` for dev)
3. Click **"Run Database Tests"**
4. Review results:
   - ✅ Green = Working
   - ❌ Red = Needs fixing

#### Step 2: Based on Test Results

**If "Direct Profile Query" FAILS:**
→ RLS policies are blocking access
→ Apply **DATABASE_FIX_COMPLETE.sql** (see Method 2 below)

**If "RPC Function Test" FAILS:**
→ Function doesn't exist (this is OK, fallback works)
→ Optionally apply RPC function for better performance

**If "Available Usernames" shows 0 results:**
→ No profiles in database with valid usernames
→ Create a test user or check existing profiles

---

### METHOD 2: Manual SQL Fix (2 minutes)

#### Step 1: Open Supabase SQL Editor
```
https://supabase.com/dashboard/project/hnxnvdzrwbtmcohdptfq
```
Click: **SQL Editor** → **+ New query**

#### Step 2: Copy & Run Complete Fix Script

**File Location**: `/app/DATABASE_FIX_COMPLETE.sql`

This script will:
1. ✅ Run diagnostics (show current state)
2. ✅ Fix RLS policies on profiles table
3. ✅ Grant permissions to anon users
4. ✅ Enable access to related tables
5. ✅ Create RPC functions
6. ✅ Run verification tests
7. ✅ Show valid usernames for testing

**Expected Output:**
```
CHECK 1: Profiles in database
total_profiles | profiles_with_username
----------------|----------------------
         50    |          45

CHECK 2: Example usernames
username | display_name | id | created_at
---------|--------------|----|-----------
fosik    | Fosik User   | ... | ...
kousik   | Kousik Kar   | ... | ...

[... more checks ...]

✅ DATABASE FIX COMPLETE!
Profiles should now be accessible to all visitors.
```

---

## 🧪 VERIFICATION STEPS

### Step 1: Check Database Test Page
1. Go to `https://avatartalk.co/db-test`
2. Run tests
3. All tests should be ✅ green

### Step 2: Test Profile Access (Incognito)
1. Open **incognito/private window** (Ctrl+Shift+N)
2. Get a valid username from test page or SQL query
3. Visit: `https://avatartalk.co/{username}`
4. **Expected**: Profile loads with avatar, name, bio
5. **Expected**: "Join Free" CTA banner appears at bottom

### Step 3: Check Browser Console
1. Press **F12** (Developer Tools)
2. Click **Console** tab
3. Look for profile loading logs:

**Success (Method 1 - RPC):**
```
[ProfilePage] Fetching profile for username: fosik
[ProfilePage] RPC result: { profileRows: [...], profileError: null }
[ProfilePage] Profile loaded via RPC: { username: 'fosik', profileId: '...' }
```

**Success (Method 2 - Fallback):**
```
[ProfilePage] Fetching profile for username: fosik
[ProfilePage] RPC function not found, using fallback method
[ProfilePage] Fallback result: { fallbackProfile: {...}, fallbackError: null }
[ProfilePage] Profile loaded via fallback: { username: 'fosik', profileId: '...' }
```

**Failure:**
```
[ProfilePage] RPC Error: { code: "PGRST116", message: "..." }
[ProfilePage] Fallback error: { code: "42501", message: "permission denied" }
```

---

## 📊 DIAGNOSTIC QUERIES

Run these in Supabase SQL Editor if you need to debug:

### Check 1: Do profiles exist?
```sql
SELECT COUNT(*) as total,
       COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as with_username
FROM public.profiles;
```

### Check 2: What usernames are available?
```sql
SELECT username, display_name, id, created_at 
FROM public.profiles 
WHERE username IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check 3: Are RLS policies correct?
```sql
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```
**Expected**: Policy named `public_profile_read_access` with roles: `{anon,authenticated}`

### Check 4: Are grants correct?
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' 
  AND grantee IN ('anon', 'authenticated');
```
**Expected**: `anon` and `authenticated` should have `SELECT` privilege

### Check 5: Does RPC function exist?
```sql
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'get_public_profile_by_username';
```
**Expected**: 1 row (function exists) OR 0 rows (using fallback - OK)

### Check 6: Test as anonymous user
```sql
SET ROLE anon;
SELECT username FROM public.profiles WHERE username IS NOT NULL LIMIT 1;
RESET ROLE;
```
**Expected**: Should return a username, not "permission denied"

---

## 🔍 TROUBLESHOOTING COMMON ERRORS

### Error: "Profile Not Found"

**Cause 1**: Username doesn't exist
**Fix**: Check available usernames with query above

**Cause 2**: RLS blocking anonymous access
**Fix**: Run `DATABASE_FIX_COMPLETE.sql`

**Cause 3**: Grants missing
**Fix**: Re-run GRANT statements from fix script

---

### Error: "Permission denied for table profiles"

**Cause**: `anon` role doesn't have SELECT permission
**Fix**: 
```sql
GRANT SELECT (id, username, display_name, full_name, bio, profession,
              avatar_id, avatar_url, profile_pic_url, country, location,
              website, followers_count, following_count, created_at, updated_at)
ON public.profiles TO anon, authenticated;
```

---

### Error: "function public.get_public_profile_by_username does not exist"

**Cause**: RPC function not created yet
**Status**: ⚠️ This is OK! The fallback method will work.
**Optional Fix**: Create function by running `DATABASE_FIX_COMPLETE.sql`

---

### Error: "no rows returned" (but username exists)

**Cause**: RLS policy too restrictive
**Fix**: Check policy USING clause:
```sql
-- Should be:
USING (username IS NOT NULL AND username != '')

-- Not:
USING (auth.uid() = id)  -- This blocks anon users!
```

---

## 📁 FILES REFERENCE

1. **Complete Database Fix**: `/app/DATABASE_FIX_COMPLETE.sql`
   - Full diagnostic + fix script
   - Run this in Supabase SQL Editor

2. **Frontend Test Page**: `/app/frontend/src/components/DatabaseTestPage.tsx`
   - Access at: `/db-test` route
   - Visual diagnostic tool

3. **Emergency RLS Fix**: `/app/EMERGENCY_FIX_RLS_POLICIES.sql`
   - Quick policy fix only
   - Use if you just need RLS update

4. **Profile Page (Updated)**: `/app/frontend/src/components/ProfilePage.tsx`
   - Has automatic fallback
   - Works with or without RPC function

---

## ✅ SUCCESS CHECKLIST

After applying fixes, verify:

- [ ] Database test page shows all green ✅
- [ ] Profile loads in incognito window
- [ ] Avatar, name, bio visible
- [ ] "Join Free" CTA appears for non-logged-in users
- [ ] Console shows successful profile load
- [ ] No "Permission denied" errors
- [ ] No "Profile Not Found" errors
- [ ] Related data loads (stats, products, events)

---

## 🎯 EXPECTED FINAL STATE

### Database:
- ✅ RLS enabled on all tables
- ✅ Public read policies for safe columns
- ✅ `anon` role has SELECT grants
- ✅ RPC functions created (optional but recommended)

### Frontend:
- ✅ Profile page uses fallback if RPC missing
- ✅ Automatic retry with different methods
- ✅ Clear error messages in console
- ✅ CTA banner for non-logged-in users

### User Experience:
- ✅ Profiles accessible without login
- ✅ Fast loading (< 2 seconds)
- ✅ SEO-friendly with meta tags
- ✅ Search engine indexable

---

## 🚀 NEXT STEPS AFTER FIX

1. **Test multiple profiles** - Verify different usernames work
2. **Check logged-in view** - CTA shouldn't appear
3. **Submit to Google** - Add sitemap to Search Console
4. **Monitor analytics** - Track profile views
5. **Create more profiles** - Add to sitemap.xml

---

## 📞 STILL NEED HELP?

If profiles still don't load after applying all fixes:

1. **Export database state:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT 
     (SELECT COUNT(*) FROM profiles) as total_profiles,
     (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as profile_policies,
     (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%public_profile%') as rpc_functions;
   ```

2. **Check frontend logs:**
   - Open DevTools (F12)
   - Copy all `[ProfilePage]` logs
   - Look for specific error codes

3. **Verify Supabase config:**
   - Project ID: `hnxnvdzrwbtmcohdptfq`
   - Check `.env` file has correct URL and anon key

---

*Frontend updated with test page + fallback. Database fix script ready. Apply the SQL migration to complete the fix!*
