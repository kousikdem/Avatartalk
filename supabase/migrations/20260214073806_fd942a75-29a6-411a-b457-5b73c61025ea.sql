
-- Atomic increment for post views
CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_post_id
  RETURNING views_count INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Atomic increment for product views
CREATE OR REPLACE FUNCTION public.increment_product_views(p_product_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE products
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_product_id
  RETURNING views_count INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Atomic increment for profile views in user_stats
CREATE OR REPLACE FUNCTION public.increment_profile_views(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO user_stats (user_id, profile_views)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET profile_views = COALESCE(user_stats.profile_views, 0) + 1
  RETURNING profile_views INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$$;
