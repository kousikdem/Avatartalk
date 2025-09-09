import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, UserMinus, Search, Eye, MessageSquare } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  last_seen?: string;
}

const FollowersPage = () => {
  const { followers, following, loading, followUser, unfollowUser, isFollowing } = useFollows();
  const [searchTerm, setSearchTerm] = useState('');
  const [visitors, setVisitors] = useState<User[]>([]);

  // Fetch visitors from profile_visitors table
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) return;

        const { data: visitorsData, error } = await supabase
          .from('profile_visitors')
          .select(`
            visitor_id,
            visited_at,
            profiles!profile_visitors_visitor_id_fkey(
              id,
              full_name,
              display_name,
              avatar_url,
              profile_pic_url,
              bio
            )
          `)
          .eq('visited_profile_id', currentUser.user.id)
          .order('visited_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const formattedVisitors: User[] = visitorsData?.map(visitor => ({
          id: visitor.profiles?.id || '',
          full_name: visitor.profiles?.display_name || visitor.profiles?.full_name || 'Anonymous',
          email: '', // Don't show email for privacy
          avatar_url: visitor.profiles?.avatar_url || visitor.profiles?.profile_pic_url,
          bio: visitor.profiles?.bio,
          last_seen: visitor.visited_at
        })).filter(visitor => visitor.id) || [];

        setVisitors(formattedVisitors);
      } catch (error) {
        console.error('Error fetching visitors:', error);
      }
    };

    fetchVisitors();
  }, []);

  // Transform followers data for display
  const displayFollowers: User[] = followers.map(follow => ({
    id: follow.follower?.id || '',
    full_name: follow.follower?.display_name || follow.follower?.username || 'Unknown',
    email: '', // Don't show email for privacy
    avatar_url: follow.follower?.avatar_url,
    bio: '', // Add bio if needed
    followers_count: 0,
    following_count: 0,
    last_seen: follow.created_at
  }));

  // Transform following data for display
  const displayFollowing: User[] = following.map(follow => ({
    id: follow.following?.id || '',
    full_name: follow.following?.display_name || follow.following?.username || 'Unknown',
    email: '', // Don't show email for privacy
    avatar_url: follow.following?.avatar_url,
    bio: '', // Add bio if needed
    followers_count: 0,
    following_count: 0,
    last_seen: follow.created_at
  }));

  const filteredFollowers = displayFollowers.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowing = displayFollowing.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVisitors = visitors.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFollow = async (userId: string) => {
    await followUser(userId);
  };

  const handleUnfollow = async (userId: string) => {
    await unfollowUser(userId);
  };

  const UserCard = ({ user, showFollowButton = false, isFollowing = false, showMessageButton = false }: {
    user: User;
    showFollowButton?: boolean;
    isFollowing?: boolean;
    showMessageButton?: boolean;
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white/80 via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border border-white/50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{user.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 truncate">{user.full_name}</h3>
              {user.last_seen && (
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50">
                  {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            
            {user.bio && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
            )}
            
            {(user.followers_count !== undefined || user.following_count !== undefined) && (
              <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                {user.followers_count !== undefined && (
                  <span>{user.followers_count} followers</span>
                )}
                {user.following_count !== undefined && (
                  <span>{user.following_count} following</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {showMessageButton && (
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            
            {showFollowButton && (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={() => isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                disabled={loading}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Connections</h1>
              <p className="text-slate-600">Manage your followers and following</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gradient-to-r from-white/80 to-blue-50/30 border-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-white/80 via-blue-50/50 to-indigo-50/30 backdrop-blur-sm">
            <TabsTrigger value="followers">
              Followers ({filteredFollowers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({filteredFollowing.length})
            </TabsTrigger>
            <TabsTrigger value="visitors">
              Visitors ({filteredVisitors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-6 space-y-4">
            {filteredFollowers.length === 0 ? (
              <Card className="bg-gradient-to-r from-white/80 via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border border-white/50">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No followers found matching your search' : 'No followers yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFollowers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  showMessageButton={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6 space-y-4">
            {filteredFollowing.length === 0 ? (
              <Card className="bg-gradient-to-r from-white/80 via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border border-white/50">
                <CardContent className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No following found matching your search' : 'Not following anyone yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFollowing.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  showFollowButton={true}
                  isFollowing={isFollowing(user.id)}
                  showMessageButton={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="visitors" className="mt-6 space-y-4">
            {filteredVisitors.length === 0 ? (
              <Card className="bg-gradient-to-r from-white/80 via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border border-white/50">
                <CardContent className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No visitors found matching your search' : 'No recent visitors'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredVisitors.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  showFollowButton={true}
                  isFollowing={isFollowing(user.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FollowersPage;
