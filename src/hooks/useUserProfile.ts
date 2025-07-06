
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  id: string;
  username: string;
  display_name: string;
  full_name: string;
  email: string;
  bio: string;
  profile_pic_url: string;
  gender: string;
  age: number;
  profession: string;
  public_link: string;
  avatar_data: {
    style: string;
    voice: string;
    preview_url: string;
    mood: string;
    lip_sync: boolean;
    head_movement: boolean;
  };
  social_links: {
    facebook: string;
    twitter: string; 
    instagram: string;
    linkedin: string;
    youtube: string;
    website: string;
    pinterest: string;
  };
  analytics: {
    profile_views: number;
    total_conversations: number;
    engagement_score: number;
    followers_count: number;
  };
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadCompleteProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load avatar settings
      const { data: avatarSettings } = await supabase
        .from('avatar_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load social links
      const { data: socialLinks } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const completeProfile: UserProfileData = {
          id: profile.id,
          username: profile.username || '',
          display_name: profile.display_name || '',
          full_name: profile.full_name || '',
          email: profile.email || user.email || '',
          bio: profile.bio || '',
          profile_pic_url: profile.profile_pic_url || '',
          gender: profile.gender || '',
          age: profile.age || 18,
          profession: profile.profession || '',
          public_link: `${window.location.origin}/${profile.username || user.id}`,
          avatar_data: {
            style: avatarSettings?.avatar_type || 'realistic',
            voice: avatarSettings?.voice_type || 'neutral',
            preview_url: profile.avatar_url || '',
            mood: avatarSettings?.avatar_mood || 'friendly',
            lip_sync: avatarSettings?.lip_sync ?? true,
            head_movement: avatarSettings?.head_movement ?? true,
          },
          social_links: {
            facebook: socialLinks?.facebook || '',
            twitter: socialLinks?.twitter || '',
            instagram: socialLinks?.instagram || '',
            linkedin: socialLinks?.linkedin || '',
            youtube: socialLinks?.youtube || '',
            website: socialLinks?.website || '',
            pinterest: socialLinks?.pinterest || '',
          },
          analytics: {
            profile_views: userStats?.profile_views || 0,
            total_conversations: userStats?.total_conversations || 0,
            engagement_score: userStats?.engagement_score || 0,
            followers_count: userStats?.followers_count || 0,
          },
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
        };

        setProfileData(completeProfile);
      }
    } catch (error) {
      console.error('Error loading complete profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !profileData) return false;

      const now = new Date().toISOString();

      // Update profile table
      if (updates.username || updates.display_name || updates.full_name || 
          updates.email || updates.bio || updates.profile_pic_url || 
          updates.gender || updates.age || updates.profession) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: updates.username || profileData.username,
            display_name: updates.display_name || profileData.display_name,
            full_name: updates.full_name || profileData.full_name,
            email: updates.email || profileData.email,
            bio: updates.bio || profileData.bio,
            profile_pic_url: updates.profile_pic_url || profileData.profile_pic_url,
            gender: updates.gender || profileData.gender,
            age: updates.age || profileData.age,
            profession: updates.profession || profileData.profession,
            updated_at: now,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Update avatar settings if changed
      if (updates.avatar_data) {
        const { error: avatarError } = await supabase
          .from('avatar_settings')
          .update({
            avatar_type: updates.avatar_data.style || profileData.avatar_data.style,
            voice_type: updates.avatar_data.voice || profileData.avatar_data.voice,
            avatar_mood: updates.avatar_data.mood || profileData.avatar_data.mood,
            lip_sync: updates.avatar_data.lip_sync ?? profileData.avatar_data.lip_sync,
            head_movement: updates.avatar_data.head_movement ?? profileData.avatar_data.head_movement,
            updated_at: now,
          })
          .eq('user_id', user.id);

        if (avatarError) throw avatarError;
      }

      // Update social links if changed
      if (updates.social_links) {
        const { error: socialError } = await supabase
          .from('social_links')
          .update({
            facebook: updates.social_links.facebook || profileData.social_links.facebook,
            twitter: updates.social_links.twitter || profileData.social_links.twitter,
            instagram: updates.social_links.instagram || profileData.social_links.instagram,
            linkedin: updates.social_links.linkedin || profileData.social_links.linkedin,
            youtube: updates.social_links.youtube || profileData.social_links.youtube,
            website: updates.social_links.website || profileData.social_links.website,
            pinterest: updates.social_links.pinterest || profileData.social_links.pinterest,
            updated_at: now,
          })
          .eq('user_id', user.id);

        if (socialError) throw socialError;
      }

      // Update local state
      setProfileData(prev => prev ? {
        ...prev,
        ...updates,
        updated_at: now,
        public_link: updates.username ? 
          `${window.location.origin}/${updates.username}` : 
          prev.public_link
      } : null);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error", 
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user?.id || '');

      if (error) throw error;
      return data.length === 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const incrementProfileViews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile views directly in user_stats table
      const { error } = await supabase
        .from('user_stats')
        .update({ 
          profile_views: profileData?.analytics.profile_views ? profileData.analytics.profile_views + 1 : 1 
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing profile views:', error);
    }
  };

  useEffect(() => {
    loadCompleteProfile();
  }, []);

  return {
    profileData,
    loading,
    saving,
    updateProfile,
    checkUsernameAvailability,
    incrementProfileViews,
    refreshProfile: loadCompleteProfile,
  };
};
