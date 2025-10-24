import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FuturisticAvatar3D from './FuturisticAvatar3D';
import { useAvatarSettings } from '@/hooks/useAvatarSettings';

interface ChangeableAvatarPreviewProps {
  userId?: string;
  isLarge?: boolean;
  showControls?: boolean;
  enableVoice?: boolean;
  isInteractive?: boolean;
  isTalking?: boolean;
  className?: string;
  onAvatarClick?: () => void;
}

const ChangeableAvatarPreview: React.FC<ChangeableAvatarPreviewProps> = ({
  userId,
  isLarge = false,
  showControls = false,
  enableVoice = false,
  isInteractive = true,
  isTalking = false,
  className = '',
  onAvatarClick
}) => {
  const [avatarData, setAvatarData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { settings } = useAvatarSettings();

  // Fetch avatar configuration and profile data
  const fetchAvatarData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        setLoading(false);
        return;
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;
      setProfileData(profile);

      // Fetch avatar configuration if avatar_id is linked
      if (profile?.avatar_id) {
        const { data: avatarConfig, error: avatarError } = await supabase
          .from('avatar_configurations')
          .select('*')
          .eq('id', profile.avatar_id)
          .single();

        if (!avatarError && avatarConfig) {
          setAvatarData(avatarConfig);
        }
      }
    } catch (error) {
      console.error('Error fetching avatar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatarData();
  }, [userId]);

  // Real-time subscriptions for avatar and profile updates
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return;

    // Subscribe to avatar_configurations changes
    const avatarChannel = supabase
      .channel('avatar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avatar_configurations',
          filter: `user_id=eq.${targetUserId}`
        },
        () => {
          fetchAvatarData();
        }
      )
      .subscribe();

    // Subscribe to profiles changes
    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${targetUserId}`
        },
        () => {
          fetchAvatarData();
        }
      )
      .subscribe();

      return () => {
        supabase.removeChannel(avatarChannel);
        supabase.removeChannel(profileChannel);
      };
    };

    setupSubscriptions();
  }, [userId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to profile-pictures bucket
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_pic_url: publicUrl,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully!');
      setIsChangeModalOpen(false);
      fetchAvatarData();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const getAvatarDisplay = () => {
    if (profileData?.profile_pic_url) return profileData.profile_pic_url;
    if (profileData?.avatar_url) return profileData.avatar_url;
    if (avatarData?.thumbnail_url) return avatarData.thumbnail_url;
    return '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png';
  };

  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    } else {
      setIsChangeModalOpen(true);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className={`relative group cursor-pointer ${className}`} onClick={handleAvatarClick}>
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/40 via-blue-900/20 to-slate-800/40 border border-slate-600/30 shadow-inner ${isLarge ? 'h-80' : 'h-64'}`}>
          {/* 3D Floating Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative animate-[float_6s_ease-in-out_infinite]">
            <FuturisticAvatar3D
              isLarge={isLarge}
              isTalking={isTalking}
              avatarStyle={(settings?.avatar_type as any) || 'realistic'}
              mood={(settings?.avatar_mood as any) || 'friendly'}
              className="w-full h-full"
              onInteraction={() => {}}
            />
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Change Avatar</p>
            </div>
          </div>
        </div>

        {showControls && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              size="sm"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsChangeModalOpen(true);
              }}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Change Avatar Modal */}
      <Dialog open={isChangeModalOpen} onOpenChange={setIsChangeModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Change Avatar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center gap-4">
              {/* Current Avatar Preview */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/30">
                <img 
                  src={getAvatarDisplay()}
                  alt="Current Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Options */}
              <div className="w-full space-y-3">
                <Button
                  onClick={() => window.location.href = '/avatar'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Create 3D Avatar
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangeableAvatarPreview;
