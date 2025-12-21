import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, MessageCircle, Share2, Send, MoreVertical, 
  Lock, Crown, ExternalLink, MousePointerClick, Eye,
  FileText, Image as ImageIcon, Video, BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikes } from '@/hooks/useLikes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  post_type: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  link_clicks?: number;
  is_paid?: boolean;
  price?: number;
  currency?: string;
  is_subscriber_only?: boolean;
  subscription_plan_id?: string;
  poll_options?: { options: Array<{ id: string; text: string; votes: number }> };
  poll_votes?: Record<string, string>;
  link_thumbnail_url?: string;
  link_button_text?: string;
  link_button_url?: string;
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

interface EnhancedPostCardWithLocksProps {
  post: Post;
  currentUserId?: string;
  onPostUpdate?: (updatedPost: Post) => void;
  showComments?: boolean;
  isSubscriber?: boolean;
  showLinkClicks?: boolean;
}

const EnhancedPostCardWithLocks: React.FC<EnhancedPostCardWithLocksProps> = ({ 
  post, 
  currentUserId, 
  onPostUpdate,
  showComments = true,
  isSubscriber = false,
  showLinkClicks = false
}) => {
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  const { toast } = useToast();
  const { likesCount, isLiked, toggleLike, loading: likesLoading } = useLikes(post.id, 'post');
  
  // Check if content is locked
  const isPaidContent = post.is_paid && post.price && post.price > 0;
  const isSubscriberContent = post.is_subscriber_only;
  const isOwnPost = currentUserId === post.user_id;
  
  // Determine if content should be shown
  const shouldShowContent = isOwnPost || 
    (!isPaidContent && !isSubscriberContent) || 
    isUnlocked || 
    (isSubscriberContent && isSubscriber);

  // Check if user has unlocked this post
  useEffect(() => {
    if (isPaidContent && currentUserId && !isOwnPost) {
      checkUnlockStatus();
    }
    if (post.poll_votes && currentUserId) {
      setHasVoted(!!post.poll_votes[currentUserId]);
      setSelectedPollOption(post.poll_votes[currentUserId] || null);
    }
  }, [post.id, currentUserId, isPaidContent, isOwnPost]);

  const checkUnlockStatus = async () => {
    try {
      const { data } = await supabase
        .from('post_unlocks')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId!)
        .maybeSingle();
      
      setIsUnlocked(!!data);
    } catch (error) {
      console.error('Error checking unlock status:', error);
    }
  };

  const handleUnlockPost = async () => {
    if (!currentUserId) {
      window.dispatchEvent(new CustomEvent('show-visitor-auth'));
      return;
    }

    setIsProcessingPayment(true);

    try {
      const amount = Math.max((post.price || 0) * 100, 100); // Convert to paise, minimum ₹1

      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          amount,
          currency: post.currency || 'INR',
          productId: post.id,
          productType: 'post_unlock',
          buyerId: currentUserId,
          sellerId: post.user_id,
          metadata: {
            post_id: post.id,
            post_title: post.title
          }
        }
      });

      if (orderError) throw orderError;

      const razorpayOrderId = orderData.order_id || orderData.orderId;
      const razorpayKeyId = orderData.key_id;

      if (!razorpayKeyId || !razorpayOrderId) {
        throw new Error('Payment gateway not configured');
      }

      // Load Razorpay if not loaded
      if (typeof window.Razorpay === 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load payment gateway'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Unlock Post',
        description: post.title || 'Unlock exclusive content',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Create unlock record
            const { error: unlockError } = await supabase
              .from('post_unlocks')
              .insert({
                post_id: post.id,
                user_id: currentUserId,
                payment_amount: amount / 100,
                payment_currency: post.currency || 'INR',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id
              });

            if (unlockError) throw unlockError;

            setIsUnlocked(true);
            toast({
              title: "Content Unlocked!",
              description: "You can now view this exclusive content.",
            });
          } catch (error) {
            console.error('Unlock error:', error);
            toast({
              title: "Error",
              description: "Payment successful but failed to unlock. Please contact support.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false)
        },
        theme: { color: '#6366f1' }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Payment could not be processed.",
          variant: "destructive"
        });
        setIsProcessingPayment(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  };

  const handleLinkClick = async (url: string) => {
    try {
      // Track click
      await supabase.rpc('increment_post_link_clicks', { post_id_param: post.id });
      await supabase.from('post_link_clicks').insert({
        post_id: post.id,
        user_id: currentUserId || null,
        link_url: url
      });
      
      // Open link
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking click:', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePollVote = async (optionId: string) => {
    if (!currentUserId || hasVoted) return;

    try {
      const updatedVotes = { ...(post.poll_votes || {}), [currentUserId]: optionId };
      const updatedOptions = post.poll_options?.options.map(opt => ({
        ...opt,
        votes: opt.id === optionId ? opt.votes + 1 : opt.votes
      }));

      const { error } = await supabase
        .from('posts')
        .update({
          poll_votes: updatedVotes,
          poll_options: { options: updatedOptions }
        })
        .eq('id', post.id);

      if (error) throw error;

      setHasVoted(true);
      setSelectedPollOption(optionId);
      
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          poll_votes: updatedVotes,
          poll_options: { options: updatedOptions || [] }
        });
      }

      toast({ title: "Vote recorded!" });
    } catch (error) {
      console.error('Vote error:', error);
      toast({ title: "Error", description: "Failed to record vote", variant: "destructive" });
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`id, content, created_at, user_id, profiles!comments_user_id_fkey(username, display_name, avatar_url)`)
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
        .insert([{ user_id: currentUserId, post_id: post.id, comment_type: 'post', content: newComment.trim() }]);

      if (error) throw error;
      setNewComment('');
      fetchComments();
      toast({ title: "Comment added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast({ title: "Link copied" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTotalVotes = () => {
    return post.poll_options?.options.reduce((sum, opt) => sum + opt.votes, 0) || 0;
  };

  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'poll': return <BarChart3 className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-border">
              <AvatarImage src={post.profile?.avatar_url} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {(post.profile?.display_name || post.profile?.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">
                  {post.profile?.display_name || post.profile?.username || 'Anonymous'}
                </h4>
                {getPostTypeIcon()}
                {isPaidContent && !isUnlocked && !isOwnPost && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Lock className="w-3 h-3" />
                    {formatPrice(post.price || 0, post.currency)}
                  </Badge>
                )}
                {isSubscriberContent && !isSubscriber && !isOwnPost && (
                  <Badge variant="secondary" className="gap-1 text-xs bg-purple-100 text-purple-700">
                    <Crown className="w-3 h-3" />
                    Subscribers
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                @{post.profile?.username || 'unknown'} • {formatDistanceToNow(new Date(post.created_at))} ago
              </p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Title */}
          {post.title && shouldShowContent && (
            <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
          )}

          {/* Locked Content Overlay */}
          {!shouldShowContent ? (
            <div className="relative">
              {/* Blurred Preview */}
              <div className="blur-md select-none pointer-events-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {post.content.slice(0, 100)}...
                </p>
                {post.media_url && (
                  <div className="h-48 bg-muted rounded-lg" />
                )}
              </div>

              {/* Lock Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                {isPaidContent ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-bold text-foreground mb-1">Premium Content</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unlock this exclusive content for {formatPrice(post.price || 0, post.currency)}
                    </p>
                    <Button 
                      onClick={handleUnlockPost}
                      disabled={isProcessingPayment}
                      className="bg-gradient-to-r from-primary to-purple-600"
                    >
                      {isProcessingPayment ? 'Processing...' : `Unlock for ${formatPrice(post.price || 0, post.currency)}`}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Crown className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-foreground mb-1">Subscribers Only</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Subscribe to view this exclusive content
                    </p>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Subscribe Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Post Content */}
              <div className="mb-4">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                {/* Media */}
                {post.media_url && post.media_type !== 'link' && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    {post.media_type?.startsWith('image/') ? (
                      <img src={post.media_url} alt="Post media" className="w-full h-auto max-h-96 object-cover" />
                    ) : post.media_type?.startsWith('video/') ? (
                      <video src={post.media_url} controls className="w-full h-auto max-h-96" />
                    ) : null}
                  </div>
                )}

                {/* Link with Button/Thumbnail */}
                {(post.post_type === 'link' || post.post_type === 'link_with_button') && post.media_url && (
                  <div 
                    className="mt-3 border border-border rounded-lg overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleLinkClick(post.media_url!)}
                  >
                    {post.link_thumbnail_url && (
                      <img 
                        src={post.link_thumbnail_url} 
                        alt="Link preview" 
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-primary">
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm truncate">{post.media_url}</span>
                      </div>
                      {post.link_button_text && post.link_button_url && (
                        <Button 
                          className="mt-3 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLinkClick(post.link_button_url!);
                          }}
                        >
                          {post.link_button_text}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Poll */}
                {post.post_type === 'poll' && post.poll_options?.options && (
                  <div className="mt-4 space-y-2">
                    {post.poll_options.options.map((option) => {
                      const totalVotes = getTotalVotes();
                      const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                      const isSelected = selectedPollOption === option.id;

                      return (
                        <div key={option.id} className="relative">
                          <button
                            onClick={() => handlePollVote(option.id)}
                            disabled={hasVoted || !currentUserId}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between relative z-10">
                              <span className="font-medium text-foreground">{option.text}</span>
                              {hasVoted && (
                                <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</span>
                              )}
                            </div>
                            {hasVoted && (
                              <Progress value={percentage} className="mt-2 h-1" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {getTotalVotes()} vote{getTotalVotes() !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span>{likesCount} like{likesCount !== 1 ? 's' : ''}</span>
              <span>{post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views_count}
              </span>
            </div>
            {showLinkClicks && (post.link_clicks ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <MousePointerClick className="w-3 h-3" />
                {post.link_clicks} click{post.link_clicks !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!currentUserId) {
                  toast({ title: "Login Required", description: "Please login to like posts" });
                  return;
                }
                toggleLike();
              }}
              disabled={likesLoading}
              className={`flex items-center space-x-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </Button>

            {showComments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!currentUserId) {
                    toast({ title: "Login Required", description: "Please login to comment" });
                    return;
                  }
                  setShowCommentsSection(!showCommentsSection);
                  if (!showCommentsSection && comments.length === 0) fetchComments();
                }}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Comment</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2 text-muted-foreground hover:text-green-500"
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
                className="mt-4 border-t border-border pt-4"
              >
                {currentUserId && (
                  <form onSubmit={handleCommentSubmit} className="mb-4 flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={!newComment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}

                <div className="space-y-3">
                  {loadingComments ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.profile?.avatar_url} />
                          <AvatarFallback>
                            {(comment.profile?.display_name || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground">
                              {comment.profile?.display_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at))} ago
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No comments yet</p>
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

export default EnhancedPostCardWithLocks;
