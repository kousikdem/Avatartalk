import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp,
  MessageCircle,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFollows } from '@/hooks/useFollows';
import SocialFeed from '@/components/SocialFeed';
import TokenDisplay from '@/components/TokenDisplay';
import { useAuth } from '@/context/auth';

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
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('my-posts');
  const { toast } = useToast();

  const userId = user?.id;
  const { following, followUser, unfollowUser, isFollowing } = useFollows(userId);

  useEffect(() => {
    if (userId) {
      fetchSuggestedUsers();
    }
  }, [userId, following]);

  const fetchSuggestedUsers = async () => {
    if (!userId) return;
    
    try {
      const followingIds = following.map(f => f.following_id);
      const excludeIds = [...followingIds, userId];
      
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, profile_pic_url, bio, followers_count')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('username', 'is', null)
        .order('followers_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSuggestedUsers(usersData || []);
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
      fetchSuggestedUsers();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card className="bg-card border-border hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || user.profile_pic_url} alt={user.display_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
              {(user.display_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{user.display_name}</h3>
            <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.followers_count || 0} followers</p>
          </div>
        </div>
        {user.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{user.bio}</p>
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

  // No loading skeleton - instant render
  if (!userId) return null;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Social Feed
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage your posts</p>
          </div>
          <TokenDisplay compact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="my-posts">My Posts</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="paid-posts">Paid Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="my-posts" className="mt-6">
                <SocialFeed 
                  userId={userId}
                  showCreatePost={true}
                  feedType="user"
                  showLinkClicks={true}
                  showEditOption={true}
                />
              </TabsContent>

              <TabsContent value="following" className="mt-6">
                <SocialFeed 
                  userId={userId}
                  showCreatePost={false}
                  feedType="following"
                  showLinkClicks={false}
                />
              </TabsContent>

              <TabsContent value="paid-posts" className="mt-6">
                <SocialFeed 
                  userId={userId}
                  showCreatePost={false}
                  feedType="paid"
                  showLinkClicks={false}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Following</span>
                  <Badge variant="secondary">{following.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Suggested Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">
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
