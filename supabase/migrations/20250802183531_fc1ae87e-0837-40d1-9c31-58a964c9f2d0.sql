
-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  like_type TEXT NOT NULL CHECK (like_type IN ('post', 'profile')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('post', 'profile')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES auth.users NOT NULL,
  subscribed_to_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL DEFAULT 'monthly',
  price DECIMAL(10,2) NOT NULL DEFAULT 9.99,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(subscriber_id, subscribed_to_id)
);

-- Add RLS policies for likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() = subscribed_to_id);
CREATE POLICY "Users can create subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = subscriber_id);
CREATE POLICY "Users can update their subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = subscriber_id);

-- Add indexes for better performance
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_profile_id ON public.likes(profile_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_profile_id ON public.comments(profile_id);
CREATE INDEX idx_subscriptions_subscriber_id ON public.subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_subscribed_to_id ON public.subscriptions(subscribed_to_id);

-- Function to update user stats when likes/comments/subscriptions change
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update followers count based on follows table
  UPDATE user_stats 
  SET followers_count = (
    SELECT COUNT(*) FROM follows WHERE following_id = 
    CASE 
      WHEN TG_TABLE_NAME = 'follows' THEN COALESCE(NEW.following_id, OLD.following_id)
      WHEN TG_TABLE_NAME = 'subscriptions' THEN COALESCE(NEW.subscribed_to_id, OLD.subscribed_to_id)
      ELSE NULL
    END
  ),
  updated_at = now()
  WHERE user_id = 
    CASE 
      WHEN TG_TABLE_NAME = 'follows' THEN COALESCE(NEW.following_id, OLD.following_id)
      WHEN TG_TABLE_NAME = 'subscriptions' THEN COALESCE(NEW.subscribed_to_id, OLD.subscribed_to_id)
      ELSE NULL
    END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update stats automatically
CREATE TRIGGER update_stats_on_follow
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_stats_on_subscription
  AFTER INSERT OR DELETE OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();
