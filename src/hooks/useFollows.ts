
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
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  following?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export const useFollows = () => {
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFollows = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch followers
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select(`
          *,
          follower:profiles!follows_follower_id_fkey(*)
        `)
        .eq('following_id', user.id);

      if (followersError) throw followersError;

      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select(`
          *,
          following:profiles!follows_following_id_fkey(*)
        `)
        .eq('follower_id', user.id);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('follows')
        .insert([{ follower_id: user.id, following_id: followingId }]);

      if (error) throw error;
      
      await fetchFollows();
      toast({
        title: "Success",
        description: "Successfully followed user",
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const unfollowUser = async (followingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) throw error;
      
      await fetchFollows();
      toast({
        title: "Success",
        description: "Successfully unfollowed user",
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFollows();
  }, []);

  return {
    followers,
    following,
    loading,
    followUser,
    unfollowUser,
    refetch: fetchFollows
  };
};
