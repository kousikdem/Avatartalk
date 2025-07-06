
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Share2, Link, Download, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, profileUrl, username }) => {
  const { toast } = useToast();
  const [qrCodeUrl] = useState(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`);

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
      tiktok: `https://www.tiktok.com`,
      snapchat: `https://www.snapchat.com`,
      discord: `https://discord.com`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${username}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "QR code has been downloaded to your device.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white text-center mb-6 text-xl font-bold">
            Share Your Avatar Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* URL Copy Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Link</label>
            <div className="flex items-center gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="flex-1 text-xs bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white"
              />
              <Button 
                onClick={copyToClipboard} 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300"
              >
                <Link className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">QR Code</label>
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
              <Button 
                onClick={downloadQRCode}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-2" />
                Download QR Code
              </Button>
            </div>
          </div>

          {/* Social Media Share with Large Gradient Icons */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Share on Social Media</label>
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Facebook className="w-8 h-8" />
                <span className="text-xs font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Twitter className="w-8 h-8" />
                <span className="text-xs font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => shareToSocial('instagram')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Instagram className="w-8 h-8" />
                <span className="text-xs font-medium">Instagram</span>
              </button>
              
              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Linkedin className="w-8 h-8" />
                <span className="text-xs font-medium">LinkedIn</span>
              </button>
              
              <button
                onClick={() => shareToSocial('youtube')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Youtube className="w-8 h-8" />
                <span className="text-xs font-medium">YouTube</span>
              </button>
              
              <button
                onClick={() => shareToSocial('pinterest')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm0 19c-.68 0-1.35-.09-1.99-.27.28-.44.78-1.28.78-1.28s.2.38.62.38c2.97 0 5.02-2.77 5.02-6.12 0-2.65-2.23-4.63-5.19-4.63-3.72 0-6.49 2.67-6.49 6.16 0 1.51.57 2.86 1.8 3.36.2.08.38 0 .44-.22.04-.16.14-.56.18-.73.06-.23.03-.31-.11-.51-.31-.43-.51-.99-.51-1.78 0-2.3 1.72-4.36 4.47-4.36 2.44 0 3.78 1.49 3.78 3.48 0 2.61-1.16 4.81-2.88 4.81-1.03 0-1.8-.85-1.55-1.89.3-1.24 1.04-2.58 1.04-3.47 0-.8-.43-1.47-1.32-1.47-1.05 0-1.89.86-1.89 2.01 0 .73.25 1.23.25 1.23l-1.02 4.33c-.3 1.29-.05 2.87-.02 3.03.02.09.12.11.17.04.07-.1.98-1.22 1.34-2.47.1-.35.56-2.18.56-2.18.28.53 1.1 1 1.97 1 2.6 0 4.36-2.37 4.36-5.54C17.15 5.5 14.95 3.5 12 3.5z"/>
                </svg>
                <span className="text-xs font-medium">Pinterest</span>
              </button>
              
              <button
                onClick={() => shareToSocial('whatsapp')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span className="text-xs font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={() => shareToSocial('telegram')}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-xs font-medium">Telegram</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
