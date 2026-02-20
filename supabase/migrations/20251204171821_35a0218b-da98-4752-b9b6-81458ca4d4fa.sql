-- Drop the restrictive SELECT policy on avatar_configurations
DROP POLICY IF EXISTS "Users can view their own avatar configurations" ON avatar_configurations;

-- Create a new policy that allows anyone to view avatar configurations (needed for profile visitors)
CREATE POLICY "Anyone can view avatar configurations" 
ON avatar_configurations 
FOR SELECT 
USING (true);

-- This allows visitors to see the 3D avatar on user profiles while maintaining INSERT/UPDATE/DELETE restrictions to owners only