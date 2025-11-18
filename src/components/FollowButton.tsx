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
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Only initialize useFollows if user is authenticated
  const followsHook = useFollows(currentUserId);
  const { isFollowing, followUser, unfollowUser, loading, refetch } = currentUserId ? followsHook : {
    isFollowing: () => false,
    followUser: async () => {},
    unfollowUser: async () => {},
    loading: false,
    refetch: async () => {}
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
    // Debounce: Prevent rapid clicks
    if (isProcessing || loading) return;
    
    if (!currentUserId) {
      window.dispatchEvent(new CustomEvent('show-visitor-auth'));
      return;
    }
    
    setIsProcessing(true);
    const wasFollowing = isFollowing(targetUserId);
    
    try {
      if (wasFollowing) {
        await unfollowUser(targetUserId);
        
        // Update profile follower count
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('followers_count')
          .eq('id', targetUserId)
          .single();
          
        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ followers_count: Math.max(0, (currentProfile.followers_count || 1) - 1) })
            .eq('id', targetUserId);
        }
        
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${targetUsername || 'user'}`,
        });
      } else {
        await followUser(targetUserId);
        
        // Update profile follower count
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('followers_count')
          .eq('id', targetUserId)
          .single();
          
        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ followers_count: (currentProfile.followers_count || 0) + 1 })
            .eq('id', targetUserId);
        }
        
        // Update current user's following count
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('following_count')
          .eq('id', currentUserId)
          .single();
          
        if (myProfile) {
          await supabase
            .from('profiles')
            .update({ following_count: (myProfile.following_count || 0) + 1 })
            .eq('id', currentUserId);
        }
        
        toast({
          title: "Following",
          description: `You are now following ${targetUsername || 'user'}`,
        });
      }
      
      // Refetch to update button state
      await refetch();
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Rollback optimistic update by refetching current state
      await refetch();
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset processing state after 1 second to prevent spam
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const isUserFollowing = isFollowing(targetUserId);

  if (variant === 'compact') {
      return (
        <Button
          variant={isUserFollowing ? "default" : "outline"}
          size="sm"
          onClick={handleFollowClick}
          disabled={loading || isProcessing}
          className={`${
            isUserFollowing 
              ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-red-500/30' 
              : 'bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white border-0 shadow-lg hover:shadow-gray-500/30'
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
          ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-red-500/30' 
          : 'bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 border-0 text-white shadow-lg hover:shadow-gray-500/30'
      } ${className}`}
      onClick={handleFollowClick}
      disabled={loading || isProcessing}
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