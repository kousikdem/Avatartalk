-- Create notification_settings table for push notification and advanced settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create push_notifications table for scheduled/custom push notifications from admin
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  icon TEXT,
  notification_type TEXT NOT NULL DEFAULT 'announcement',
  target_audience TEXT NOT NULL DEFAULT 'all', -- all, subscribers, followers, custom
  target_user_ids UUID[] DEFAULT NULL,
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sent, cancelled
  sent_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add link_url column to notifications table if not exists
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link_text TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_settings (super admin only)
CREATE POLICY "Super admins can manage notification settings"
ON public.notification_settings
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- RLS policies for push_notifications (super admin only)
CREATE POLICY "Super admins can manage push notifications"
ON public.push_notifications
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Insert default notification settings
INSERT INTO public.notification_settings (setting_key, setting_value, description, category) VALUES
  ('follow_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify users when someone follows them', 'activity'),
  ('product_purchase_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify sellers on product purchases', 'sales'),
  ('meeting_booking_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify on meeting/collab bookings', 'sales'),
  ('post_like_notifications', '{"enabled": true, "realtime": true, "push": false}', 'Notify on post likes', 'activity'),
  ('post_comment_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify on post comments', 'activity'),
  ('message_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify on new messages', 'messages'),
  ('subscription_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify on new subscriptions', 'sales'),
  ('token_gift_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify on token gifts', 'tokens'),
  ('order_update_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Notify on order status changes', 'orders'),
  ('profile_visit_milestone_notifications', '{"enabled": true, "milestones": [10, 50, 100, 500, 1000]}', 'Notify on profile visit milestones', 'milestones'),
  ('product_view_milestone_notifications', '{"enabled": true, "milestones": [10, 50, 100, 500]}', 'Notify on product view milestones', 'milestones'),
  ('system_notifications', '{"enabled": true, "realtime": true, "push": true}', 'System-wide announcements', 'system'),
  ('promotion_notifications', '{"enabled": true, "realtime": true, "push": true}', 'Promotional notifications', 'marketing')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_notification_settings_timestamp
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();

CREATE TRIGGER update_push_notifications_timestamp
  BEFORE UPDATE ON public.push_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();