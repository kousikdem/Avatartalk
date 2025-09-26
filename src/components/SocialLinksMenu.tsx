import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Link, 
  Globe, 
  Github,
  Palette,
  Play,
  Camera,
  Image,
  Music,
  Headphones,
  Brush,
  PenTool,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface SocialLinksMenuProps {
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    pinterest?: string;
    github?: string;
    dribbble?: string;
    twitch?: string;
    tiktok?: string;
    snapchat?: string;
    discord?: string;
    spotify?: string;
    soundcloud?: string;
    behance?: string;
    medium?: string;
  };
  onShare?: () => void;
}

const SocialLinksMenu: React.FC<SocialLinksMenuProps> = ({ 
  socialLinks = {}, 
  onShare 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleLinkClick = (url?: string, platform?: string) => {
    if (!url) {
      toast({
        title: "Link Not Available",
        description: `${platform} link is not set up yet`,
        variant: "destructive",
      });
      return;
    }
    
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    setIsMenuOpen(false);
  };

  const additionalSocialLinks = [
    { 
      name: 'Website', 
      icon: Globe, 
      color: 'from-slate-600 to-slate-800',
      url: socialLinks.website,
      key: 'website'
    },
    { 
      name: 'GitHub', 
      icon: Github, 
      color: 'from-gray-700 to-gray-900',
      url: socialLinks.github,
      key: 'github'
    },
    { 
      name: 'Dribbble', 
      icon: Palette, 
      color: 'from-pink-500 to-rose-600',
      url: socialLinks.dribbble,
      key: 'dribbble'
    },
    { 
      name: 'Twitch', 
      icon: Play, 
      color: 'from-purple-600 to-purple-800',
      url: socialLinks.twitch,
      key: 'twitch'
    },
    { 
      name: 'TikTok', 
      icon: Camera, 
      color: 'from-black to-gray-800',
      url: socialLinks.tiktok,
      key: 'tiktok'
    },
    { 
      name: 'Snapchat', 
      icon: Image, 
      color: 'from-yellow-400 to-yellow-600',
      url: socialLinks.snapchat,
      key: 'snapchat'
    },
    { 
      name: 'Discord', 
      icon: Music, 
      color: 'from-indigo-600 to-purple-700',
      url: socialLinks.discord,
      key: 'discord'
    },
    { 
      name: 'Spotify', 
      icon: Headphones, 
      color: 'from-green-500 to-green-700',
      url: socialLinks.spotify,
      key: 'spotify'
    },
    { 
      name: 'SoundCloud', 
      icon: Music, 
      color: 'from-orange-500 to-orange-700',
      url: socialLinks.soundcloud,
      key: 'soundcloud'
    },
    { 
      name: 'Behance', 
      icon: Brush, 
      color: 'from-blue-600 to-indigo-700',
      url: socialLinks.behance,
      key: 'behance'
    },
    { 
      name: 'Medium', 
      icon: PenTool, 
      color: 'from-gray-800 to-black',
      url: socialLinks.medium,
      key: 'medium'
    },
    { 
      name: 'Pinterest', 
      icon: Link, 
      color: 'from-red-500 to-pink-600',
      url: socialLinks.pinterest,
      key: 'pinterest'
    },
  ];

  return (
    <div className="relative">
      {/* Three Dots Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2.5 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 rounded-full transition-all duration-300 min-w-[44px] shadow-lg hover:shadow-purple-500/30"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {/* Share Button with Text */}
      <Button
        variant="ghost" 
        size="sm"
        onClick={() => {
          onShare?.();
          setIsMenuOpen(false);
        }}
        className="px-3 py-2.5 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 rounded-full transition-all duration-300 ml-2 shadow-lg hover:shadow-green-500/30 flex items-center gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        <span className="text-xs font-medium">Share</span>
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 right-0 w-72 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 p-4 z-50 backdrop-blur-lg"
          >
            <div className="mb-3">
              <h4 className="text-white font-semibold text-sm mb-2">More Social Links</h4>
              <div className="grid grid-cols-3 gap-2">
                {additionalSocialLinks.map((platform) => (
                  <motion.button
                    key={platform.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLinkClick(platform.url, platform.name)}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg
                      bg-gradient-to-br ${platform.color}
                      text-white hover:shadow-lg transition-all duration-200
                      ${!platform.url ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={!platform.url}
                  >
                    <platform.icon className="w-4 h-4" />
                    <span className="text-xs font-medium truncate w-full text-center">
                      {platform.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-700/50 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onShare?.();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white border-0 font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialLinksMenu;