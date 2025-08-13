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
  const [activeTab, setActiveTab] = useState<'chat' | 'posts' | 'products'>('chat');
  
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

        {/* Bottom Tabs */}
        <div className="flex bg-card/30 rounded-full p-1 border border-border/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full transition-all duration-300 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full transition-all duration-300 ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full transition-all duration-300 ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Products</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'posts' && (
            <>
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
                        <div className="flex items-center gap-4 text-muted-foreground text-xs">
                          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes_count || 0}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <MessageSquare className="w-3 h-3" />
                            <span>{post.comments_count || 0}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'products' && (
            <div className="bg-card/30 rounded-xl p-6 text-center border border-border/50">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No products available yet</p>
            </div>
          )}

          {activeTab === 'chat' && (
            <>
              {/* Voice Conversations */}
              {voiceConversations.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {voiceConversations.map((conversation, index) => (
                    <div key={index} className={`flex ${conversation.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl ${
                        conversation.type === 'user' 
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ml-4' 
                          : 'bg-card/50 text-foreground mr-4 border border-border/50'
                      }`}>
                        {conversation.isLink && conversation.linkData ? (
                          <LinkCard {...conversation.linkData} />
                        ) : (
                          <p className="text-sm">{conversation.message}</p>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat Input */}
        <div className="bg-card/30 rounded-2xl p-4 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceInput}
              disabled={!voiceSupported}
              className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive' 
                  : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Input
              value={chatMessage + (interimTranscript ? ` ${interimTranscript}` : '')}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="h-10 w-10 p-0 hover:bg-background/50 rounded-xl"
              >
                <Smile className="w-5 h-5 text-muted-foreground" />
              </Button>
              {isEmojiPickerOpen && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker 
                    isOpen={isEmojiPickerOpen}
                    onClose={() => setIsEmojiPickerOpen(false)}
                    onEmojiSelect={handleEmojiSelect} 
                  />
                </div>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="h-10 px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Social Media Links Row */}
        <div className="flex justify-center gap-3 pt-2">
          <a 
            href={socialLinks?.facebook || 'https://facebook.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.twitter || 'https://x.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.instagram || 'https://instagram.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.youtube || 'https://youtube.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <Youtube className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.linkedin || 'https://linkedin.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.github || 'https://github.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <Github className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.discord || 'https://discord.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.website || 'https://reddit.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110"
          >
            <Globe className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;