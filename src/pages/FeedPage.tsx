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
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');
  const { toast } = useToast();
  
  // Get current user's posts using the usePosts hook
  const { posts: userPosts, isLoading: userPostsLoading } = usePosts(currentUser?.id);
  const { following, followUser, unfollowUser, isFollowing } = useFollows(currentUser?.id);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
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
        // If not following anyone, show popular posts
        const { data: popularPosts, error } = await supabase
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
          .order('likes_count', { ascending: false })
          .limit(10);

        if (error) throw error;
        setFeedPosts(popularPosts || []);
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
      // Get users the current user is not following
      const followingIds = following.map(f => f.following_id);
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          profile_pic_url,
          bio,
          user_stats!user_stats_user_id_fkey(followers_count)
        `)
        .not('id', 'in', `(${[currentUser.id, ...followingIds].join(',')})`)
        .not('username', 'is', null)
        .limit(5);

      if (error) throw error;
      
      const formattedUsers = users?.map(user => ({
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
        toast({
          title: "Unfollowed",
          description: "User unfollowed successfully",
        });
      } else {
        await followUser(userId);
        toast({
          title: "Following",
          description: "Now following user",
        });
      }
      // Refresh suggested users after follow/unfollow action
      fetchSuggestedUsers();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const PostCard = ({ post }: { post: FeedPost }) => (
    <Card className="bg-white border border-slate-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.avatar_url || post.author?.profile_pic_url} alt={post.author?.display_name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {(post.author?.display_name?.[0] || post.author?.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{post.author?.display_name || post.author?.username}</h3>
            <p className="text-sm text-gray-500 truncate">@{post.author?.username}</p>
          </div>
          <div className="flex items-center text-xs text-gray-400 gap-1">
            <Clock className="h-3 w-3" />
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
        
        {post.media_url && (
          <div className="rounded-lg overflow-hidden">
            {post.media_type === 'image' ? (
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="w-full h-auto object-cover max-h-96"
              />
            ) : post.media_type === 'video' ? (
              <video 
                src={post.media_url} 
                className="w-full h-auto object-cover max-h-96"
                controls
              />
            ) : null}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <LikeButton
              itemId={post.id}
              itemType="post"
              showCount={true}
              className="text-gray-600 hover:text-red-600"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.comments_count}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {post.views_count} views
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-blue-600"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
          onClick={() => handleFollow(user.id)}
          className={`w-full ${
            isFollowing(user.id)
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          }`}
        >
          <Users className="h-4 w-4 mr-2" />
          {isFollowing(user.id) ? 'Following' : 'Follow'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Feed</h1>
          <p className="text-gray-300">Stay updated with your network</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
                <TabsTrigger 
                  value="following" 
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-gray-900"
                >
                  Following
                </TabsTrigger>
                <TabsTrigger 
                  value="discover" 
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-gray-900"
                >
                  Discover
                </TabsTrigger>
                <TabsTrigger 
                  value="my-posts" 
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-gray-900"
                >
                  My Posts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="following" className="space-y-6 mt-6">
                {feedPosts.length > 0 ? (
                  feedPosts.map((post) => (
                    <PostCard key={post.id} post={{
                      ...post,
                      author: {
                        username: post.author?.username || '',
                        display_name: post.author?.display_name || '',
                        avatar_url: post.author?.avatar_url,
                        profile_pic_url: post.author?.profile_pic_url
                      }
                    }} />
                  ))
                ) : (
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                      <p className="text-gray-300 mb-4">Follow some users to see their posts in your feed</p>
                      <Button 
                        onClick={() => setActiveTab('discover')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Discover Users
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="discover" className="space-y-6 mt-6">
                {feedPosts.length > 0 ? (
                  feedPosts.map((post) => (
                    <PostCard key={post.id} post={{
                      ...post,
                      author: {
                        username: post.author?.username || '',
                        display_name: post.author?.display_name || '',
                        avatar_url: post.author?.avatar_url,
                        profile_pic_url: post.author?.profile_pic_url
                      }
                    }} />
                  ))
                ) : (
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No posts available</h3>
                      <p className="text-gray-300">Check back later for new content</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-posts" className="space-y-6 mt-6">
                {userPosts && userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard key={post.id} post={{
                      ...post,
                      author: {
                        username: currentUser?.email?.split('@')[0] || '',
                        display_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || '',
                        avatar_url: currentUser?.user_metadata?.avatar_url,
                        profile_pic_url: undefined
                      }
                    }} />
                  ))
                ) : (
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-8 text-center">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                      <p className="text-gray-300 mb-4">Share your thoughts and connect with others</p>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Following</span>
                  <Badge variant="secondary">{following.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Posts</span>
                  <Badge variant="secondary">{userPosts?.length || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Suggested Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))
                ) : (
                  <p className="text-gray-300 text-center py-4">No suggestions available</p>
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