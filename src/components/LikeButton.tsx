
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';

interface LikeButtonProps {
  itemId: string;
  itemType: 'post' | 'profile';
  showCount?: boolean;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  itemId,
  itemType,
  showCount = true,
  className = ""
}) => {
  const { likesCount, isLiked, loading, toggleLike } = useLikes(itemId, itemType);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center space-x-1 ${className}`}
    >
      <Heart 
        className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
      />
      {showCount && <span className="text-sm">{likesCount}</span>}
    </Button>
  );
};

export default LikeButton;
