
-- ============================================================
-- 1. FIX: Notification INSERT policy - prevent users from
--    creating notifications for OTHER users (abuse/spam vector)
-- ============================================================

-- Drop the existing overly-permissive INSERT policy
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "authenticated_insert_notifications" ON public.notifications;

-- Create strict policy: users can only insert notifications for THEMSELVES
-- (System/admin notifications are created via SECURITY DEFINER functions or service_role)
CREATE POLICY "Users can only insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. FIX: notification_settings - restrict read access to
--    super admins only (prevents internal config exposure)
-- ============================================================

-- Drop the overly-permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read notification settings" ON public.notification_settings;

-- Only super admins can read notification settings
CREATE POLICY "Super admins can read notification settings"
ON public.notification_settings
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));
