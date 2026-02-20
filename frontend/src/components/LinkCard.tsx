import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Share2 } from 'lucide-react';

interface LinkCardProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  onShare?: () => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  url,
  title,
  description,
  image,
  onShare
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        onShare?.();
      }
    } else {
      onShare?.();
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 p-4 hover:bg-slate-800/70 transition-colors">
      <div className="flex gap-3">
        {image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{title}</h3>
          {description && (
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs border-slate-600 text-slate-300"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Visit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs border-slate-600 text-slate-300"
              onClick={handleShare}
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};