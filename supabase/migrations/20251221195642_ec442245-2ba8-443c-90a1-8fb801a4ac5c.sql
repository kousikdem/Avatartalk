-- Add new columns to posts table for enhanced functionality
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS is_subscriber_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS link_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS poll_options JSONB,
ADD COLUMN IF NOT EXISTS poll_votes JSONB,
ADD COLUMN IF NOT EXISTS link_thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS link_button_text TEXT,
ADD COLUMN IF NOT EXISTS link_button_url TEXT;

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_posts_subscriber_only ON public.posts(is_subscriber_only);
CREATE INDEX IF NOT EXISTS idx_posts_is_paid ON public.posts(is_paid);
CREATE INDEX IF NOT EXISTS idx_posts_subscription_plan_id ON public.posts(subscription_plan_id);

-- Create table to track post unlocks (for paid content)
CREATE TABLE IF NOT EXISTS public.post_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_amount NUMERIC,
  payment_currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_unlocks
ALTER TABLE public.post_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_unlocks
CREATE POLICY "Users can view their own unlocks" 
ON public.post_unlocks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own unlocks" 
ON public.post_unlocks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create table to track link clicks
CREATE TABLE IF NOT EXISTS public.post_link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  link_url TEXT
);

-- Enable RLS on post_link_clicks
ALTER TABLE public.post_link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_link_clicks
CREATE POLICY "Anyone can view link clicks" 
ON public.post_link_clicks 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create link clicks" 
ON public.post_link_clicks 
FOR INSERT 
WITH CHECK (true);

-- Create function to increment link clicks
CREATE OR REPLACE FUNCTION public.increment_post_link_clicks(post_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts 
  SET link_clicks = COALESCE(link_clicks, 0) + 1
  WHERE id = post_id_param;
END;
$$;