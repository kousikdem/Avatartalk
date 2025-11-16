import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, UserMinus, Search, Eye, MessageSquare, Trash2, Filter, Clock, ArrowUpDown, Sparkles } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import FollowButton from '@/components/FollowButton';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  last_seen?: string;
  username?: string;
}

type SortOption = 'recent' | 'alphabetical' | 'online' | 'interactions';
type FilterOption = 'all' | 'creators' | 'users' | 'business';

const FollowersPage = () => {
  const { followers, following, loading, followUser, unfollowUser, isFollowing, refetch } = useFollows();
  const [searchTerm, setSearchTerm] = useState('');
  const [visitors, setVisitors] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('followers');
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const { toast } = useToast();

  // Fetch visitors from profile_visitors table with real-time updates
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) return;

        // Fetch visitors with profile data
        const { data: visitorsData, error } = await supabase
          .from('profile_visitors')
          .select(`
            visitor_id,
            visited_at,
            is_anonymous,
            profiles!profile_visitors_visitor_id_fkey (
              id,
              username,
              display_name,
              avatar_url,
              bio
            )
          `)
          .eq('visited_profile_id', currentUser.user.id)
          .order('visited_at', { ascending: false })
          .limit(30);

        if (error) throw error;

        // Transform visitors data with profile information
        const formattedVisitors: User[] = visitorsData?.map(visitor => ({
          id: visitor.visitor_id || `anonymous_${visitor.visited_at}`,
          full_name: visitor.profiles?.display_name || visitor.profiles?.username || 'Anonymous Visitor',
          email: '', // Don't show email for privacy
          avatar_url: visitor.profiles?.avatar_url,
          bio: visitor.profiles?.bio || (visitor.visitor_id ? 'Registered user' : 'Anonymous visitor'),
          last_seen: visitor.visited_at
        })) || [];

        setVisitors(formattedVisitors);
      } catch (error) {
        console.error('Error fetching visitors:', error);
        toast({
          title: "Error",
          description: "Failed to load profile visitors",
          variant: "destructive",
        });
      }
    };

    fetchVisitors();

    // Set up real-time subscription for profile visitors
    const channel = supabase
      .channel('profile-visitors-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_visitors'
        },
        () => {
          fetchVisitors(); // Refetch when new visitor
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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

  // Sort function
  const sortUsers = (users: User[]): User[] => {
    const sorted = [...users];
    switch (sortBy) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.full_name.localeCompare(b.full_name));
      case 'online':
        return sorted.sort((a, b) => {
          const aOnline = a.last_seen ? new Date(a.last_seen).getTime() : 0;
          const bOnline = b.last_seen ? new Date(b.last_seen).getTime() : 0;
          return bOnline - aOnline;
        });
      case 'interactions':
        return sorted.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0));
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          const aTime = a.last_seen ? new Date(a.last_seen).getTime() : 0;
          const bTime = b.last_seen ? new Date(b.last_seen).getTime() : 0;
          return bTime - aTime;
        });
    }
  };

  const filteredFollowers = sortUsers(
    displayFollowers.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredFollowing = sortUsers(
    displayFollowing.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredVisitors = sortUsers(
    visitors.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleFollow = async (userId: string) => {
    try {
      // Prevent following anonymous visitors
      if (userId.startsWith('anonymous_')) {
        toast({
          title: "Cannot Follow",
          description: "Anonymous visitors cannot be followed. They need to sign up first.",
          variant: "destructive",
        });
        return;
      }

      await followUser(userId);
      await refetch(); // Refresh the data
      toast({
        title: "Success",
        description: "Successfully followed user",
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
      await refetch(); // Refresh the data
      toast({
        title: "Success",
        description: "Successfully unfollowed user",
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
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { error } = await supabase
        .from('profile_visitors')
        .delete()
        .eq('visited_profile_id', currentUser.user.id);

      if (error) throw error;

      setVisitors([]);
      toast({
        title: "Success",
        description: "Visitor history cleared",
      });
    } catch (error) {
      console.error('Error clearing visitor history:', error);
      toast({
        title: "Error",
        description: "Failed to clear visitor history",
        variant: "destructive",
      });
    }
  };

  const handleChatClick = async (userId: string) => {
    try {
      // Get username for the user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profileData?.username) {
        window.location.href = `/${profileData.username}`;
      } else {
        toast({
          title: "Error",
          description: "Unable to open chat",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error navigating to profile:', error);
      toast({
        title: "Error",
        description: "Unable to open chat",
        variant: "destructive",
      });
    }
  };

  const UserCard = ({ user, showFollowButton = false, isFollowing = false, showMessageButton = false }: {
    user: User;
    showFollowButton?: boolean;
    isFollowing?: boolean;
    showMessageButton?: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white/90 via-blue-50/40 to-indigo-50/30 backdrop-blur-lg border border-white/60 hover:border-blue-200/60 transform hover:-translate-y-1">
        <CardContent className="p-5">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="w-14 h-14 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {user.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {user.last_seen && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate text-base group-hover:text-blue-900 transition-colors">
                  {user.full_name}
                </h3>
                {user.last_seen && (
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                  </Badge>
                )}
              </div>
              
              {user.bio && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">{user.bio}</p>
              )}
              
              {(user.followers_count !== undefined || user.following_count !== undefined) && (
                <div className="flex space-x-4 text-sm text-gray-500">
                  {user.followers_count !== undefined && (
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {user.followers_count} followers
                    </span>
                  )}
                  {user.following_count !== undefined && (
                    <span>{user.following_count} following</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              {showMessageButton && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="hover:bg-blue-50 hover:border-blue-200"
                  onClick={() => handleChatClick(user.id)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
              
              {showFollowButton && (
                <FollowButton
                  targetUserId={user.id}
                  targetUsername={user.username}
                  variant="compact"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Social Connections
              </h1>
              <p className="text-slate-600 text-lg">Manage your network and discover new connections</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[180px] bg-white/80 border-white/60 shadow-sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="online">Recently Active</SelectItem>
                <SelectItem value="interactions">Top Interactions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
              <SelectTrigger className="w-[160px] bg-white/80 border-white/60 shadow-sm">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="creators">Creators</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search users by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gradient-to-r from-white/90 to-blue-50/40 border-white/60 backdrop-blur-lg rounded-2xl text-base placeholder-gray-500 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 shadow-lg transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-white/90 via-blue-50/60 to-indigo-50/40 backdrop-blur-lg border border-white/60 shadow-lg rounded-2xl p-1">
            <TabsTrigger 
              value="followers"
              className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Followers ({filteredFollowers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="following"
              className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Following ({filteredFollowing.length})
            </TabsTrigger>
            <TabsTrigger 
              value="visitors"
              className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visitors ({filteredVisitors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-8">
            <AnimatePresence mode="wait">
              {filteredFollowers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-gradient-to-r from-white/90 via-blue-50/40 to-indigo-50/30 backdrop-blur-lg border border-white/60">
                    <CardContent className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'No followers found' : 'No followers yet'}
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm 
                          ? 'Try adjusting your search terms to find specific followers' 
                          : 'Share your profile to start building your community!'
                        }
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div className="space-y-4">
                  <AnimatePresence>
                    {filteredFollowers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <UserCard
                          user={user}
                          showMessageButton={true}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="following" className="mt-8">
            <AnimatePresence mode="wait">
              {filteredFollowing.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-gradient-to-r from-white/90 via-blue-50/40 to-indigo-50/30 backdrop-blur-lg border border-white/60">
                    <CardContent className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserPlus className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'No matches found' : 'Not following anyone yet'}
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm 
                          ? 'Try different search terms to find who you are following' 
                          : 'Discover interesting profiles and start following to build your network!'
                        }
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div className="space-y-4">
                  <AnimatePresence>
                    {filteredFollowing.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <UserCard
                          user={user}
                          showFollowButton={true}
                          isFollowing={isFollowing(user.id)}
                          showMessageButton={true}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="visitors" className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Recent profile visitors (last 30)</span>
              </div>
              {filteredVisitors.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearVisitorHistory}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {filteredVisitors.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-gradient-to-r from-white/90 via-blue-50/40 to-indigo-50/30 backdrop-blur-lg border border-white/60">
                    <CardContent className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Eye className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'No visitors found' : 'No recent visitors'}
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm 
                          ? 'Try different search terms to find specific visitors' 
                          : 'Share your profile link to start tracking visitors!'
                        }
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div className="space-y-4">
                  <AnimatePresence>
                    {filteredVisitors.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <UserCard
                          user={user}
                          showFollowButton={user.id !== `anonymous_${user.last_seen}` && !user.id.startsWith('anonymous_')}
                          isFollowing={isFollowing(user.id)}
                          showMessageButton={user.id !== `anonymous_${user.last_seen}` && !user.id.startsWith('anonymous_')}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FollowersPage;