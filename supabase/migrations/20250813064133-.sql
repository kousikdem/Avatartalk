-- Fix email exposure security issue by updating profiles RLS policy
-- Drop the current overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that allows public access to non-sensitive profile data only
-- Users can view their own complete profile including email
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a view for public profile data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  created_at,
  updated_at,
  full_name,
  avatar_url,
  username,
  bio,
  profile_pic_url,
  display_name,
  profession
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Grant public access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Create a security definer function to get public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  full_name text,
  avatar_url text,
  username text,
  bio text,
  profile_pic_url text,
  display_name text,
  profession text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.created_at,
    p.updated_at,
    p.full_name,
    p.avatar_url,
    p.username,
    p.bio,
    p.profile_pic_url,
    p.display_name,
    p.profession
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;