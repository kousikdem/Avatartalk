import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EnhancedPostCardWithLocks from './EnhancedPostCardWithLocks';
import EnhancedCreatePostModal from './EnhancedCreatePostModal';
import { motion } from 'framer-motion';

interface ExtendedPost {
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
  poll_options?: any;
  poll_votes?: any;
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

interface SocialFeedProps {
  userId?: string;
  showCreatePost?: boolean;
  feedType?: 'user' | 'following' | 'public';
  showLinkClicks?: boolean;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ 
  userId, 
  showCreatePost = true,
  feedType = 'user',
  showLinkClicks = false
}) => {
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);

  const { toast } = useToast();

  // Get current user and profile
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
      
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        setUserProfile(profile);
      }
    };
    getCurrentUser();
  }, []);

  // Check subscription status
  useEffect(() => {
    if (currentUser && userId && currentUser.id !== userId) {
      checkSubscriptionStatus();
    }
  }, [currentUser, userId]);

  const checkSubscriptionStatus = async () => {
    if (!currentUser || !userId) return;
    
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', currentUser.id)
        .eq('subscribed_to_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      setIsSubscriber(!!data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Fetch posts based on feed type
  useEffect(() => {
    fetchPosts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, feedType]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
        `);

      switch (feedType) {
        case 'user':
          if (userId) {
            query = query.eq('user_id', userId);
          }
          break;
        case 'following':
          if (userId) {
            const { data: follows } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', userId);
            
            if (follows && follows.length > 0) {
              const followingIds = follows.map(f => f.following_id);
              query = query.in('user_id', followingIds);
            } else {
              setPosts([]);
              setLoading(false);
              return;
            }
          }
          break;
        case 'public':
          break;
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost: ExtendedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Section */}
      {showCreatePost && currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground font-semibold">
                    {(userProfile?.display_name?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  onClick={() => setShowPostModal(true)}
                  className="flex-1 justify-start text-left h-12 px-4 bg-muted/50 border-border hover:bg-muted hover:border-primary/30 text-muted-foreground transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  Share something amazing...
                </Button>
                <Button
                  onClick={() => setShowPostModal(true)}
                  size="icon"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-primary-foreground shadow-md"
                >
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Create Post Modal */}
      <EnhancedCreatePostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="space-y-6"
          >
            {posts.map((post) => (
              <EnhancedPostCardWithLocks
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                onPostUpdate={handlePostUpdate}
                isSubscriber={isSubscriber}
                showLinkClicks={showLinkClicks}
                profileUsername={post.profile?.username}
              />
            ))}
          </motion.div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <PlusCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {feedType === 'user' 
                  ? "Share your first post to get started!" 
                  : feedType === 'following'
                    ? "Follow some users to see their posts here"
                    : "Be the first to share something interesting!"
                }
              </p>
              {showCreatePost && currentUser && (
                <Button 
                  onClick={() => setShowPostModal(true)}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
