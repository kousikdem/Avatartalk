
-- Ensure profiles table exists with all necessary columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  profile_pic_url TEXT,
  avatar_url TEXT,
  gender TEXT,
  age INTEGER DEFAULT 18,
  profession TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own complete profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (username IS NOT NULL);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Ensure avatar_settings table exists
CREATE TABLE IF NOT EXISTS public.avatar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_type TEXT DEFAULT 'realistic',
  avatar_mood TEXT DEFAULT 'friendly',
  voice_type TEXT DEFAULT 'neutral',
  lip_sync BOOLEAN DEFAULT true,
  head_movement BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on avatar_settings table
ALTER TABLE public.avatar_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for avatar_settings
DROP POLICY IF EXISTS "Users can view their avatar settings" ON public.avatar_settings;
DROP POLICY IF EXISTS "Users can update their avatar settings" ON public.avatar_settings;

CREATE POLICY "Users can view their avatar settings" 
  ON public.avatar_settings 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their avatar settings" 
  ON public.avatar_settings 
  FOR ALL 
  USING (user_id = auth.uid());

-- Ensure social_links table exists
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  linkedin TEXT,
  youtube TEXT,
  pinterest TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on social_links table
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Create policies for social_links
DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links;
DROP POLICY IF EXISTS "Users can manage their social links" ON public.social_links;

CREATE POLICY "Anyone can view social links" 
  ON public.social_links 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their social links" 
  ON public.social_links 
  FOR ALL 
  USING (user_id = auth.uid());

-- Ensure user_stats table exists
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_conversations INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_stats table
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for user_stats
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can manage their stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;

CREATE POLICY "Users can view their own stats" 
  ON public.user_stats 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their stats" 
  ON public.user_stats 
  FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stats" 
  ON public.user_stats 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stats" 
  ON public.user_stats 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create or replace the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the function to initialize user data
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

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_created ON public.profiles;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_data();

-- Add username trimming function and trigger
CREATE OR REPLACE FUNCTION public.trim_username()
RETURNS TRIGGER AS $$
BEGIN
  NEW.username = trim(NEW.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_username_trigger ON public.profiles;
CREATE TRIGGER trim_username_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trim_username();
