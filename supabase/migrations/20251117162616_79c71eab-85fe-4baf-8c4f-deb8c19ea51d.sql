-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('zoom', 'google_meet', 'microsoft_teams', 'calendly', 'google_drive', 'dropbox', 'onedrive', 'shopify')),
  connected BOOLEAN DEFAULT false,
  connection_data JSONB DEFAULT '{}',
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create integration_auth table for encrypted tokens
CREATE TABLE IF NOT EXISTS public.integration_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration_settings table
CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  settings_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integration_logs table
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('success', 'failure')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_auth_integration_id ON public.integration_auth(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_settings_integration_id ON public.integration_settings(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON public.integration_logs(integration_id);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for integrations
CREATE POLICY "Users can manage their own integrations"
  ON public.integrations
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS policies for integration_auth
CREATE POLICY "Users can manage their own integration auth"
  ON public.integration_auth
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE integrations.id = integration_auth.integration_id
      AND integrations.user_id = auth.uid()
    )
  );

-- RLS policies for integration_settings
CREATE POLICY "Users can manage their own integration settings"
  ON public.integration_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE integrations.id = integration_settings.integration_id
      AND integrations.user_id = auth.uid()
    )
  );

-- RLS policies for integration_logs
CREATE POLICY "Users can view their own integration logs"
  ON public.integration_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE integrations.id = integration_logs.integration_id
      AND integrations.user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER update_integration_auth_updated_at
  BEFORE UPDATE ON public.integration_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_updated_at();