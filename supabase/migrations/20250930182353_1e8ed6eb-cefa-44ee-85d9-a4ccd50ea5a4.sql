-- Security Enhancement: Restrict social network and business data visibility

-- 1. Update follows table RLS - restrict to involved users only
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;

CREATE POLICY "Users can view relevant follows"
ON public.follows
FOR SELECT
TO authenticated
USING (
  auth.uid() = follower_id OR 
  auth.uid() = following_id
);

-- 2. Restrict products visibility - only owner and authenticated users can view
DROP POLICY IF EXISTS "Users can view all products" ON public.products;

CREATE POLICY "Users can view published products"
ON public.products
FOR SELECT
TO authenticated
USING (
  status = 'published' OR 
  user_id = auth.uid()
);

-- 3. Restrict comments visibility - authenticated users only
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

CREATE POLICY "Authenticated users can view comments"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

-- 4. Restrict collaborations - only participants can view
DROP POLICY IF EXISTS "Users can view all collaborations" ON public.collaborations;

CREATE POLICY "Users can view relevant collaborations"
ON public.collaborations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  participants @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
);

-- 5. Restrict scenario templates - only owner can view personal templates
DROP POLICY IF EXISTS "Users can view all templates and manage their own" ON public.scenario_templates;

CREATE POLICY "Users can view default and own templates"
ON public.scenario_templates
FOR SELECT
TO authenticated
USING (
  is_default = true OR 
  user_id = auth.uid()
);