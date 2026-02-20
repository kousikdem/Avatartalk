
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AvatarSettings {
  avatar_type: string;
  avatar_mood: string;
  voice_type: string;
  lip_sync: boolean;
  head_movement: boolean;
}

export const useAvatarSettings = () => {
  const [settings, setSettings] = useState<AvatarSettings>({
    avatar_type: 'realistic',
    avatar_mood: 'friendly',
    voice_type: 'neutral',
    lip_sync: true,
    head_movement: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: avatarSettings, error } = await supabase
          .from('avatar_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (avatarSettings) {
          setSettings({
            avatar_type: avatarSettings.avatar_type || 'realistic',
            avatar_mood: avatarSettings.avatar_mood || 'friendly',
            voice_type: avatarSettings.voice_type || 'neutral',
            lip_sync: avatarSettings.lip_sync ?? true,
            head_movement: avatarSettings.head_movement ?? true
          });
        }
      }
    } catch (error) {
      console.error('Error loading avatar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<AvatarSettings>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('avatar_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setSettings(updatedSettings);
      
      toast({
        title: "Success",
        description: "Avatar settings saved successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error saving avatar settings:', error);
      toast({
        title: "Error",
        description: "Failed to save avatar settings.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    loadSettings,
    saveSettings,
    updateSetting: (key: keyof AvatarSettings, value: any) => {
      const newSettings = { [key]: value };
      setSettings(prev => ({ ...prev, ...newSettings }));
      saveSettings(newSettings);
    }
  };
};
