-- Add foreign key constraints to follows table for proper relationship management
-- This ensures data integrity and enables proper joins with profiles table

-- First check and add foreign key for follower_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'follows_follower_id_fkey' 
    AND table_name = 'follows'
  ) THEN
    ALTER TABLE public.follows 
      ADD CONSTRAINT follows_follower_id_fkey 
      FOREIGN KEY (follower_id) 
      REFERENCES public.profiles(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Then check and add foreign key for following_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'follows_following_id_fkey' 
    AND table_name = 'follows'
  ) THEN
    ALTER TABLE public.follows 
      ADD CONSTRAINT follows_following_id_fkey 
      FOREIGN KEY (following_id) 
      REFERENCES public.profiles(id) 
      ON DELETE CASCADE;
  END IF;
END $$;