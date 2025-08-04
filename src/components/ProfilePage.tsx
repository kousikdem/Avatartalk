
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Users, 
  Eye, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  Share2,
  UserPlus,
  UserMinus,
  Crown,
  Verified,
  Mic,
  Smile,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/5 to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Profile Container */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md mx-auto">
            {/* Profile Card */}
            <div className="neo-card p-8 text-center space-y-6">
              {/* 3D Avatar */}
              <div className="relative mx-auto w-48 h-48 md:w-56 md:h-56">
                <div className="avatar-glow">
                  <Avatar3D 
                    isLarge={true}
                    avatarStyle="realistic"
                    mood="friendly"
                    onInteraction={() => {}}
                  />
                </div>
              </div>

              {/* Name and Username */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {profileData.display_name || profileData.full_name || profileData.username}
                </h1>
                <p className="text-lg text-muted-foreground">@{profileData.username}</p>
              </div>

              {/* Bio */}
              {profileData.bio && (
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {profileData.bio}
                </p>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isCurrentUser && (
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      className="flex-1 neo-button-primary"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Talk to Me
                    </Button>
                    <Button
                      onClick={handleFollowToggle}
                      variant="outline"
                      size="lg"
                      className="flex-1 neo-button-secondary"
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
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">352</div>
                  <div className="stat-label">Total Conversations</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{followerCount > 999 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount}</div>
                  <div className="stat-label">Followers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">89</div>
                  <div className="stat-label">Engagement Score</div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="tab-navigation">
                  <TabsTrigger value="posts" className="tab-trigger">Posts</TabsTrigger>
                  <TabsTrigger value="chat" className="tab-trigger">Chat</TabsTrigger>
                  <TabsTrigger value="products" className="tab-trigger">Products/Gifts</TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No posts yet</p>
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="mt-6">
                  <div className="neo-card p-4 h-64 overflow-hidden">
                    <ChatTab />
                  </div>
                </TabsContent>

                <TabsContent value="products" className="mt-6">
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No products available</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Chat Input */}
              <div className="relative">
                <Input
                  placeholder="Ask me anything..."
                  className="neo-input pr-20 py-3 text-center"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/20">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/20">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="social-icons">
                <Button variant="ghost" size="sm" className="social-icon">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="social-icon">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="social-icon">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="social-icon">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="social-icon">
                  <Youtube className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="social-icon">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
