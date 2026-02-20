-- Add rate_limit_per_minute setting if not exists, set to 3
INSERT INTO public.ai_system_limits (limit_key, limit_value, description)
VALUES ('rate_limit_per_minute', '{"limit": 3}', 'AI requests rate limit per minute')
ON CONFLICT (limit_key) DO UPDATE SET limit_value = '{"limit": 3}';

-- Ensure all necessary settings exist for Super Admin editing
INSERT INTO public.ai_system_limits (limit_key, limit_value, description)
VALUES 
  ('max_tokens_per_message', '{"limit": 4000}', 'Maximum tokens per AI message'),
  ('max_messages_per_day', '{"limit": 1000}', 'Maximum messages per day per user'),
  ('first_time_gift_popup_enabled', '{"enabled": true}', 'Show gift popup to first-time visitors on profile'),
  ('gift_token_price_per_million', '{"limit": 420}', 'Price per million tokens in INR for gifting')
ON CONFLICT (limit_key) DO NOTHING;