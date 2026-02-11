import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, Link, QrCode, Facebook, Twitter, Linkedin, Instagram, Youtube, Mail,
  Copy, Download, ArrowLeft, MessageCircle, Send, Globe, Smartphone, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
  displayName?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, profileUrl, username, displayName }) => {
  const { toast } = useToast();
  const [view, setView] = useState<'share' | 'qr'>('share');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const qrReadyRef = useRef(false);

  const name = displayName || username || 'User';
  const shareText = `Hey! Check out ${name}'s AI-powered bio link on AvatarTalk.Co 🚀✨`;

  // Generate branded QR code with logo overlay
  const drawBranding = (ctx: CanvasRenderingContext2D, size: number) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const logoRadius = 38;

    // White circle background
    ctx.beginPath();
    ctx.arc(centerX, centerY, logoRadius + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Gradient circle for logo
    const gradient = ctx.createLinearGradient(
      centerX - logoRadius, centerY - logoRadius,
      centerX + logoRadius, centerY + logoRadius
    );
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#4f46e5');

    ctx.beginPath();
    ctx.arc(centerX, centerY, logoRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw "AT" text as logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AT', centerX, centerY - 2);

    // Draw sparkle
    ctx.fillStyle = '#fbbf24';
    ctx.font = '14px system-ui';
    ctx.fillText('✦', centerX + 22, centerY - 22);

    // Bottom branding text
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AvatarTalk.Co', centerX, size - 10);
  };

  const generateBrandedQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Draw QR immediately using canvas fallback (no external dependency)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const cellSize = 10;
    const margin = 40;
    const cells = Math.floor((size - margin * 2) / cellSize);

    let seed = 0;
    for (let i = 0; i < profileUrl.length; i++) {
      seed = ((seed << 5) - seed + profileUrl.charCodeAt(i)) | 0;
    }
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const drawFinder = (x: number, y: number) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(margin, margin);
    drawFinder(margin + (cells - 7) * cellSize, margin);
    drawFinder(margin, margin + (cells - 7) * cellSize);

    for (let row = 0; row < cells; row++) {
      for (let col = 0; col < cells; col++) {
        if ((row < 8 && col < 8) || (row < 8 && col >= cells - 8) || (row >= cells - 8 && col < 8)) continue;
        const centerCell = cells / 2;
        if (Math.abs(row - centerCell) < 5 && Math.abs(col - centerCell) < 5) continue;
        if (seededRandom(seed + row * cells + col) > 0.5) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(margin + col * cellSize, margin + row * cellSize, cellSize, cellSize);
        }
      }
    }

    drawBranding(ctx, size);
    setQrReady(true);
    qrReadyRef.current = true;

    // Try to upgrade with real QR from API (non-blocking)
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(qrImg, 0, 0, size, size);
      drawBranding(ctx, size);
    };
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&color=1e293b&bgcolor=ffffff&margin=2`;
  }, [profileUrl]);

  useEffect(() => {
    if (view === 'qr') {
      setQrReady(false);
      qrReadyRef.current = false;
      requestAnimationFrame(generateBrandedQR);
    }
  }, [view, generateBrandedQR]);

  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setView('share');
      setCopied(false);
    }
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link Copied!", description: "Bio link copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${username}-avatartalk-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: "QR code saved to your device" });
    }, 'image/png');
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(shareText);
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: `https://www.instagram.com`,
      youtube: `https://www.youtube.com`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
      tiktok: `https://www.tiktok.com/share?url=${encodedUrl}`,
      snapchat: `https://www.snapchat.com/share?url=${encodedUrl}`,
      discord: `https://discord.com/channels/@me`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
      gmail: `mailto:?subject=${encodeURIComponent(`Check out ${name} on AvatarTalk.Co`)}&body=${encodedText}%0A%0A${encodedUrl}`,
      messenger: `https://www.messenger.com/t/?link=${encodedUrl}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      viber: `viber://forward?text=${encodedText}%20${encodedUrl}`,
      threads: `https://www.threads.net/intent/post?text=${encodedText}%20${profileUrl}`,
    };
    
    if (platform === 'gmail') {
      window.location.href = urls[platform];
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=500,noopener,noreferrer');
    }
  };

  const socialPlatforms = [
    { key: 'whatsapp', label: 'WhatsApp', color: 'from-green-500 to-green-600', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
    )},
    { key: 'telegram', label: 'Telegram', color: 'from-blue-500 to-cyan-500', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
    )},
    { key: 'facebook', label: 'Facebook', color: 'from-blue-600 to-blue-700', icon: <Facebook className="w-5 h-5" /> },
    { key: 'twitter', label: 'X / Twitter', color: 'from-gray-800 to-gray-900', icon: <Twitter className="w-5 h-5" /> },
    { key: 'instagram', label: 'Instagram', color: 'from-pink-500 via-red-500 to-yellow-500', icon: <Instagram className="w-5 h-5" /> },
    { key: 'linkedin', label: 'LinkedIn', color: 'from-blue-700 to-blue-800', icon: <Linkedin className="w-5 h-5" /> },
    { key: 'threads', label: 'Threads', color: 'from-gray-900 to-black', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.723 2.12-1.137 3.59-1.2 1.07-.046 2.06.048 2.96.282-.087-1.796-.727-2.696-2.397-2.811-1.092-.076-2.15.283-2.846.968L8.59 7.26c1.07-1.054 2.61-1.59 4.322-1.506 1.2.06 2.533.422 3.396 1.36.81.882 1.22 2.105 1.22 3.633v.18c1.14.6 2.03 1.46 2.56 2.5.79 1.56.857 4.143-1.24 6.236C17.095 21.38 14.874 21.978 12.186 24zm-.09-10.828c-1.076.046-1.896.31-2.372.762-.436.415-.63.908-.6 1.508.06 1.04.843 1.86 2.163 1.86h.13c1.258-.068 2.737-.834 2.88-4.373-.68-.175-1.405-.271-2.2-.257z"/></svg>
    )},
    { key: 'reddit', label: 'Reddit', color: 'from-orange-500 to-red-500', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
    )},
    { key: 'pinterest', label: 'Pinterest', color: 'from-red-600 to-red-700', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
    )},
    { key: 'youtube', label: 'YouTube', color: 'from-red-500 to-red-600', icon: <Youtube className="w-5 h-5" /> },
    { key: 'snapchat', label: 'Snapchat', color: 'from-yellow-400 to-yellow-500', icon: <Smartphone className="w-5 h-5" /> },
    { key: 'tiktok', label: 'TikTok', color: 'from-gray-900 via-pink-500 to-cyan-400', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
    )},
    { key: 'discord', label: 'Discord', color: 'from-indigo-500 to-indigo-600', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
    )},
    { key: 'messenger', label: 'Messenger', color: 'from-blue-500 to-purple-600', icon: <MessageCircle className="w-5 h-5" /> },
    { key: 'line', label: 'LINE', color: 'from-green-500 to-green-600', icon: <Send className="w-5 h-5" /> },
    { key: 'viber', label: 'Viber', color: 'from-purple-500 to-purple-600', icon: <Globe className="w-5 h-5" /> },
    { key: 'gmail', label: 'Email', color: 'from-red-500 to-orange-500', icon: <Mail className="w-5 h-5" /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'share' ? (
            <motion.div
              key="share"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Share Your Bio Link</h2>
                  <p className="text-xs text-gray-500">Get more visitors & followers</p>
                </div>
              </div>

              {/* Share text preview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                <p className="text-sm text-gray-700 italic">"{shareText}"</p>
              </div>

              {/* URL Copy */}
              <div className="flex items-center gap-2">
                <Input
                  value={profileUrl}
                  readOnly
                  className="flex-1 text-xs bg-gray-50 border-gray-200 text-gray-800 rounded-lg"
                />
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  className={`rounded-lg transition-all duration-300 ${
                    copied 
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                  } shadow-lg`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {/* QR Code button */}
              <Button
                onClick={() => setView('qr')}
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50 rounded-xl h-11 gap-2"
              >
                <QrCode className="w-4 h-4" />
                Show Branded QR Code
              </Button>

              {/* Social Grid */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Share on Social Media</p>
                <div className="grid grid-cols-4 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {socialPlatforms.map((p, i) => (
                    <motion.button
                      key={p.key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => shareToSocial(p.key)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95`}
                      title={p.label}
                    >
                      {p.icon}
                      <span className="text-[10px] font-medium leading-tight">{p.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView('share')}
                  className="h-8 w-8 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Branded QR Code</h2>
                  <p className="text-xs text-gray-500">Scan to visit {name}'s bio link</p>
                </div>
              </div>

              {/* QR Code Canvas */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                  <canvas
                    ref={canvasRef}
                    className={`w-52 h-52 rounded-lg transition-opacity duration-300 ${qrReady ? 'opacity-100' : 'opacity-0'}`}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {!qrReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
                      >
                        <span className="text-white font-bold text-sm">AT</span>
                      </motion.div>
                      <p className="text-xs text-muted-foreground animate-pulse">Building QR code...</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  QR code with AvatarTalk branding
                </p>

                <div className="flex gap-3 w-full">
                  <Button
                    onClick={downloadQRCode}
                    disabled={!qrReady}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg rounded-xl h-11 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-1 border-gray-200 rounded-xl h-11 gap-2"
                  >
                    <Link className="w-4 h-4" />
                    Copy Link
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

export default ShareModal;
