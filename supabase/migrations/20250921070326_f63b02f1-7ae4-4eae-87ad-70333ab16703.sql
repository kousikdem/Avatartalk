-- Remove any default avatar configurations that might interfere with proper profile picture display
-- Update profiles to ensure profile_pic_url takes precedence over avatar_url

-- Remove default avatar configurations that might be showing generic avatars
DELETE FROM public.avatar_configurations 
WHERE avatar_name = 'Default Avatar' OR avatar_name LIKE '%Default%';

-- Update any profiles that have generic or placeholder avatar URLs to use profile_pic_url instead
UPDATE public.profiles 
SET avatar_url = profile_pic_url 
WHERE profile_pic_url IS NOT NULL 
  AND profile_pic_url != '' 
  AND (avatar_url IS NULL OR avatar_url = '' OR avatar_url LIKE '%placeholder%' OR avatar_url LIKE '%default%');