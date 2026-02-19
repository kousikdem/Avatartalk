-- Allow all authenticated users to read notification_settings (needed for client-side checks)
CREATE POLICY "Authenticated users can read notification settings"
ON public.notification_settings
FOR SELECT
TO authenticated
USING (true);