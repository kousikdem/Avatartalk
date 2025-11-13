-- Create follower analytics table for tracking growth trends
CREATE TABLE IF NOT EXISTS public.follower_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  followers_gained INTEGER DEFAULT 0,
  followers_lost INTEGER DEFAULT 0,
  net_growth INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create follower engagement table for tracking interactions
CREATE TABLE IF NOT EXISTS public.follower_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visits INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  chat_interactions INTEGER DEFAULT 0,
  post_likes INTEGER DEFAULT 0,
  post_comments INTEGER DEFAULT 0,
  product_purchases INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  engagement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, follower_id)
);

-- Create follower categories table for organizing following
CREATE TABLE IF NOT EXISTS public.follower_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, category_name)
);

-- Create follower category assignments table
CREATE TABLE IF NOT EXISTS public.follower_category_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.follower_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, following_id, category_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.follower_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_category_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for follower_analytics
CREATE POLICY "Users can manage their own follower analytics"
  ON public.follower_analytics
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS policies for follower_engagement
CREATE POLICY "Users can view their follower engagement"
  ON public.follower_engagement
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their follower engagement"
  ON public.follower_engagement
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update engagement records"
  ON public.follower_engagement
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for follower_categories
CREATE POLICY "Users can manage their own categories"
  ON public.follower_categories
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS policies for follower_category_assignments
CREATE POLICY "Users can manage their own category assignments"
  ON public.follower_category_assignments
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_follower_analytics_user_date ON public.follower_analytics(user_id, date DESC);
CREATE INDEX idx_follower_engagement_user ON public.follower_engagement(user_id, engagement_score DESC);
CREATE INDEX idx_follower_engagement_follower ON public.follower_engagement(follower_id);
CREATE INDEX idx_follower_categories_user ON public.follower_categories(user_id);
CREATE INDEX idx_category_assignments_user ON public.follower_category_assignments(user_id, following_id);

-- Create function to update engagement score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.engagement_score := (
    (NEW.profile_visits * 1.0) +
    (NEW.link_clicks * 2.0) +
    (NEW.chat_interactions * 3.0) +
    (NEW.post_likes * 1.5) +
    (NEW.post_comments * 2.5) +
    (NEW.product_purchases * 10.0)
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for engagement score calculation
CREATE TRIGGER calculate_engagement_score_trigger
  BEFORE INSERT OR UPDATE ON public.follower_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_engagement_score();

-- Create function to track daily follower changes
CREATE OR REPLACE FUNCTION public.update_follower_analytics()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  current_total INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_user_id := NEW.following_id;
    
    -- Get current total followers
    SELECT COUNT(*) INTO current_total
    FROM public.follows
    WHERE following_id = target_user_id;
    
    -- Insert or update today's analytics
    INSERT INTO public.follower_analytics (user_id, date, followers_gained, net_growth, total_followers)
    VALUES (target_user_id, CURRENT_DATE, 1, 1, current_total)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      followers_gained = follower_analytics.followers_gained + 1,
      net_growth = follower_analytics.net_growth + 1,
      total_followers = current_total;
      
  ELSIF TG_OP = 'DELETE' THEN
    target_user_id := OLD.following_id;
    
    -- Get current total followers
    SELECT COUNT(*) INTO current_total
    FROM public.follows
    WHERE following_id = target_user_id;
    
    -- Insert or update today's analytics
    INSERT INTO public.follower_analytics (user_id, date, followers_lost, net_growth, total_followers)
    VALUES (target_user_id, CURRENT_DATE, 1, -1, current_total)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      followers_lost = follower_analytics.followers_lost + 1,
      net_growth = follower_analytics.net_growth - 1,
      total_followers = current_total;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for follower analytics tracking
CREATE TRIGGER track_follower_analytics
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follower_analytics();