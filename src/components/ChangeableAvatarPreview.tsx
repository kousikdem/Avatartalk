import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, MessageSquare } from 'lucide-react';
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

  const getAvatarDisplay = () => {
    if (profileData?.profile_pic_url) return profileData.profile_pic_url;
    if (profileData?.avatar_url) return profileData.avatar_url;
    if (avatarData?.thumbnail_url) return avatarData.thumbnail_url;
    return '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png';
  };

  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    }
    // Removed modal opening since change button is removed
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
      <div className={`relative group ${className}`}>
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

        </div>

        {/* Talk to Me Button - Always visible, floating at bottom center */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            size="sm"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              // This can be customized based on your needs
              toast.success('Voice interaction coming soon!');
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Talk to Me</span>
          </Button>
        </div>
      </div>

    </>
  );
};

export default ChangeableAvatarPreview;
