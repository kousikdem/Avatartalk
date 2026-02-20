-- Update default token balance to 10,000 for new users (down from 100,000)
ALTER TABLE public.profiles 
ALTER COLUMN token_balance SET DEFAULT 10000;

-- Reduce existing users' token balance by 90,000 (but not below 0)
UPDATE public.profiles 
SET token_balance = GREATEST(token_balance - 90000, 0);

-- Update platform_settings to reflect new default
UPDATE public.platform_settings
SET setting_value = '{"amount": 10000}',
    updated_at = now()
WHERE setting_key = 'default_token_balance';