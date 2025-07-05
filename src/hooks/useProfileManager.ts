
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ProfileData {
  id?: string;
  display_name?: string;
  username?: string;
  bio?: string;
  full_name?: string;
  email?: string;
  gender?: string;
  age?: number;
  profession?: string;
  avatar_url?: string;
  profile_pic_url?: string;
}

export const useProfileManager = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setProfile(profileData || { id: user.id, email: user.email });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<ProfileData>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData = {
        ...profileData,
        id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData, { onConflict: 'id' });

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updateData }));
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    saving,
    loadProfile,
    saveProfile,
    updateAvatar
  };
};
