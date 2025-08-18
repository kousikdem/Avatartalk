
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Eye,
  Plus,
  Settings,
  Share,
  MoreHorizontal,
  Grid3X3,
  List,
  BookOpen,
  Camera
} from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import PostsGrid from './PostsGrid';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { posts, isLoading, fetchPosts } = usePosts(currentUser?.id);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            >
              <Camera className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>
          
          <CardContent className="relative pt-0 pb-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 relative z-10">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
                  <AvatarImage src="/placeholder.svg" alt="Profile" />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 min-w-0 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">John Doe</h1>
                    <p className="text-lg text-muted-foreground">@johndoe</p>
                    <p className="text-foreground mt-2 leading-relaxed max-w-2xl">
                      Passionate developer and creative thinker. Building amazing experiences with code and design. 
                      Always learning, always growing. 🚀
                    </p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsCreatePostOpen(true)}
                      className="font-semibold"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Profile Stats & Info */}
                <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined March 2023</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">1.2K</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">842</span>
                    <span className="text-muted-foreground">likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">12.5K</span>
                    <span className="text-muted-foreground">profile views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                About
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Posts</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </Button>
                <Button variant="outline" size="sm">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid View
                </Button>
              </div>
            </div>
            <PostsGrid posts={posts} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground">
                    Passionate developer and creative thinker. Building amazing experiences with code and design.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Work</h3>
                  <p className="text-muted-foreground">Software Engineer at Tech Corp</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Education</h3>
                  <p className="text-muted-foreground">Computer Science - University of Technology</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No media yet</h3>
                <p className="text-muted-foreground">
                  Media from your posts will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground">
                  Your likes, comments, and interactions will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default ProfilePage;
