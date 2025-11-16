import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useFollows } from '@/hooks/useFollows';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowLeft, Filter } from 'lucide-react';
import UserFollowCard from '@/components/UserFollowCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  profile_pic_url?: string;
  profession?: string;
  followers_count?: number;
  following_count?: number;
}

interface VisitorData extends ProfileData {
  visited_at: string;
  visit_count?: number;
}

const FollowersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('followers');
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);

  const { followers, following, loading, refetch } = useFollows(currentUserId || undefined);

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    initUser();

    // Set active tab from URL params
    const tab = searchParams.get('tab');
    if (tab && ['followers', 'following', 'visitors'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentUserId) {
      fetchVisitors();
      
      // Set up realtime for visitors
      const channel = supabase
        .channel('profile-visitors-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profile_visitors',
            filter: `visited_profile_id=eq.${currentUserId}`
          },
          () => {
            fetchVisitors();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);

  const fetchVisitors = async () => {
    if (!currentUserId) return;
    
    setLoadingVisitors(true);
    try {
      const { data, error } = await supabase
        .from('profile_visitors')
        .select(`
          visitor_id,
          visited_at,
          profiles!profile_visitors_visitor_id_fkey (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            profile_pic_url,
            profession,
            followers_count,
            following_count
          )
        `)
        .eq('visited_profile_id', currentUserId)
        .not('visitor_id', 'is', null)
        .order('visited_at', { ascending: false });

      if (error) throw error;

      // Count visits per visitor
      const visitorMap = new Map<string, VisitorData>();
      data?.forEach((record: any) => {
        const profile = record.profiles;
        if (profile && profile.username) {
          const existing = visitorMap.get(profile.id);
          if (existing) {
            existing.visit_count = (existing.visit_count || 1) + 1;
            if (new Date(record.visited_at) > new Date(existing.visited_at)) {
              existing.visited_at = record.visited_at;
            }
          } else {
            visitorMap.set(profile.id, {
              ...profile,
              visited_at: record.visited_at,
              visit_count: 1
            });
          }
        }
      });

      setVisitors(Array.from(visitorMap.values()));
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast({
        title: "Error",
        description: "Failed to load profile visitors",
        variant: "destructive",
      });
    } finally {
      setLoadingVisitors(false);
    }
  };

  const transformFollowData = (followList: any[]): ProfileData[] => {
    return followList
      .map((follow: any) => {
        const profile = follow.follower || follow.following;
        if (!profile?.username) return null;
        
        return {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name || profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          profile_pic_url: profile.profile_pic_url,
          profession: profile.profession,
          followers_count: profile.followers_count || 0,
          following_count: profile.following_count || 0,
        } as ProfileData;
      })
      .filter((user) => user !== null) as ProfileData[];
  };

  const filterAndSortUsers = (users: (ProfileData | VisitorData)[]) => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(user => {
        if (filterBy === 'creators' && user.profession) return true;
        if (filterBy === 'users' && !user.profession) return true;
        return false;
      });
    }

    // Sort
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.display_name.localeCompare(b.display_name));
    } else if (sortBy === 'followers') {
      filtered.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0));
    } else if (sortBy === 'recent' && 'visited_at' in filtered[0]) {
      filtered.sort((a: any, b: any) => 
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime()
      );
    }

    return filtered;
  };

  const followersList = transformFollowData(followers);
  const followingList = transformFollowData(following);
  
  const filteredFollowers = filterAndSortUsers(followersList);
  const filteredFollowing = filterAndSortUsers(followingList);
  const filteredVisitors = filterAndSortUsers(visitors);

  const renderUserCards = (users: (ProfileData | VisitorData)[], showLoading: boolean) => {
    if (showLoading) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No users found</p>
          {searchTerm && (
            <Button 
              variant="link" 
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <UserFollowCard
            key={user.id}
            id={user.id}
            username={user.username}
            displayName={user.display_name}
            bio={user.bio}
            avatarUrl={user.avatar_url}
            profilePicUrl={user.profile_pic_url}
            profession={user.profession}
            followersCount={user.followers_count}
            followingCount={user.following_count}
            lastSeen={'visited_at' in user ? user.visited_at : undefined}
            visitCount={'visit_count' in user ? user.visit_count : undefined}
            currentUserId={currentUserId || undefined}
            showFollowButton={true}
            showMessageButton={true}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your Network
          </h1>
          <p className="text-muted-foreground">
            Manage your followers, following, and profile visitors
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="followers">Most Followers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="creators">Creators</SelectItem>
                <SelectItem value="users">Regular Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="followers" className="text-base">
              Followers
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs font-semibold">
                {followersList.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="following" className="text-base">
              Following
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs font-semibold">
                {followingList.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="text-base">
              Visitors
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs font-semibold">
                {visitors.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            {renderUserCards(filteredFollowers, loading)}
          </TabsContent>

          <TabsContent value="following">
            {renderUserCards(filteredFollowing, loading)}
          </TabsContent>

          <TabsContent value="visitors">
            {renderUserCards(filteredVisitors, loadingVisitors)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FollowersPage;
