-- Create tables for AI Training functionality

-- Q&A pairs table
CREATE TABLE public.qa_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documents table
CREATE TABLE public.training_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending',
  extracted_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voice recordings table
CREATE TABLE public.voice_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration FLOAT,
  transcription TEXT,
  voice_profile_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voice profiles table
CREATE TABLE public.voice_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  voice_settings JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API training data table
CREATE TABLE public.api_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_endpoint TEXT NOT NULL,
  api_method TEXT DEFAULT 'GET',
  api_headers JSONB DEFAULT '{}',
  response_data JSONB,
  training_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI training sessions table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  training_type TEXT NOT NULL,
  personality_settings JSONB DEFAULT '{}',
  progress FLOAT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Behavior learning data table
CREATE TABLE public.behavior_learning_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  user_input TEXT,
  ai_response TEXT,
  feedback_score INTEGER,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.qa_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_learning_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own QA pairs" ON public.qa_pairs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own training documents" ON public.training_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own voice recordings" ON public.voice_recordings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own voice profiles" ON public.voice_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API training data" ON public.api_training_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own training sessions" ON public.training_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own behavior learning data" ON public.behavior_learning_data
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_qa_pairs_user_id ON public.qa_pairs(user_id);
CREATE INDEX idx_training_documents_user_id ON public.training_documents(user_id);
CREATE INDEX idx_voice_recordings_user_id ON public.voice_recordings(user_id);
CREATE INDEX idx_voice_profiles_user_id ON public.voice_profiles(user_id);
CREATE INDEX idx_api_training_data_user_id ON public.api_training_data(user_id);
CREATE INDEX idx_training_sessions_user_id ON public.training_sessions(user_id);
CREATE INDEX idx_behavior_learning_data_user_id ON public.behavior_learning_data(user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qa_pairs_updated_at
  BEFORE UPDATE ON public.qa_pairs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_documents_updated_at
  BEFORE UPDATE ON public.training_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_recordings_updated_at
  BEFORE UPDATE ON public.voice_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_profiles_updated_at
  BEFORE UPDATE ON public.voice_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();