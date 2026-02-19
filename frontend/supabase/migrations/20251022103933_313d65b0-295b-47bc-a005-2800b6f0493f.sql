-- Add avatar_id to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_id'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN avatar_id UUID REFERENCES public.avatar_configurations(id) ON DELETE SET NULL;
    
    -- Add index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_avatar_id ON public.profiles(avatar_id);
  END IF;
END $$;