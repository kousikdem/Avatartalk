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
  ExternalLink,
  Send,
  Play,
  Volume2,
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
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube, 
  FaPinterest, 
  FaReddit,
  FaWhatsapp,
  FaTiktok,
  FaSnapchat,
  FaTelegram
} from 'react-icons/fa';
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

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'avatar';
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
  const [conversations, setConversations] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'chat' | 'products'>('chat');
  
  // New states for social menu and share functionality
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

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
      // Add user message to conversations
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        message: chatMessage,
        timestamp: new Date(),
        type: 'user'
      };
      setConversations(prev => [...prev, newUserMessage]);
      
      // Generate avatar response
      const avatarResponse = `Thank you for saying: "${chatMessage}". How can I help you further?`;
      const newAvatarMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: avatarResponse,
        timestamp: new Date(),
        type: 'avatar'
      };
      
      setTimeout(() => {
        setConversations(prev => [...prev, newAvatarMessage]);
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
    console.log('Voice input toggled, isListening:', isListening);
    console.log('Voice supported:', voiceSupported);
    
    if (isListening) {
      stopListening();
    } else {
      if (!voiceSupported) {
        toast({
          title: "Voice Input Not Supported",
          description: "Speech recognition is not supported in this browser",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Starting voice input...');
      resetTranscript();
      startListening({ 
        continuous: false, 
        interimResults: true,
        language: 'en-US'
      });
    }
  };

  const handleTalkToAvatar = () => {
    if (lastSpokenMessage) {
      synthesizeSpeech(`Hello! You said: ${lastSpokenMessage}. How can I help you today?`);
    } else {
      synthesizeSpeech("Hello! I'm excited to talk with you. What would you like to discuss?");
    }
  };

  const stopTTS = () => {
    stopSpeech();
  };

  // Share functionality
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${profileData?.display_name || profileData?.username}'s profile`;
    
    const shareUrls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      instagram: 'https://www.instagram.com',
      youtube: 'https://www.youtube.com',
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setIsShareMenuOpen(false);
  };

  // Update chat message with voice input
  useEffect(() => {
    if (transcript && !isListening) {
      setChatMessage(prev => (prev + ' ' + transcript).trim());
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  // Handle interim transcript display
  useEffect(() => {
    if (interimTranscript && isListening) {
      // This will show the interim results in real-time
    }
  }, [interimTranscript, isListening]);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-foreground mb-2">Profile not found</h1>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {/* Profile Header - Moved to top left */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border">
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
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {profileData.display_name || profileData.full_name || profileData.username}
            </h2>
            <p className="text-muted-foreground text-sm">@{profileData.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-accent" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-2 space-y-6">

        {/* Bio */}
        {profileData.bio && (
          <p className="text-foreground leading-relaxed">
            {profileData.bio}
          </p>
        )}

        {/* Main Avatar Preview - Increased height */}
        <div className="relative">
          <div className="h-96 bg-gradient-to-br from-card/80 to-primary/10 rounded-2xl overflow-hidden border border-border/50">
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
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full px-4 py-2 backdrop-blur-sm border border-primary/30"
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
            <div className="text-2xl font-bold text-foreground">
              {userStats.total_conversations}
            </div>
            <div className="text-sm text-muted-foreground">Total Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {userStats.followers_count > 999 
                ? `${(userStats.followers_count / 1000).toFixed(1)}K` 
                : userStats.followers_count}
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {userStats.engagement_score}
            </div>
            <div className="text-sm text-muted-foreground">Engagement Score</div>
          </div>
        </div>

        {/* Bottom Tabs - Posts, Chat, Products */}
        <div className="flex bg-card/30 rounded-full p-1 border border-border/50 backdrop-blur-sm">
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
              {/* Chat Messages - Flexible conversation box */}
              <div className="bg-card/30 border border-border/50 rounded-lg p-4 min-h-64 max-h-96 overflow-y-auto">
                {conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex ${conversation.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            conversation.type === 'user'
                              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm">{conversation.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {conversation.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Start a conversation with the AI avatar</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Chat Input - Only show when chat tab is active */}
        {activeTab === 'chat' && (
          <div className="bg-card/30 rounded-2xl p-3 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Input
                value={chatMessage + (isListening && interimTranscript ? ` ${interimTranscript}` : '')}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type a message...'}
                className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="h-8 w-8 p-0 hover:bg-background/50 rounded-lg relative"
              >
                <Smile className="w-4 h-4 text-muted-foreground" />
                {isEmojiPickerOpen && (
                  <div className="absolute bottom-full right-0 mb-2 z-50">
                    <EmojiPicker 
                      isOpen={isEmojiPickerOpen}
                      onClose={() => setIsEmojiPickerOpen(false)}
                      onEmojiSelect={handleEmojiSelect} 
                    />
                  </div>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                disabled={!voiceSupported}
                className={`h-8 w-8 p-0 rounded-lg transition-all duration-300 ${
                  isListening 
                    ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive animate-pulse' 
                    : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                }`}
                title={!voiceSupported ? 'Voice input not supported' : isListening ? 'Stop recording' : 'Start recording'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              {isSpeaking && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={stopTTS}
                  className="h-8 w-8 p-0 hover:bg-background/50 rounded-lg text-primary"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="h-8 px-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Social Media Links Row with Gradients */}
        <div className="flex justify-center items-center gap-2 mt-1 relative">
          <a 
            href={socialLinks?.facebook || 'https://facebook.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
          >
            <FaFacebook className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.twitter || 'https://x.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
          >
            <X className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.instagram || 'https://instagram.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
          >
            <FaInstagram className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.youtube || 'https://youtube.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
          >
            <FaYoutube className="w-4 h-4" />
          </a>
          <a 
            href={socialLinks?.linkedin || 'https://linkedin.com'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-700 to-blue-600 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
          >
            <FaLinkedin className="w-4 h-4" />
          </a>

          {/* More Social Networks Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSocialMenuOpen(!isSocialMenuOpen)}
              className="w-9 h-9 p-0 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {isSocialMenuOpen && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-3 z-50 min-w-52">
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={socialLinks?.github || 'https://github.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 transition-all duration-300 hover:scale-105"
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-sm">GitHub</span>
                  </a>
                  <a 
                    href={socialLinks?.discord || 'https://discord.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Discord</span>
                  </a>
                  <a 
                    href={socialLinks?.pinterest || 'https://pinterest.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaPinterest className="w-4 h-4" />
                    <span className="text-sm">Pinterest</span>
                  </a>
                  <a 
                    href={socialLinks?.reddit || 'https://reddit.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaReddit className="w-4 h-4" />
                    <span className="text-sm">Reddit</span>
                  </a>
                  <a 
                    href={socialLinks?.tiktok || 'https://tiktok.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transition-all duration-300 hover:scale-105"
                  >
                    <FaTiktok className="w-4 h-4" />
                    <span className="text-sm">TikTok</span>
                  </a>
                  <a 
                    href={socialLinks?.website || 'https://example.com'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 transition-all duration-300 hover:scale-105"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Share Button with Gradient and Animation */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
              className="w-10 h-10 p-0 rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white transition-all duration-300 hover:scale-110 hover:shadow-xl animate-share-pulse"
            >
              <Share2 className="w-4 h-4 animate-zoom-in" />
            </Button>
            {isShareMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-3 z-50 min-w-60">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaFacebook className="w-4 h-4" />
                    <span className="text-sm">Facebook</span>
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 hover:scale-105"
                  >
                    <FaTwitter className="w-4 h-4" />
                    <span className="text-sm">X/Twitter</span>
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 transition-all duration-300 hover:scale-105"
                  >
                    <FaLinkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </button>
                  <button 
                    onClick={() => handleShare('pinterest')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaPinterest className="w-4 h-4" />
                    <span className="text-sm">Pinterest</span>
                  </button>
                  <button 
                    onClick={() => handleShare('reddit')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaReddit className="w-4 h-4" />
                    <span className="text-sm">Reddit</span>
                  </button>
                  <button 
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span className="text-sm">WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => handleShare('instagram')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white hover:from-pink-400 hover:via-red-400 hover:to-yellow-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaInstagram className="w-4 h-4" />
                    <span className="text-sm">Instagram</span>
                  </button>
                  <button 
                    onClick={() => handleShare('telegram')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 hover:scale-105"
                  >
                    <FaTelegram className="w-4 h-4" />
                    <span className="text-sm">Telegram</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
