-- Add additional profile fields for AvatarTalk.bio
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_pic_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create avatar settings table
CREATE TABLE IF NOT EXISTS public.avatar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  avatar_type TEXT DEFAULT 'realistic',
  avatar_mood TEXT DEFAULT 'friendly',
  lip_sync BOOLEAN DEFAULT true,
  head_movement BOOLEAN DEFAULT true,
  voice_type TEXT DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create social links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  twitter TEXT,
  linkedin TEXT,
  facebook TEXT,
  instagram TEXT,
  youtube TEXT,
  pinterest TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_conversations INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.avatar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for avatar_settings
CREATE POLICY "Users can view their avatar settings" ON public.avatar_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their avatar settings" ON public.avatar_settings
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for social_links
CREATE POLICY "Anyone can view social links" ON public.social_links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their social links" ON public.social_links
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_stats
CREATE POLICY "Anyone can view user stats" ON public.user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their stats" ON public.user_stats
  FOR ALL USING (user_id = auth.uid());

-- Update profiles RLS to allow public viewing
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_avatar_settings_user_id ON public.avatar_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON public.social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create functions to initialize user data
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default avatar settings
  INSERT INTO public.avatar_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default social links
  INSERT INTO public.social_links (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize user data
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_data();