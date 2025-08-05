
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Futuristic Space Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-purple-600/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/60 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-blue-300/40 rounded-full animate-pulse delay-1500"></div>
          <div className="absolute top-1/2 right-20 w-1 h-1 bg-purple-300/50 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
      
      {/* Profile Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <h1 className="text-xl font-bold text-white">AvatarTalk.bio</h1>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Share2 className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Main Profile Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 space-y-6 shadow-2xl">
            
            {/* Profile Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">
                {profileData.display_name || profileData.full_name || profileData.username}
              </h1>
              <p className="text-blue-300 font-medium">@{profileData.username}</p>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="text-center">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {profileData.bio}
                </p>
              </div>
            )}

            {/* 3D Avatar Preview */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-blue-900/30 rounded-2xl border border-slate-600/30 overflow-hidden">
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
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 font-semibold border-0">
                  Talk to Me
                </Button>
                <Button
                  onClick={handleFollowToggle}
                  variant="outline"
                  className="flex-1 border-slate-600 text-white hover:bg-slate-800 rounded-full h-12 font-semibold"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 w-12 rounded-full text-white hover:bg-slate-800"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                <div className="text-2xl font-bold text-white">352</div>
                <div className="text-xs text-slate-400 mt-1">Total Conversations</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                <div className="text-2xl font-bold text-white">
                  {followerCount > 999 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount}
                </div>
                <div className="text-xs text-slate-400 mt-1">Followers</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                <div className="text-2xl font-bold text-white">89</div>
                <div className="text-xs text-slate-400 mt-1">Engagement Score</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="bg-slate-800/50 border border-slate-700/50 rounded-full p-1 w-full grid grid-cols-3">
                <TabsTrigger value="posts" className="rounded-full text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="chat" className="rounded-full text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="products" className="rounded-full text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Projects/Gifts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-4">
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30 text-center">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">No posts yet</p>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-4">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 h-48">
                  <ChatTab />
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-4">
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-slate-400 text-sm">Premium Gifts</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Input */}
          <div className="mt-6 relative">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full p-3 flex items-center gap-3">
              <Input
                placeholder="Ask me anything..."
                className="border-0 bg-transparent text-white placeholder:text-slate-400 flex-1 focus-visible:ring-0"
              />
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-slate-800 rounded-full text-slate-400"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-slate-800 rounded-full text-slate-400"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center items-center gap-4 mt-6 px-4">
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full text-slate-400 hover:text-blue-400 hover:bg-slate-800">
              <Twitter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-800">
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-800">
              <Youtube className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full text-slate-400 hover:text-blue-500 hover:bg-slate-800">
              <Facebook className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full text-slate-400 hover:text-pink-500 hover:bg-slate-800">
              <Instagram className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full text-slate-400 hover:text-green-500 hover:bg-slate-800">
              <ExternalLink className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-slate-700"></div>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
