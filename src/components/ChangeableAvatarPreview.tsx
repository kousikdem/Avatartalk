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

      // Fetch active avatar configuration
      // First try to get by avatar_id if it exists in profile
      if (profile?.avatar_id) {
        const { data: avatarConfig, error: avatarError } = await supabase
          .from('avatar_configurations')
          .select('*')
          .eq('id', profile.avatar_id)
          .single();

        if (!avatarError && avatarConfig) {
          setAvatarData(avatarConfig);
        }
      } else {
        // Otherwise, get the active avatar configuration for this user
        const { data: activeAvatar, error: activeAvatarError } = await supabase
          .from('avatar_configurations')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('is_active', true)
          .maybeSingle();

        if (!activeAvatarError && activeAvatar) {
          setAvatarData(activeAvatar);
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

  // Enhanced Real-time subscriptions for instant avatar sync
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return;

      // Subscribe to avatar_configurations changes with real-time sync
      const avatarChannel = supabase
        .channel(`avatar-sync-${targetUserId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'avatar_configurations',
            filter: `user_id=eq.${targetUserId}`
          },
          (payload) => {
            console.log('🔄 Avatar config changed in real-time:', payload);
            // Instant refresh on any avatar change
            fetchAvatarData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${targetUserId}`
          },
          (payload) => {
            console.log('🔄 Profile updated in real-time:', payload);
            // Instant refresh on profile change
            fetchAvatarData();
          }
        )
        .subscribe((status) => {
          console.log('🔌 Real-time subscription status:', status);
        });

      return () => {
        console.log('🔌 Cleaning up real-time subscriptions');
        supabase.removeChannel(avatarChannel);
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [userId]);

  const getAvatarDisplay = () => {
    // ONLY show 3D avatar sources, NEVER profile_pic_url (profile picture is separate)
    // Priority order for 3D avatar display:
    // 1. Custom uploaded model from avatar configuration (highest priority for custom uploads)
    if (avatarData?.model_url) return avatarData.model_url;
    // 2. Custom uploaded thumbnail from avatar configuration
    if (avatarData?.thumbnail_url) return avatarData.thumbnail_url;
    // 3. Profile avatar_url (fallback for direct uploads)
    if (profileData?.avatar_url) return profileData.avatar_url;
    // 4. No 3D avatar exists - show default built avatar (FuturisticAvatar3D)
    return null;
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

  const avatarImageUrl = getAvatarDisplay();
  const hasUploadedAvatar = avatarData?.thumbnail_url || avatarData?.model_url || profileData?.avatar_url;

  return (
    <>
      <div className={`relative group ${className}`}>
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/40 via-blue-900/20 to-slate-800/40 border border-slate-600/30 shadow-inner ${isLarge ? 'h-80' : 'h-64'}`}>
          {/* 3D Floating Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Show uploaded avatar image if available, otherwise show 3D avatar */}
          {hasUploadedAvatar ? (
            <div className="relative h-full flex items-center justify-center p-6">
              <img 
                src={avatarImageUrl} 
                alt="Avatar" 
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                style={{
                  filter: isTalking ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' : 'none',
                  transition: 'filter 0.3s ease'
                }}
              />
              {isTalking && (
                <div className="absolute inset-0 border-4 border-blue-400/60 rounded-2xl animate-pulse"></div>
              )}
            </div>
          ) : (
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
          )}

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
