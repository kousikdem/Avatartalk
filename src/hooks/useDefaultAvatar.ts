import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface DefaultAvatarConfig {
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
  current_pose: string;
  current_expression: string;
  is_active: boolean;
}

export const useDefaultAvatar = () => {
  const [defaultConfig, setDefaultConfig] = useState<DefaultAvatarConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadDefaultAvatar = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: avatarConfig, error } = await supabase
        .from('avatar_configurations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setDefaultConfig(avatarConfig);
    } catch (error) {
      console.error('Error loading default avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAsDefault = async (configId: string) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, set all user's avatars to inactive
      const { error: deactivateError } = await supabase
        .from('avatar_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (deactivateError) throw deactivateError;

      // Then set the selected avatar as active
      const { data: updatedConfig, error: activateError } = await supabase
        .from('avatar_configurations')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (activateError) throw activateError;

      // Update profile with current profile pic or avatar URL
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('profile_pic_url, avatar_url')
        .eq('id', user.id)
        .single();

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: currentProfile?.profile_pic_url || currentProfile?.avatar_url || '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setDefaultConfig(updatedConfig);
      
      toast({
        title: "Default Avatar Set",
        description: "Your avatar is now the default for new users!",
      });

      return true;
    } catch (error) {
      console.error('Error saving default avatar:', error);
      toast({
        title: "Error",
        description: "Failed to set default avatar.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const linkWithProfile = async (avatarConfigId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      // Get the avatar configuration
      const { data: avatarConfig, error: avatarError } = await supabase
        .from('avatar_configurations')
        .select('*')
        .eq('id', avatarConfigId)
        .eq('user_id', user.id)
        .single();

      if (avatarError) throw avatarError;

      // Update the profile with current profile pic or default avatar
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('profile_pic_url, avatar_url')
        .eq('id', user.id)
        .single();

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: currentProfile?.profile_pic_url || currentProfile?.avatar_url || '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update avatar settings to match the configuration
      const { error: settingsError } = await supabase
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

      if (settingsError) throw settingsError;

      toast({
        title: "Avatar Linked",
        description: "Avatar dashboard is now linked with your profile!",
      });

      return true;
    } catch (error) {
      console.error('Error linking avatar with profile:', error);
      toast({
        title: "Error",
        description: "Failed to link avatar with profile.",
        variant: "destructive"
      });
      return false;
    }
  };

  const createDefaultForNewUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user for avatar creation');
        return false;
      }

      // Check if user already has any avatar configuration
      const { data: existingConfigs, error: checkError } = await supabase
        .from('avatar_configurations')
        .select('id, is_active')
        .eq('user_id', user.id);

      if (checkError) {
        console.error('Error checking existing avatars:', checkError);
        // Continue anyway - try to create
      }

      // If user has any configs, check if one is active
      if (existingConfigs && existingConfigs.length > 0) {
        const hasActive = existingConfigs.some(c => c.is_active);
        if (hasActive) {
          console.log('User already has an active avatar');
          return true;
        }
        
        // User has configs but none active - activate the first one
        const { error: activateError } = await supabase
          .from('avatar_configurations')
          .update({ is_active: true })
          .eq('id', existingConfigs[0].id);
          
        if (!activateError) {
          console.log('Activated existing avatar configuration');
          await loadDefaultAvatar();
          return true;
        }
      }

      // Create a default avatar configuration for new users
      const defaultAvatarConfig = {
        user_id: user.id,
        avatar_name: 'My Avatar',
        gender: 'male',
        age_category: 'adult',
        skin_tone: '#F1C27D',
        hair_style: 'medium',
        hair_color: '#8B4513',
        eye_color: '#8B4513',
        height: 170,
        current_pose: 'standing',
        current_expression: 'neutral',
        is_active: true
      };

      const { data: newConfig, error } = await supabase
        .from('avatar_configurations')
        .insert(defaultAvatarConfig)
        .select()
        .single();

      if (error) {
        console.error('Error creating default avatar:', error);
        
        // If it's a duplicate key error, try to fetch existing
        if (error.code === '23505') {
          await loadDefaultAvatar();
          return true;
        }
        
        toast({
          title: "Avatar Setup",
          description: "Using default avatar settings.",
        });
        return false;
      }

      setDefaultConfig(newConfig);
      
      // Try to link with profile (don't fail if this errors)
      try {
        await linkWithProfile(newConfig.id);
      } catch (linkError) {
        console.error('Error linking avatar with profile:', linkError);
      }

      toast({
        title: "Avatar Created",
        description: "Your personalized avatar has been set up!",
      });

      return true;
    } catch (error) {
      console.error('Error creating default avatar for new user:', error);
      return false;
    }
  };

  useEffect(() => {
    loadDefaultAvatar();
  }, []);

  return {
    defaultConfig,
    loading,
    saving,
    loadDefaultAvatar,
    saveAsDefault,
    linkWithProfile,
    createDefaultForNewUsers,
    refreshDefault: loadDefaultAvatar
  };
};