-- Create RPC function to increment post link clicks
CREATE OR REPLACE FUNCTION public.increment_post_link_clicks(post_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET link_clicks = COALESCE(link_clicks, 0) + 1
  WHERE id = post_id_param;
END;
$$;