-- Create product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_photos JSONB DEFAULT '[]'::jsonb,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can view product reviews"
  ON public.product_reviews
  FOR SELECT
  USING (true);

-- Only buyers can create reviews for products they purchased
CREATE POLICY "Buyers can create reviews for purchased products"
  ON public.product_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id
      AND orders.buyer_id = auth.uid()
      AND orders.product_id = product_reviews.product_id
      AND orders.payment_status = 'completed'
    )
  );

-- Buyers can update their own reviews
CREATE POLICY "Buyers can update their own reviews"
  ON public.product_reviews
  FOR UPDATE
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can delete their own reviews
CREATE POLICY "Buyers can delete their own reviews"
  ON public.product_reviews
  FOR DELETE
  USING (auth.uid() = buyer_id);

-- Create index for faster queries
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_buyer_id ON public.product_reviews(buyer_id);
CREATE INDEX idx_product_reviews_rating ON public.product_reviews(rating);

-- Trigger to update updated_at
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate average rating for products
CREATE OR REPLACE FUNCTION public.get_product_rating(p_product_id UUID)
RETURNS TABLE(
  average_rating NUMERIC,
  total_reviews BIGINT,
  rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::numeric, 2) as average_rating,
    COUNT(*)::bigint as total_reviews,
    jsonb_object_agg(
      rating::text,
      count
    ) as rating_distribution
  FROM (
    SELECT rating, COUNT(*) as count
    FROM public.product_reviews
    WHERE product_id = p_product_id
    GROUP BY rating
  ) ratings;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Add review count and average rating to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Trigger to update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM public.product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_product_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_rating();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;