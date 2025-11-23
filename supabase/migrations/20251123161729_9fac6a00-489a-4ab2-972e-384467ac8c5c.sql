-- Create web_training_data table for URL scraping
CREATE TABLE IF NOT EXISTS public.web_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  scraped_content TEXT,
  scraping_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.web_training_data ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own web training data
CREATE POLICY "Users can manage their own web training data"
  ON public.web_training_data
  FOR ALL
  USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX idx_web_training_data_user_id ON public.web_training_data(user_id);
CREATE INDEX idx_web_training_data_status ON public.web_training_data(scraping_status);