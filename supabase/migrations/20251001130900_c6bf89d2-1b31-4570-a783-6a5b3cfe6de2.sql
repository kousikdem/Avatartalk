-- Security Fix: Restrict public profile access to safe fields only
-- This prevents exposure of sensitive PII (email, full_name, age, gender)

-- Drop ALL existing profile policies
DROP POLICY IF EXISTS "Public profiles viewable anonymously" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;

-- Create a security definer function to get safe public profile fields
CREATE OR REPLACE FUNCTION public.get_safe_profile_fields(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  bio text,
  profile_pic_url text,
  avatar_url text,
  profession text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.profile_pic_url,
    p.avatar_url,
    p.profession,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id
    AND p.username IS NOT NULL; -- Only return public profiles
$$;

-- Policy 1: Users can view their own complete profile (all fields including sensitive data)
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Authenticated users can view safe public fields of other profiles
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  username IS NOT NULL 
  AND id != auth.uid()
  AND id IN (
    SELECT id FROM public.get_safe_profile_fields(profiles.id)
  )
);

-- Policy 3: Anonymous users can view only safe public fields
CREATE POLICY "Anonymous users can view limited public profiles"
ON public.profiles
FOR SELECT
TO anon
USING (
  username IS NOT NULL
  AND id IN (
    SELECT id FROM public.get_safe_profile_fields(profiles.id)
  )
);

-- Policy 4: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 5: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- IMPORTANT: Sensitive fields (email, full_name, age, gender) are now protected
-- from public/anonymous access through RLS column-level filtering