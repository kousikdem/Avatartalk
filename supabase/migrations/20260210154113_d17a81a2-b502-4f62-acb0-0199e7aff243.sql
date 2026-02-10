
-- Add INSERT policy: authenticated users can create notifications for any user
-- This is needed for the notification service to work (e.g., when user A likes user B's post, a notification is created for user B)
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add DELETE policy: users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
