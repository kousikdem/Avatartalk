import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AITrainingSettings {
  id: string;
  user_id: string;
  welcome_message_enabled: boolean;
  welcome_message_text: string;
  welcome_message_trigger: string;
  welcome_message_language: string;
  custom_variables: Array<{ name: string; description: string; defaultValue?: string }>;
  global_describe_text: string | null;
  global_describe_priority: boolean;
  engagement_score_weight: Record<string, number> | null;
}

export const useAITrainingSettings = () => {
  const [settings, setSettings] = useState<AITrainingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_training_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const customVars = Array.isArray(data.custom_variables) 
          ? (data.custom_variables as unknown as Array<{ name: string; description: string; defaultValue?: string }>)
          : [];
        const engagementWeights = typeof data.engagement_score_weight === 'object' && data.engagement_score_weight !== null
          ? (data.engagement_score_weight as Record<string, number>)
          : null;
        setSettings({
          ...data,
          custom_variables: customVars,
          engagement_score_weight: engagementWeights
        } as AITrainingSettings);
      }
    } catch (error) {
      console.error('Error fetching AI training settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<AITrainingSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const settingsData = {
        user_id: user.id,
        ...newSettings,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ai_training_settings')
        .upsert(settingsData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      const customVars = Array.isArray(data.custom_variables) 
        ? (data.custom_variables as unknown as Array<{ name: string; description: string; defaultValue?: string }>)
        : [];
      const engagementWeights = typeof data.engagement_score_weight === 'object' && data.engagement_score_weight !== null
        ? (data.engagement_score_weight as Record<string, number>)
        : null;
      setSettings({
        ...data,
        custom_variables: customVars,
        engagement_score_weight: engagementWeights
      } as AITrainingSettings);

      toast({
        title: "Settings Saved",
        description: "Your AI training settings have been updated",
      });

      return data;
    } catch (error: any) {
      console.error('Error saving AI training settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings
  };
};
