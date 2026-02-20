-- Update handle_new_user function to auto-generate username and create complete profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  username_counter integer := 0;
BEGIN
  -- Generate base username from name or email
  base_username := COALESCE(
    lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), '[^a-zA-Z0-9]', '', 'g')),
    'user'
  );
  
  -- Ensure username is unique
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    username_counter := username_counter + 1;
    final_username := base_username || username_counter::text;
  END LOOP;
  
  -- Create profile with auto-generated username
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    username,
    display_name
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', final_username)
  );
  
  RETURN NEW;
END;
$$;

-- Enable realtime for posts table
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Enable realtime for follows table
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;

-- Enable realtime for products table
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for likes table
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;

-- Enable realtime for comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;