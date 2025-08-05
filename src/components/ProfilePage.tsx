
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Users, 
  Heart,
  Share2,
  UserPlus,
  UserMinus,
  Crown,
  Mic,
  Smile,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
  Send
} from 'lucide-react';
import Avatar3D from './Avatar3D';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFollows } from '@/hooks/useFollows';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import ChatTab from './ChatTab';

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  full_name: string;
  email: string;
  bio: string;
  profile_pic_url: string;
  avatar_url: string;
  created_at: string;
}

const ProfilePage = () => {
  const { username: urlUsername } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData: currentUserProfile } = useUserProfile();
  const { followUser, unfollowUser } = useFollows();
  
  // Get username from either URL params or search params
  const username = urlUsername || searchParams.get('username');
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading profile for username:', username);

      // Load profile data - use exact matching now that usernames are clean
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username?.trim())
        .maybeSingle();

      console.log('Profile query result:', { profile, error });

      if (error) {
        console.error('Profile error:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If no profile found, show not found state
      if (!profile) {
        console.log('No profile found for username:', username);
        setProfileData(null);
        setLoading(false);
        return;
      }

      setProfileData(profile);

      // Check if this is the current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      setIsCurrentUser(user?.id === profile.id);

      // Load follow status and counts
      if (user && user.id !== profile.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .maybeSingle();

        setIsFollowing(!!followData);
      }

      // Load follower and following counts
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', profile.id),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', profile.id)
      ]);

      setFollowerCount(followersResult.count || 0);
      setFollowingCount(followingResult.count || 0);

      // Increment profile views
      if (user && user.id !== profile.id) {
        await supabase
          .from('profile_visitors')
          .insert([{
            visitor_id: user.id,
            visited_profile_id: profile.id
          }]);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileData) return;

    try {
      if (isFollowing) {
        await unfollowUser(profileData.id);
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else {
        await followUser(profileData.id);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-r-2 border-primary"></div>
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center neo-card p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile not found</h1>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-accent/40 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg mx-auto">
          {/* Main Profile Card */}
          <div className="neo-card p-6 md:p-8 text-center space-y-6 animate-fade-in">
            
            {/* 3D Avatar with Enhanced Effects */}
            <div className="relative mx-auto w-40 h-40 md:w-48 md:h-48 mb-6">
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring"></div>
              <div className="relative avatar-glow rounded-full overflow-hidden">
                <Avatar3D 
                  isLarge={true}
                  avatarStyle="realistic"
                  mood="friendly"
                  onInteraction={() => {}}
                />
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-card animate-glow">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {profileData.display_name || profileData.full_name || profileData.username}
                </h1>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
              </div>
              <p className="text-base text-muted-foreground font-medium">@{profileData.username}</p>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="bg-muted/30 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {profileData.bio}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!isCurrentUser && (
              <div className="flex gap-3 mt-6">
                <Button
                  size="lg"
                  className="flex-1 neo-button-primary h-12 rounded-full font-semibold"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Talk to Me
                </Button>
                <Button
                  onClick={handleFollowToggle}
                  variant="outline"
                  size="lg"
                  className="flex-1 neo-button-secondary h-12 rounded-full font-semibold"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-5 h-5 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 w-12 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/10"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid mt-8">
              <div className="stat-item bg-card/30 rounded-lg p-4 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div className="stat-number">352</div>
                <div className="stat-label">Conversations</div>
              </div>
              <div className="stat-item bg-card/30 rounded-lg p-4 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div className="stat-number">{followerCount > 999 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-item bg-card/30 rounded-lg p-4 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <div className="stat-number">89</div>
                <div className="stat-label">Engagement</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs defaultValue="posts" className="w-full mt-8">
              <TabsList className="tab-navigation w-full">
                <TabsTrigger value="posts" className="tab-trigger flex-1">Posts</TabsTrigger>
                <TabsTrigger value="chat" className="tab-trigger flex-1">Chat</TabsTrigger>
                <TabsTrigger value="products" className="tab-trigger flex-1">Gifts</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6">
                <div className="bg-card/20 rounded-lg p-8 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No posts yet</h3>
                    <p className="text-sm text-muted-foreground">Share your first thought with the world</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <div className="bg-card/20 rounded-lg p-4 backdrop-blur-sm h-64">
                  <ChatTab />
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <div className="bg-card/20 rounded-lg p-8 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Premium Gifts</h3>
                    <p className="text-sm text-muted-foreground">Exclusive gifts coming soon</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Interactive Chat Input */}
            <div className="relative mt-8">
              <div className="neo-input relative flex items-center pr-16">
                <Input
                  placeholder="Ask me anything..."
                  className="border-0 bg-transparent text-center flex-1 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-primary/20 rounded-full"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-primary/20 rounded-full"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-primary hover:bg-primary/90 rounded-full"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="social-icons mt-6">
              <Button variant="ghost" size="sm" className="social-icon hover:text-blue-400">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="social-icon hover:text-blue-600">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="social-icon hover:text-blue-500">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="social-icon hover:text-pink-500">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="social-icon hover:text-red-500">
                <Youtube className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="social-icon hover:text-green-500">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
