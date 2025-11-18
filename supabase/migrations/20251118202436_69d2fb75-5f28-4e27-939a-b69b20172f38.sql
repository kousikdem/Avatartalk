-- Add custom link fields to qa_pairs table
ALTER TABLE qa_pairs 
ADD COLUMN IF NOT EXISTS custom_link_url TEXT,
ADD COLUMN IF NOT EXISTS custom_link_button_name TEXT;