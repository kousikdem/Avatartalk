-- Fix security vulnerability: Restrict user_stats table access
-- Drop the overly permissive policy that allows anyone to view user stats
DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats;

-- Create new restrictive policies for user_stats table
-- Users can only view their own statistics
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow viewing stats for public profiles (when explicitly made public)
-- This policy will only work if we have a way to determine if a profile is public
-- For now, we'll keep it restrictive and only allow users to see their own stats
CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;