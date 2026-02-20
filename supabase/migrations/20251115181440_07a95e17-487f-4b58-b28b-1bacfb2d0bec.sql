-- Add follower and following count columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment follower count for the user being followed
    UPDATE profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    -- Increment following count for the follower
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement follower count for the user being unfollowed
    UPDATE profiles 
    SET followers_count = GREATEST(followers_count - 1, 0) 
    WHERE id = OLD.following_id;
    
    -- Decrement following count for the unfollower
    UPDATE profiles 
    SET following_count = GREATEST(following_count - 1, 0) 
    WHERE id = OLD.follower_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on follows table
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
CREATE TRIGGER update_follower_counts_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

-- Initialize existing counts (backfill)
UPDATE profiles p
SET 
  followers_count = (
    SELECT COUNT(*) 
    FROM follows 
    WHERE following_id = p.id
  ),
  following_count = (
    SELECT COUNT(*) 
    FROM follows 
    WHERE follower_id = p.id
  );