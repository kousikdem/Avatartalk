import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FollowButtonProps {
  targetUserId: string;
  targetUsername?: string;
  currentUserId?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  targetUsername,
  currentUserId,
  variant = 'default',
  className = ''
}) => {
  const { toast } = useToast();
  const { isFollowing, followUser, unfollowUser, loading } = useFollows();

  // Don't show follow button for own profile
  if (currentUserId === targetUserId) {
    return null;
  }

  // Require real authentication for following
  if (!currentUserId) {
    return (
      <Button
        variant="outline"
        className={`${variant === 'compact' ? 'py-2 text-sm' : 'py-4 text-base'} rounded-2xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
        onClick={() => {
          // Trigger visitor auth popup
          window.dispatchEvent(new CustomEvent('show-visitor-auth'));
        }}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {variant === 'compact' ? 'Follow' : 'Login to Follow'}
      </Button>
    );
  }

  const handleFollowClick = async () => {
    try {
      if (isFollowing(targetUserId)) {
        await unfollowUser(targetUserId);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${targetUsername || 'user'}`,
        });
      } else {
        await followUser(targetUserId);
        toast({
          title: "Following",
          description: `You are now following ${targetUsername || 'user'}`,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const isUserFollowing = isFollowing(targetUserId);

  if (variant === 'compact') {
      return (
        <Button
          variant={isUserFollowing ? "default" : "outline"}
          size="sm"
          onClick={handleFollowClick}
          disabled={loading}
          className={`${
            isUserFollowing 
              ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-emerald-500/30' 
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-indigo-500/30'
          } transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isUserFollowing ? (
            <UserMinus className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isUserFollowing ? 'Following' : 'Follow'}
          </span>
        </Button>
      );
  }

  return (
    <Button
      variant={isUserFollowing ? "default" : "outline"}
      className={`py-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
        isUserFollowing 
          ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-emerald-500/30' 
          : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 border-0 text-white shadow-lg hover:shadow-indigo-500/30'
      } ${className}`}
      onClick={handleFollowClick}
      disabled={loading}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isUserFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isUserFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;