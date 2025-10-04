import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFollows } from '@/hooks/useFollows';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users,
  Search,
  UserPlus,
  UserCheck,
  Eye,
  MessageCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  follower_count?: number;
  following_count?: number;
  last_seen?: string;
}

const FollowersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visitors, setVisitors] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  
  const { 
    followers, 
    following, 
    followersCount, 
    followingCount, 
    loading, 
    followUser, 
    unfollowUser, 
    isFollowing,
    refetch 
  } = useFollows();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
      
      if (data.user) {
        loadVisitors(data.user.id);
      }
    };
    loadCurrentUser();
  }, []);

  const loadVisitors = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profile_visitors')
        .select(`
          *,
          visitor:profiles!profile_visitors_visitor_id_fkey(
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('visited_profile_id', userId)
        .order('visited_at', { ascending: false });

      if (error) throw error;

      const visitorUsers: User[] = (data || [])
        .map(v => {
          if (!v.visitor || typeof v.visitor !== 'object') return null;
          const visitor = v.visitor as any;
          return {
            id: visitor.id || '',
            username: visitor.username || '',
            display_name: visitor.display_name || '',
            avatar_url: visitor.avatar_url || '',
            bio: visitor.bio || ''
          };
        })
        .filter((v): v is User => v !== null && v.id !== '');

      setVisitors(visitorUsers);
    } catch (error) {
      console.error('Error loading visitors:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
      await refetch();
      toast({
        title: "Success",
        description: "Now following user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser(userId);
      await refetch();
      toast({
        title: "Success",
        description: "Unfollowed user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const clearVisitorHistory = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('profile_visitors')
        .delete()
        .eq('visited_profile_id', currentUser.id);

      if (error) throw error;

      setVisitors([]);
      toast({
        title: "Success",
        description: "Visitor history cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear visitor history",
        variant: "destructive",
      });
    }
  };

  // Transform followers data to User format
  const displayFollowers = followers.map(f => ({
    id: f.follower?.id || '',
    username: f.follower?.username || '',
    display_name: f.follower?.display_name || '',
    avatar_url: f.follower?.avatar_url || '',
    bio: '',
    last_seen: f.created_at
  }));

  // Transform following data to User format
  const displayFollowing = following.map(f => ({
    id: f.following?.id || '',
    username: f.following?.username || '',
    display_name: f.following?.display_name || '',
    avatar_url: f.following?.avatar_url || '',
    bio: '',
    last_seen: f.created_at
  }));

  // Filter logic
  const filteredFollowers = displayFollowers.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowing = displayFollowing.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVisitors = visitors.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserCard = ({ user, showFollowButton = true }: { user: User; showFollowButton?: boolean }) => {
    const userIsFollowing = isFollowing(user.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-blue-100">
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {(user.display_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-base">
                  {user.display_name || user.username}
                </h3>
                <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{user.bio}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {showFollowButton && (
                  <Button
                    size="sm"
                    onClick={() => userIsFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                    className={userIsFollowing 
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700 border-0" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    }
                  >
                    {userIsFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-10 w-10 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mx-auto">{description}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community</h1>
              <p className="text-gray-600">Manage your connections and visitors</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 opacity-80" />
                <div className="text-2xl font-bold">{followersCount}</div>
                <div className="text-sm opacity-90">Followers</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
              <CardContent className="p-4 text-center">
                <UserCheck className="h-6 w-6 mx-auto mb-2 opacity-80" />
                <div className="text-2xl font-bold">{followingCount}</div>
                <div className="text-sm opacity-90">Following</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-600 to-pink-700 border-0 text-white">
              <CardContent className="p-4 text-center">
                <Eye className="h-6 w-6 mx-auto mb-2 opacity-80" />
                <div className="text-2xl font-bold">{visitors.length}</div>
                <div className="text-sm opacity-90">Visitors</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 bg-white border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="followers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-2xl shadow-sm">
              <TabsTrigger 
                value="followers" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
              >
                <Users className="h-4 w-4 mr-2" />
                Followers
                <Badge className="ml-2 bg-blue-100 text-blue-700 border-0">{followersCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="following" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-medium"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Following
                <Badge className="ml-2 bg-purple-100 text-purple-700 border-0">{followingCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="visitors" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visitors
                <Badge className="ml-2 bg-pink-100 text-pink-700 border-0">{visitors.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="followers" className="space-y-4">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredFollowers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFollowers.map((user) => (
                      <UserCard key={user.id} user={user} showFollowButton={false} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No Followers Yet"
                    description="When someone follows you, they'll appear here. Share your profile to gain followers!"
                  />
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="following" className="space-y-4">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredFollowing.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFollowing.map((user) => (
                      <UserCard key={user.id} user={user} showFollowButton={true} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={UserCheck}
                    title="Not Following Anyone"
                    description="Start following users to see their updates and connect with them here."
                  />
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="visitors" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Recent profile visitors
                </p>
                {visitors.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearVisitorHistory}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              <AnimatePresence mode="wait">
                {filteredVisitors.length > 0 ? (
                  <div className="space-y-3">
                    {filteredVisitors.map((user) => (
                      <UserCard key={user.id} user={user} showFollowButton={true} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Eye}
                    title="No Visitors Yet"
                    description="When someone visits your profile, they'll show up here. Keep creating great content!"
                  />
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default FollowersPage;
