-- Drop restrictive policies that block viewing posts
DROP POLICY IF EXISTS "Users can view free posts" ON public.posts;
DROP POLICY IF EXISTS "Subscribers can view paid posts" ON public.posts;

-- Create a unified SELECT policy that allows everyone to view all posts
-- The content locking is handled at the application level based on is_paid, is_subscriber_only
CREATE POLICY "Anyone can view posts" 
ON public.posts 
FOR SELECT 
USING (true);

-- Allow unauthenticated users to view post unlocks (needed to check if they've unlocked)
DROP POLICY IF EXISTS "Users can view their own unlocks" ON public.post_unlocks;
CREATE POLICY "Users can view their own unlocks" 
ON public.post_unlocks 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Make sure products are also visible to all
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);