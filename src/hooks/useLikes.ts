
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/utils/notificationService';

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

      // Type assertion to ensure correct types
      const typedData = (data || []).map(item => ({
        ...item,
        like_type: item.like_type as 'post' | 'profile'
      }));

      setLikes(typedData);
      setLikesCount(typedData.length);

      // Check if current user has liked this item
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userLike = typedData.find(like => like.user_id === user.id);
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

        // Send notification to post/profile owner
        if (itemType === 'post') {
          try {
            const { data: post } = await supabase.from('posts').select('user_id, content').eq('id', itemId).single();
            if (post && post.user_id !== user.id) {
              const { data: likerProfile } = await supabase.from('profiles').select('display_name, username').eq('id', user.id).single();
              const likerName = likerProfile?.display_name || likerProfile?.username || 'Someone';
              const postTitle = (post.content || '').slice(0, 40) || 'your post';
              await notificationService.notifyPostLike(post.user_id, likerName, postTitle, itemId);
            }
          } catch (e) { console.error('Like notification error:', e); }
        }
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
