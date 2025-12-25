import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserChatSettings {
  id: string;
  user_id: string;
  free_messages_per_day: number;
  enable_daily_limit: boolean;
  enable_gift_popup: boolean;
  gift_popup_after_messages: number;
  gift_popup_message: string;
  show_gift_button: boolean;
  ai_responses_enabled: boolean;
  pause_ai_until: string | null;
  allow_direct_chat: boolean;
  direct_chat_free: boolean;
  max_message_length: number;
  enable_voice_responses: boolean;
  enable_rich_responses: boolean;
  created_at: string;
  updated_at: string;
}

const defaultSettings: Partial<UserChatSettings> = {
  free_messages_per_day: 5,
  enable_daily_limit: true,
  enable_gift_popup: true,
  gift_popup_after_messages: 3,
  gift_popup_message: 'Help support my AI assistant! Gift tokens to help me continue voice + text conversations.',
  show_gift_button: true,
  ai_responses_enabled: true,
  pause_ai_until: null,
  allow_direct_chat: true,
  direct_chat_free: false,
  max_message_length: 2000,
  enable_voice_responses: true,
  enable_rich_responses: true,
};

export const useUserChatSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserChatSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_chat_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data as UserChatSettings);
      } else {
        // Create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from('user_chat_settings')
          .insert({ user_id: userId, ...defaultSettings })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings as UserChatSettings);
      }
    } catch (error) {
      console.error('Error fetching chat settings:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateSettings = async (updates: Partial<UserChatSettings>) => {
    if (!settings) return false;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_chat_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast({ title: 'Settings saved', description: 'Your chat settings have been updated.' });
      return true;
    } catch (error) {
      console.error('Error updating chat settings:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to save settings. Please try again.', 
        variant: 'destructive' 
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings,
  };
};

// Hook to fetch profile owner's chat settings (for visitors)
export const useProfileChatSettings = (profileId?: string) => {
  const [settings, setSettings] = useState<UserChatSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      try {
        // Use RPC or direct query with service role for public access
        const { data, error } = await supabase
          .from('user_chat_settings')
          .select('*')
          .eq('user_id', profileId)
          .maybeSingle();

        if (!error && data) {
          setSettings(data as UserChatSettings);
        }
      } catch (error) {
        console.error('Error fetching profile chat settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [profileId]);

  return { settings, loading };
};
