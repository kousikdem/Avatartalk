-- =============================================
-- VIRTUAL COLLABORATION SYSTEM MIGRATION
-- =============================================

-- 1. Create virtual_products table for virtual collaboration products
CREATE TABLE public.virtual_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  product_type TEXT NOT NULL DEFAULT 'one_to_one', -- one_to_one, one_to_many, brand_collaboration, recurring_series, on_demand
  visibility TEXT NOT NULL DEFAULT 'public', -- public, private, invite_only
  thumbnail_url TEXT,
  
  -- Pricing
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  price_model TEXT NOT NULL DEFAULT 'per_session', -- per_session, multi_session_pass, free, pay_what_you_want
  tax_rate NUMERIC DEFAULT 18,
  tax_inclusive BOOLEAN DEFAULT false,
  refund_policy TEXT,
  
  -- Scheduling
  scheduling_mode TEXT NOT NULL DEFAULT 'scheduled_slots', -- instant_on_demand, scheduled_slots, recurring_schedule
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  duration_mins INTEGER NOT NULL DEFAULT 60,
  capacity INTEGER NOT NULL DEFAULT 1,
  buffer_time_mins INTEGER DEFAULT 15,
  min_booking_notice_hours INTEGER DEFAULT 24,
  max_bookings_per_user INTEGER DEFAULT 10,
  waitlist_enabled BOOLEAN DEFAULT false,
  waitlist_limit INTEGER DEFAULT 50,
  
  -- Meeting Platform
  meeting_provider TEXT NOT NULL DEFAULT 'google_meet', -- google_meet, zoom, manual
  auto_generate_meeting_link BOOLEAN DEFAULT true,
  recording_allowed BOOLEAN DEFAULT false,
  join_link_visibility TEXT DEFAULT 'after_payment', -- after_payment, after_confirmation, after_reminder
  
  -- Booking Form Settings
  booking_form_fields JSONB DEFAULT '[]'::jsonb,
  require_terms_consent BOOLEAN DEFAULT true,
  require_recording_consent BOOLEAN DEFAULT false,
  require_marketing_consent BOOLEAN DEFAULT false,
  
  -- Notifications
  send_calendar_invite BOOLEAN DEFAULT true,
  reminder_24h BOOLEAN DEFAULT true,
  reminder_1h BOOLEAN DEFAULT true,
  notify_host_on_booking BOOLEAN DEFAULT true,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, archived
  
  -- Promo code support
  promo_codes_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create virtual_product_slots table for available time slots
CREATE TABLE public.virtual_product_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  virtual_product_id UUID NOT NULL REFERENCES public.virtual_products(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  booked_count INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create virtual_bookings table for bookings
CREATE TABLE public.virtual_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  virtual_product_id UUID NOT NULL REFERENCES public.virtual_products(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES public.virtual_product_slots(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Booking Details
  booking_status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
  booking_form_data JSONB DEFAULT '{}'::jsonb,
  
  -- Meeting Details
  meeting_provider TEXT,
  meeting_id TEXT,
  join_url TEXT,
  password TEXT,
  calendar_event_id TEXT,
  
  -- Payment Details
  amount INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, refunded, failed
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  promo_code_id UUID,
  
  -- Platform Fee
  platform_fee INTEGER DEFAULT 0,
  seller_earnings INTEGER DEFAULT 0,
  
  -- Timestamps
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create host_integrations table for OAuth tokens
CREATE TABLE public.host_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Google Integration
  google_connected BOOLEAN DEFAULT false,
  google_email TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMP WITH TIME ZONE,
  google_scopes TEXT[],
  
  -- Zoom Integration
  zoom_connected BOOLEAN DEFAULT false,
  zoom_user_id TEXT,
  zoom_email TEXT,
  zoom_access_token TEXT,
  zoom_refresh_token TEXT,
  zoom_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Google Calendar Sync
  calendar_sync_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 5. Enable RLS on all tables
ALTER TABLE public.virtual_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_product_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_integrations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for virtual_products
CREATE POLICY "Anyone can view published virtual products" 
ON public.virtual_products 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Users can manage their own virtual products" 
ON public.virtual_products 
FOR ALL 
USING (auth.uid() = user_id);

-- 7. RLS Policies for virtual_product_slots
CREATE POLICY "Anyone can view available slots" 
ON public.virtual_product_slots 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Users can manage slots for their products" 
ON public.virtual_product_slots 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.virtual_products vp 
  WHERE vp.id = virtual_product_id AND vp.user_id = auth.uid()
));

-- 8. RLS Policies for virtual_bookings
CREATE POLICY "Users can view their bookings as buyer" 
ON public.virtual_bookings 
FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Users can view bookings as seller" 
ON public.virtual_bookings 
FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Users can create bookings" 
ON public.virtual_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update their bookings" 
ON public.virtual_bookings 
FOR UPDATE 
USING (auth.uid() = seller_id);

-- 9. RLS Policies for host_integrations
CREATE POLICY "Users can manage their own integrations" 
ON public.host_integrations 
FOR ALL 
USING (auth.uid() = user_id);

-- 10. Create indexes for performance
CREATE INDEX idx_virtual_products_user_id ON public.virtual_products(user_id);
CREATE INDEX idx_virtual_products_status ON public.virtual_products(status);
CREATE INDEX idx_virtual_product_slots_product_id ON public.virtual_product_slots(virtual_product_id);
CREATE INDEX idx_virtual_product_slots_start_time ON public.virtual_product_slots(start_time);
CREATE INDEX idx_virtual_bookings_buyer_id ON public.virtual_bookings(buyer_id);
CREATE INDEX idx_virtual_bookings_seller_id ON public.virtual_bookings(seller_id);
CREATE INDEX idx_virtual_bookings_product_id ON public.virtual_bookings(virtual_product_id);
CREATE INDEX idx_host_integrations_user_id ON public.host_integrations(user_id);

-- 11. Create trigger for updated_at
CREATE TRIGGER update_virtual_products_updated_at
BEFORE UPDATE ON public.virtual_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_virtual_product_slots_updated_at
BEFORE UPDATE ON public.virtual_product_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_virtual_bookings_updated_at
BEFORE UPDATE ON public.virtual_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_host_integrations_updated_at
BEFORE UPDATE ON public.host_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();