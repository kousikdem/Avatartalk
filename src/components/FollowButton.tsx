import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  targetUserId: string;
  targetUsername?: string;
  targetDisplayName?: string;
  currentUserId?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  targetUsername,
  targetDisplayName,
  currentUserId,
  className = '',
  variant = 'default'
}) => {
  const { toast } = useToast();
  const {
    isFollowing,
    followUser,
    unfollowUser,
    loading: followsLoading,
    refetch
  } = useFollows();

  if (!currentUserId || currentUserId === targetUserId) {
    return null;
  }

  const handleFollow = async () => {
    try {
      if (isFollowing(targetUserId)) {
        await unfollowUser(targetUserId);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${targetDisplayName || targetUsername || 'user'}`,
        });
      } else {
        await followUser(targetUserId);
        toast({
          title: "Following",
          description: `You are now following ${targetDisplayName || targetUsername || 'user'}`,
        });
      }
      await refetch();
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const isFollowingUser = isFollowing(targetUserId);

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFollow}
        disabled={followsLoading}
        className={`p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 ${className}`}
      >
        {followsLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowingUser ? (
          <UserCheck className="w-4 h-4 text-green-500" />
        ) : (
          <UserPlus className="w-4 h-4 text-slate-400 hover:text-purple-400" />
        )}
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        variant={isFollowingUser ? "default" : "outline"}
        size="sm"
        onClick={handleFollow}
        disabled={followsLoading}
        className={`${
          isFollowingUser 
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0 text-white'
        } ${className}`}
      >
        {followsLoading ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <Users className="w-3 h-3 mr-1" />
        )}
        {isFollowingUser ? 'Following' : 'Follow'}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowingUser ? "default" : "outline"}
      onClick={handleFollow}
      disabled={followsLoading}
      className={`${
        isFollowingUser 
          ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl' 
          : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl'
      } py-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {followsLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Users className="h-4 w-4" />
      )}
      {isFollowingUser ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;