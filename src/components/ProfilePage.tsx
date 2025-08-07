
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
  Github
} from 'lucide-react';
import Avatar3D from './Avatar3D';
import EmojiPicker from './EmojiPicker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFollows } from '@/hooks/useFollows';
import { useVoiceInput } from '@/hooks/useVoiceInput';
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
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [lastSpokenMessage, setLastSpokenMessage] = useState('');
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [voiceConversations, setVoiceConversations] = useState<Array<{message: string, timestamp: Date, type: 'user' | 'avatar'}>>([]);
  
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
  
  // Simple TTS using browser API
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
        speak(avatarResponse);
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
      speak(`Hello! You said: ${lastSpokenMessage}. How can I help you today?`);
    } else {
      speak("Hello! I'm excited to talk with you. What would you like to discuss?");
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
          <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full h-12 font-medium shadow-lg">
            Subscribe - $9.99/mo
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
              Products
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
            <div className="bg-slate-800/30 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto border border-slate-700/50">
              <div className="space-y-3">
                {voiceConversations.length === 0 ? (
                  <>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                      <div className="bg-slate-700/70 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                        <p className="text-slate-200 text-sm">
                          Hi! I'm excited to chat with you. What would you like to talk about?
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  voiceConversations.map((conversation, index) => (
                    <div key={index} className={`flex gap-3 ${conversation.type === 'user' ? 'justify-end' : ''}`}>
                      {conversation.type === 'avatar' && (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                      )}
                      <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                        conversation.type === 'user' 
                          ? 'bg-blue-600 rounded-tr-md text-white' 
                          : 'bg-slate-700/70 rounded-tl-md text-slate-200'
                      }`}>
                        <p className="text-sm">{conversation.message}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      {conversation.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
                      )}
                    </div>
                  ))
                )}
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
              value={chatMessage + (isListening ? interimTranscript : '')}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="border-0 bg-transparent text-white placeholder:text-slate-400 flex-1 focus-visible:ring-0 p-0"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full"
            >
              <Smile className="w-4 h-4 text-slate-400" />
            </Button>
            {voiceSupported && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={toggleVoiceInput}
                className={`h-8 w-8 p-0 hover:bg-slate-700 rounded-full ${
                  isListening ? 'bg-red-600/20 text-red-400' : ''
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-slate-400" />}
              </Button>
            )}
            {isSpeaking && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={stopTTS}
                className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full text-blue-400"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSendMessage}
              className="h-8 w-8 p-0 hover:bg-slate-700 rounded-full"
            >
              <Send className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
          <EmojiPicker 
            isOpen={isEmojiPickerOpen}
            onClose={() => setIsEmojiPickerOpen(false)}
            onEmojiSelect={handleEmojiSelect}
          />
        </div>

        {/* Social Media and Share Section */}
        <div className="space-y-4">
          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {socialLinks?.twitter && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 rounded-full hover:bg-slate-700"
                onClick={() => window.open(socialLinks.twitter, '_blank')}
              >
                <X className="w-6 h-6 text-slate-400" />
              </Button>
            )}
            {socialLinks?.facebook && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 rounded-full hover:bg-slate-700"
                onClick={() => window.open(socialLinks.facebook, '_blank')}
              >
                <Facebook className="w-6 h-6 text-slate-400" />
              </Button>
            )}
            {socialLinks?.instagram && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 rounded-full hover:bg-slate-700"
                onClick={() => window.open(socialLinks.instagram, '_blank')}
              >
                <Instagram className="w-6 h-6 text-slate-400" />
              </Button>
            )}
            {socialLinks?.youtube && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 rounded-full hover:bg-slate-700"
                onClick={() => window.open(socialLinks.youtube, '_blank')}
              >
                <Youtube className="w-6 h-6 text-slate-400" />
              </Button>
            )}
            {socialLinks?.linkedin && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 rounded-full hover:bg-slate-700"
                onClick={() => window.open(socialLinks.linkedin, '_blank')}
              >
                <Linkedin className="w-6 h-6 text-slate-400" />
              </Button>
            )}
            {socialLinks?.pinterest && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 rounded-full hover:bg-slate-700"
                onClick={() => window.open(socialLinks.pinterest, '_blank')}
              >
                <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.803 1.604.803 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.003-4.625 4.137 0 .695.366 1.56.951 1.836.096-.084.14-.221.105-.343-.084-.307-.273-1.072-.273-1.224 0-.12.061-.232.199-.232.113 0 .168.069.168.162 0 .479-.304 1.124-.304 1.913 0 1.186.909 2.142 2.343 2.142 1.086 0 1.684-.638 1.684-1.524 0-.585-.34-1.264-.34-1.264-.229-.479-.229-1.072 0-1.551.229-.479.799-.479 1.028 0 .229.479.229 1.072 0 1.551 0 0-.34.679-.34 1.264 0 .886.598 1.524 1.684 1.524 1.434 0 2.343-.956 2.343-2.142 0-.789-.304-1.434-.304-1.913 0-.093.055-.162.168-.162.138 0 .199.112.199.232 0 .152-.189.917-.273 1.224-.035.122.009.259.105.343.585-.276.951-1.141.951-1.836 0-2.134-1.604-4.137-4.625-4.137-2.428 0-4.316 1.73-4.316 4.042 0 2.413 1.522 4.354 3.633 4.354.709 0 1.375-.367 1.604-.803l.437 1.664c.157.608.584 1.37.87 1.835A11.936 11.936 0 0 1 12 19z"/>
                </svg>
              </Button>
            )}
            {socialLinks?.website && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 rounded-full hover:bg-slate-700"
                onClick={() => window.open(socialLinks.website, '_blank')}
              >
                <Globe className="w-6 h-6 text-slate-400" />
              </Button>
            )}
          </div>

          {/* Share Options */}
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 px-3 rounded-full hover:bg-slate-700 text-xs text-slate-400"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`Check out ${profileData?.display_name || profileData?.username}'s AI Avatar on AvatarTalk.bio`);
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
              }}
            >
              Share on X
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 px-3 rounded-full hover:bg-slate-700 text-xs text-slate-400"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
              }}
            >
              Share on Facebook
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 px-3 rounded-full hover:bg-slate-700 text-xs text-slate-400"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`Check out this amazing AI Avatar: ${profileData?.display_name || profileData?.username}`);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
              }}
            >
              Share on LinkedIn
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 w-10 rounded-full hover:bg-slate-700"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${profileData?.display_name || profileData?.username} - AvatarTalk.bio`,
                    text: 'Check out this amazing AI Avatar!',
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied to clipboard!" });
                }
              }}
            >
              <Share2 className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
