
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  product_type TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  is_free BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  thumbnail_url TEXT,
  media_url TEXT,
  media_type TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table  
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'event',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  thumbnail_url TEXT,
  attendees JSONB DEFAULT '[]',
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collaborations table
CREATE TABLE public.collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  collaboration_type TEXT DEFAULT 'project',
  participants JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  thumbnail_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all products" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own products" 
  ON public.products 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all events" 
  ON public.events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own events" 
  ON public.events 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for collaborations
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all collaborations" 
  ON public.collaborations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own collaborations" 
  ON public.collaborations 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);

-- Add RLS policies for thumbnails bucket
CREATE POLICY "Anyone can view thumbnails" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload thumbnails" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their thumbnails" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their thumbnails" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
