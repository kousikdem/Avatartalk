-- AI Training Settings table for Welcome Messages, Topics, and Global Describe
CREATE TABLE IF NOT EXISTS public.ai_training_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Welcome Message Settings
  welcome_message_enabled BOOLEAN DEFAULT true,
  welcome_message_text TEXT DEFAULT 'Hi! How can I help you today?',
  welcome_message_trigger TEXT DEFAULT 'first_open', -- 'first_open', 'first_interaction'
  welcome_message_language TEXT DEFAULT 'en',
  
  -- Personalization Variables
  custom_variables JSONB DEFAULT '[]'::jsonb, -- [{name: "company_name", value: "MyCompany"}, ...]
  
  -- Global Describe (catch-all guidance)
  global_describe_text TEXT,
  global_describe_priority BOOLEAN DEFAULT false,
  
  -- Engagement Settings
  engagement_score_weight JSONB DEFAULT '{"chat_count": 5, "visit_count": 1, "response_time": 2, "follow_up_completion": 3}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_ai_settings UNIQUE (user_id)
);

-- AI Topics table for per-topic configurations
CREATE TABLE IF NOT EXISTS public.ai_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Topic Identification
  topic_name TEXT NOT NULL,
  topic_priority INTEGER DEFAULT 10, -- Higher = more priority
  authority TEXT DEFAULT 'adaptive', -- 'authoritative', 'adaptive', 'conversational'
  
  -- Describe Text for this topic
  describe_text TEXT,
  describe_priority BOOLEAN DEFAULT false, -- When ON, overrides global persona for this topic
  
  -- Do/Avoid rules
  do_rules JSONB DEFAULT '[]'::jsonb, -- ["Mention speed to deploy", ...]
  avoid_rules JSONB DEFAULT '[]'::jsonb, -- ["Never promise free custom design", ...]
  
  -- Sample prompts for this topic
  sample_prompts JSONB DEFAULT '[]'::jsonb,
  
  -- Keywords for topic matching
  keywords JSONB DEFAULT '[]'::jsonb, -- ["template", "portfolio", "design", ...]
  
  -- Version history (last 5 edits)
  describe_history JSONB DEFAULT '[]'::jsonb, -- [{text: "...", timestamp: "...", version: 1}, ...]
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Follow-up Questions table
CREATE TABLE IF NOT EXISTS public.ai_follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.ai_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Question Configuration
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'choice', -- 'choice', 'open', 'boolean', 'rating'
  choices JSONB DEFAULT '[]'::jsonb, -- ["Yes - show me", "Not now", ...]
  
  -- Presentation
  presentation TEXT DEFAULT 'inline', -- 'inline', 'modal', 'suggestion'
  
  -- Conditions
  conditions JSONB DEFAULT '{}'::jsonb, -- {visit_count_lt: 3, subscription_tier_not: "pro", ...}
  
  -- Probability & Limits
  probability_pct INTEGER DEFAULT 100,
  max_per_session INTEGER DEFAULT 3,
  cooldown_seconds INTEGER DEFAULT 300,
  always_ask BOOLEAN DEFAULT false,
  
  -- Analytics
  analytics_id TEXT,
  analytics_description TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Chat Memory table (enhanced visitor tracking)
CREATE TABLE IF NOT EXISTS public.ai_chat_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL, -- Can be user_id or session_id for anonymous
  
  -- Visitor Info
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Session Tracking
  session_count INTEGER DEFAULT 1,
  total_messages INTEGER DEFAULT 0,
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Engagement Tracking
  engagement_score INTEGER DEFAULT 0, -- 1-100
  follow_ups_shown INTEGER DEFAULT 0,
  follow_ups_completed INTEGER DEFAULT 0,
  
  -- Chat Context
  last_topics JSONB DEFAULT '[]'::jsonb, -- Last 5 topics discussed
  preferences JSONB DEFAULT '{}'::jsonb, -- Learned preferences
  
  -- Welcome message tracking
  welcome_shown BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_profile_visitor UNIQUE (profile_id, visitor_id)
);

-- Enable RLS
ALTER TABLE public.ai_training_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_training_settings
CREATE POLICY "Users can view their own AI training settings" 
ON public.ai_training_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI training settings" 
ON public.ai_training_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI training settings" 
ON public.ai_training_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI training settings" 
ON public.ai_training_settings FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for ai_topics
CREATE POLICY "Users can view their own AI topics" 
ON public.ai_topics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI topics" 
ON public.ai_topics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI topics" 
ON public.ai_topics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI topics" 
ON public.ai_topics FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for ai_follow_ups
CREATE POLICY "Users can view their own AI follow-ups" 
ON public.ai_follow_ups FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI follow-ups" 
ON public.ai_follow_ups FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI follow-ups" 
ON public.ai_follow_ups FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI follow-ups" 
ON public.ai_follow_ups FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for ai_chat_memory
CREATE POLICY "Profile owners can view chat memory for their profile" 
ON public.ai_chat_memory FOR SELECT 
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())
  OR visitor_id = auth.uid()::text
);

CREATE POLICY "Anyone can insert chat memory" 
ON public.ai_chat_memory FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Profile owners can update chat memory" 
ON public.ai_chat_memory FOR UPDATE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Profile owners can delete chat memory" 
ON public.ai_chat_memory FOR DELETE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Visitors can view AI settings publicly (for chat widget)
CREATE POLICY "Anyone can view AI training settings for chat" 
ON public.ai_training_settings FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view AI topics for chat" 
ON public.ai_topics FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view AI follow-ups for chat" 
ON public.ai_follow_ups FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_training_settings_updated_at
BEFORE UPDATE ON public.ai_training_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_topics_updated_at
BEFORE UPDATE ON public.ai_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_follow_ups_updated_at
BEFORE UPDATE ON public.ai_follow_ups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chat_memory_updated_at
BEFORE UPDATE ON public.ai_chat_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_topics_user_id ON public.ai_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_topics_active ON public.ai_topics(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_topic_id ON public.ai_follow_ups(topic_id);
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_user_id ON public.ai_follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_memory_profile_visitor ON public.ai_chat_memory(profile_id, visitor_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_memory_engagement ON public.ai_chat_memory(profile_id, engagement_score DESC);