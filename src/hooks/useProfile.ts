import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  profile_pic_url: string | null;
  full_name: string | null;
  email: string | null;
}

export interface AvatarSettings {
  avatar_type: string;
  avatar_mood: string;
  lip_sync: boolean;
  head_movement: boolean;
  voice_type: string;
}

export interface SocialLinks {
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  pinterest: string | null;
  website: string | null;
}

export interface UserStats {
  total_conversations: number;
  followers_count: number;
  engagement_score: number;
  profile_views: number;
}

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarSettings, setAvatarSettings] = useState<AvatarSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Fetch avatar settings
      const { data: avatarData, error: avatarError } = await supabase
        .from('avatar_settings')
        .select('*')
        .eq('user_id', id)
        .single();

      // Fetch social links
      const { data: socialData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', id)
        .single();

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', id)
        .single();

      setProfile(profileData);
      setAvatarSettings(avatarData || {
        avatar_type: 'realistic',
        avatar_mood: 'friendly',
        lip_sync: true,
        head_movement: true,
        voice_type: 'neutral'
      });
      setSocialLinks(socialData || {
        twitter: null,
        linkedin: null,
        facebook: null,
        instagram: null,
        youtube: null,
        pinterest: null,
        website: null
      });
      setUserStats(statsData || {
        total_conversations: 0,
        followers_count: 0,
        engagement_score: 0,
        profile_views: 0
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading profile",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (err: any) {
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const updateAvatarSettings = async (updates: Partial<AvatarSettings>) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('avatar_settings')
        .upsert({
          user_id: profile.id,
          ...avatarSettings,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;

      setAvatarSettings(data);
      toast({
        title: "Avatar settings updated",
        description: "Your avatar settings have been updated."
      });
    } catch (err: any) {
      toast({
        title: "Error updating avatar settings",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const updateSocialLinks = async (updates: Partial<SocialLinks>) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('social_links')
        .upsert({
          user_id: profile.id,
          ...socialLinks,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;

      setSocialLinks(data);
      toast({
        title: "Social links updated",
        description: "Your social links have been updated."
      });
    } catch (err: any) {
      toast({
        title: "Error updating social links",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return {
    profile,
    avatarSettings,
    socialLinks,
    userStats,
    loading,
    error,
    updateProfile,
    updateAvatarSettings,
    updateSocialLinks,
    refetch: () => profile && fetchUserProfile(profile.id)
  };
};