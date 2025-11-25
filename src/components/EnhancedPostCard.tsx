import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Send, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikes } from '@/hooks/useLikes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EnhancedShareModal from './EnhancedShareModal';
import CommentSection from './CommentSection';

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
    profile_pic_url?: string;
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
    profile_pic_url?: string;
  };
}

interface EnhancedPostCardProps {
  post: Post;
  currentUserId?: string;
  onPostUpdate?: (updatedPost: Post) => void;
  showComments?: boolean;
}

const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({ 
  post, 
  currentUserId, 
  onPostUpdate,
  showComments = true 
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  
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
  }, [post.id, onPostUpdate]);

  const fetchUpdatedPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(username, display_name, avatar_url, profile_pic_url)
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

  const handleShare = () => {
    setShowShareModal(true);
  };

  const getProfileImage = (profile?: Post['profile']) => {
    return profile?.profile_pic_url || profile?.avatar_url;
  };

  const getDisplayName = (profile?: Post['profile']) => {
    return profile?.display_name || profile?.username || 'Anonymous User';
  };

  const getUsername = (profile?: Post['profile']) => {
    return profile?.username || 'unknown';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              {/* Enhanced Avatar with Profile Picture */}
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                  <AvatarImage 
                    src={getProfileImage(post.profile)} 
                    alt={getDisplayName(post.profile)}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {getDisplayName(post.profile)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card shadow-sm" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {getDisplayName(post.profile)}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  @{getUsername(post.profile)} • {formatDistanceToNow(new Date(post.created_at))} ago
                </p>
              </div>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Post Content */}
            <div className="mb-4">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
              
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 pb-3 border-b border-border">
              <button 
                onClick={() => setShowCommentSection(!showCommentSection)}
                className="hover:text-foreground transition-colors"
              >
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </button>
              <button 
                onClick={() => setShowCommentSection(!showCommentSection)}
                className="hover:text-foreground transition-colors"
              >
                {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!currentUserId) {
                    toast({
                      title: "Login Required",
                      description: "Please login to like posts",
                    });
                    return;
                  }
                  toggleLike();
                }}
                disabled={likesLoading}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">Like</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentSection(!showCommentSection)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  showCommentSection 
                    ? 'text-primary hover:text-primary/80 hover:bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <MessageCircle className={`w-5 h-5 ${showCommentSection ? 'fill-current' : ''}`} />
                <span className="font-medium">Comment</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 text-muted-foreground hover:text-green-500 hover:bg-green-50 transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share</span>
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && showCommentSection && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <CommentSection 
                  itemId={post.id} 
                  itemType="post"
                  showCount={false}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Enhanced Share Modal */}
      <EnhancedShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={`${window.location.origin}/post/${post.id}`}
        title={`Check out this post by ${getDisplayName(post.profile)}`}
        description={post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')}
        type="post"
      />
    </>
  );
};

export default EnhancedPostCard;