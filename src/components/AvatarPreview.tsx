
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useDefaultAvatar } from '@/hooks/useDefaultAvatar';

interface AvatarPreviewProps {
  isLarge?: boolean;
  showControls?: boolean;
  avatarConfig?: any;
  profileData?: any;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({ 
  isLarge = false, 
  showControls = false, 
  avatarConfig,
  profileData 
}) => {
  const [isTalking, setIsTalking] = React.useState(false);
  const { defaultConfig } = useDefaultAvatar();

  // Use profile data first, then avatar configuration, then default
  const getAvatarDisplay = () => {
    // First priority: Custom uploaded thumbnail from avatar config
    if (avatarConfig?.thumbnail_url) {
      return avatarConfig.thumbnail_url;
    }
    // Second priority: avatar_url from profile (3D avatar model/preview, NOT profile picture)
    if (profileData?.avatar_url) {
      return profileData.avatar_url;
    }
    // Fallback: default avatar image
    return "/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png";
  };

  const getAvatarName = () => {
    if (avatarConfig?.avatar_name) return avatarConfig.avatar_name;
    if (defaultConfig?.avatar_name) return defaultConfig.avatar_name;
    if (profileData?.display_name) return profileData.display_name;
    return "Avatar";
  };

  return (
    <Card className={`${isLarge ? 'w-full max-w-md' : 'w-64'} bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 border-slate-600/30 overflow-hidden backdrop-blur-sm shadow-2xl`}>
      <div className="relative">
        <div className={`${isLarge ? 'h-80' : 'h-48'} bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-slate-900/20 flex items-center justify-center relative overflow-hidden`}>
          {/* Enhanced Avatar Display */}
          <div className={`${isLarge ? 'w-48 h-48' : 'w-32 h-32'} rounded-full bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-blue-500/30 border-4 border-blue-400/20`}>
            <img 
              src={getAvatarDisplay()} 
              alt={getAvatarName()} 
              className="w-full h-full object-cover transition-all duration-300"
            />
            {/* Enhanced Talking Indicator */}
            {isTalking && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-blue-400/80 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border-2 border-cyan-300/60 animate-ping"></div>
              </>
            )}
            
            {/* Avatar Configuration Visual Indicators */}
            {(avatarConfig || defaultConfig) && (
              <div className="absolute bottom-2 right-2 flex gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
              </div>
            )}
          </div>
          
          {/* Ambient Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-full blur-xl"></div>
        </div>
        
        {showControls && (
          <div className="absolute bottom-4 right-4">
            <Button
              size="sm"
              variant={isTalking ? "destructive" : "default"}
              className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-slate-700/90 to-slate-600/90 border-2 border-slate-500/50 shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-110"
              onClick={() => setIsTalking(!isTalking)}
            >
              {isTalking ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        )}
        
        {/* Avatar Info Overlay */}
        {isLarge && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-4">
            <p className="text-white/90 text-sm font-medium text-center">
              {getAvatarName()}
            </p>
            {(avatarConfig || defaultConfig) && (
              <p className="text-slate-300 text-xs text-center mt-1">
                Linked with Avatar Dashboard
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AvatarPreview;
