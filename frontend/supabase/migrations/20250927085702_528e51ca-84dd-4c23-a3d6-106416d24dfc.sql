-- Fix security warning: Set proper search_path for the get_public_profile function
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
 SET search_path = public
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