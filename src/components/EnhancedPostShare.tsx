import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPostShareProps {
  postId: string;
  postContent: string;
  postUrl?: string;
  className?: string;
}

const socialPlatforms = [
  {
    name: 'Copy Link',
    icon: Copy,
    action: 'copy',
    gradient: 'from-gray-500 to-gray-700',
    hoverGradient: 'hover:from-gray-600 hover:to-gray-800'
  },
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

const EnhancedPostShare: React.FC<EnhancedPostShareProps> = ({
  postId,
  postContent,
  postUrl,
  className = ''
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { toast } = useToast();

  const shareUrl = postUrl || `${window.location.origin}/post/${postId}`;
  const shareText = postContent.length > 100 ? `${postContent.substring(0, 100)}...` : postContent;

  const handleShare = async (platform: string) => {
    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copied!",
            description: "Post link copied to clipboard",
          });
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
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
        description: "Failed to share post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-all duration-200 hover:scale-110"
      >
        <Share2 className="w-5 h-5" />
        <span>Share</span>
      </Button>

      <AnimatePresence>
        {showShareMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowShareMenu(false)}
            />
            
            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 right-0 z-50"
            >
              <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl min-w-[200px]">
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {socialPlatforms.map((platform) => (
                      <Button
                        key={platform.action}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(platform.action)}
                        className={`
                          flex items-center justify-center gap-2 p-3 h-auto
                          bg-gradient-to-r ${platform.gradient} ${platform.hoverGradient}
                          text-white border-0 rounded-lg
                          transform hover:scale-105 transition-all duration-200
                          shadow-md hover:shadow-lg
                        `}
                      >
                        <platform.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{platform.name}</span>
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
  );
};

export default EnhancedPostShare;