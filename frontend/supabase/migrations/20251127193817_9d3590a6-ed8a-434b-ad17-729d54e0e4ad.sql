-- Create orders table for tracking purchases
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Pricing
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  shipping_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  
  -- Payment details
  payment_method TEXT NOT NULL DEFAULT 'razorpay',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  
  -- Shipping details (for physical products)
  shipping_address JSONB,
  shipping_method TEXT,
  tracking_number TEXT,
  
  -- Order status
  order_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  
  -- Fees and earnings
  platform_fee INTEGER DEFAULT 0,
  seller_earnings INTEGER DEFAULT 0,
  
  -- Metadata
  order_notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- 'percent' or 'fixed'
  discount_value NUMERIC NOT NULL,
  
  -- Scope
  scope TEXT NOT NULL DEFAULT 'store', -- 'store', 'product', 'collection'
  applicable_product_ids UUID[],
  
  -- Usage limits
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Conditions
  min_order_value INTEGER DEFAULT 0,
  combinable BOOLEAN DEFAULT false,
  auto_apply BOOLEAN DEFAULT false,
  
  -- Validity
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create discount_usage table to track per-user usage
CREATE TABLE IF NOT EXISTS public.discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(discount_code_id, order_id)
);

-- Extend products table with new fields
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS product_category TEXT,
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS base_currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS inventory_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS variants_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS shipping_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shipping_weight NUMERIC,
  ADD COLUMN IF NOT EXISTS shipping_dimensions JSONB,
  ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cod_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS digital_assets JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS download_limit INTEGER,
  ADD COLUMN IF NOT EXISTS license_type TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS tax_class TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS taxable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
  ADD COLUMN IF NOT EXISTS shopify_sync_enabled BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders as buyer"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their products"
  ON public.orders FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order fulfillment"
  ON public.orders FOR UPDATE
  USING (auth.uid() = seller_id);

-- RLS Policies for discount codes
CREATE POLICY "Anyone can view active discount codes"
  ON public.discount_codes FOR SELECT
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Sellers can manage their discount codes"
  ON public.discount_codes FOR ALL
  USING (auth.uid() = seller_id);

-- RLS Policies for discount usage
CREATE POLICY "Users can view their own discount usage"
  ON public.discount_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create discount usage records"
  ON public.discount_usage FOR INSERT
  WITH CHECK (true);

-- Create function to update order timestamps
CREATE OR REPLACE FUNCTION public.update_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_updated_at();

-- Create function to decrement inventory atomically
CREATE OR REPLACE FUNCTION public.decrement_product_inventory(
  p_product_id UUID,
  p_variant_id TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_inventory INTEGER;
  v_variants JSONB;
BEGIN
  -- Lock the row for update
  SELECT inventory_quantity, variants INTO v_current_inventory, v_variants
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;
  
  IF p_variant_id IS NOT NULL AND v_variants IS NOT NULL THEN
    -- Handle variant inventory
    UPDATE public.products
    SET variants = (
      SELECT jsonb_agg(
        CASE 
          WHEN v->>'id' = p_variant_id THEN
            jsonb_set(v, '{inventory}', to_jsonb((v->>'inventory')::int - p_quantity))
          ELSE v
        END
      )
      FROM jsonb_array_elements(variants) v
    )
    WHERE id = p_product_id
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(variants) v
      WHERE v->>'id' = p_variant_id 
      AND (v->>'inventory')::int >= p_quantity
    );
    
    RETURN FOUND;
  ELSE
    -- Handle product-level inventory
    IF v_current_inventory >= p_quantity THEN
      UPDATE public.products
      SET inventory_quantity = inventory_quantity - p_quantity
      WHERE id = p_product_id;
      RETURN TRUE;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;