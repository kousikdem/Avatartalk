-- Update profiles table follower counts when follows change
-- This ensures the follower_count and following_count in profiles table stay in sync

-- Function to update follower counts in profiles table
CREATE OR REPLACE FUNCTION public.update_profile_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update the following_id user's followers_count (person being followed)
  UPDATE profiles
  SET followers_count = (
    SELECT COUNT(*) FROM follows WHERE following_id = COALESCE(NEW.following_id, OLD.following_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.following_id, OLD.following_id);

  -- Update the follower_id user's following_count (person doing the following)
  UPDATE profiles
  SET following_count = (
    SELECT COUNT(*) FROM follows WHERE follower_id = COALESCE(NEW.follower_id, OLD.follower_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.follower_id, OLD.follower_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger on follows table
DROP TRIGGER IF EXISTS update_profile_counts_on_follow ON public.follows;
CREATE TRIGGER update_profile_counts_on_follow
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_follower_counts();