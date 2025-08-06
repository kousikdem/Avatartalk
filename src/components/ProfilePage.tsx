
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
  Send,
  Download,
  ArrowLeft,
  MoreVertical
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

interface UserStats {
  total_conversations: number;
  followers_count: number;
  engagement_score: number;
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
  const [userStats, setUserStats] = useState<UserStats>({
    total_conversations: 0,
    followers_count: 0,
    engagement_score: 0
  });
  const [chatMessage, setChatMessage] = useState('');

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

      // Load follower and following counts and user stats
      const [followersResult, followingResult, statsResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', profile.id),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', profile.id),
        supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle()
      ]);

      setFollowerCount(followersResult.count || 0);
      setFollowingCount(followingResult.count || 0);
      
      if (statsResult.data) {
        setUserStats({
          total_conversations: statsResult.data.total_conversations || 0,
          followers_count: followersResult.count || 0,
          engagement_score: Math.round(statsResult.data.engagement_score || 0)
        });
      }

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
        setUserStats(prev => ({ ...prev, followers_count: prev.followers_count - 1 }));
      } else {
        await followUser(profileData.id);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        setUserStats(prev => ({ ...prev, followers_count: prev.followers_count + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Handle sending message logic here
      setChatMessage('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-foreground mb-2">Profile not found</h1>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">AvatarTalk.bio</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600">
              <Avatar3D 
                isLarge={false}
                avatarStyle="realistic"
                mood="friendly"
                onInteraction={() => {}}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {profileData.display_name || profileData.full_name || profileData.username}
            </h2>
            <p className="text-slate-400">@{profileData.username}</p>
          </div>
        </div>

        {/* Bio */}
        {profileData.bio && (
          <p className="text-slate-300 leading-relaxed">
            {profileData.bio}
          </p>
        )}

        {/* Main Avatar Preview */}
        <div className="relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-slate-800/80 to-blue-900/50 rounded-2xl overflow-hidden border border-slate-600/50">
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
        <div className="flex gap-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 font-medium">
            Talk to Me
          </Button>
          <Button
            onClick={handleFollowToggle}
            variant="outline"
            className={`px-6 h-12 rounded-full font-medium border-slate-600 ${
              isFollowing 
                ? 'bg-slate-700 text-white' 
                : 'bg-transparent text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button variant="outline" size="sm" className="h-12 w-12 rounded-full border-slate-600">
            <UserPlus className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {userStats.total_conversations}
            </div>
            <div className="text-sm text-slate-400">Total Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {userStats.followers_count > 999 
                ? `${(userStats.followers_count / 1000).toFixed(1)}K` 
                : userStats.followers_count}
            </div>
            <div className="text-sm text-slate-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {userStats.engagement_score}
            </div>
            <div className="text-sm text-slate-400">Engagement Score</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 rounded-xl p-1">
            <TabsTrigger 
              value="posts" 
              className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              Projects/Gifts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <div className="bg-slate-800/30 rounded-xl p-6 text-center border border-slate-700/50">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-400 text-sm">No posts yet</p>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            <div className="bg-slate-800/30 rounded-xl p-4 min-h-[200px] border border-slate-700/50">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                  <div className="bg-slate-700/70 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                    <p className="text-slate-200 text-sm">
                      Hi! I'm excited to chat with you. What would you like to talk about?
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-blue-600 rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                    <p className="text-white text-sm">
                      Tell me about your experience in AI!
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <div className="bg-slate-800/30 rounded-xl p-6 text-center border border-slate-700/50">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-slate-400 text-sm">Digital Products & Services</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chat Input */}
        <div className="relative">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-600/50 px-4 py-3 flex items-center gap-3">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="border-0 bg-transparent text-white placeholder:text-slate-400 flex-1 focus-visible:ring-0 p-0"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full"
            >
              <Mic className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center justify-center gap-4 pb-6">
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-slate-700">
            <Twitter className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-slate-700">
            <Linkedin className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-slate-700">
            <Youtube className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-slate-700">
            <Facebook className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-slate-700">
            <Instagram className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-slate-700">
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Button>
          <div className="w-px h-6 bg-slate-600"></div>
          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-slate-700">
            <Share2 className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
