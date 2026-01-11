-- =====================================================
-- SECURITY FIX - Part 4: Additional RLS hardening
-- =====================================================

-- Verify host_integrations is properly protected
DROP POLICY IF EXISTS "Users can manage their own host integrations" ON host_integrations;
CREATE POLICY "Users manage own host integrations" ON host_integrations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify integration_auth is properly protected
DROP POLICY IF EXISTS "Users can manage their own integration auth" ON integration_auth;
CREATE POLICY "Users manage own integration auth" ON integration_auth
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM integrations i
    WHERE i.id = integration_auth.integration_id
    AND i.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM integrations i
    WHERE i.id = integration_auth.integration_id
    AND i.user_id = auth.uid()
  )
);

-- Ensure orders table has proper buyer/seller restrictions
DROP POLICY IF EXISTS "Users can view orders as buyer" ON orders;
DROP POLICY IF EXISTS "Users can view orders as seller" ON orders;
DROP POLICY IF EXISTS "Buyers can view their orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view their orders" ON orders;

CREATE POLICY "Buyers view their orders" ON orders
FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers view their orders" ON orders
FOR SELECT
USING (auth.uid() = seller_id);

-- Ensure virtual_bookings has proper access control
DROP POLICY IF EXISTS "Users can view their bookings as buyer" ON virtual_bookings;
DROP POLICY IF EXISTS "Users can view bookings as seller" ON virtual_bookings;

CREATE POLICY "Buyers view their virtual bookings" ON virtual_bookings
FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers view their virtual bookings" ON virtual_bookings
FOR SELECT
USING (auth.uid() = seller_id);

-- Restrict ai_chat_memory to profile owners and their own visitor record
DROP POLICY IF EXISTS "Profile owners view chat memory anonymized" ON ai_chat_memory;
DROP POLICY IF EXISTS "Profile owners can update chat memory" ON ai_chat_memory;
DROP POLICY IF EXISTS "Profile owners can delete chat memory" ON ai_chat_memory;

CREATE POLICY "Profile owners view own chat memory" ON ai_chat_memory
FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Visitors view own memory record" ON ai_chat_memory
FOR SELECT
USING (visitor_id = (auth.uid())::text);

CREATE POLICY "Profile owners update chat memory" ON ai_chat_memory
FOR UPDATE
USING (profile_id = auth.uid());

CREATE POLICY "Profile owners delete chat memory" ON ai_chat_memory
FOR DELETE
USING (profile_id = auth.uid());

-- Ensure custom_token_purchases has proper protection
DROP POLICY IF EXISTS "Users can view their own token purchases" ON custom_token_purchases;
CREATE POLICY "Users view own custom token purchases" ON custom_token_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Add proper INSERT policy
CREATE POLICY "Users create own custom token purchases" ON custom_token_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure discount_usage has proper seller restriction
DROP POLICY IF EXISTS "Users can view their own discount usage" ON discount_usage;
CREATE POLICY "Users view own discount usage" ON discount_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Ensure follower_engagement is restricted to profile owner
DROP POLICY IF EXISTS "Profile owners can view their follower engagement" ON follower_engagement;
DROP POLICY IF EXISTS "Users can view their engagement data" ON follower_engagement;
CREATE POLICY "Profile owners view follower engagement" ON follower_engagement
FOR SELECT
USING (auth.uid() = user_id);