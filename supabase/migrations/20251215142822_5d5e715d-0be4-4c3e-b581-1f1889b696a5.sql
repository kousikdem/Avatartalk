-- Fix products RLS to allow ALL users (including anonymous) to view published products
DROP POLICY IF EXISTS "Users can view published products" ON public.products;

CREATE POLICY "Anyone can view published products"
ON public.products
FOR SELECT
USING (status = 'published');

-- Fix events RLS to allow ALL users to view published virtual collaboration events
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;

CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
USING (status IN ('published', 'upcoming'));

-- Ensure avatar_configurations can be created by new users
DROP POLICY IF EXISTS "Users can create their own avatar configurations" ON public.avatar_configurations;

CREATE POLICY "Users can create their own avatar configurations"
ON public.avatar_configurations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure avatar_settings can be created/updated by users
DROP POLICY IF EXISTS "Users can manage their avatar settings" ON public.avatar_settings;

CREATE POLICY "Users can manage their avatar settings"
ON public.avatar_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);