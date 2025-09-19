import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Copy, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import ShareModal from './ShareModal';

interface EnhancedShareButtonProps {
  profileUrl: string;
  username: string;
  displayName?: string;
  className?: string;
  variant?: 'gradient' | 'simple';
  showText?: boolean;
}

const EnhancedShareButton: React.FC<EnhancedShareButtonProps> = ({
  profileUrl,
  username,
  displayName,
  className = '',
  variant = 'gradient',
  showText = true
}) => {
  const [showQuickShare, setShowQuickShare] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const { toast } = useToast();

  const quickSharePlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800',
      action: () => shareToSocial('facebook')
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'from-blue-400 to-blue-500',
      hoverColor: 'hover:from-blue-500 hover:to-blue-600',
      action: () => shareToSocial('twitter')
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-700 to-blue-800',
      hoverColor: 'hover:from-blue-800 hover:to-blue-900',
      action: () => shareToSocial('linkedin')
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-500 to-rose-500',
      hoverColor: 'hover:from-pink-600 hover:to-rose-600',
      action: () => shareToSocial('instagram')
    },
    {
      name: 'Copy',
      icon: Copy,
      color: 'from-gray-600 to-gray-700',
      hoverColor: 'hover:from-gray-700 hover:to-gray-800',
      action: () => copyLink()
    }
  ];

  const shareToSocial = (platform: string) => {
    const text = `Check out ${displayName || username}'s AI avatar profile on AvatarTalk.bio!`;
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(text);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: `https://www.instagram.com`
    };
    
    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
    
    setShowQuickShare(false);
    toast({
      title: "Shared!",
      description: `Profile shared on ${platform}`,
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setShowQuickShare(false);
    toast({
      title: "Link Copied",
      description: "Profile link copied to clipboard!",
    });
  };

  if (variant === 'simple') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFullModal(true)}
          className={`text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          {showText && <span className="ml-2">Share</span>}
        </Button>
        
        <ShareModal
          isOpen={showFullModal}
          onClose={() => setShowFullModal(false)}
          profileUrl={profileUrl}
          username={username}
        />
      </>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setShowQuickShare(!showQuickShare)}
        className={`${
          variant === 'gradient'
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 text-white shadow-lg hover:shadow-xl border-0'
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
        } px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2`}
      >
        <Share2 className="h-4 w-4" />
        {showText && <span>Share Profile</span>}
      </Button>

      <AnimatePresence>
        {showQuickShare && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowQuickShare(false)}
            />
            
            {/* Quick Share Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-4 shadow-2xl z-50 min-w-[320px]"
            >
              <div className="text-sm font-semibold text-white mb-3 text-center">Quick Share</div>
              
              {/* Quick Share Buttons */}
              <div className="flex justify-center gap-2 mb-3">
                {quickSharePlatforms.map((platform) => (
                  <Button
                    key={platform.name}
                    onClick={platform.action}
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${platform.color} ${platform.hoverColor} text-white shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 p-0`}
                  >
                    <platform.icon className="w-5 h-5" />
                  </Button>
                ))}
              </div>
              
              {/* More Options Button */}
              <Button
                onClick={() => {
                  setShowQuickShare(false);
                  setShowFullModal(true);
                }}
                variant="outline"
                size="sm"
                className="w-full border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:text-white transition-all duration-200"
              >
                <QrCode className="w-4 h-4 mr-2" />
                More Options & QR Code
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShareModal
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        profileUrl={profileUrl}
        username={username}
      />
    </div>
  );
};

export default EnhancedShareButton;