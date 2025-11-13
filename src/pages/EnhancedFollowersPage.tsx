import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, UserPlus, UserMinus, Search, TrendingUp, TrendingDown, 
  Download, Send, Filter, SortAsc, Heart, MessageSquare, Eye,
  ShoppingCart, Clock, MapPin, Folder, Star, MoreVertical, Shield, X
} from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { useFollowerAnalytics } from '@/hooks/useFollowerAnalytics';
import { useFollowerEngagement } from '@/hooks/useFollowerEngagement';
import { useFollowerCategories } from '@/hooks/useFollowerCategories';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

interface FollowerUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  followed_at: string;
  engagement_score?: number;
  last_interaction?: string;
}

type SortBy = 'recent' | 'alphabetical' | 'most_active';
type FilterBy = 'all' | 'recent' | 'active' | 'inactive';

const EnhancedFollowersPage = () => {
  const navigate = useNavigate();
  const { followers, following, followersCount, followingCount, loading, followUser, unfollowUser, isFollowing, refetch } = useFollows();
  const { growthStats, loading: analyticsLoading } = useFollowerAnalytics();
  const { engagement, loading: engagementLoading } = useFollowerEngagement();
  const { categories, createCategory, assignToCategory, removeFromCategory, getCategoriesForFollowing } = useFollowerCategories();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('followers');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');

  // Transform followers with engagement data
  const followersWithEngagement: FollowerUser[] = useMemo(() => {
    return followers.map(follow => {
      const engagementData = engagement.find(e => e.follower_id === follow.follower?.id);
      return {
        id: follow.follower?.id || '',
        username: follow.follower?.username || '',
        display_name: follow.follower?.display_name || '',
        avatar_url: follow.follower?.avatar_url,
        bio: '',
        followed_at: follow.created_at,
        engagement_score: engagementData?.engagement_score || 0,
        last_interaction: engagementData?.last_interaction_at
      };
    });
  }, [followers, engagement]);

  // Transform following data
  const followingUsers: FollowerUser[] = useMemo(() => {
    return following.map(follow => ({
      id: follow.following?.id || '',
      username: follow.following?.username || '',
      display_name: follow.following?.display_name || '',
      avatar_url: follow.following?.avatar_url,
      bio: '',
      followed_at: follow.created_at,
    }));
  }, [following]);

  // Filter and sort logic
  const processedFollowers = useMemo(() => {
    let filtered = followersWithEngagement.filter(user =>
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply filter
    if (filterBy === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(u => new Date(u.followed_at) > weekAgo);
    } else if (filterBy === 'active') {
      filtered = filtered.filter(u => u.engagement_score && u.engagement_score > 0);
    } else if (filterBy === 'inactive') {
      filtered = filtered.filter(u => !u.engagement_score || u.engagement_score === 0);
    }

    // Apply sort
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.display_name.localeCompare(b.display_name));
    } else if (sortBy === 'most_active') {
      filtered.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
    } else {
      filtered.sort((a, b) => new Date(b.followed_at).getTime() - new Date(a.followed_at).getTime());
    }

    return filtered;
  }, [followersWithEngagement, searchTerm, sortBy, filterBy]);

  const processedFollowing = useMemo(() => {
    let filtered = followingUsers.filter(user =>
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.display_name.localeCompare(b.display_name));
    } else {
      filtered.sort((a, b) => new Date(b.followed_at).getTime() - new Date(a.followed_at).getTime());
    }

    return filtered;
  }, [followingUsers, searchTerm, sortBy]);

  // Get mutual connections
  const mutualConnections = useMemo(() => {
    const followerIds = new Set(followers.map(f => f.follower?.id));
    return following.filter(f => followerIds.has(f.following?.id));
  }, [followers, following]);

  // Most engaged followers
  const topEngagedFollowers = useMemo(() => {
    return followersWithEngagement
      .filter(f => f.engagement_score && f.engagement_score > 0)
      .sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))
      .slice(0, 10);
  }, [followersWithEngagement]);

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedUsers.size === processedFollowers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(processedFollowers.map(u => u.id)));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Username', 'Display Name', 'Followed At', 'Engagement Score'];
    const rows = processedFollowers.map(u => [
      u.username,
      u.display_name,
      u.followed_at,
      u.engagement_score?.toFixed(2) || '0'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `followers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Followers list exported successfully",
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory(newCategoryName, undefined, newCategoryColor);
    setNewCategoryName('');
    setNewCategoryColor('#6366f1');
    setShowCategoryDialog(false);
  };

  if (loading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Community
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your followers, following, and community connections
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Dashboard
          </Button>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followers">
              Followers ({followersCount})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({followingCount})
            </TabsTrigger>
            <TabsTrigger value="mutual">
              Mutual ({mutualConnections.length})
            </TabsTrigger>
          </TabsList>

          {/* Followers Tab */}
          <TabsContent value="followers" className="space-y-6">
            {/* Growth Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Followers</p>
                      <p className="text-3xl font-bold mt-1">{followersCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-3xl font-bold">{growthStats.today > 0 ? '+' : ''}{growthStats.today}</p>
                        {growthStats.today > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : growthStats.today < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-3xl font-bold">{growthStats.week > 0 ? '+' : ''}{growthStats.week}</p>
                        {growthStats.week > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : growthStats.week < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-3xl font-bold">{growthStats.month > 0 ? '+' : ''}{growthStats.month}</p>
                        {growthStats.month > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : growthStats.month < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Growth Chart */}
            {growthStats.chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Follower Growth Trend</CardTitle>
                  <CardDescription>Your follower count over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthStats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="followers" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Most Engaged Followers */}
            {topEngagedFollowers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Most Engaged Followers
                  </CardTitle>
                  <CardDescription>Your top supporters based on interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topEngagedFollowers.map((follower, index) => (
                      <div key={follower.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <Badge variant="outline" className="font-bold">
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={follower.avatar_url} />
                          <AvatarFallback>{follower.display_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{follower.display_name}</p>
                          <p className="text-sm text-muted-foreground truncate">@{follower.username}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{follower.engagement_score?.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search followers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Followers</SelectItem>
                      <SelectItem value="recent">Recent (7 days)</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      <SelectItem value="most_active">Most Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.size > 0 && (
                  <div className="mt-4 flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedUsers.size} selected
                    </p>
                    <div className="flex gap-2 ml-auto">
                      <Button size="sm" variant="outline" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedUsers(new Set())}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Followers List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Followers ({processedFollowers.length})</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleSelectAll}>
                    {selectedUsers.size === processedFollowers.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  <div className="space-y-3">
                    {processedFollowers.map((follower) => (
                      <motion.div
                        key={follower.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={selectedUsers.has(follower.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedUsers);
                            if (checked) {
                              newSelected.add(follower.id);
                            } else {
                              newSelected.delete(follower.id);
                            }
                            setSelectedUsers(newSelected);
                          }}
                        />

                        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/@${follower.username}`)}>
                          <AvatarImage src={follower.avatar_url} />
                          <AvatarFallback>{follower.display_name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate cursor-pointer hover:text-primary" onClick={() => navigate(`/@${follower.username}`)}>
                              {follower.display_name}
                            </p>
                            {follower.engagement_score && follower.engagement_score > 10 && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Super Fan
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">@{follower.username}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(follower.followed_at), { addSuffix: true })}
                            </span>
                            {follower.engagement_score && follower.engagement_score > 0 && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Heart className="h-3 w-3" />
                                {follower.engagement_score.toFixed(0)} engagement
                              </span>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/@${follower.username}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Shield className="h-4 w-4 mr-2" />
                              Block User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))}

                    {processedFollowers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold">No followers found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm ? 'Try adjusting your search or filters' : 'Start building your community!'}
                        </p>
                      </div>
                    )}
                  </div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Organize Following</CardTitle>
                  <Button size="sm" onClick={() => setShowCategoryDialog(true)}>
                    <Folder className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="outline" style={{ borderColor: category.color }}>
                      {category.category_name}
                    </Badge>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Create categories to organize who you follow
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search following..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Following List */}
            <Card>
              <CardHeader>
                <CardTitle>Following ({processedFollowing.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processedFollowing.map((user) => {
                    const userCategories = getCategoriesForFollowing(user.id);
                    
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-primary transition-colors"
                      >
                        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/@${user.username}`)}>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate cursor-pointer hover:text-primary" onClick={() => navigate(`/@${user.username}`)}>
                              {user.display_name}
                            </p>
                            {mutualConnections.some(m => m.following?.id === user.id) && (
                              <Badge variant="secondary" className="text-xs">
                                Mutual
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {userCategories.map(cat => (
                              <Badge key={cat.id} variant="outline" className="text-xs" style={{ borderColor: cat.color }}>
                                {cat.category_name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/@${user.username}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {categories.length > 0 && (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Folder className="h-4 w-4 mr-2" />
                                  Add to Category
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {categories.map(cat => (
                                    <DropdownMenuItem key={cat.id} onClick={() => assignToCategory(user.id, cat.id)}>
                                      {cat.category_name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => unfollowUser(user.id)}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Unfollow
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    );
                  })}

                  {processedFollowing.length === 0 && (
                    <div className="text-center py-12">
                      <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold">Not following anyone yet</p>
                      <p className="text-sm text-muted-foreground">
                        Discover and follow interesting profiles
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mutual Tab */}
          <TabsContent value="mutual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mutual Connections
                </CardTitle>
                <CardDescription>
                  Profiles that follow you and you follow back
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mutualConnections.map((connection) => (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-primary/20 bg-primary/5"
                    >
                      <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/@${connection.following?.username}`)}>
                        <AvatarImage src={connection.following?.avatar_url} />
                        <AvatarFallback>{connection.following?.display_name?.[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate cursor-pointer hover:text-primary" onClick={() => navigate(`/@${connection.following?.username}`)}>
                          {connection.following?.display_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">@{connection.following?.username}</p>
                        <Badge variant="secondary" className="text-xs mt-2">
                          <Users className="h-3 w-3 mr-1" />
                          Mutual Connection
                        </Badge>
                      </div>

                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/@${connection.following?.username}`)}
                      >
                        View Profile
                      </Button>
                    </motion.div>
                  ))}

                  {mutualConnections.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold">No mutual connections yet</p>
                      <p className="text-sm text-muted-foreground">
                        Follow your followers to create mutual connections
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Organize who you follow into categories
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Friends, Creators, Business"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color">Color</Label>
              <Input
                id="category-color"
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedFollowersPage;
