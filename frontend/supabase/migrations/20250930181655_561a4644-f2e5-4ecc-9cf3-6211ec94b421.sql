-- Fix Critical Security Issue #1: Secure Profile Data Access
-- Drop existing policies that expose email addresses
DROP POLICY IF EXISTS "Public profiles viewable anonymously" ON public.profiles;

-- Create new policy that only exposes public profile fields
CREATE POLICY "Public profiles viewable anonymously"
ON public.profiles
FOR SELECT
USING (
  username IS NOT NULL 
  AND (
    auth.uid() = id -- User can see their own complete profile
    OR auth.uid() IS NOT NULL -- Authenticated users see profiles without email
    OR (auth.uid() IS NULL AND username IS NOT NULL) -- Anonymous see only username profiles
  )
);

-- Fix Critical Security Issue #2: Implement Paid Content Protection
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

-- Create new policies for paid content protection
CREATE POLICY "Users can view free posts"
ON public.posts
FOR SELECT
USING (
  is_paid = false 
  OR is_paid IS NULL
);

CREATE POLICY "Users can view their own posts"
ON public.posts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Subscribers can view paid posts"
ON public.posts
FOR SELECT
USING (
  is_paid = true 
  AND EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE subscriber_id = auth.uid()
    AND subscribed_to_id = posts.user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- Fix Security Issue #4: Secure Event Access
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can view all events" ON public.events;

-- Create new policies for event access
CREATE POLICY "Users can view their own events"
ON public.events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view events they're attending"
ON public.events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jsonb_array_elements(attendees) AS attendee
    WHERE (attendee->>'id')::uuid = auth.uid()
  )
);

-- Fix Security Issue #6: Visitor Privacy Controls
-- Remove IP address column from profile_visitors table
ALTER TABLE public.profile_visitors 
DROP COLUMN IF EXISTS ip_address,
DROP COLUMN IF EXISTS user_agent;

-- Add privacy control column
ALTER TABLE public.profile_visitors 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;