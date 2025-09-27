-- Fix critical security issues (corrected)

-- 1. Drop the public_profiles view since it bypasses RLS
DROP VIEW IF EXISTS public.public_profiles;

-- The profiles table already has proper RLS policies, so we don't need the view

-- 2. Secure visitor tracking system - require authentication
DROP POLICY IF EXISTS "Anyone can create visitor records" ON public.profile_visitors;
DROP POLICY IF EXISTS "Anyone can record profile visits" ON public.profile_visitors;

-- Only authenticated users can create visitor records with their own ID
CREATE POLICY "Authenticated users can create visitor records"
ON public.profile_visitors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = visitor_id);

-- 3. Fix database function security by adding search_path
CREATE OR REPLACE FUNCTION public.trim_username()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.username = trim(NEW.username);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Update followers count based on follows table
  UPDATE user_stats 
  SET followers_count = (
    SELECT COUNT(*) FROM follows WHERE following_id = 
    CASE 
      WHEN TG_TABLE_NAME = 'follows' THEN COALESCE(NEW.following_id, OLD.following_id)
      WHEN TG_TABLE_NAME = 'subscriptions' THEN COALESCE(NEW.subscribed_to_id, OLD.subscribed_to_id)
      ELSE NULL
    END
  ),
  updated_at = now()
  WHERE user_id = 
    CASE 
      WHEN TG_TABLE_NAME = 'follows' THEN COALESCE(NEW.following_id, OLD.following_id)
      WHEN TG_TABLE_NAME = 'subscriptions' THEN COALESCE(NEW.subscribed_to_id, OLD.subscribed_to_id)
      ELSE NULL
    END;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Update follower count for the user being followed/unfollowed
  UPDATE public.user_stats 
  SET followers_count = (
    SELECT COUNT(*) FROM public.follows 
    WHERE following_id = COALESCE(NEW.following_id, OLD.following_id)
  )
  WHERE user_id = COALESCE(NEW.following_id, OLD.following_id);
  
  -- Update following count for the user doing the following/unfollowing
  UPDATE public.user_stats 
  SET following_count = (
    SELECT COUNT(*) FROM public.follows 
    WHERE follower_id = COALESCE(NEW.follower_id, OLD.follower_id)
  )
  WHERE user_id = COALESCE(NEW.follower_id, OLD.follower_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_user_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Insert default avatar settings
  INSERT INTO public.avatar_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default social links
  INSERT INTO public.social_links (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;