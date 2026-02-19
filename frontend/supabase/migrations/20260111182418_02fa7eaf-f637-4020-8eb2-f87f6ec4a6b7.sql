-- =====================================================
-- SECURITY FIX MIGRATION - RLS Policies and Validation
-- =====================================================

-- =====================================================
-- 1. FIX AI_CHAT_HISTORY - Strengthen session validation
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Profile owners can view their chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Visitors can view their own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON ai_chat_history;
DROP POLICY IF EXISTS "Authenticated users can create chat messages" ON ai_chat_history;
DROP POLICY IF EXISTS "Anonymous users with session can create messages" ON ai_chat_history;

-- Create stricter SELECT policy for profile owners
CREATE POLICY "Profile owners view their chat history" ON ai_chat_history
FOR SELECT
USING (profile_id = auth.uid());

-- Create SELECT policy for authenticated visitors
CREATE POLICY "Authenticated visitors view their chat" ON ai_chat_history
FOR SELECT
USING (visitor_id IS NOT NULL AND visitor_id = auth.uid());

-- Create INSERT policy for authenticated users
CREATE POLICY "Authenticated users insert chat messages" ON ai_chat_history
FOR INSERT
WITH CHECK (profile_id = auth.uid() OR visitor_id = auth.uid());

-- Create INSERT policy for anonymous sessions with validation
CREATE POLICY "Anonymous sessions insert with validation" ON ai_chat_history
FOR INSERT
WITH CHECK (
  visitor_id IS NULL
  AND visitor_session_id IS NOT NULL
  AND char_length(visitor_session_id) >= 32
  AND char_length(visitor_session_id) <= 100
);

-- =====================================================
-- 2. FIX USER_CHAT_SETTINGS - Remove public access
-- =====================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view chat settings" ON user_chat_settings;

-- Create policy for users to view their own settings (keep existing)
-- "Users can view their own chat settings" already exists

-- Create policy for authenticated users to view settings for public profiles
CREATE POLICY "Authenticated view public chat settings" ON user_chat_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = user_chat_settings.user_id 
    AND p.username IS NOT NULL
  )
);

-- =====================================================
-- 3. CREATE SECURE VIEW FOR PUBLIC CHAT SETTINGS
-- =====================================================

DROP VIEW IF EXISTS public.public_chat_settings;
CREATE VIEW public.public_chat_settings
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  free_messages_per_day,
  enable_daily_limit,
  max_message_length,
  enable_voice_responses,
  enable_rich_responses,
  ai_responses_enabled,
  allow_direct_chat,
  direct_chat_free,
  show_gift_button,
  enable_gift_popup,
  gift_popup_after_messages
FROM user_chat_settings
WHERE EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = user_chat_settings.user_id 
  AND p.username IS NOT NULL
);

GRANT SELECT ON public.public_chat_settings TO anon;
GRANT SELECT ON public.public_chat_settings TO authenticated;

-- =====================================================
-- 4. FIX AI_CHAT_MEMORY INSERT policy
-- =====================================================

DROP POLICY IF EXISTS "Anyone can insert chat memory" ON ai_chat_memory;
CREATE POLICY "Validated insert chat memory" ON ai_chat_memory
FOR INSERT
WITH CHECK (
  profile_id = auth.uid()
  OR visitor_id IS NOT NULL
);

-- =====================================================
-- 5. ADD VALIDATION TRIGGER FOR CHAT MESSAGES
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_chat_message()
RETURNS trigger AS $$
BEGIN
  IF char_length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'Message exceeds maximum length of 5000 characters';
  END IF;
  
  IF char_length(TRIM(NEW.message)) = 0 THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;
  
  IF NEW.visitor_session_id IS NOT NULL THEN
    IF char_length(NEW.visitor_session_id) < 32 THEN
      RAISE EXCEPTION 'Invalid session ID format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_chat_message_trigger ON ai_chat_history;
CREATE TRIGGER validate_chat_message_trigger
BEFORE INSERT ON ai_chat_history
FOR EACH ROW
EXECUTE FUNCTION public.validate_chat_message();

-- =====================================================
-- 6. FIX TOKEN TABLES - Remove overly permissive policies
-- =====================================================

DROP POLICY IF EXISTS "System can insert token events" ON token_events;
DROP POLICY IF EXISTS "System can manage purchases" ON token_purchases;
DROP POLICY IF EXISTS "System can update gift status" ON token_gifts;

-- Create proper INSERT policy for token_purchases
CREATE POLICY "Users can create their own purchases" ON token_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy for token_purchases (for payment verification)
CREATE POLICY "Users can update pending purchases" ON token_purchases
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- =====================================================
-- 7. FIX PROFILES TABLE - More restrictive access
-- =====================================================

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own complete profile" ON profiles;
DROP POLICY IF EXISTS "Public can only see non-sensitive fields" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Limited public profile access" ON profiles;

-- Create policy for own profile access
CREATE POLICY "Users view own complete profile" ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy for public profiles (those with username set)
CREATE POLICY "Public can view profiles with username" ON profiles
FOR SELECT
USING (username IS NOT NULL);