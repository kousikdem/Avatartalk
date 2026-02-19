-- Create AI chat history table to persist conversations
CREATE TABLE public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  visitor_session_id TEXT,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'avatar')),
  rich_data JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_ai_chat_history_profile_visitor ON public.ai_chat_history(profile_id, visitor_id);
CREATE INDEX idx_ai_chat_history_session ON public.ai_chat_history(profile_id, visitor_session_id);
CREATE INDEX idx_ai_chat_history_created ON public.ai_chat_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Users can view chat history for their own profile (as owner)
CREATE POLICY "Profile owners can view their chat history"
ON public.ai_chat_history
FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Users can view their own conversations as visitor
CREATE POLICY "Visitors can view their own chat history"
ON public.ai_chat_history
FOR SELECT
USING (visitor_id = auth.uid());

-- Anyone can insert chat messages
CREATE POLICY "Anyone can create chat messages"
ON public.ai_chat_history
FOR INSERT
WITH CHECK (true);

-- Add is_new_user and first_visit_at to user_stats for engagement tracking
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS is_new_user BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS total_products_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0;

-- Create function to calculate engagement score
CREATE OR REPLACE FUNCTION public.calculate_user_engagement_score(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC := 0;
  v_followers INTEGER;
  v_chats INTEGER;
  v_products_sold INTEGER;
  v_profile_views INTEGER;
  v_days_since_join INTEGER;
BEGIN
  SELECT 
    COALESCE(followers_count, 0),
    COALESCE(total_chats_sent, 0) + COALESCE(total_chats_received, 0),
    COALESCE(total_products_sold, 0),
    COALESCE(profile_views, 0),
    EXTRACT(DAY FROM (now() - COALESCE(first_visit_at, created_at)))::INTEGER
  INTO v_followers, v_chats, v_products_sold, v_profile_views, v_days_since_join
  FROM public.user_stats
  WHERE user_id = p_user_id;

  -- Calculate engagement score (weighted formula)
  v_score := (v_followers * 10) + (v_chats * 5) + (v_products_sold * 20) + (v_profile_views * 1);
  
  -- Boost for new users (joined within 7 days)
  IF v_days_since_join <= 7 THEN
    v_score := v_score * 1.2;
  END IF;
  
  RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update engagement score automatically
CREATE OR REPLACE FUNCTION public.update_engagement_score_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.engagement_score := public.calculate_user_engagement_score(NEW.user_id);
  NEW.updated_at := now();
  
  -- Mark as not new after 7 days
  IF NEW.first_visit_at IS NOT NULL AND 
     EXTRACT(DAY FROM (now() - NEW.first_visit_at)) > 7 THEN
    NEW.is_new_user := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_engagement_score ON public.user_stats;
CREATE TRIGGER trigger_update_engagement_score
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_engagement_score_trigger();

-- Enable realtime for ai_chat_history
ALTER TABLE public.ai_chat_history REPLICA IDENTITY FULL;