import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  following?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface UseFollowsReturn {
  followers: Follow[];
  following: Follow[];
  loading: boolean;
  followUser: (followingId: string) => Promise<void>;
  unfollowUser: (followingId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  refetch: () => Promise<void>;
}

export const useFollows = (userId?: string): UseFollowsReturn => {
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFollows = async (targetUserId?: string) => {
    try {
      const currentUser = await supabase.auth.getUser();
      const queryUserId = targetUserId || currentUser.data.user?.id;
      
      if (!queryUserId) return;

      // Fetch followers
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select(`
          *,
          follower:profiles!follows_follower_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('following_id', queryUserId);

      if (followersError) throw followersError;

      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select(`
          *,
          following:profiles!follows_following_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('follower_id', queryUserId);

      if (followingError) throw followingError;

      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error) {
      console.error('Error fetching follows:', error);
      toast({
        title: "Error",
        description: "Failed to load follow data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (followingId: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Error",
          description: "You must be logged in to follow users",
          variant: "destructive",
        });
        return;
      }

      // Prevent following yourself
      if (currentUser.user.id === followingId) {
        toast({
          title: "Error",
          description: "You cannot follow yourself",
          variant: "destructive",
        });
        return;
      }

      // Check if already following
      if (isFollowing(followingId)) {
        toast({
          title: "Info",
          description: "You are already following this user",
        });
        return;
      }

      const { error } = await supabase
        .from('follows')
        .insert([
          {
            follower_id: currentUser.user.id,
            following_id: followingId,
          },
        ]);

      if (error) {
        // Handle duplicate follow error
        if (error.code === '23505') {
          toast({
            title: "Info",
            description: "You are already following this user",
          });
          await fetchFollows();
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Successfully followed user",
      });

      await fetchFollows();
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const unfollowUser = async (followingId: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Error",
          description: "You must be logged in to unfollow users",
          variant: "destructive",
        });
        return;
      }

      // Check if not following
      if (!isFollowing(followingId)) {
        toast({
          title: "Info",
          description: "You are not following this user",
        });
        return;
      }

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.user.id)
        .eq('following_id', followingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully unfollowed user",
      });

      await fetchFollows();
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const isFollowing = (targetUserId: string): boolean => {
    return following.some(follow => follow.following_id === targetUserId);
  };

  const refetch = async () => {
    setLoading(true);
    await fetchFollows(userId);
  };

  useEffect(() => {
    fetchFollows(userId);

    // Set up realtime subscription for follows
    const currentUserId = userId || supabase.auth.getUser().then(u => u.data.user?.id);
    
    Promise.resolve(currentUserId).then(uid => {
      if (!uid) return;

      const channel = supabase
        .channel('follows-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follows',
            filter: `follower_id=eq.${uid}`
          },
          () => fetchFollows(userId)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follows',
            filter: `following_id=eq.${uid}`
          },
          () => fetchFollows(userId)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [userId]);

  return {
    followers,
    following,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    refetch,
  };
};