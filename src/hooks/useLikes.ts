
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Like {
  id: string;
  user_id: string;
  post_id?: string;
  profile_id?: string;
  like_type: 'post' | 'profile';
  created_at: string;
}

export const useLikes = (itemId?: string, itemType?: 'post' | 'profile') => {
  const [likes, setLikes] = useState<Like[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLikes = async () => {
    if (!itemId || !itemType) return;

    try {
      const column = itemType === 'post' ? 'post_id' : 'profile_id';
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq(column, itemId)
        .eq('like_type', itemType);

      if (error) throw error;

      setLikes(data || []);
      setLikesCount(data?.length || 0);

      // Check if current user has liked this item
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userLike = data?.find(like => like.user_id === user.id);
        setIsLiked(!!userLike);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      toast({
        title: "Error",
        description: "Failed to load likes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!itemId || !itemType) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to like",
          variant: "destructive",
        });
        return;
      }

      if (isLiked) {
        // Unlike
        const column = itemType === 'post' ? 'post_id' : 'profile_id';
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq(column, itemId)
          .eq('like_type', itemType);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const likeData = {
          user_id: user.id,
          like_type: itemType,
          [itemType === 'post' ? 'post_id' : 'profile_id']: itemId
        };

        const { error } = await supabase
          .from('likes')
          .insert([likeData]);

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [itemId, itemType]);

  return {
    likes,
    likesCount,
    isLiked,
    loading,
    toggleLike,
    refetch: fetchLikes
  };
};
