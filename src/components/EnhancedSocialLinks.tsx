import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Facebook, 
  Youtube, 
  Globe, 
  MoreVertical,
  Share2,
  MessageCircle,
  Send,
  Camera,
  Music,
  MapPin,
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface SocialLink {
  name: string;
  icon: React.ComponentType<any>;
  url?: string;
  gradient: string;
  hoverGradient: string;
  visible?: boolean;
}

interface EnhancedSocialLinksProps {
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  profileUrl?: string;
  username?: string;
  displayName?: string;
  className?: string;
}

const EnhancedSocialLinks: React.FC<EnhancedSocialLinksProps> = ({
  socialLinks = {},
  profileUrl,
  username = '',
  displayName = '',
  className = ''
}) => {
  const [showMoreLinks, setShowMoreLinks] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { toast } = useToast();

  // Main 4 social links (shown by default)
  const mainSocialLinks: SocialLink[] = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: socialLinks.twitter,
      gradient: 'from-sky-500 to-blue-600',
      hoverGradient: 'hover:from-sky-600 hover:to-blue-700',
      visible: true
    },
    {
      name: 'Instagram', 
      icon: Instagram,
      url: socialLinks.instagram,
      gradient: 'from-pink-500 via-red-500 to-yellow-500',
      hoverGradient: 'hover:from-pink-600 hover:via-red-600 hover:to-yellow-600',
      visible: true
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: socialLinks.linkedin,
      gradient: 'from-blue-700 to-indigo-800',
      hoverGradient: 'hover:from-blue-800 hover:to-indigo-900',
      visible: true
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: socialLinks.facebook,
      gradient: 'from-blue-600 to-blue-800',
      hoverGradient: 'hover:from-blue-700 hover:to-blue-900',
      visible: true
    }
  ];

  // Additional social links (shown in dropdown)
  const moreSocialLinks: SocialLink[] = [
    {
      name: 'YouTube',
      icon: Youtube,
      url: socialLinks.youtube,
      gradient: 'from-red-500 to-red-700',
      hoverGradient: 'hover:from-red-600 hover:to-red-800'
    },
    {
      name: 'Website',
      icon: Globe,
      url: socialLinks.website,
      gradient: 'from-purple-500 to-indigo-600',
      hoverGradient: 'hover:from-purple-600 hover:to-indigo-700'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/${socialLinks.whatsapp || ''}`,
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-700'
    },
    {
      name: 'Telegram',
      icon: Send,
      url: `https://t.me/${socialLinks.telegram || ''}`,
      gradient: 'from-blue-400 to-cyan-500',
      hoverGradient: 'hover:from-blue-500 hover:to-cyan-600'
    },
    {
      name: 'TikTok',
      icon: Camera,
      url: socialLinks.tiktok,
      gradient: 'from-black to-gray-800',
      hoverGradient: 'hover:from-gray-800 hover:to-gray-900'
    },
    {
      name: 'Spotify',
      icon: Music,
      url: socialLinks.spotify,
      gradient: 'from-green-400 to-green-600',
      hoverGradient: 'hover:from-green-500 hover:to-green-700'
    },
    {
      name: 'Pinterest',
      icon: MapPin,
      url: socialLinks.pinterest,
      gradient: 'from-red-600 to-pink-600',
      hoverGradient: 'hover:from-red-700 hover:to-pink-700'
    },
    {
      name: 'Discord',
      icon: Gamepad2,
      url: socialLinks.discord,
      gradient: 'from-indigo-500 to-purple-600',
      hoverGradient: 'hover:from-indigo-600 hover:to-purple-700'
    }
  ];

  // Share options
  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      action: 'facebook',
      gradient: 'from-blue-600 to-blue-800',
      hoverGradient: 'hover:from-blue-700 hover:to-blue-900'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: 'twitter',
      gradient: 'from-sky-500 to-blue-600',
      hoverGradient: 'hover:from-sky-600 hover:to-blue-700'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: 'linkedin',
      gradient: 'from-blue-700 to-indigo-800',
      hoverGradient: 'hover:from-blue-800 hover:to-indigo-900'
    },
    {
      name: 'Pinterest',
      icon: MapPin,
      action: 'pinterest',
      gradient: 'from-red-600 to-pink-600',
      hoverGradient: 'hover:from-red-700 hover:to-pink-700'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: 'whatsapp',
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-700'
    },
    {
      name: 'Telegram',
      icon: Send,
      action: 'telegram',
      gradient: 'from-blue-400 to-cyan-500',
      hoverGradient: 'hover:from-blue-500 hover:to-cyan-600'
    }
  ];

  const handleSocialClick = (url?: string, name?: string) => {
    if (url && url.trim()) {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
      window.open(finalUrl, '_blank');
    } else {
      toast({
        title: "Link not available",
        description: `${name} link is not set up yet`,
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = profileUrl || window.location.href;
    const shareText = `Check out ${displayName || username}'s profile!`;

    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'pinterest':
          window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
          break;
        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
          break;
        default:
          break;
      }
      setShowShareMenu(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share failed",
        description: "Failed to share profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`${className}`}>
      {/* Main Social Links Row */}
      <div className="flex items-center justify-center space-x-3 relative">
        {/* First 4 social links */}
        {mainSocialLinks.map((social, index) => (
          <Button
            key={social.name}
            variant="ghost"
            size="sm"
            onClick={() => handleSocialClick(social.url, social.name)}
            className={`
              relative p-3 rounded-xl border-0
              bg-gradient-to-r ${social.gradient} ${social.hoverGradient}
              text-white shadow-md hover:shadow-lg
              transform hover:scale-110 transition-all duration-300
              group
            `}
          >
            <social.icon className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {social.name}
            </span>
          </Button>
        ))}

        {/* Three dots menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreLinks(!showMoreLinks)}
            className="
              relative p-3 rounded-xl border-0
              bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800
              text-white shadow-md hover:shadow-lg
              transform hover:scale-110 transition-all duration-300
            "
          >
            <MoreVertical className="w-5 h-5" />
          </Button>

          {/* More Social Links Dropdown */}
          <AnimatePresence>
            {showMoreLinks && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreLinks(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-3 right-0 z-50"
                >
                   <Card className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl min-w-[300px]">
                     <CardContent className="p-4">
                       <h4 className="text-sm font-medium text-white mb-3">More Social Links</h4>
                       <div className="grid grid-cols-2 gap-3">
                         {moreSocialLinks.map((social) => (
                           <Button
                             key={social.name}
                             variant="ghost"
                             size="sm"
                             onClick={() => {
                               handleSocialClick(social.url, social.name);
                               setShowMoreLinks(false);
                             }}
                             className={`
                               flex items-center justify-start gap-3 p-3 h-auto
                               bg-gradient-to-r ${social.gradient} ${social.hoverGradient}
                               text-white border-0 rounded-lg
                               transform hover:scale-105 transition-all duration-200
                               shadow-md hover:shadow-lg
                             `}
                           >
                             <social.icon className="w-4 h-4" />
                             <span className="text-sm font-medium">{social.name}</span>
                           </Button>
                         ))}
                       </div>
                     </CardContent>
                   </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Share Button with Animation */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="
              relative flex items-center gap-2 px-4 py-3 rounded-xl border-0
              bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 
              hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600
              text-white shadow-lg hover:shadow-xl
              transform hover:scale-110 transition-all duration-300
              animate-pulse hover:animate-none
              shadow-violet-500/25 hover:shadow-violet-500/40
            "
          >
            <Share2 className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Share Profile</span>
          </Button>

          {/* Share Menu */}
          <AnimatePresence>
            {showShareMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowShareMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-3 right-0 z-50"
                >
                   <Card className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl min-w-[320px]">
                     <CardContent className="p-4">
                       <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                         <Share2 className="w-4 h-4 text-violet-400" />
                         Share Profile
                       </h4>
                       <div className="grid grid-cols-2 gap-2">
                         {shareOptions.map((option) => (
                           <Button
                             key={option.action}
                             variant="ghost"
                             size="sm"
                             onClick={() => handleShare(option.action)}
                             className={`
                               flex items-center justify-start gap-2 p-3 h-auto
                               bg-gradient-to-r ${option.gradient} ${option.hoverGradient}
                               text-white border-0 rounded-lg
                               transform hover:scale-105 transition-all duration-200
                               shadow-md hover:shadow-lg
                             `}
                           >
                             <option.icon className="w-4 h-4" />
                             <span className="text-sm font-medium">{option.name}</span>
                           </Button>
                         ))}
                         {/* Copy Link Option */}
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             navigator.clipboard.writeText(profileUrl || window.location.href);
                             setShowShareMenu(false);
                             // Show toast if available
                           }}
                           className="
                             flex items-center justify-start gap-2 p-3 h-auto
                             bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700
                             text-white border-0 rounded-lg
                             transform hover:scale-105 transition-all duration-200
                             shadow-md hover:shadow-lg
                           "
                         >
                           <Share2 className="w-4 h-4" />
                           <span className="text-sm font-medium">Copy Link</span>
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSocialLinks;