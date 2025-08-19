
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Mail,
  Edit,
  Settings,
  Share2,
  MessageCircle,
  Users,
  Grid,
  List,
  Filter
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePosts } from '@/hooks/usePosts';
import PostsGrid from './PostsGrid';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const { profile, isLoading } = useProfile();
  const { userProfile } = useUserProfile();
  const { posts, isLoading: postsLoading } = usePosts(profile?.id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="flex gap-4">
            <div className="h-24 w-24 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Posts', value: posts?.length || 0 },
    { label: 'Followers', value: userProfile?.followers_count || 0 },
    { label: 'Following', value: 0 },
    { label: 'Views', value: userProfile?.profile_views || 0 },
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-t-lg"></div>
          
          {/* Profile Info */}
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-12 relative z-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url || profile?.profile_pic_url} />
                  <AvatarFallback className="text-lg font-semibold">
                    {profile?.display_name?.[0] || profile?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {profile?.display_name || profile?.full_name || 'Anonymous User'}
                    </h1>
                    {profile?.username && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Additional Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  {profile?.profession && (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{profile.profession}</Badge>
                    </div>
                  )}
                  {profile?.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-semibold text-foreground">{stat.value}</div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Profile Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Posts</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">About</span>
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Followers</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Posts ({posts?.length || 0})</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <PostsGrid 
            posts={posts || []} 
            isLoading={postsLoading} 
            showAuthor={false}
          />
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}
              
              {profile?.profession && (
                <div>
                  <h4 className="font-medium mb-2">Profession</h4>
                  <p className="text-muted-foreground">{profile.profession}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="space-y-2">
                  {profile?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span className="text-muted-foreground">{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Followers & Following</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Followers and following list will be implemented soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Profile Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
