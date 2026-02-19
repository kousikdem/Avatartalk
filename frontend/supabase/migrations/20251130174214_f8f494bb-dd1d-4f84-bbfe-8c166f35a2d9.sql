-- First drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Sellers can update order fulfillment" ON orders;
  DROP POLICY IF EXISTS "Sellers can view orders for their products" ON orders;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create orders RLS policies
CREATE POLICY "Sellers can update order fulfillment"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can view orders for their products"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id);