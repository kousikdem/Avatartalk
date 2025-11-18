import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, UserMinus, Search, Eye, MessageSquare, Trash2, Filter, Clock, SortAsc, CircleDot } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import FollowButton from '@/components/FollowButton';

interface User {
  id: string;
  full_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  last_seen?: string;
  visit_count?: number;
  is_online?: boolean;
}

type SortOption = 'recent' | 'alphabetical' | 'online' | 'interactions';
type FilterOption = 'all' | 'creators' | 'users' | 'business' | 'ai';

const FollowersPage = () => {
  const { followers, following, loading, followUser, unfollowUser, isFollowing, refetch } = useFollows();
  const [searchTerm, setSearchTerm] = useState('');
  const [visitors, setVisitors] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('followers');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch visitors from profile_visitors table with real-time updates
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) return;

        // Fetch visitors with profile data including visit_count
        const { data: visitorsData, error } = await supabase
          .from('profile_visitors')
          .select(`
            visitor_id,
            visited_at,
            is_anonymous,
            visit_count,
            profiles!profile_visitors_visitor_id_fkey (
              id,
              username,
              display_name,
              avatar_url,
              bio,
              followers_count,
              following_count
            )
          `)
          .eq('visited_profile_id', currentUser.user.id)
          .order('visited_at', { ascending: false });

        if (error) throw error;

        // Transform visitors data with profile information
        const formattedVisitors: User[] = visitorsData?.map(visitor => ({
          id: visitor.visitor_id || `anonymous_${visitor.visited_at}`,
          username: visitor.profiles?.username,
          full_name: visitor.profiles?.display_name || visitor.profiles?.username || 'Anonymous Visitor',
          email: '',
          avatar_url: visitor.profiles?.avatar_url,
          bio: visitor.profiles?.bio || (visitor.visitor_id ? 'Registered user' : 'Anonymous visitor'),
          followers_count: visitor.profiles?.followers_count || 0,
          following_count: visitor.profiles?.following_count || 0,
          last_seen: visitor.visited_at,
          visit_count: visitor.visit_count || 1,
          is_online: false
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
          event: '*',
          schema: 'public',
          table: 'profile_visitors'
        },
        () => {
          fetchVisitors(); // Refetch when visitor changes
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
    username: follow.follower?.username,
    full_name: follow.follower?.display_name || follow.follower?.username || 'Unknown',
    email: '',
    avatar_url: follow.follower?.avatar_url,
    bio: 'Follower',
    followers_count: 0,
    following_count: 0,
    is_online: false
  }));

  // Transform following data for display
  const displayFollowing: User[] = following.map(follow => ({
    id: follow.following?.id || '',
    username: follow.following?.username,
    full_name: follow.following?.display_name || follow.following?.username || 'Unknown',
    email: '',
    avatar_url: follow.following?.avatar_url,
    bio: 'Following',
    followers_count: 0,
    following_count: 0,
    is_online: false
  }));

  // Sort function
  const sortUsers = (users: User[]) => {
    const sorted = [...users];
    switch (sortBy) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.full_name.localeCompare(b.full_name));
      case 'online':
        return sorted.sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));
      case 'interactions':
        return sorted.sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0));
      case 'recent':
      default:
        return sorted;
    }
  };

  // Filter and search logic
  const filterAndSearchUsers = (users: User[]) => {
    let filtered = users.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply filter (can be enhanced with actual user types)
    if (filterBy !== 'all') {
      // Placeholder for future filter logic
      filtered = filtered;
    }

    return sortUsers(filtered);
  };

  const filteredFollowers = filterAndSearchUsers(displayFollowers);
  const filteredFollowing = filterAndSearchUsers(displayFollowing);
  const filteredVisitors = filterAndSearchUsers(visitors);

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser(userId);
      await refetch();
    } catch (error) {
      console.error('Error unfollowing user:', error);
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
        description: "Visitor history cleared successfully",
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

  const handleChatClick = (userId: string, username?: string) => {
    if (username) {
      navigate(`/${username}`);
    }
  };

  // UserCard Component
  const UserCard: React.FC<{
    user: User;
    type: 'follower' | 'following' | 'visitor';
  }> = ({ user, type }) => {
    const isAnonymous = user.id.startsWith('anonymous_');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Card className="hover:shadow-xl transition-all duration-300 border hover:border-primary/40 bg-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar with Online Status */}
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/30 ring-2 ring-background group-hover:border-primary transition-colors">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.is_online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <CircleDot className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* User Info */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                        {user.full_name}
                      </h3>
                      {user.username && (
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      )}
                    </div>
                    {type === 'visitor' && user.visit_count && user.visit_count > 1 && (
                      <Badge variant="secondary" className="shrink-0">
                        <Eye className="h-3 w-3 mr-1" />
                        {user.visit_count} visits
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {user.bio || 'No bio available'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium">{user.followers_count || 0}</span> followers
                  </span>
                  <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="font-medium">{user.following_count || 0}</span> following
                  </span>
                </div>

                {/* Last Seen / Visit Info */}
                {user.last_seen && type === 'visitor' && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last visited {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {!isAnonymous && user.username && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChatClick(user.id, user.username)}
                      className="flex-1 group-hover:border-primary/50 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}

                  {!isAnonymous && type === 'follower' && (
                    <FollowButton
                      targetUserId={user.id}
                      targetUsername={user.username}
                      currentUserId={currentUserId || undefined}
                      variant="compact"
                      className="flex-1"
                    />
                  )}

                  {type === 'following' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(user.id)}
                      className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive transition-colors"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </Button>
                  )}

                  {type === 'visitor' && !isAnonymous && (
                    <FollowButton
                      targetUserId={user.id}
                      targetUsername={user.username}
                      currentUserId={currentUserId || undefined}
                      variant="compact"
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="shadow-2xl border-primary/20 overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background pb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Community
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your connections and track engagement
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-[160px] border-primary/20">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="online">Online First</SelectItem>
                    <SelectItem value="interactions">Top Interactions</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                  <SelectTrigger className="w-[140px] border-primary/20">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="creators">Creators</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="ai">AI Avatars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 p-1 h-auto bg-muted/50 rounded-xl">
              <TabsTrigger 
                value="followers" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 transition-all"
              >
                <Users className="h-4 w-4" />
                <span className="font-semibold">Followers</span>
                <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary border-0">
                  {followers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="following" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span className="font-semibold">Following</span>
                <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary border-0">
                  {following.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="visitors" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 transition-all"
              >
                <Eye className="h-4 w-4" />
                <span className="font-semibold">Visitors</span>
                <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary border-0">
                  {visitors.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Followers Tab */}
            <TabsContent value="followers" className="mt-0">
              {loading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading followers...</p>
                </div>
              ) : filteredFollowers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Followers Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchTerm ? "No followers match your search criteria" : "When people follow you, they'll appear here. Share your profile to grow your audience!"}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {filteredFollowers.map((follower) => (
                      <UserCard
                        key={follower.id}
                        user={follower}
                        type="follower"
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="mt-0">
              {loading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading following...</p>
                </div>
              ) : filteredFollowing.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <UserPlus className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Not Following Anyone</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchTerm ? "No users match your search criteria" : "Start following interesting creators and users to build your network!"}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {filteredFollowing.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        type="following"
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </TabsContent>

            {/* Visitors Tab */}
            <TabsContent value="visitors" className="mt-0">
              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Track who's viewing your profile and their engagement
                </p>
                {visitors.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearVisitorHistory}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                )}
              </div>

              {filteredVisitors.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Eye className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Profile Visitors</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchTerm ? "No visitors match your search criteria" : "When people visit your profile, they'll show up here with visit counts and timestamps"}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {filteredVisitors.map((visitor) => (
                      <UserCard
                        key={visitor.id}
                        user={visitor}
                        type="visitor"
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowersPage;
