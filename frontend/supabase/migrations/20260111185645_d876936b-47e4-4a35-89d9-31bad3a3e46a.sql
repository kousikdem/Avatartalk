-- =====================================================
-- SECURITY FIX - Part 3: Fix remaining permissive INSERT/UPDATE policies
-- =====================================================

-- Fix daily_token_usage (system-only via service role)
DROP POLICY IF EXISTS "System can manage usage" ON daily_token_usage;
-- This should be managed by edge functions with service role

-- Fix discount_usage INSERT policy
DROP POLICY IF EXISTS "System can create discount usage records" ON discount_usage;
-- This should be managed by edge functions with service role

-- Fix post_link_clicks INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create link clicks" ON post_link_clicks;
CREATE POLICY "Authenticated create link clicks" ON post_link_clicks
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix visitor_chat_usage old policies (replace with proper ones)
DROP POLICY IF EXISTS "Allow insert for chat usage tracking" ON visitor_chat_usage;
DROP POLICY IF EXISTS "Allow update for chat usage tracking" ON visitor_chat_usage;

-- The "Validated insert visitor usage" and "Validated update visitor usage" 
-- policies were already created in the previous migration

-- Restrict ai_follow_ups, ai_topics, ai_training_settings to public profiles
DROP POLICY IF EXISTS "Anyone can view AI follow-ups for chat" ON ai_follow_ups;
CREATE POLICY "Public view AI follow-ups" ON ai_follow_ups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = ai_follow_ups.user_id 
    AND p.username IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Anyone can view AI topics for chat" ON ai_topics;
CREATE POLICY "Public view AI topics" ON ai_topics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = ai_topics.user_id 
    AND p.username IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Anyone can view AI training settings for chat" ON ai_training_settings;
CREATE POLICY "Public view AI training settings" ON ai_training_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = ai_training_settings.user_id 
    AND p.username IS NOT NULL
  )
);

-- Restrict avatar_configurations to public profiles
DROP POLICY IF EXISTS "Anyone can view avatar configurations" ON avatar_configurations;
CREATE POLICY "Public view avatar configurations" ON avatar_configurations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = avatar_configurations.user_id 
    AND p.username IS NOT NULL
  )
);