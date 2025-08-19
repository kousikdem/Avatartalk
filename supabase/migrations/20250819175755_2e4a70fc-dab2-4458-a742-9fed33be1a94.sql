
-- Create posts table with all necessary fields
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  content TEXT,
  post_type TEXT DEFAULT 'text'::text,
  media_url TEXT,
  media_type TEXT,
  link_url TEXT,
  integration_data JSONB DEFAULT '{}'::jsonb,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  price NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts table
CREATE POLICY "Anyone can view posts" 
  ON public.posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their posts" 
  ON public.posts 
  FOR ALL 
  USING (user_id = auth.uid());

-- Update likes table to ensure it works with posts
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_check;
ALTER TABLE public.likes ADD CONSTRAINT likes_check 
  CHECK ((post_id IS NOT NULL AND profile_id IS NULL) OR (post_id IS NULL AND profile_id IS NOT NULL));

-- Update comments table to ensure it works with posts  
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_check;
ALTER TABLE public.comments ADD CONSTRAINT comments_check 
  CHECK ((post_id IS NOT NULL AND profile_id IS NULL) OR (post_id IS NULL AND profile_id IS NOT NULL));

-- Create function to update post counts when likes/comments change
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle likes
  IF TG_TABLE_NAME = 'likes' AND NEW.post_id IS NOT NULL THEN
    UPDATE posts 
    SET likes_count = (
      SELECT COUNT(*) FROM likes WHERE post_id = NEW.post_id
    ),
    updated_at = now()
    WHERE id = NEW.post_id;
  END IF;
  
  -- Handle likes deletion
  IF TG_TABLE_NAME = 'likes' AND OLD.post_id IS NOT NULL THEN
    UPDATE posts 
    SET likes_count = (
      SELECT COUNT(*) FROM likes WHERE post_id = OLD.post_id
    ),
    updated_at = now()
    WHERE id = OLD.post_id;
  END IF;
  
  -- Handle comments
  IF TG_TABLE_NAME = 'comments' AND NEW.post_id IS NOT NULL THEN
    UPDATE posts 
    SET comments_count = (
      SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id
    ),
    updated_at = now()
    WHERE id = NEW.post_id;
  END IF;
  
  -- Handle comments deletion
  IF TG_TABLE_NAME = 'comments' AND OLD.post_id IS NOT NULL THEN
    UPDATE posts 
    SET comments_count = (
      SELECT COUNT(*) FROM comments WHERE post_id = OLD.post_id
    ),
    updated_at = now()
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update post stats
CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION update_post_stats();

CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_post_stats();
