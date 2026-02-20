-- Fix security vulnerability: Remove public access to social_links table
-- This prevents unauthorized access to users' personal social media accounts

-- Drop the overly permissive policy that allows anyone to view social links
DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links;

-- Create a more secure policy that only allows users to view their own social links
-- and allows viewing social links for public profiles (profiles with usernames set)
CREATE POLICY "Users can view social links for public profiles or their own"
ON public.social_links
FOR SELECT
USING (
  -- Users can always view their own social links
  (user_id = auth.uid()) 
  OR 
  -- Social links are viewable for public profiles (profiles with username set)
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = social_links.user_id 
    AND profiles.username IS NOT NULL
  )
);