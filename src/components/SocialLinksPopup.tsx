import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Globe,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialLinksPopupProps {
  isOpen: boolean;
  onClose: () => void;
  socialLinks: any;
}

const SocialLinksPopup: React.FC<SocialLinksPopupProps> = ({ 
  isOpen, 
  onClose, 
  socialLinks 
}) => {
  const openLink = (url: string | null) => {
    if (!url) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank');
  };

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: Twitter,
      link: socialLinks?.twitter,
      color: 'from-sky-400 via-blue-500 to-indigo-600',
      hoverColor: 'hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700',
      shadowColor: 'shadow-sky-400/30'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      link: socialLinks?.linkedin,
      color: 'from-blue-500 via-blue-600 to-indigo-700',
      hoverColor: 'hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800',
      shadowColor: 'shadow-blue-500/30'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      link: socialLinks?.facebook,
      color: 'from-blue-600 via-indigo-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800',
      shadowColor: 'shadow-blue-600/30'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      link: socialLinks?.instagram,
      color: 'from-pink-500 via-red-500 to-yellow-500',
      hoverColor: 'hover:from-pink-600 hover:via-red-600 hover:to-yellow-600',
      shadowColor: 'shadow-pink-500/30'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      link: socialLinks?.youtube,
      color: 'from-red-500 via-red-600 to-red-700',
      hoverColor: 'hover:from-red-600 hover:via-red-700 hover:to-red-800',
      shadowColor: 'shadow-red-500/30'
    },
    {
      name: 'Website',
      icon: Globe,
      link: socialLinks?.website,
      color: 'from-emerald-500 via-teal-600 to-cyan-700',
      hoverColor: 'hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-800',
      shadowColor: 'shadow-emerald-500/30'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Popup Menu */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
          >
            <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-blue-950/50 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Social Links</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Social Links Grid */}
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform, index) => (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => openLink(platform.link)}
                      disabled={!platform.link}
                      className={`w-full h-16 bg-gradient-to-br ${platform.color} ${platform.hoverColor} text-white rounded-2xl transition-all duration-300 shadow-lg ${platform.shadowColor} flex items-center justify-start gap-3 px-4 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 border-0`}
                    >
                      <platform.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium truncate">{platform.name}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Close Button */}
              <Button
                onClick={onClose}
                className="w-full mt-4 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-2xl py-3 border border-slate-600/30"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SocialLinksPopup;
