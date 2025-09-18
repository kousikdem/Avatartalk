import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Send, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onPostUpdate?: (updatedPost: Post) => void;
  showComments?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserId, 
  onPostUpdate,
  showComments = true 
}) => {
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const { toast } = useToast();
  const { likesCount, isLiked, toggleLike, loading: likesLoading } = useLikes(post.id, 'post');
  
  // Real-time updates for post engagement
  useEffect(() => {
    // Set up real-time subscription for likes
    const likesChannel = supabase
      .channel(`post-likes-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        () => {
          // Refetch likes count when likes change
          if (onPostUpdate) {
            fetchUpdatedPost();
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for comments
    const commentsChannel = supabase
      .channel(`post-comments-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${post.id}`
        },
        () => {
          if (showCommentsSection) {
            fetchComments();
          }
          if (onPostUpdate) {
            fetchUpdatedPost();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [post.id, showCommentsSection, onPostUpdate]);

  const fetchUpdatedPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
        `)
        .eq('id', post.id)
        .single();

      if (error) throw error;
      if (data && onPostUpdate) {
        onPostUpdate(data);
      }
    } catch (error) {
      console.error('Error fetching updated post:', error);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!comments_user_id_fkey(
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', post.id)
        .eq('comment_type', 'post')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedComments = (data || []).map(item => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        user_id: item.user_id,
        profile: item.profiles as any
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          user_id: currentUserId,
          post_id: post.id,
          comment_type: 'post',
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const toggleComments = () => {
    const newState = !showCommentsSection;
    setShowCommentsSection(newState);
    if (newState && comments.length === 0) {
      fetchComments();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profile?.avatar_url} />
              <AvatarFallback>
                {(post.profile?.display_name || post.profile?.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {post.profile?.display_name || post.profile?.username || 'Anonymous User'}
              </h4>
              <p className="text-sm text-gray-500">
                @{post.profile?.username || 'unknown'} • {formatDistanceToNow(new Date(post.created_at))} ago
              </p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed">{post.content}</p>
            
            {/* Media */}
            {post.media_url && (
              <div className="mt-3 rounded-lg overflow-hidden">
                {post.media_type?.startsWith('image/') ? (
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : post.media_type?.startsWith('video/') ? (
                  <video
                    src={post.media_url}
                    controls
                    className="w-full h-auto max-h-96"
                  />
                ) : null}
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
              disabled={likesLoading || !currentUserId}
              className={`flex items-center space-x-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </Button>

            {showComments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleComments}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Comment</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </Button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showCommentsSection && showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 border-t pt-4"
              >
                {/* Comment Input */}
                {currentUserId && (
                  <form onSubmit={handleCommentSubmit} className="mb-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" disabled={!newComment.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-3">
                  {loadingComments ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex space-x-3"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.profile?.avatar_url} />
                          <AvatarFallback>
                            {(comment.profile?.display_name || comment.profile?.username || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.profile?.display_name || comment.profile?.username || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.created_at))} ago
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostCard;