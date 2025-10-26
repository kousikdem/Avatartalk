import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Twitter, Linkedin, Facebook, Instagram, Youtube, Globe, Share2, Github, Twitch, Music, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialLinksPopupProps {
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    tiktok?: string;
    github?: string;
    twitch?: string;
    discord?: string;
  };
  onShare?: () => void;
}

const SocialLinksPopup: React.FC<SocialLinksPopupProps> = ({ socialLinks, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (url?: string, platform?: string) => {
    if (!url) {
      return;
    }
    
    // Format URL if needed
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    
    window.open(formattedUrl, '_blank');
  };

  const socialPlatforms = [
    { name: 'Twitter', icon: Twitter, url: socialLinks?.twitter, color: 'bg-blue-400 hover:bg-blue-500' },
    { name: 'LinkedIn', icon: Linkedin, url: socialLinks?.linkedin, color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Facebook', icon: Facebook, url: socialLinks?.facebook, color: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Instagram', icon: Instagram, url: socialLinks?.instagram, color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' },
    { name: 'Youtube', icon: Youtube, url: socialLinks?.youtube, color: 'bg-red-600 hover:bg-red-700' },
    { name: 'TikTok', icon: Music, url: socialLinks?.tiktok, color: 'bg-black hover:bg-gray-900' },
    { name: 'GitHub', icon: Github, url: socialLinks?.github, color: 'bg-gray-800 hover:bg-gray-900' },
    { name: 'Twitch', icon: Twitch, url: socialLinks?.twitch, color: 'bg-purple-600 hover:bg-purple-700' },
    { name: 'Discord', icon: MessageCircle, url: socialLinks?.discord, color: 'bg-indigo-600 hover:bg-indigo-700' },
    { name: 'Website', icon: Globe, url: socialLinks?.website, color: 'bg-gray-600 hover:bg-gray-700' },
  ].filter(platform => platform.url);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="h-5 w-5 text-gray-700 dark:text-white" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Popup Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 min-w-[200px]"
            >
              <div className="space-y-2">
                {socialPlatforms.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Social Links
                    </div>
                    {socialPlatforms.map((platform) => (
                      <button
                        key={platform.name}
                        onClick={() => handleLinkClick(platform.url, platform.name)}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.color} shadow-sm group-hover:shadow-md transition-all duration-200`}>
                          <platform.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {platform.name}
                        </span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No social links available
                  </div>
                )}

                {onShare && (
                  <>
                    <div className="border-t border-gray-200 my-2" />
                    <button
                      onClick={() => {
                        onShare();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                        <Share2 className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Share Profile
                      </span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialLinksPopup;
