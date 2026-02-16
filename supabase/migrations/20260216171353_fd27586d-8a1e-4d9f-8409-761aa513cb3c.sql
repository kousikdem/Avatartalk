
-- ============================================================
-- FIX 1: Restrict notifications INSERT - prevent any user from
--        creating notifications for other users (notification spam/phishing)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "System-only notification creation"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FIX 2: Remove user write access to user_stats (prevent stat falsification)
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;

-- Only allow SELECT for own stats
CREATE POLICY "Users can view own stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- FIX 3: Remove user write access to follower_analytics (prevent manipulation)
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own follower analytics" ON public.follower_analytics;

CREATE POLICY "Users can view own follower analytics"
ON public.follower_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- FIX 4: Remove user write access to user_analytics
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own analytics" ON public.user_analytics;

CREATE POLICY "Users can view own analytics"
ON public.user_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- FIX 5: Remove user INSERT on follower_engagement (prevent artificial inflation)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own engagement" ON public.follower_engagement;
DROP POLICY IF EXISTS "Users can manage own follower engagement" ON public.follower_engagement;

CREATE POLICY "Users can view own follower engagement"
ON public.follower_engagement
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- FIX 6: Remove user INSERT/UPDATE on daily_token_usage (prevent manipulation)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own daily usage" ON public.daily_token_usage;
DROP POLICY IF EXISTS "Users can update own daily usage" ON public.daily_token_usage;

-- ============================================================
-- FIX 7: Fix search_path on update_user_chat_settings_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_user_chat_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- ============================================================
-- FIX 8: Fix search_path on update_subscription_plans_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_subscription_plans_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- ============================================================
-- FIX 9: Fix search_path on update_integration_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
