
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  display_name: string;
  username: string;
  bio: string;
  full_name: string;
  email: string;
  gender: string;
  age: number;
  profession: string;
  profile_pic_url?: string;
}

export const useProfileManager = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    username: '',
    bio: '',
    full_name: '',
    email: '',
    gender: '',
    age: 18,
    profession: '',
    profile_pic_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setProfileData({
            display_name: profile.display_name || '',
            username: profile.username || '',
            bio: profile.bio || '',
            full_name: profile.full_name || '',
            email: profile.email || user.email || '',
            gender: profile.gender || '',
            age: profile.age || 18,
            profession: profile.profession || '',
            profile_pic_url: profile.profile_pic_url || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileData = async (data?: Partial<ProfileData>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updateData = data || profileData;
        
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            ...updateData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        if (data) {
          setProfileData(prev => ({ ...prev, ...data }));
        }

        toast({
          title: "Profile Updated",
          description: "Your profile has been saved successfully.",
        });
        return true;
      }
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

  const updateField = (field: keyof ProfileData, value: string | number) => {
    const newData = { [field]: value };
    setProfileData(prev => ({ ...prev, ...newData }));
    saveProfileData(newData);
  };

  const updateProfilePicture = (imageUrl: string) => {
    updateField('profile_pic_url', imageUrl);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  return {
    profileData,
    loading,
    saving,
    loadProfileData,
    saveProfileData,
    updateField,
    updateProfilePicture,
    setProfileData
  };
};
