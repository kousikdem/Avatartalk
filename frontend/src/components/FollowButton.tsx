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
  const [optimisticFollowing, setOptimisticFollowing] = React.useState<boolean | null>(null);
  
  // Only initialize useFollows if user is authenticated
  const followsHook = useFollows(currentUserId);
  const { isFollowing, followUserOptimistic, unfollowUserOptimistic, loading } = currentUserId ? followsHook : {
    isFollowing: () => false,
    followUserOptimistic: async () => {},
    unfollowUserOptimistic: async () => {},
    loading: false
  };

  // Don't show follow button for own profile
  if (currentUserId === targetUserId) {
    return null;
  }

  // Require real authentication for following
  if (!currentUserId) {
    return (
      <Button
        variant="outline"
        className={`${variant === 'compact' ? 'py-2 text-sm' : 'py-4 text-base'} rounded-2xl font-semibold bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white border-0 shadow-lg hover:shadow-gray-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('show-visitor-auth'));
        }}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {variant === 'compact' ? 'Follow' : 'Login to Follow'}
      </Button>
    );
  }

  const handleFollowClick = async () => {
    if (!currentUserId) {
      window.dispatchEvent(new CustomEvent('show-visitor-auth'));
      return;
    }
    
    const wasFollowing = optimisticFollowing ?? isFollowing(targetUserId);
    
    // Instant optimistic update
    setOptimisticFollowing(!wasFollowing);
    
    try {
      if (wasFollowing) {
        await unfollowUserOptimistic(targetUserId);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${targetUsername || 'user'}`,
        });
      } else {
        await followUserOptimistic(targetUserId);
        toast({
          title: "Following",
          description: `You are now following ${targetUsername || 'user'}`,
        });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setOptimisticFollowing(wasFollowing);
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update follow status.",
        variant: "destructive",
      });
    }
  };

  // Use optimistic state if set, otherwise use actual state
  const isUserFollowing = optimisticFollowing ?? isFollowing(targetUserId);
  
  // Reset optimistic state when actual state catches up
  React.useEffect(() => {
    if (optimisticFollowing !== null && isFollowing(targetUserId) === optimisticFollowing) {
      setOptimisticFollowing(null);
    }
  }, [isFollowing, targetUserId, optimisticFollowing]);

  if (variant === 'compact') {
      return (
        <Button
          variant={isUserFollowing ? "default" : "outline"}
          size="sm"
          onClick={handleFollowClick}
          disabled={loading}
          className={`${
            isUserFollowing 
              ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-green-500/30' 
              : 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-white border-0 shadow-lg hover:shadow-primary/30'
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
          ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-green-500/30' 
          : 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 border-0 text-white shadow-lg hover:shadow-primary/30'
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