import React, { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, MessageSquare, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import AdvancedAvatarPreview from './AdvancedAvatarPreview';
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
  onTalkClick?: () => void;
  onGiftClick?: () => void;
  showGiftButton?: boolean;
}

const ChangeableAvatarPreview: React.FC<ChangeableAvatarPreviewProps> = ({
  userId,
  isLarge = false,
  showControls = false,
  enableVoice = false,
  isInteractive = true,
  isTalking = false,
  className = '',
  onAvatarClick,
  onTalkClick,
  onGiftClick,
  showGiftButton = false
}) => {
  const [avatarData, setAvatarData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const { settings } = useAvatarSettings();

  // Fetch avatar configuration and profile data - works for ALL visitors
  const fetchAvatarData = async () => {
    try {
      setLoading(true);
      
      // Use the provided userId prop directly (this is the profile owner's ID)
      // Don't rely on auth for viewing - anyone should see the avatar
      const targetUserId = userId;

      if (!targetUserId) {
        console.log('No userId provided to ChangeableAvatarPreview');
        setLoading(false);
        return;
      }

      console.log('🎭 Fetching avatar for user:', targetUserId);

      // Fetch profile data using RPC for public access
      const { data: profileArray, error: profileError } = await supabase
        .rpc('get_public_profile', { profile_id: targetUserId });

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Fallback to direct query
        const { data: directProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle();
        if (directProfile) setProfileData(directProfile);
      } else if (profileArray && profileArray.length > 0) {
        setProfileData(profileArray[0]);
      }

      // Also fetch the full profile to get avatar_id
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('avatar_id')
        .eq('id', targetUserId)
        .maybeSingle();

      // Fetch active avatar configuration - this should be publicly viewable
      // First try to get by avatar_id if it exists in profile
      if (fullProfile?.avatar_id) {
        const { data: avatarConfig, error: avatarError } = await supabase
          .from('avatar_configurations')
          .select('*')
          .eq('id', fullProfile.avatar_id)
          .maybeSingle();

        if (!avatarError && avatarConfig) {
          console.log('🎭 Found avatar by avatar_id:', avatarConfig.avatar_name);
          setAvatarData(avatarConfig);
          setLoading(false);
          return;
        }
      }
      
      // Otherwise, get the active avatar configuration for this user
      const { data: activeAvatar, error: activeAvatarError } = await supabase
        .from('avatar_configurations')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .maybeSingle();

      if (!activeAvatarError && activeAvatar) {
        console.log('🎭 Found active avatar:', activeAvatar.avatar_name);
        setAvatarData(activeAvatar);
      } else {
        // Try to get any avatar for this user
        const { data: anyAvatar } = await supabase
          .from('avatar_configurations')
          .select('*')
          .eq('user_id', targetUserId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (anyAvatar) {
          console.log('🎭 Found fallback avatar:', anyAvatar.avatar_name);
          setAvatarData(anyAvatar);
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
    // Priority order for 3D avatar display:
    // 1. Custom uploaded model from avatar configuration (highest priority for custom uploads)
    if (avatarData?.model_url) return avatarData.model_url;
    // 2. Custom uploaded thumbnail from avatar configuration
    if (avatarData?.thumbnail_url) return avatarData.thumbnail_url;
    // 3. Profile avatar_url (fallback for direct uploads)
    if (profileData?.avatar_url) return profileData.avatar_url;
    // 4. No uploaded image - will render configured 3D avatar instead
    return null;
  };

  const shouldRenderConfiguredAvatar = () => {
    // Render configured avatar if we have avatar configuration data but no uploaded images
    return avatarData && !avatarData.model_url && !avatarData.thumbnail_url && !profileData?.avatar_url;
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
          
          {/* Show uploaded avatar image if available */}
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
          ) : shouldRenderConfiguredAvatar() ? (
            // Render the actual configured 3D avatar from dashboard
            <div className="relative h-full">
              <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <spotLight position={[-10, -10, -5]} intensity={0.3} />
                
                <Suspense fallback={null}>
                  <AdvancedAvatarPreview config={avatarData} />
                </Suspense>
                
                <OrbitControls 
                  enablePan={false}
                  enableZoom={false}
                  minDistance={7}
                  maxDistance={12}
                  maxPolarAngle={Math.PI / 1.8}
                  autoRotate={!isTalking}
                  autoRotateSpeed={0.5}
                />
                <Environment preset="studio" />
                <ContactShadows position={[0, -2.5, 0]} scale={8} blur={3} far={3} />
              </Canvas>
              {isTalking && (
                <div className="absolute inset-0 border-4 border-blue-400/60 rounded-2xl animate-pulse pointer-events-none"></div>
              )}
            </div>
          ) : (
            // Fallback to default futuristic avatar if no configuration exists
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

        {/* Gift Button - Bottom Left - Highly Visible */}
        {showGiftButton && onGiftClick && (
          <div className="absolute bottom-4 left-4 z-10">
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl px-5 py-3 flex items-center gap-2 animate-pulse hover:animate-none transition-all border-2 border-white/30"
              onClick={(e) => {
                e.stopPropagation();
                onGiftClick();
              }}
              title="Gift AI Tokens"
            >
              <Gift className="w-5 h-5" />
              <span className="font-bold text-sm">Gift Tokens</span>
            </Button>
          </div>
        )}

        {/* Talk to Me Button - Always visible, floating at bottom center */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            size="sm"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              if (onTalkClick) {
                onTalkClick();
              } else {
                toast.success('Opening chat...');
              }
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
