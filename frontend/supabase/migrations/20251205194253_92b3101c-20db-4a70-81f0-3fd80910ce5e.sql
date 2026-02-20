-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT now(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix ai_chat_history INSERT policy - restrict to authenticated or validated sessions
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.ai_chat_history;

CREATE POLICY "Authenticated users can create chat messages"
ON public.ai_chat_history
FOR INSERT
TO authenticated
WITH CHECK (
  -- User is creating message as visitor to a profile
  visitor_id = auth.uid() OR
  -- User is the profile owner responding
  profile_id = auth.uid()
);

-- Allow anonymous users with valid session to create messages (for public chat)
CREATE POLICY "Anonymous users with session can create messages"
ON public.ai_chat_history
FOR INSERT
TO anon
WITH CHECK (
  -- Must have a session ID and visitor_id must be null (anonymous)
  visitor_id IS NULL AND 
  visitor_session_id IS NOT NULL AND
  char_length(visitor_session_id) >= 10 AND
  char_length(visitor_session_id) <= 100
);

-- Add validation trigger for chat messages
CREATE OR REPLACE FUNCTION public.validate_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate message length
  IF char_length(NEW.message) > 2000 THEN
    RAISE EXCEPTION 'Message exceeds maximum length of 2000 characters';
  END IF;
  
  -- Validate message is not empty
  IF char_length(trim(NEW.message)) = 0 THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_chat_message_trigger
BEFORE INSERT ON public.ai_chat_history
FOR EACH ROW
EXECUTE FUNCTION public.validate_chat_message();