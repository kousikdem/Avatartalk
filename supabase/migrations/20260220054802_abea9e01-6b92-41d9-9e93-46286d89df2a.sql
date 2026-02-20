
-- ============================================================
-- SECURITY FIX 1: Restrict profiles table
-- Remove "Public can view profiles with username" policy that
-- exposes ALL columns (email, age, gender, phone_number, etc.)
-- ============================================================

DROP POLICY IF EXISTS "Public can view profiles with username" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own complete profile" ON public.profiles;

-- Owner sees their full profile
CREATE POLICY "Users view own complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Super admins see all profiles (needed for broadcast notifications)
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Public/anonymous access ONLY via the safe public_profiles VIEW (no policy on raw table for anon)

-- ============================================================
-- SECURITY FIX 2: token_gifts UPDATE - must use SECURITY DEFINER only
-- ============================================================

DROP POLICY IF EXISTS "System can update gift status" ON public.token_gifts;
DROP POLICY IF EXISTS "Users can update pending gifts" ON public.token_gifts;
-- Updates go through process_token_gift() SECURITY DEFINER function only.
-- No direct UPDATE policy for regular users.

-- ============================================================
-- SECURITY FIX 3: discount_usage - restrict INSERT
-- ============================================================

DROP POLICY IF EXISTS "System can create discount usage records" ON public.discount_usage;
CREATE POLICY "Buyers insert own discount usage"
ON public.discount_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SECURITY FIX 4: transactions - restrict INSERT
-- transactions table uses profile_id and subscriber_id (no generic user_id)
-- ============================================================

DROP POLICY IF EXISTS "System can create transactions" ON public.transactions;
CREATE POLICY "Subscribers insert own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = subscriber_id);

-- ============================================================
-- SECURITY FIX 5: admin_audit_logs - restrict INSERT
-- ============================================================

DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_logs;
-- Only super admins or admins can insert; all other inserts must go via
-- the log_admin_action() SECURITY DEFINER RPC which is called server-side
CREATE POLICY "Admins insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- SECURITY FIX 6: sensitive_data_access_log - restrict INSERT
-- (table uses user_id column confirmed from schema)
-- ============================================================

DROP POLICY IF EXISTS "System can insert access logs" ON public.sensitive_data_access_log;
CREATE POLICY "Users insert own access logs"
ON public.sensitive_data_access_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
