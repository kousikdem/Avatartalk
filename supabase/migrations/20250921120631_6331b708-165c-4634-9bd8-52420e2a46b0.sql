-- Remove default avatar functionality
-- Update avatar configurations to remove default avatar dependency
UPDATE avatar_configurations 
SET is_active = true 
WHERE user_id IN (
    SELECT DISTINCT user_id 
    FROM avatar_configurations 
    GROUP BY user_id 
    HAVING COUNT(*) = 1
);

-- Remove any default avatar entries that are not user-specific
DELETE FROM avatar_configurations 
WHERE avatar_name = 'Default Avatar' 
AND user_id NOT IN (
    SELECT id FROM auth.users
);

-- Update profiles to remove default avatar URLs and use actual profile pictures
UPDATE profiles 
SET avatar_url = COALESCE(profile_pic_url, avatar_url)
WHERE avatar_url LIKE '%28a7b1bf-3631-42ba-ab7e-d0557c2d9bae%' 
   OR avatar_url LIKE '%default%';