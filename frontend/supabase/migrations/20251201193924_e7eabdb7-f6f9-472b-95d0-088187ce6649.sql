-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;

-- Users can view their own likes
CREATE POLICY "Users can view own likes" ON likes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can view likes on their posts
CREATE POLICY "Users can view likes on own posts" ON likes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts WHERE id = likes.post_id AND user_id = auth.uid()
  )
);

-- Users can view likes on their profile
CREATE POLICY "Users can view likes on own profile" ON likes
FOR SELECT TO authenticated
USING (profile_id = auth.uid());