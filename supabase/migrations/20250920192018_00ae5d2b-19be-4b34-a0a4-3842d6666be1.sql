-- Create follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows
CREATE POLICY "Users can view all follows" 
ON public.follows 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow others" 
ON public.follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
ON public.follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Update user_stats table to include follower count tracking
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update follower count for the user being followed/unfollowed
  UPDATE public.user_stats 
  SET followers_count = (
    SELECT COUNT(*) FROM public.follows 
    WHERE following_id = COALESCE(NEW.following_id, OLD.following_id)
  )
  WHERE user_id = COALESCE(NEW.following_id, OLD.following_id);
  
  -- Update following count for the user doing the following/unfollowing
  UPDATE public.user_stats 
  SET following_count = (
    SELECT COUNT(*) FROM public.follows 
    WHERE follower_id = COALESCE(NEW.follower_id, OLD.follower_id)
  )
  WHERE user_id = COALESCE(NEW.follower_id, OLD.follower_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update follow counts
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON public.follows;
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_counts();

-- Create visitor tracking table for profile visits
CREATE TABLE IF NOT EXISTS public.profile_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visited_profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable Row Level Security on visitors table
ALTER TABLE public.profile_visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for profile visitors
CREATE POLICY "Users can view their own profile visitors" 
ON public.profile_visitors 
FOR SELECT 
USING (auth.uid() = visited_profile_id OR auth.uid() = visitor_id);

CREATE POLICY "Anyone can record profile visits" 
ON public.profile_visitors 
FOR INSERT 
WITH CHECK (true);

-- Add profile views count to user_stats
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_profile_visitors_visited_profile_id ON public.profile_visitors(visited_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_visitors_visitor_id ON public.profile_visitors(visitor_id);