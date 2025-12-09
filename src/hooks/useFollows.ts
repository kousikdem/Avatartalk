import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    profile_pic_url?: string;
  };
  following?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    profile_pic_url?: string;
  };
}

interface UseFollowsReturn {
  followers: Follow[];
  following: Follow[];
  loading: boolean;
  followUser: (followingId: string) => Promise<void>;
  unfollowUser: (followingId: string) => Promise<void>;
  followUserOptimistic: (followingId: string) => Promise<void>;
  unfollowUserOptimistic: (followingId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  refetch: () => Promise<void>;
}

export const useFollows = (userId?: string): UseFollowsReturn => {
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(false);
  const cachedUserIdRef = useRef<string | null>(null);
  const initialFetchDone = useRef(false);

  const fetchFollows = useCallback(async (targetUserId?: string, skipLoading = false) => {
    try {
      const queryUserId = targetUserId || cachedUserIdRef.current;
      
      if (!queryUserId) {
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user?.id) {
          cachedUserIdRef.current = currentUser.user.id;
        } else {
          setLoading(false);
          return;
        }
      }

      const uid = queryUserId || cachedUserIdRef.current;
      if (!uid) return;

      if (!skipLoading && !initialFetchDone.current) {
        setLoading(true);
      }

      // Parallel fetch for speed
      const [followersResponse, followingResponse] = await Promise.all([
        supabase
          .from('follows')
          .select(`*, follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_url, profile_pic_url)`)
          .eq('following_id', uid),
        supabase
          .from('follows')
          .select(`*, following:profiles!follows_following_id_fkey(id, username, display_name, avatar_url, profile_pic_url)`)
          .eq('follower_id', uid)
      ]);

      if (!followersResponse.error) setFollowers(followersResponse.data || []);
      if (!followingResponse.error) setFollowing(followingResponse.data || []);
      
      initialFetchDone.current = true;
    } catch (error) {
      console.error('Error fetching follows:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic follow - instant UI update
  const followUserOptimistic = useCallback(async (followingId: string) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error("You must be logged in");
    if (currentUser.user.id === followingId) throw new Error("You cannot follow yourself");

    // Optimistic update
    const optimisticFollow: Follow = {
      id: `temp-${Date.now()}`,
      follower_id: currentUser.user.id,
      following_id: followingId,
      created_at: new Date().toISOString()
    };
    setFollowing(prev => [...prev, optimisticFollow]);

    // Background insert
    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: currentUser.user.id, following_id: followingId }]);

    if (error && error.code !== '23505') {
      // Revert on error
      setFollowing(prev => prev.filter(f => f.id !== optimisticFollow.id));
      throw error;
    }
    
    // Silent background refresh
    fetchFollows(userId, true);
  }, [userId, fetchFollows]);

  // Optimistic unfollow - instant UI update
  const unfollowUserOptimistic = useCallback(async (followingId: string) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error("You must be logged in");

    // Store for potential revert
    const previousFollowing = [...following];
    
    // Optimistic update
    setFollowing(prev => prev.filter(f => f.following_id !== followingId));

    // Background delete
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.user.id)
      .eq('following_id', followingId);

    if (error) {
      // Revert on error
      setFollowing(previousFollowing);
      throw error;
    }
    
    // Silent background refresh
    fetchFollows(userId, true);
  }, [userId, following, fetchFollows]);

  // Legacy methods (kept for compatibility)
  const followUser = useCallback(async (followingId: string) => {
    await followUserOptimistic(followingId);
  }, [followUserOptimistic]);

  const unfollowUser = useCallback(async (followingId: string) => {
    await unfollowUserOptimistic(followingId);
  }, [unfollowUserOptimistic]);

  const isFollowing = useCallback((targetUserId: string): boolean => {
    return following.some(follow => follow.following_id === targetUserId);
  }, [following]);

  const refetch = useCallback(async () => {
    await fetchFollows(userId, true);
  }, [userId, fetchFollows]);

  useEffect(() => {
    if (userId) {
      cachedUserIdRef.current = userId;
    }
    fetchFollows(userId);

    // Realtime subscription
    const setupSubscription = async () => {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return;

      const channel = supabase
        .channel(`follows-${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: `follower_id=eq.${uid}` }, 
          () => fetchFollows(userId, true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: `following_id=eq.${uid}` }, 
          () => fetchFollows(userId, true))
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    setupSubscription();
  }, [userId, fetchFollows]);

  return {
    followers,
    following,
    loading,
    followUser,
    unfollowUser,
    followUserOptimistic,
    unfollowUserOptimistic,
    isFollowing,
    refetch,
  };
};