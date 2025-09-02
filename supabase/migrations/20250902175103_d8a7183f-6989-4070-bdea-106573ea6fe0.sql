-- Create comprehensive avatar configurations table
CREATE TABLE public.avatar_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_name TEXT NOT NULL DEFAULT 'My Avatar',
  
  -- Basic Info
  gender TEXT NOT NULL DEFAULT 'male',
  age_category TEXT NOT NULL DEFAULT 'adult',
  
  -- Body Configuration
  height NUMERIC NOT NULL DEFAULT 170,
  weight NUMERIC NOT NULL DEFAULT 70,
  muscle_definition NUMERIC NOT NULL DEFAULT 50,
  body_fat NUMERIC NOT NULL DEFAULT 20,
  
  -- Head & Face
  head_size NUMERIC NOT NULL DEFAULT 50,
  head_shape TEXT NOT NULL DEFAULT 'oval',
  face_width NUMERIC NOT NULL DEFAULT 50,
  jawline NUMERIC NOT NULL DEFAULT 50,
  cheekbones NUMERIC NOT NULL DEFAULT 50,
  
  -- Eyes
  eye_shape TEXT NOT NULL DEFAULT 'almond',
  eye_size NUMERIC NOT NULL DEFAULT 50,
  eye_distance NUMERIC NOT NULL DEFAULT 50,
  eye_color TEXT NOT NULL DEFAULT '#8B4513',
  
  -- Nose
  nose_size NUMERIC NOT NULL DEFAULT 50,
  nose_width NUMERIC NOT NULL DEFAULT 50,
  nose_shape TEXT NOT NULL DEFAULT 'straight',
  
  -- Mouth & Lips
  mouth_width NUMERIC NOT NULL DEFAULT 50,
  lip_thickness NUMERIC NOT NULL DEFAULT 50,
  lip_shape TEXT NOT NULL DEFAULT 'normal',
  
  -- Ears
  ear_size NUMERIC NOT NULL DEFAULT 50,
  ear_position NUMERIC NOT NULL DEFAULT 50,
  ear_shape TEXT NOT NULL DEFAULT 'normal',
  
  -- Hair
  hair_style TEXT NOT NULL DEFAULT 'medium',
  hair_color TEXT NOT NULL DEFAULT '#8B4513',
  hair_length NUMERIC NOT NULL DEFAULT 50,
  
  -- Skin
  skin_tone TEXT NOT NULL DEFAULT '#F1C27D',
  skin_texture TEXT NOT NULL DEFAULT 'smooth',
  
  -- Pose & Expression
  current_pose TEXT NOT NULL DEFAULT 'standing',
  current_expression TEXT NOT NULL DEFAULT 'neutral',
  
  -- Clothing & Accessories
  clothing_top TEXT,
  clothing_bottom TEXT,
  shoes TEXT,
  accessories JSONB DEFAULT '[]'::jsonb,
  
  -- 3D Model Data
  model_url TEXT,
  thumbnail_url TEXT,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.avatar_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for avatar configurations
CREATE POLICY "Users can view their own avatar configurations" 
ON public.avatar_configurations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own avatar configurations" 
ON public.avatar_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatar configurations" 
ON public.avatar_configurations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avatar configurations" 
ON public.avatar_configurations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_avatar_configurations_updated_at
BEFORE UPDATE ON public.avatar_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_avatar_configurations_user_id ON public.avatar_configurations(user_id);
CREATE INDEX idx_avatar_configurations_active ON public.avatar_configurations(user_id, is_active) WHERE is_active = true;