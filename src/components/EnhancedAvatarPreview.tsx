import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Play, Pause, Mic, Volume2 } from 'lucide-react';
import { useDefaultAvatar } from '@/hooks/useDefaultAvatar';
import { useAvatarSettings } from '@/hooks/useAvatarSettings';
import FuturisticAvatar3D from './FuturisticAvatar3D';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface EnhancedAvatarPreviewProps {
  userId?: string;
  isLarge?: boolean;
  showControls?: boolean;
  enableVoice?: boolean;
  isInteractive?: boolean;
  talking?: boolean;
  onAvatarClick?: () => void;
}

interface AvatarConfig {
  avatar_name: string;
  gender: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  eye_color: string;
  current_expression: string;
  current_pose: string;
}

const EnhancedAvatarPreview: React.FC<EnhancedAvatarPreviewProps> = ({
  userId,
  isLarge = false,
  showControls = true,
  enableVoice = false,
  isInteractive = true,
  talking = false,
  onAvatarClick
}) => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const { defaultConfig, loading: defaultLoading } = useDefaultAvatar();
  const { settings, loading: settingsLoading } = useAvatarSettings();

  // Real-time avatar configuration updates
  useEffect(() => {
    if (!userId) return;

    const fetchAvatarConfig = async () => {
      try {
        const { data } = await supabase
          .from('avatar_configurations')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();
        
        if (data && data.is_active) {
          setAvatarConfig(data);
        }
      } catch (error) {
        console.error('Error fetching avatar config:', error);
      }
    };

    fetchAvatarConfig();

    // Set up real-time subscription
    const channel = supabase
      .channel('avatar-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avatar_configurations',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).is_active) {
            setAvatarConfig(payload.new as AvatarConfig);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Use default config if no specific config available
  const displayConfig = avatarConfig || defaultConfig;

  const getAvatarStyle = (): "realistic" | "holographic" | "neon" | "crystalline" => {
    const type = settings?.avatar_type || 'realistic';
    
    // Ensure we return a valid style type
    if (type === 'holographic' || type === 'neon' || type === 'crystalline') {
      return type;
    }
    return 'realistic';
  };

  const getAvatarMood = (): "friendly" | "professional" | "mysterious" | "energetic" => {
    const mood = settings?.avatar_mood || 'friendly';
    
    // Ensure we return a valid mood type
    if (mood === 'professional' || mood === 'mysterious' || mood === 'energetic') {
      return mood;
    }
    return 'friendly';
  };

  const handleAvatarInteraction = () => {
    if (isInteractive && onAvatarClick) {
      onAvatarClick();
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMicrophone = () => {
    setIsMicActive(!isMicActive);
  };

  if (defaultLoading || settingsLoading) {
    return (
      <Card className={`${isLarge ? 'h-96' : 'h-64'} bg-gradient-to-br from-slate-50 to-gray-50`}>
        <CardContent className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${isLarge ? 'h-96' : 'h-64'} bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 overflow-hidden`}>
        <CardContent className="h-full p-4 relative">
          {/* Avatar Display */}
          <div 
            className={`${isLarge ? 'h-80' : 'h-48'} relative cursor-pointer group`}
            onClick={handleAvatarInteraction}
          >
            <FuturisticAvatar3D
              isTalking={talking || isPlaying}
              avatarStyle={getAvatarStyle()}
              mood={getAvatarMood()}
              onInteraction={handleAvatarInteraction}
              className="w-full h-full"
            />
            
            {/* Interaction Overlay */}
            {isInteractive && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Play className="w-6 h-6 text-primary" />
                </div>
              </div>
            )}

            {/* Status Indicators */}
            {(talking || isPlaying || isMicActive) && (
              <div className="absolute top-2 right-2 flex space-x-1">
                {(talking || isPlaying) && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="bg-green-500 rounded-full p-1"
                  >
                    <Volume2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                {isMicActive && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="bg-red-500 rounded-full p-1"
                  >
                    <Mic className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Avatar Info */}
          <div className="mt-2">
            <h3 className="font-medium text-gray-900 text-center">
              {displayConfig?.avatar_name || 'My Avatar'}
            </h3>
            <p className="text-xs text-gray-500 text-center">
              {settings?.avatar_type || 'Realistic'} • {settings?.avatar_mood || 'Friendly'}
            </p>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
              {enableVoice && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={togglePlayback}
                    className="bg-white/80 backdrop-blur-sm"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleMicrophone}
                    className={`bg-white/80 backdrop-blur-sm ${isMicActive ? 'text-red-500' : ''}`}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = '/avatar'}
                className="bg-white/80 backdrop-blur-sm"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedAvatarPreview;