import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Integration {
  id: string;
  provider: string;
  connected: boolean;
  connection_data: any;
  scopes: string[];
  created_at: string;
  updated_at: string;
  settings?: {
    settings_json: any;
  };
  last_sync?: string;
  expires_at?: string;
}

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('integrations')
        .select(`
          *,
          settings:integration_settings(settings_json),
          auth:integration_auth(expires_at)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        settings: item.settings?.[0],
        expires_at: item.auth?.[0]?.expires_at,
      })) || [];

      setIntegrations(formattedData);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (provider: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('integrations')
        .upsert({
          user_id: user.id,
          provider,
          connected: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${provider} connected successfully`,
      });

      await loadIntegrations();
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect integration',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const disconnectIntegration = async (integrationId: string, provider: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${provider} disconnected successfully`,
      });

      await loadIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateSettings = async (integrationId: string, settings: any) => {
    try {
      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          integration_id: integrationId,
          settings_json: settings,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });

      await loadIntegrations();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  return {
    integrations,
    loading,
    connectIntegration,
    disconnectIntegration,
    updateSettings,
    refetch: loadIntegrations,
  };
};
