
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
  parent_comment_id?: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    display_name?: string;
    username?: string;
  };
  replies?: Comment[];
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
      
      // First get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq(column, itemId)
        .eq('comment_type', itemType)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Then get profiles for those comments
      if (commentsData && commentsData.length > 0) {
        const userIds = commentsData.map(comment => comment.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, display_name, username')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine comments with profiles and organize replies
        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          comment_type: comment.comment_type as 'post' | 'profile',
          profiles: profilesData?.find(profile => profile.id === comment.user_id)
        }));

        // Organize comments with replies
        const topLevelComments = commentsWithProfiles.filter(c => !c.parent_comment_id);
        const repliesMap = new Map<string, Comment[]>();
        
        commentsWithProfiles.forEach(comment => {
          if (comment.parent_comment_id) {
            if (!repliesMap.has(comment.parent_comment_id)) {
              repliesMap.set(comment.parent_comment_id, []);
            }
            repliesMap.get(comment.parent_comment_id)?.push(comment);
          }
        });

        // Attach replies to their parent comments
        const commentsWithReplies = topLevelComments.map(comment => ({
          ...comment,
          replies: repliesMap.get(comment.id) || []
        }));

        setComments(commentsWithReplies);
      } else {
        setComments([]);
      }
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

  const addComment = async (content: string, parentCommentId?: string) => {
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
        [itemType === 'post' ? 'post_id' : 'profile_id']: itemId,
        parent_comment_id: parentCommentId || null
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
