-- Phase 1: Add missing export and compression columns to avatar_configurations
ALTER TABLE avatar_configurations 
ADD COLUMN IF NOT EXISTS json_export_url TEXT,
ADD COLUMN IF NOT EXISTS gif_export_url TEXT,
ADD COLUMN IF NOT EXISTS glb_export_url TEXT,
ADD COLUMN IF NOT EXISTS gltf_export_url TEXT,
ADD COLUMN IF NOT EXISTS fbx_export_url TEXT,
ADD COLUMN IF NOT EXISTS obj_export_url TEXT;

-- Add compressed format URL columns
ALTER TABLE avatar_configurations 
ADD COLUMN IF NOT EXISTS compressed_json_url TEXT,
ADD COLUMN IF NOT EXISTS compressed_glb_url TEXT,
ADD COLUMN IF NOT EXISTS compressed_gif_url TEXT,
ADD COLUMN IF NOT EXISTS compression_ratio NUMERIC;

-- Add format metadata
ALTER TABLE avatar_configurations 
ADD COLUMN IF NOT EXISTS last_export_format TEXT,
ADD COLUMN IF NOT EXISTS last_export_date TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_avatar_configs_user_active 
ON avatar_configurations(user_id, is_active);

-- Phase 8: Update trigger to NEVER touch profile_pic_url
CREATE OR REPLACE FUNCTION public.sync_avatar_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update profile with latest 3D avatar data when configuration is saved
  IF NEW.is_active = true THEN
    UPDATE profiles
    SET 
      avatar_id = NEW.id,
      -- Use model_url or glb_export_url for 3D avatar, NEVER profile_pic_url
      avatar_url = COALESCE(NEW.model_url, NEW.glb_export_url, NEW.thumbnail_url, avatar_url),
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;