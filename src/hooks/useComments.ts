
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  user_id: string;
  post_id?: string;
  profile_id?: string;
  comment_type: 'post' | 'profile';
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    display_name?: string;
  };
}

export const useComments = (itemId?: string, itemType?: 'post' | 'profile') => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!itemId || !itemType) return;

    try {
      const column = itemType === 'post' ? 'post_id' : 'profile_id';
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey (
            full_name,
            avatar_url,
            display_name
          )
        `)
        .eq(column, itemId)
        .eq('comment_type', itemType)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion to ensure correct types
      const typedData = (data || []).map(item => ({
        ...item,
        comment_type: item.comment_type as 'post' | 'profile'
      }));

      setComments(typedData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!itemId || !itemType || !content.trim()) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to comment",
          variant: "destructive",
        });
        return;
      }

      const commentData = {
        user_id: user.id,
        comment_type: itemType,
        content: content.trim(),
        [itemType === 'post' ? 'post_id' : 'profile_id']: itemId
      };

      const { error } = await supabase
        .from('comments')
        .insert([commentData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [itemId, itemType]);

  return {
    comments,
    loading,
    submitting,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
