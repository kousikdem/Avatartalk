-- Fix RLS policies for voice_cloning table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own voice clonings" ON public.voice_cloning;
DROP POLICY IF EXISTS "Users can create their own voice clonings" ON public.voice_cloning;
DROP POLICY IF EXISTS "Users can update their own voice clonings" ON public.voice_cloning;
DROP POLICY IF EXISTS "Users can delete their own voice clonings" ON public.voice_cloning;

-- Enable RLS on voice_cloning table
ALTER TABLE public.voice_cloning ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for voice_cloning table
CREATE POLICY "Users can view their own voice clonings" 
ON public.voice_cloning 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice clonings" 
ON public.voice_cloning 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice clonings" 
ON public.voice_cloning 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice clonings" 
ON public.voice_cloning 
FOR DELETE 
USING (auth.uid() = user_id);

-- Also fix personalized_ai_training table policies if needed
DROP POLICY IF EXISTS "Users can view their own AI trainings" ON public.personalized_ai_training;
DROP POLICY IF EXISTS "Users can create their own AI trainings" ON public.personalized_ai_training;
DROP POLICY IF EXISTS "Users can update their own AI trainings" ON public.personalized_ai_training;
DROP POLICY IF EXISTS "Users can delete their own AI trainings" ON public.personalized_ai_training;

-- Enable RLS on personalized_ai_training table
ALTER TABLE public.personalized_ai_training ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for personalized_ai_training table
CREATE POLICY "Users can view their own AI trainings" 
ON public.personalized_ai_training 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI trainings" 
ON public.personalized_ai_training 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI trainings" 
ON public.personalized_ai_training 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI trainings" 
ON public.personalized_ai_training 
FOR DELETE 
USING (auth.uid() = user_id);