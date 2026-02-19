-- Add parent_comment_id to support nested comments (replies)
ALTER TABLE comments 
ADD COLUMN parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE;

-- Create index for better query performance on nested comments
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);

-- Update the trigger to handle reply counts (optional enhancement)
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL AND NEW.parent_comment_id IS NULL THEN
    -- Only increment for top-level comments, not replies
    UPDATE posts 
    SET comments_count = COALESCE(comments_count, 0) + 1,
        updated_at = now()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL AND OLD.parent_comment_id IS NULL THEN
    -- Only decrement for top-level comments, not replies
    UPDATE posts 
    SET comments_count = GREATEST(COALESCE(comments_count, 1) - 1, 0),
        updated_at = now()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;