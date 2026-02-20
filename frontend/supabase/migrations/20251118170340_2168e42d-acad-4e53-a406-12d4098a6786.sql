-- Add visit_count to profile_visitors table for tracking multiple visits
ALTER TABLE public.profile_visitors
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;

-- Create an index for better performance on visited_profile_id queries
CREATE INDEX IF NOT EXISTS idx_profile_visitors_visited_profile_id 
ON public.profile_visitors(visited_profile_id);

-- Create an index for visitor_id lookups
CREATE INDEX IF NOT EXISTS idx_profile_visitors_visitor_id 
ON public.profile_visitors(visitor_id);

-- Add a function to update visit count when visitor returns
CREATE OR REPLACE FUNCTION public.update_visit_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if visitor has visited before today
  IF EXISTS (
    SELECT 1 FROM public.profile_visitors 
    WHERE visitor_id = NEW.visitor_id 
    AND visited_profile_id = NEW.visited_profile_id
    AND id != NEW.id
  ) THEN
    -- Update the existing record's visit count and timestamp
    UPDATE public.profile_visitors
    SET visit_count = visit_count + 1,
        visited_at = NEW.visited_at
    WHERE visitor_id = NEW.visitor_id 
    AND visited_profile_id = NEW.visited_profile_id
    AND id = (
      SELECT id FROM public.profile_visitors
      WHERE visitor_id = NEW.visitor_id 
      AND visited_profile_id = NEW.visited_profile_id
      ORDER BY visited_at DESC
      LIMIT 1
    );
    
    -- Delete the new record since we updated the existing one
    RETURN NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically update visit count
DROP TRIGGER IF EXISTS update_visitor_count_trigger ON public.profile_visitors;
CREATE TRIGGER update_visitor_count_trigger
BEFORE INSERT ON public.profile_visitors
FOR EACH ROW
EXECUTE FUNCTION public.update_visit_count();