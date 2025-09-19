import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface RealtimeAvatarConfig {
  id: string;
  user_id: string;
  avatar_name: string;
  gender: string;
  age_category: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  eye_color: string;
  height: number;
  weight: number;
  muscle_definition: number;
  current_pose: string;
  current_expression: string;
  is_active: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export const useRealtimeAvatar = () => {
  const [avatarConfig, setAvatarConfig] = useState<RealtimeAvatarConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Real-time subscription to avatar changes
  useEffect(() => {
    let channel: any = null;

    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load initial avatar config
        await loadAvatarConfig(user.id);

        // Set up real-time subscription for avatar changes
        channel = supabase
          .channel('avatar-config-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'avatar_configurations',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Avatar config changed:', payload);
              if (payload.new && (payload.new as any).is_active) {
                setAvatarConfig(payload.new as RealtimeAvatarConfig);
              }
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Error setting up avatar realtime subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadAvatarConfig = async (userId?: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return;

      const { data: config, error } = await supabase
        .from('avatar_configurations')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAvatarConfig(config);
    } catch (error) {
      console.error('Error loading avatar config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatarConfig = async (updates: Partial<RealtimeAvatarConfig>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !avatarConfig) {
        throw new Error('User not authenticated or no avatar config');
      }

      const { data: updatedConfig, error } = await supabase
        .from('avatar_configurations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', avatarConfig.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAvatarConfig(updatedConfig);
      
      // Update profile avatar_url if needed
      if (updates.thumbnail_url) {
        await supabase
          .from('profiles')
          .update({ 
            avatar_url: updates.thumbnail_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully!",
      });

      return updatedConfig;
    } catch (error) {
      console.error('Error updating avatar config:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar configuration.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const createAvatarConfig = async (config: Partial<RealtimeAvatarConfig>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Deactivate existing configs
      await supabase
        .from('avatar_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const newConfig = {
        user_id: user.id,
        avatar_name: config.avatar_name || 'My Avatar',
        gender: config.gender || 'male',
        age_category: config.age_category || 'adult',
        skin_tone: config.skin_tone || '#F1C27D',
        hair_style: config.hair_style || 'medium',
        hair_color: config.hair_color || '#8B4513',
        eye_color: config.eye_color || '#8B4513',
        height: config.height || 170,
        weight: config.weight || 70,
        muscle_definition: config.muscle_definition || 50,
        current_pose: config.current_pose || 'standing',
        current_expression: config.current_expression || 'neutral',
        is_active: true,
        ...config
      };

      const { data: createdConfig, error } = await supabase
        .from('avatar_configurations')
        .insert(newConfig)
        .select()
        .single();

      if (error) throw error;

      setAvatarConfig(createdConfig);
      
      toast({
        title: "Avatar Created",
        description: "New avatar configuration created successfully!",
      });

      return createdConfig;
    } catch (error) {
      console.error('Error creating avatar config:', error);
      toast({
        title: "Error",
        description: "Failed to create avatar configuration.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const syncWithProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !avatarConfig) return;

      // Update profile with current avatar settings
      await supabase
        .from('profiles')
        .update({
          avatar_url: avatarConfig.thumbnail_url || '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Update avatar settings
      await supabase
        .from('avatar_settings')
        .upsert({
          user_id: user.id,
          avatar_type: 'realistic',
          avatar_mood: 'friendly',
          voice_type: 'neutral',
          lip_sync: true,
          head_movement: true,
          updated_at: new Date().toISOString()
        });

      toast({
        title: "Sync Complete",
        description: "Avatar synchronized with profile successfully!",
      });
    } catch (error) {
      console.error('Error syncing with profile:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync avatar with profile.",
        variant: "destructive"
      });
    }
  };

  return {
    avatarConfig,
    loading,
    saving,
    loadAvatarConfig,
    updateAvatarConfig,
    createAvatarConfig,
    syncWithProfile,
    refreshAvatar: () => loadAvatarConfig()
  };
};