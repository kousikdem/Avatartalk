-- Add unique constraint for upsert operations on platform_integration_secrets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'platform_integration_secrets_unique_key'
    ) THEN
        ALTER TABLE public.platform_integration_secrets 
        ADD CONSTRAINT platform_integration_secrets_unique_key 
        UNIQUE (integration_name, secret_key, environment);
    END IF;
END $$;