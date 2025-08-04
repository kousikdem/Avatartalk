-- Check and fix RLS policies for profiles table
-- First, let's see the current policies and then ensure they work correctly

-- Drop existing policies and recreate them to ensure they work
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Create a simple policy that allows anyone to view profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
FOR SELECT 
USING (true);

-- Also ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;