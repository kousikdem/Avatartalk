-- Allow super admins to read all profiles for push notification targeting
CREATE POLICY "Super admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_super_admin(auth.uid())
);