-- Create function to update post comment counts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
    -- Increment comment count for the post
    UPDATE posts 
    SET comments_count = COALESCE(comments_count, 0) + 1,
        updated_at = now()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
    -- Decrement comment count for the post
    UPDATE posts 
    SET comments_count = GREATEST(COALESCE(comments_count, 1) - 1, 0),
        updated_at = now()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for comment count updates on INSERT
DROP TRIGGER IF EXISTS update_post_comment_count_insert ON comments;
CREATE TRIGGER update_post_comment_count_insert
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.comment_type = 'post' AND NEW.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_comment_count();

-- Create trigger for comment count updates on DELETE
DROP TRIGGER IF EXISTS update_post_comment_count_delete ON comments;
CREATE TRIGGER update_post_comment_count_delete
  AFTER DELETE ON comments
  FOR EACH ROW
  WHEN (OLD.comment_type = 'post' AND OLD.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_comment_count();