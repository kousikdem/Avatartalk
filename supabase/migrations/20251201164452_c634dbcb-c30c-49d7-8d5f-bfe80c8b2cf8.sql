ALTER TABLE discount_codes ADD COLUMN priority integer DEFAULT 0;
ALTER TABLE discount_codes ADD COLUMN target_buyer_type text DEFAULT 'all';
ALTER TABLE discount_codes ADD COLUMN target_product_type text DEFAULT 'all';
ALTER TABLE discount_codes ADD COLUMN min_quantity integer DEFAULT 1;
ALTER TABLE discount_codes ADD COLUMN free_shipping boolean DEFAULT false;
ALTER TABLE discount_codes ADD COLUMN flash_sale boolean DEFAULT false;
ALTER TABLE discount_codes ADD COLUMN recurring_schedule jsonb DEFAULT NULL;
ALTER TABLE discount_codes ADD COLUMN created_by_type text DEFAULT 'seller';
ALTER TABLE discount_codes ADD COLUMN analytics_data jsonb DEFAULT '{"redemptions": 0, "revenue_generated": 0, "revenue_lost": 0, "conversion_rate": 0}'::jsonb;
ALTER TABLE discount_codes ADD COLUMN fraud_flags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE discount_codes ADD COLUMN targeting_rules jsonb DEFAULT '{}'::jsonb;

CREATE INDEX idx_discount_codes_auto_apply ON discount_codes(auto_apply, active, seller_id) WHERE auto_apply = true AND active = true;
CREATE INDEX idx_discount_codes_priority ON discount_codes(priority DESC, created_at DESC);
CREATE INDEX idx_discount_codes_dates ON discount_codes(starts_at, expires_at) WHERE active = true;

ALTER TABLE discount_usage ADD COLUMN discount_amount numeric DEFAULT 0;
ALTER TABLE discount_usage ADD COLUMN order_amount numeric DEFAULT 0;
ALTER TABLE discount_usage ADD COLUMN buyer_type text DEFAULT 'unknown';