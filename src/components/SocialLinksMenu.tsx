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
      color: 'from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700',
      url: socialLinks.website,
      key: 'website'
    },
    { 
      name: 'GitHub', 
      icon: Github, 
      color: 'from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800',
      url: socialLinks.github,
      key: 'github'
    },
    { 
      name: 'Dribbble', 
      icon: Palette, 
      color: 'from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500',
      url: socialLinks.dribbble,
      key: 'dribbble'
    },
    { 
      name: 'Twitch', 
      icon: Play, 
      color: 'from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700',
      url: socialLinks.twitch,
      key: 'twitch'
    },
    { 
      name: 'TikTok', 
      icon: Camera, 
      color: 'from-gray-900 to-black hover:from-gray-800 hover:to-gray-900',
      url: socialLinks.tiktok,
      key: 'tiktok'
    },
    { 
      name: 'Snapchat', 
      icon: Image, 
      color: 'from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500',
      url: socialLinks.snapchat,
      key: 'snapchat'
    },
    { 
      name: 'Discord', 
      icon: Music, 
      color: 'from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600',
      url: socialLinks.discord,
      key: 'discord'
    },
    { 
      name: 'Spotify', 
      icon: Headphones, 
      color: 'from-green-500 to-green-700 hover:from-green-400 hover:to-green-600',
      url: socialLinks.spotify,
      key: 'spotify'
    },
    { 
      name: 'SoundCloud', 
      icon: Music, 
      color: 'from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600',
      url: socialLinks.soundcloud,
      key: 'soundcloud'
    },
    { 
      name: 'Behance', 
      icon: Brush, 
      color: 'from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600',
      url: socialLinks.behance,
      key: 'behance'
    },
    { 
      name: 'Medium', 
      icon: PenTool, 
      color: 'from-gray-800 to-black hover:from-gray-700 hover:to-gray-900',
      url: socialLinks.medium,
      key: 'medium'
    },
    { 
      name: 'Pinterest', 
      icon: Link, 
      color: 'from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500',
      url: socialLinks.pinterest,
      key: 'pinterest'
    },
  ];

  return (
    <div className="relative">
      {/* Three Dots Button with Enhanced Styling */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMenuOpen(true)}
        className="p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-700 rounded-full transition-all duration-300 min-w-[48px] min-h-[48px] shadow-lg flex-shrink-0"
      >
        <MoreVertical className="h-5 w-5" />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 right-0 w-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 p-4 z-50 backdrop-blur-lg"
            >
              <div className="mb-3">
                <h4 className="text-white font-semibold text-sm mb-3">More Social Links</h4>
                <div className="grid grid-cols-4 gap-2">
                  {additionalSocialLinks.map((platform) => (
                    <motion.button
                      key={platform.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLinkClick(platform.url, platform.name)}
                      className={`
                        flex flex-col items-center gap-1 p-3 rounded-xl
                        bg-gradient-to-br ${platform.color} hover:shadow-lg 
                        transition-all duration-300 transform hover:scale-105
                        text-white shadow-md
                        ${!platform.url ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''}
                      `}
                      disabled={!platform.url}
                    >
                      <platform.icon className="w-5 h-5" />
                      <span className="text-xs font-medium truncate w-full text-center leading-tight">
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
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white border-0 font-medium py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialLinksMenu;