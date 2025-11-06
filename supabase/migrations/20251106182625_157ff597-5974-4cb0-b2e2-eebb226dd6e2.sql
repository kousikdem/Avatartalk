-- Add configuration_data JSONB column to avatar_configurations for storing complete avatar data
ALTER TABLE avatar_configurations
ADD COLUMN IF NOT EXISTS configuration_data JSONB DEFAULT '{}'::jsonb;

-- Add index for faster configuration_data queries
CREATE INDEX IF NOT EXISTS idx_avatar_configurations_user_active 
ON avatar_configurations(user_id, is_active) 
WHERE is_active = true;

-- Add trigger to sync avatar updates to profiles table in real-time
CREATE OR REPLACE FUNCTION sync_avatar_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile with latest avatar data when configuration is saved
  IF NEW.is_active = true THEN
    UPDATE profiles
    SET 
      avatar_id = NEW.id,
      avatar_url = COALESCE(NEW.thumbnail_url, avatar_url),
      profile_pic_url = COALESCE(NEW.thumbnail_url, profile_pic_url),
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for real-time avatar sync
DROP TRIGGER IF EXISTS trigger_sync_avatar_to_profile ON avatar_configurations;
CREATE TRIGGER trigger_sync_avatar_to_profile
  AFTER INSERT OR UPDATE ON avatar_configurations
  FOR EACH ROW
  EXECUTE FUNCTION sync_avatar_to_profile();

-- Enable realtime for avatar_configurations
ALTER PUBLICATION supabase_realtime ADD TABLE avatar_configurations;