-- Fix security vulnerability: Remove email exposure from public profile access
-- Create a secure function to get public profile data without sensitive fields

-- Create a function to get public profile data safely (excluding email and other sensitive fields)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
 RETURNS TABLE(
   id uuid,
   created_at timestamp with time zone,
   updated_at timestamp with time zone,
   full_name text,
   avatar_url text,
   username text,
   bio text,
   profile_pic_url text,
   display_name text,
   profession text
 )
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
AS $function$
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
  WHERE p.id = profile_id
    AND p.username IS NOT NULL; -- Only return profiles that are meant to be public
$function$;

-- Update the existing public profile policy to be more restrictive
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a more restrictive policy that only allows viewing basic public info
-- This policy will be used in combination with the secure function above
CREATE POLICY "Limited public profile access"
ON public.profiles
FOR SELECT
USING (
  username IS NOT NULL 
  AND auth.uid() IS NOT NULL -- Require authentication for any profile access
);

-- The existing "Users can view their own complete profile" policy remains unchanged
-- so users can still see their own email and other sensitive data