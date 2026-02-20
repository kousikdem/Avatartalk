-- Fix the update_user_stats function to not reference non-existent columns
-- The CASE statement in plpgsql evaluates all branches, causing errors when columns don't exist

CREATE OR REPLACE FUNCTION public.update_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Determine the target user based on the table
  IF TG_TABLE_NAME = 'follows' THEN
    target_user_id := COALESCE(NEW.following_id, OLD.following_id);
  ELSIF TG_TABLE_NAME = 'subscriptions' THEN
    target_user_id := COALESCE(NEW.subscribed_to_id, OLD.subscribed_to_id);
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Update followers count based on follows table
  UPDATE user_stats 
  SET followers_count = (
    SELECT COUNT(*) FROM follows WHERE following_id = target_user_id
  ),
  updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;