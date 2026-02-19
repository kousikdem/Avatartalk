-- Create user_chat_settings table for individual user AI chat configurations
CREATE TABLE IF NOT EXISTS public.user_chat_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Daily chat limits
  free_messages_per_day integer DEFAULT 5,
  enable_daily_limit boolean DEFAULT true,
  
  -- Gift token settings
  enable_gift_popup boolean DEFAULT true,
  gift_popup_after_messages integer DEFAULT 3,
  gift_popup_message text DEFAULT 'Help support my AI assistant! Gift tokens to help me continue voice + text conversations.',
  show_gift_button boolean DEFAULT true,
  
  -- AI response controls
  ai_responses_enabled boolean DEFAULT true,
  pause_ai_until timestamp with time zone,
  
  -- One-on-one chat settings
  allow_direct_chat boolean DEFAULT true,
  direct_chat_free boolean DEFAULT false,
  
  -- Advanced settings
  max_message_length integer DEFAULT 2000,
  enable_voice_responses boolean DEFAULT true,
  enable_rich_responses boolean DEFAULT true,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create platform-wide chat settings for Super Admin
INSERT INTO public.ai_system_limits (limit_key, limit_value, description)
VALUES 
  ('default_free_messages_per_day', '{"limit": 5}', 'Default free messages per day for visitors'),
  ('gift_popup_after_messages', '{"limit": 3}', 'Show gift popup after N messages'),
  ('enable_one_on_one_chat_free', '{"enabled": false}', 'Make all one-on-one user chats free (no token cost)'),
  ('visitor_gift_minimum_tokens', '{"limit": 15000}', 'Minimum tokens sender must retain after gifting')
ON CONFLICT (limit_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.user_chat_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own chat settings"
ON public.user_chat_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat settings"
ON public.user_chat_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat settings"
ON public.user_chat_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create visitor_chat_usage table to track visitor message counts
CREATE TABLE IF NOT EXISTS public.visitor_chat_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id text,
  message_count integer DEFAULT 0,
  gift_popup_shown boolean DEFAULT false,
  gift_popup_shown_at timestamp with time zone,
  last_message_at timestamp with time zone DEFAULT now(),
  usage_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(visitor_id, profile_id, usage_date),
  UNIQUE(session_id, profile_id, usage_date)
);

-- Enable RLS
ALTER TABLE public.visitor_chat_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_chat_usage
CREATE POLICY "Users can view chat usage for their profile"
ON public.visitor_chat_usage FOR SELECT
USING (auth.uid() = profile_id OR auth.uid() = visitor_id);

CREATE POLICY "Allow insert for chat usage tracking"
ON public.visitor_chat_usage FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for chat usage tracking"
ON public.visitor_chat_usage FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_chat_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_chat_settings_timestamp
BEFORE UPDATE ON public.user_chat_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_chat_settings_updated_at();