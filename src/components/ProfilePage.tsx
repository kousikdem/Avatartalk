
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <h1 className="text-xl font-bold text-foreground">AvatarTalk.bio</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <div className="w-6 h-6 rounded-full bg-muted"></div>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <div className="w-6 h-6 rounded-full bg-primary"></div>
          </Button>
        </div>
      </div>
      
      {/* Profile Container */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Profile Header with Small Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-primary/30 overflow-hidden">
                <Avatar3D 
                  isLarge={false}
                  avatarStyle="realistic"
                  mood="friendly"
                  onInteraction={() => {}}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {profileData.display_name || profileData.full_name || profileData.username}
              </h1>
              <p className="text-muted-foreground">@{profileData.username}</p>
            </div>
          </div>

          {/* Bio */}
          {profileData.bio && (
            <div>
              <p className="text-foreground/80 leading-relaxed">
                {profileData.bio}
              </p>
            </div>
          )}

          {/* Main 3D Avatar Preview */}
          <div className="relative mx-auto">
            <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-blue-900/30 rounded-2xl border border-border overflow-hidden neo-glass">
              <div className="w-full h-full flex items-center justify-center">
                <Avatar3D 
                  isLarge={true}
                  avatarStyle="realistic"
                  mood="friendly"
                  onInteraction={() => {}}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isCurrentUser && (
            <div className="flex gap-3">
              <Button className="flex-1 neo-button-primary">
                Talk to Me
              </Button>
              <Button
                onClick={handleFollowToggle}
                variant="outline"
                className="neo-button-secondary"
              >
                Chat
              </Button>
              <Button
                onClick={handleFollowToggle}
                variant="outline"
                size="lg"
                className="h-12 w-12 rounded-full border-border hover:border-primary/50"
              >
                <UserPlus className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">352</div>
              <div className="stat-label">Total Conversations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {followerCount > 999 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount}
              </div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">89</div>
              <div className="stat-label">Engagement Score</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="tab-navigation">
              <TabsTrigger value="posts" className="tab-trigger">
                Posts
              </TabsTrigger>
              <TabsTrigger value="chat" className="tab-trigger">
                Chat
              </TabsTrigger>
              <TabsTrigger value="products" className="tab-trigger">
                Projects/Gifts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4">
              <div className="neo-card p-6 text-center">
                <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No posts yet</p>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              <div className="neo-card p-4 h-48 overflow-y-auto">
                <ChatTab />
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-4">
              <div className="neo-card p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-muted-foreground text-sm">Premium Gifts</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Chat Input */}
          <div className="relative">
            <div className="neo-input flex items-center gap-3 px-4 py-3">
              <Input
                placeholder="Ask me anything..."
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground flex-1 focus-visible:ring-0 p-0"
              />
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-muted rounded-full text-muted-foreground"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-muted rounded-full text-muted-foreground"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="social-icons">
            <Button variant="ghost" className="social-icon">
              <Twitter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="social-icon">
              <Linkedin className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="social-icon">
              <Youtube className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="social-icon">
              <Facebook className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="social-icon">
              <Instagram className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="social-icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border"></div>
            <Button variant="ghost" className="social-icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
