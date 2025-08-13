
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { 
  MessageSquare, 
  Users, 
  Heart,
  Share2,
  UserPlus,
  UserMinus,
  Crown,
  Mic,
  MicOff,
  Smile,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Send,
  Play,
  Volume2,
  Facebook,
  Globe,
  X,
  MoreVertical,
  Github,
  MessageCircle,
  Link,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import Avatar3D from './Avatar3D';
import EmojiPicker from './EmojiPicker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFollows } from '@/hooks/useFollows';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { usePosts } from '@/hooks/usePosts';
import { LinkCard } from '@/components/LinkCard';
import { formatDistanceToNow } from 'date-fns';

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
  const { synthesizeSpeech, stopSpeech, isPlaying: isSpeaking } = useCoquiTTS();
  const { theme, setTheme } = useTheme();
  
  // Get username from either URL params or search params
  const username = urlUsername || searchParams.get('username');
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const { posts, isLoading: isLoadingPosts } = usePosts(profileData?.id);
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
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [lastSpokenMessage, setLastSpokenMessage] = useState('');
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [voiceConversations, setVoiceConversations] = useState<Array<{ type: 'user' | 'avatar', message: string, timestamp: Date, isLink?: boolean, linkData?: any }>>([]);
  const [suggestedLinks, setSuggestedLinks] = useState<Array<{ url: string, title: string, description?: string, image?: string }>>([]);
  
  // Voice input hook
  const { 
    isListening, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: voiceSupported 
  } = useVoiceInput();
  
  const stopTTS = () => {
    stopSpeech();
  };

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

      // Load follower and following counts, user stats, and social links
      const [followersResult, followingResult, statsResult, socialLinksResult] = await Promise.all([
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
          .maybeSingle(),
        supabase
          .from('social_links')
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

      if (socialLinksResult.data) {
        setSocialLinks(socialLinksResult.data);
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
      // Add to voice conversations
      const newUserMessage = {
        message: chatMessage,
        timestamp: new Date(),
        type: 'user' as const
      };
      setVoiceConversations(prev => [...prev, newUserMessage]);
      
      // Generate avatar response
      const avatarResponse = `Thank you for saying: "${chatMessage}". How can I help you further?`;
      const newAvatarMessage = {
        message: avatarResponse,
        timestamp: new Date(),
        type: 'avatar' as const
      };
      
      setTimeout(() => {
        setVoiceConversations(prev => [...prev, newAvatarMessage]);
        synthesizeSpeech(avatarResponse);
      }, 1000);
      
      setLastSpokenMessage(chatMessage);
      setChatMessage('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setChatMessage(prev => prev + emoji);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setChatMessage(prev => prev + transcript);
        resetTranscript();
      }
    } else {
      startListening({ continuous: false, interimResults: true });
    }
  };

  const handleTalkToAvatar = () => {
    if (lastSpokenMessage) {
      synthesizeSpeech(`Hello! You said: ${lastSpokenMessage}. How can I help you today?`);
    } else {
      synthesizeSpeech("Hello! I'm excited to talk with you. What would you like to discuss?");
    }
  };

  // Update chat message with voice input
  useEffect(() => {
    if (transcript && !isListening) {
      setChatMessage(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

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
      <div className="flex items-center justify-between p-4">
        {/* Profile Header - Moved to top left */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600">
              {profileData.profile_pic_url ? (
                <img 
                  src={profileData.profile_pic_url} 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar3D 
                  isLarge={false}
                  avatarStyle="realistic"
                  mood="friendly"
                  onInteraction={() => {}}
                />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {profileData.display_name || profileData.full_name || profileData.username}
            </h2>
            <p className="text-slate-400 text-sm">@{profileData.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-white/10" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-slate-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-2 space-y-6">

        {/* Bio */}
        {profileData.bio && (
          <p className="text-slate-300 leading-relaxed">
            {profileData.bio}
          </p>
        )}

        {/* Main Avatar Preview - Increased height */}
        <div className="relative">
          <div className="h-96 bg-gradient-to-br from-slate-800/80 to-blue-900/50 rounded-2xl overflow-hidden border border-slate-600/50">
            <div className="w-full h-full flex items-center justify-center relative">
              <Avatar3D 
                isLarge={true}
                avatarStyle="realistic"
                mood="friendly"
                onInteraction={() => {}}
              />
              {/* Talk to Me button on avatar preview */}
              <Button 
                onClick={handleTalkToAvatar}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600/90 hover:bg-blue-700/90 text-white rounded-full px-4 py-2 backdrop-blur-sm border border-blue-500/30"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Talk to Me
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full h-12 font-medium shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
            Subscribe - $9.99/mo
          </Button>
          <Button
            onClick={handleFollowToggle}
            variant="outline"
            className={`px-6 h-12 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
              isFollowing 
                ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary/30 hover:to-primary/20' 
                : 'bg-gradient-to-r from-transparent to-transparent border-border hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/30'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
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

        {/* Posts Content - moved up without tabs */}
        <div className="space-y-4">
          {isLoadingPosts ? (
            <div className="bg-card/30 rounded-xl p-6 text-center border border-border/50">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-card/30 rounded-xl p-6 text-center border border-border/50">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-card/30 rounded-xl p-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={profileData?.profile_pic_url || profileData?.avatar_url || '/placeholder.svg'} 
                      alt={profileData?.display_name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-foreground font-medium text-sm">
                        {profileData?.display_name || profileData?.username}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-foreground text-sm mb-3">{post.content}</p>
                    {post.media_url && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        {post.media_type?.startsWith('image/') ? (
                          <img src={post.media_url} alt="Post media" className="w-full max-h-64 object-cover" />
                        ) : post.media_type?.startsWith('video/') ? (
                          <video src={post.media_url} controls className="w-full max-h-64" />
                        ) : null}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-1 bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 hover:text-red-400 transition-all duration-300 rounded-full"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-xs">{post.likes_count}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-blue-400 transition-all duration-300 rounded-full"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">{post.comments_count}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 hover:text-green-400 transition-all duration-300 rounded-full"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        <span className="text-xs">Share</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Input */}
        <div className="relative">
          <div className="bg-card/50 rounded-2xl border border-border/50 px-4 py-3 flex items-center gap-3">
            <Input
              value={chatMessage + (isListening ? interimTranscript : '')}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground flex-1 focus-visible:ring-0 p-0"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="h-8 w-8 p-0 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 rounded-full transition-all duration-300"
            >
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
            {voiceSupported && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={toggleVoiceInput}
                className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400' 
                    : 'bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-muted-foreground" />}
              </Button>
            )}
            {isSpeaking && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={stopTTS}
                className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 rounded-full text-blue-400 transition-all duration-300"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSendMessage}
              className="h-8 w-8 p-0 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 rounded-full transition-all duration-300"
            >
              <Send className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Social Media Icons Row */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 hover:text-blue-400 p-0 transition-all duration-300"
              onClick={() => socialLinks?.facebook ? window.open(socialLinks.facebook, '_blank') : window.open('https://facebook.com', '_blank')}
            >
              <Facebook className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-slate-500/10 to-slate-600/10 hover:from-slate-500/20 hover:to-slate-600/20 hover:text-slate-200 p-0 transition-all duration-300"
              onClick={() => socialLinks?.twitter ? window.open(socialLinks.twitter, '_blank') : window.open('https://x.com', '_blank')}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-600/10 hover:from-pink-500/20 hover:to-purple-600/20 hover:text-pink-400 p-0 transition-all duration-300"
              onClick={() => socialLinks?.instagram ? window.open(socialLinks.instagram, '_blank') : window.open('https://instagram.com', '_blank')}
            >
              <Instagram className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 hover:text-red-400 p-0 transition-all duration-300"
              onClick={() => socialLinks?.youtube ? window.open(socialLinks.youtube, '_blank') : window.open('https://youtube.com', '_blank')}
            >
              <Youtube className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600/10 to-blue-700/10 hover:from-blue-600/20 hover:to-blue-700/20 hover:text-blue-400 p-0 transition-all duration-300"
              onClick={() => socialLinks?.linkedin ? window.open(socialLinks.linkedin, '_blank') : window.open('https://linkedin.com', '_blank')}
            >
              <Linkedin className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-red-600/10 to-red-700/10 hover:from-red-600/20 hover:to-red-700/20 hover:text-red-400 p-0 transition-all duration-300"
              onClick={() => socialLinks?.pinterest ? window.open(socialLinks.pinterest, '_blank') : window.open('https://pinterest.com', '_blank')}
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.803 1.604.803 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.003-4.625 4.137 0 .695.366 1.56.951 1.836.096-.084.14-.221.105-.343-.084-.307-.273-1.072-.273-1.224 0-.12.061-.232.199-.232.113 0 .168.069.168.162 0 .479-.304 1.124-.304 1.913 0 1.186.909 2.142 2.343 2.142 1.086 0 1.684-.638 1.684-1.524 0-.585-.34-1.264-.34-1.264-.229-.479-.229-1.072 0-1.551.229-.479.799-.479 1.028 0 .229.479.229 1.072 0 1.551 0 0-.34.679-.34 1.264 0 .886.598 1.524 1.684 1.524 1.434 0 2.343-.956 2.343-2.142 0-.789-.304-1.434-.304-1.913 0-.093.055-.162.168-.162.138 0 .199.112.199.232 0 .152-.189.917-.273 1.224-.035.122.009.259.105.343.585-.276.951-1.141.951-1.836 0-2.134-1.604-4.137-4.625-4.137-2.428 0-4.316 1.73-4.316 4.042 0 2.413 1.522 4.354 3.633 4.354.709 0 1.375-.367 1.604-.803l.437 1.664c.157.608.584 1.37.87 1.835A11.936 11.936 0 0 1 12 19z"/>
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 hover:text-orange-400 p-0 transition-all duration-300"
              onClick={() => window.open('https://reddit.com', '_blank')}
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-600/10 hover:from-indigo-500/20 hover:to-purple-600/20 hover:text-indigo-400 p-0 transition-all duration-300"
              onClick={() => window.open('https://discord.com', '_blank')}
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
              </svg>
            </Button>
          </div>

          <EmojiPicker 
            isOpen={isEmojiPickerOpen}
            onClose={() => setIsEmojiPickerOpen(false)}
            onEmojiSelect={handleEmojiSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
