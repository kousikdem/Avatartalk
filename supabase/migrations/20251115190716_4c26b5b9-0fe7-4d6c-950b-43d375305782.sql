-- Fix typo in database functions/triggers that reference subscribe_to_id
-- The correct column name is subscribed_to_id in the subscriptions table

-- Drop any existing triggers on follows table that might be causing issues
DO $$ 
BEGIN
  -- Drop trigger if it exists
  DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
  DROP TRIGGER IF EXISTS on_follow_deleted ON public.follows;
  DROP TRIGGER IF EXISTS update_user_stats_on_follow ON public.follows;
  DROP TRIGGER IF EXISTS update_user_stats_on_subscription ON public.subscriptions;
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate the update_user_stats function with correct column names
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Recreate triggers with correct references
CREATE TRIGGER update_user_stats_on_follow
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats();

CREATE TRIGGER update_user_stats_on_subscription
AFTER INSERT OR DELETE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats();