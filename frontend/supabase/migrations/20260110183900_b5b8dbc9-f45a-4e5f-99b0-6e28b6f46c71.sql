-- Fix Security Definer View warnings by converting to Security Invoker
-- This ensures views respect RLS of the querying user, not the view creator

-- Fix public_profiles view - use security invoker
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  display_name,
  bio,
  profile_pic_url,
  avatar_url,
  profession,
  followers_count,
  following_count,
  created_at
FROM profiles
WHERE username IS NOT NULL;

GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Fix safe_chat_memory view - use security invoker
DROP VIEW IF EXISTS public.safe_chat_memory;
CREATE VIEW public.safe_chat_memory 
WITH (security_invoker = true)
AS
SELECT 
  id,
  profile_id,
  visitor_id,
  CASE 
    WHEN (visitor_metadata->>'consent_to_share_email')::boolean = true THEN visitor_email
    ELSE NULL 
  END as visitor_email,
  CASE 
    WHEN (visitor_metadata->>'consent_to_share_name')::boolean = true THEN visitor_name
    ELSE 
      CASE 
        WHEN visitor_name IS NOT NULL THEN 'Anonymous Visitor'
        ELSE NULL
      END
  END as visitor_name,
  total_messages,
  engagement_score,
  last_visit_at,
  first_visit_at,
  session_count,
  last_topics,
  preferences,
  welcome_shown,
  created_at,
  updated_at
FROM ai_chat_memory;

GRANT SELECT ON public.safe_chat_memory TO authenticated;