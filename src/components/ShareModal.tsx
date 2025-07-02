import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Share2, Link, QrCode, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, profileUrl, username }) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link Copied",
      description: "Profile link copied to clipboard!",
    });
  };

  const shareToSocial = (platform: string) => {
    const text = `Check out my AI avatar profile on AvatarTalk.bio!`;
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(text);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: `https://www.instagram.com`,
      youtube: `https://www.youtube.com`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md neo-card border-0">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center mb-4">
            Share Your Avatar Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* URL Copy Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Profile Link</label>
            <div className="flex items-center gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="neo-input flex-1 text-xs"
              />
              <Button onClick={copyToClipboard} size="sm" className="neo-button-primary">
                <Link className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <Button 
              onClick={generateQRCode}
              variant="outline" 
              className="neo-button-secondary"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>

          {/* Social Media Share */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Share on Social Media</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => shareToSocial('facebook')}
                className="neo-button-secondary flex items-center gap-2 text-xs"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('twitter')}
                className="neo-button-secondary flex items-center gap-2 text-xs"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('linkedin')}
                className="neo-button-secondary flex items-center gap-2 text-xs"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('instagram')}
                className="neo-button-secondary flex items-center gap-2 text-xs"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('youtube')}
                className="neo-button-secondary flex items-center gap-2 text-xs"
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('pinterest')}
                className="neo-button-secondary flex items-center gap-2 text-xs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm0 19c-.68 0-1.35-.09-1.99-.27.28-.44.78-1.28.78-1.28s.2.38.62.38c2.97 0 5.02-2.77 5.02-6.12 0-2.65-2.23-4.63-5.19-4.63-3.72 0-6.49 2.67-6.49 6.16 0 1.51.57 2.86 1.8 3.36.2.08.38 0 .44-.22.04-.16.14-.56.18-.73.06-.23.03-.31-.11-.51-.31-.43-.51-.99-.51-1.78 0-2.3 1.72-4.36 4.47-4.36 2.44 0 3.78 1.49 3.78 3.48 0 2.61-1.16 4.81-2.88 4.81-1.03 0-1.8-.85-1.55-1.89.3-1.24 1.04-2.58 1.04-3.47 0-.8-.43-1.47-1.32-1.47-1.05 0-1.89.86-1.89 2.01 0 .73.25 1.23.25 1.23l-1.02 4.33c-.3 1.29-.05 2.87-.02 3.03.02.09.12.11.17.04.07-.1.98-1.22 1.34-2.47.1-.35.56-2.18.56-2.18.28.53 1.1 1 1.97 1 2.6 0 4.36-2.37 4.36-5.54C17.15 5.5 14.95 3.5 12 3.5z"/>
                </svg>
                Pinterest
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;