-- =====================================================
-- SECURITY FIX - Part 2: Remaining overly permissive policies
-- =====================================================

-- Fix admin_audit_logs INSERT policy (should be service role only, not true)
DROP POLICY IF EXISTS "System can insert audit logs" ON admin_audit_logs;
-- Audit logs should only be inserted via service role in edge functions

-- Fix sensitive_data_access_log INSERT policy
DROP POLICY IF EXISTS "System can insert access logs" ON sensitive_data_access_log;
-- Access logs should only be inserted via service role in edge functions

-- Fix visitor_chat_usage policies (session_id is text)
DROP POLICY IF EXISTS "Anyone can insert visitor usage" ON visitor_chat_usage;
DROP POLICY IF EXISTS "Anyone can update visitor usage" ON visitor_chat_usage;

CREATE POLICY "Validated insert visitor usage" ON visitor_chat_usage
FOR INSERT
WITH CHECK (
  session_id IS NOT NULL
  AND char_length(session_id) >= 10
);

CREATE POLICY "Validated update visitor usage" ON visitor_chat_usage
FOR UPDATE
USING (session_id IS NOT NULL);

-- Fix qa_pairs policies (correct table name)
DROP POLICY IF EXISTS "Anyone can view QA pairs for chat" ON qa_pairs;
DROP POLICY IF EXISTS "Users can view QA pairs for profiles" ON qa_pairs;

CREATE POLICY "Public view QA pairs for chat" ON qa_pairs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = qa_pairs.user_id 
    AND p.username IS NOT NULL
  )
);

-- Fix web_training_data policies
DROP POLICY IF EXISTS "Anyone can view web training data for chat" ON web_training_data;

CREATE POLICY "Public view web training for profiles" ON web_training_data
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = web_training_data.user_id 
    AND p.username IS NOT NULL
  )
);

-- Fix transactions INSERT policy (should not be true)
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
-- Transaction creation should happen via edge functions with service role