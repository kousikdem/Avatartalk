import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { 
  FaPinterest, 
  FaReddit, 
  FaTiktok, 
  FaSnapchat, 
  FaWhatsapp, 
  FaTelegram, 
  FaDiscord 
} from 'react-icons/fa';

interface SocialLinksProps {
  socialLinks: any;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ socialLinks }) => {
  const [showMoreSocial, setShowMoreSocial] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareOptions = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/sharer/sharer.php?u=', gradient: 'from-blue-500 to-blue-700' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/intent/tweet?url=', gradient: 'from-blue-400 to-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/sharing/share-offsite/?url=', gradient: 'from-blue-600 to-blue-800' },
    { name: 'Pinterest', icon: FaPinterest, url: 'https://pinterest.com/pin/create/button/?url=', gradient: 'from-red-500 to-pink-600' },
    { name: 'Reddit', icon: FaReddit, url: 'https://reddit.com/submit?url=', gradient: 'from-orange-500 to-red-600' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/', gradient: 'from-pink-500 via-purple-500 to-orange-400' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/', gradient: 'from-red-600 to-red-700' },
    { name: 'TikTok', icon: FaTiktok, url: 'https://tiktok.com/', gradient: 'from-gray-800 to-gray-900' },
    { name: 'Snapchat', icon: FaSnapchat, url: 'https://snapchat.com/', gradient: 'from-yellow-400 to-yellow-500' },
    { name: 'WhatsApp', icon: FaWhatsapp, url: 'https://wa.me/?text=', gradient: 'from-green-500 to-green-600' },
    { name: 'Telegram', icon: FaTelegram, url: 'https://t.me/share/url?url=', gradient: 'from-blue-400 to-blue-500' },
    { name: 'Discord', icon: FaDiscord, url: 'https://discord.com/', gradient: 'from-indigo-500 to-purple-600' },
  ];

  const handleShare = (platform: string, url: string) => {
    const shareUrl = `${url}${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 relative mt-1">
      {/* Main Social Icons */}
      <div className="flex gap-2">
        {[
          { icon: Twitter, url: socialLinks?.twitter, gradient: 'from-blue-400 to-blue-600' },
          { icon: Linkedin, url: socialLinks?.linkedin, gradient: 'from-blue-600 to-blue-800' },
          { icon: Facebook, url: socialLinks?.facebook, gradient: 'from-blue-500 to-blue-700' },
          { icon: Instagram, url: socialLinks?.instagram, gradient: 'from-pink-500 via-purple-500 to-orange-400' },
          { icon: Globe, url: socialLinks?.website, gradient: 'from-green-500 to-emerald-600' }
        ].map(({ icon: Icon, url, gradient }, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradient} text-white hover:scale-110 hover:shadow-lg transition-all duration-300 p-0`}
            onClick={() => url && window.open(url, '_blank')}
          >
            <Icon className="w-3 h-3" />
          </Button>
        ))}
      </div>

      {/* More Options Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMoreSocial(!showMoreSocial)}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:scale-110 hover:shadow-lg transition-all duration-300 p-0"
        >
          <MoreHorizontal className="w-3 h-3" />
        </Button>
        
        {showMoreSocial && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-xl z-10">
            <div className="flex flex-col gap-2 min-w-[120px]">
              <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 hover:text-red-500">
                <Youtube className="w-4 h-4" />
                YouTube
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-600/20 hover:text-pink-500">
                <FaPinterest className="w-4 h-4" />
                Pinterest
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-600/20 hover:text-orange-500">
                <FaReddit className="w-4 h-4" />
                Reddit
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-gray-800/20 hover:to-gray-900/20 hover:text-gray-300">
                <FaTiktok className="w-4 h-4" />
                TikTok
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Share Button with Zoom Effect */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-125 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:rotate-6 p-0"
        >
          <Share2 className="w-3 h-3" />
        </Button>
        
        {showShareMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-2xl z-20 min-w-[240px]">
            <div className="grid grid-cols-4 gap-2">
              {shareOptions.map(({ name, icon: Icon, url, gradient }) => (
                <Button
                  key={name}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(name, url)}
                  className={`flex flex-col items-center gap-1 p-2 h-auto rounded-lg bg-gradient-to-r ${gradient} text-white hover:scale-105 transition-all duration-300 hover:shadow-md`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};