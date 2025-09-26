import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Link, 
  QrCode, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Mail,
  MessageCircle,
  Send,
  Copy,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title?: string;
  description?: string;
  type?: 'profile' | 'post';
}

const EnhancedShareModal: React.FC<EnhancedShareModalProps> = ({ 
  isOpen, 
  onClose, 
  shareUrl, 
  title = 'Check this out!',
  description = 'Take a look at this awesome content',
  type = 'profile'
}) => {
  const { toast } = useToast();
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'reddit':
        shareLink = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'pinterest':
        shareLink = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'noopener,noreferrer');
    toast({
      title: "Opening Share",
      description: `Opening ${platform} to share`,
    });
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${type}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "QR Code Downloaded",
        description: "QR code saved to your device",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const socialPlatforms = [
    { name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-800', key: 'facebook' },
    { name: 'Twitter/X', icon: Twitter, color: 'from-sky-500 to-blue-600', key: 'twitter' },
    { name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-900', key: 'linkedin' },
    { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600', key: 'instagram' },
    { name: 'WhatsApp', icon: MessageCircle, color: 'from-green-500 to-green-700', key: 'whatsapp' },
    { name: 'Telegram', icon: Send, color: 'from-blue-500 to-cyan-600', key: 'telegram' },
    { name: 'Reddit', icon: Share2, color: 'from-orange-500 to-red-600', key: 'reddit' },
    { name: 'Pinterest', icon: Share2, color: 'from-red-500 to-pink-600', key: 'pinterest' },
    { name: 'Email', icon: Mail, color: 'from-gray-600 to-gray-800', key: 'email' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share {type === 'profile' ? 'Profile' : 'Post'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showQRCode ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* URL Copy Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-slate-800 border-slate-600 text-white flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className={`border-slate-600 text-white hover:bg-slate-700 ${
                      copied ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQRCode(true)}
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Social Media Grid */}
              <div className="space-y-3">
                <h4 className="font-medium text-white">Share on social media</h4>
                <div className="grid grid-cols-3 gap-3">
                  {socialPlatforms.map((platform) => (
                    <motion.button
                      key={platform.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => shareToSocial(platform.key)}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-lg
                        bg-gradient-to-br ${platform.color}
                        text-white hover:shadow-lg transition-all duration-200
                      `}
                    >
                      <platform.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{platform.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center space-y-4"
            >
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Scan this QR code to visit the {type}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQRCode(false)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedShareModal;