import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Users, 
  TrendingUp,
  Clock,
  User,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { useFollows } from '@/hooks/useFollows';
import LikeButton from '@/components/LikeButton';
import { motion, AnimatePresence } from 'framer-motion';
import TokenDisplay from '@/components/TokenDisplay';

interface FeedPost {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  user_id: string;
  author?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    profile_pic_url?: string;
  };
}

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  profile_pic_url?: string;
  bio?: string;
  followers_count?: number;
}

const FeedPage = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');
  const { toast } = useToast();
  
  // Get current user's posts using the usePosts hook
  const { posts: userPosts, isLoading: userPostsLoading } = usePosts(currentUser?.id);
  const { following, followUser, unfollowUser, isFollowing } = useFollows(currentUser?.id);

  // Authentication check
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
      
      // Redirect to login if not authenticated
      if (!session?.user) {
        window.location.href = '/';
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session?.user) {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchFeedData();
      fetchSuggestedUsers();
    }
  }, [currentUser, following]);

  const fetchFeedData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Get posts from users the current user is following
      const followingIds = following.map(f => f.following_id);
      
      if (followingIds.length > 0) {
        const { data: postsData, error } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!posts_user_id_fkey(
              username,
              display_name,
              avatar_url,
              profile_pic_url
            )
          `)
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setFeedPosts(postsData || []);
      } else {
        setFeedPosts([]);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast({
        title: "Error",
        description: "Failed to load feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    if (!currentUser) return;
    
    try {
      // Get users not currently followed (excluding current user)
      const followingIds = following.map(f => f.following_id);
      const excludeIds = [...followingIds, currentUser.id];
      
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          profile_pic_url,
          bio,
          user_stats!inner(followers_count)
        `)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('username', 'is', null)
        .order('user_stats.followers_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const formattedUsers = usersData?.map(user => ({
        ...user,
        followers_count: user.user_stats?.[0]?.followers_count || 0
      })) || [];
      
      setSuggestedUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      if (isFollowing(userId)) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      // Refresh suggested users after follow/unfollow
      fetchSuggestedUsers();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const PostCard = ({ post }: { post: FeedPost }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={post.author?.avatar_url || post.author?.profile_pic_url} 
                alt={post.author?.display_name || post.author?.username} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {(post.author?.display_name?.[0] || post.author?.username?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {post.author?.display_name || post.author?.username}
              </h3>
              <p className="text-sm text-gray-500">@{post.author?.username}</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed">{post.content}</p>
            {post.media_url && (
              <div className="mt-3 rounded-lg overflow-hidden">
                {post.media_type?.startsWith('image/') ? (
                  <img 
                    src={post.media_url} 
                    alt="Post media" 
                    className="w-full h-auto max-h-96 object-cover" 
                  />
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Media: {post.media_type}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <LikeButton 
                itemId={post.id} 
                itemType="post" 
                showCount={true} 
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.comments_count}</span>
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-blue-600"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const UserCard = ({ user }: { user: User }) => (
    <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || user.profile_pic_url} alt={user.display_name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {(user.display_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{user.display_name}</h3>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            <p className="text-xs text-gray-400">{user.followers_count || 0} followers</p>
          </div>
        </div>
        {user.bio && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
        )}
        <Button
          size="sm"
          variant={isFollowing(user.id) ? "outline" : "default"}
          onClick={() => handleFollow(user.id)}
          className="w-full"
        >
          {isFollowing(user.id) ? 'Following' : 'Follow'}
        </Button>
      </CardContent>
    </Card>
  );

  // Authentication and loading check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Social Feed
            </h1>
            <p className="text-gray-600 mt-1">Stay connected with your community</p>
          </div>
          <TokenDisplay compact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="my-posts">My Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="following" className="space-y-4 mt-6">
                <AnimatePresence>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading posts...</p>
                    </div>
                  ) : feedPosts.length > 0 ? (
                    feedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <Card className="bg-white border border-slate-200">
                      <CardContent className="p-8 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts to show</h3>
                        <p className="text-gray-600 mb-4">
                          Follow some users to see their posts in your feed
                        </p>
                        <Button 
                          onClick={() => setActiveTab('users')} 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Discover Users
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="my-posts" className="space-y-4 mt-6">
                <AnimatePresence>
                  {userPostsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading your posts...</p>
                    </div>
                  ) : userPosts.length > 0 ? (
                    userPosts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={{
                          ...post,
                          author: {
                            username: currentUser?.user_metadata?.username || 'you',
                            display_name: currentUser?.user_metadata?.display_name || 'You',
                            avatar_url: currentUser?.user_metadata?.avatar_url,
                          }
                        }} 
                      />
                    ))
                  ) : (
                    <Card className="bg-white border border-slate-200">
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-600">Share your first post to get started!</p>
                      </CardContent>
                    </Card>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Following</span>
                  <Badge variant="secondary">{following.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posts</span>
                  <Badge variant="secondary">{userPosts.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Suggested Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No suggestions available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;