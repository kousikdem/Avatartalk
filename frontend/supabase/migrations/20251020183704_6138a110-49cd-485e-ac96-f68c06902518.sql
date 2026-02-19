-- Add new social media columns to social_links table
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS tiktok text;
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS github text;
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS twitch text;
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS discord text;
