import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Heart, 
  Users, 
  Settings, 
  Download, 
  Smile, 
  Mic, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  EllipsisVertical,
  MicIcon,
  Send
} from 'lucide-react';
import Avatar3D from '@/components/Avatar3D';
import ShareModal from '@/components/ShareModal';
import EmojiPicker from '@/components/EmojiPicker';
import { supabase } from '@/integrations/supabase/client';
import { useTTS } from '@/hooks/useTTS';
import { useSTT } from '@/hooks/useSTT';

const ProfilePage = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');
  const [showAvatarPreview, setShowAvatarPreview] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [avatarSettings, setAvatarSettings] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TTS and STT hooks
  const { speak, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();
  const { 
    startListening, 
    stopListening, 
    isListening, 
    transcript, 
    clearTranscript 
  } = useSTT();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (username) {
      fetchProfileByUsername(username);
    }
  }, [username]);

  const fetchProfileByUsername = async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch profile by username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If no profile found, use demo data
        setProfileData(null);
        setAvatarSettings({
          avatar_type: 'realistic',
          avatar_mood: 'friendly',
          lip_sync: true,
          head_movement: true,
          voice_type: 'neutral'
        });
        setSocialLinks({});
        setUserStats({
          total_conversations: 352,
          followers_count: 1200,
          engagement_score: 89
        });
        setLoading(false);
        return;
      }

      setProfileData(profile);

      // Fetch related data if profile exists
      if (profile) {
        // Fetch avatar settings
        const { data: avatarData } = await supabase
          .from('avatar_settings')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        // Fetch social links
        const { data: socialData } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        // Fetch user stats
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        setAvatarSettings(avatarData || {
          avatar_type: 'realistic',
          avatar_mood: 'friendly',
          lip_sync: true,
          head_movement: true,
          voice_type: 'neutral'
        });
        setSocialLinks(socialData || {});
        setUserStats(statsData || {
          total_conversations: 0,
          followers_count: 0,
          engagement_score: 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo data fallback
  const displayData = {
    displayName: profileData?.display_name || profileData?.full_name || 'Emily Parker',
    username: profileData?.username || username || 'emily',
    bio: profileData?.bio || 'Exploring the boundaries of AI conversation. Let\'s create something amazing together!',
    profileImage: profileData?.profile_pic_url || '/lovable-uploads/fd5c2456-b137-4f5e-92b6-91e67819b497.png',
    stats: {
      conversations: userStats?.total_conversations || 352,
      followers: userStats?.followers_count || 1200,
      engagement: userStats?.engagement_score || 89
    }
  };

  const profileUrl = `${window.location.origin}/${displayData.username}`;

  const handleSendMessage = () => {
    if (message.trim()) {
      setIsTalking(true);
      // Simulate response with TTS
      speak(`Thank you for your message: ${message}`);
      setTimeout(() => setIsTalking(false), 3000);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setMessage(transcript);
        clearTranscript();
      }
    } else {
      startListening({ continuous: false, interimResults: true });
    }
  };

  const handleAvatarSettingsChange = async (setting: string, value: any) => {
    if (!profileData?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('avatar_settings')
        .upsert({
          user_id: profileData.id,
          ...avatarSettings,
          [setting]: value
        })
        .select()
        .single();

      if (error) throw error;
      setAvatarSettings(data);
    } catch (err: any) {
      console.error('Error updating avatar settings:', err);
    }
  };

  const socialIcons = [
    { icon: Twitter, url: socialLinks?.twitter, color: 'text-blue-400' },
    { icon: Linkedin, url: socialLinks?.linkedin, color: 'text-blue-600' },
    { icon: Facebook, url: socialLinks?.facebook, color: 'text-blue-500' },
    { icon: Instagram, url: socialLinks?.instagram, color: 'text-pink-500' },
    { icon: Youtube, url: socialLinks?.youtube, color: 'text-red-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_50%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
      
      {/* Main Profile Container */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen bg-slate-900/50 backdrop-blur-xl border-x border-slate-800/50 rounded-t-3xl md:rounded-none">
        {/* Header */}
        <div className="flex justify-between items-start p-4 pt-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-14 h-14 border-2 border-blue-400/30">
                <AvatarImage src={displayData.profileImage} alt="Profile" className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold">
                  {displayData.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-white text-lg font-bold leading-tight">
                {displayData.displayName}
              </h2>
              <p className="text-blue-300 text-sm leading-tight">@{displayData.username}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white rounded-full w-8 h-8 p-0 transition-all duration-300"
          >
            <EllipsisVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="pb-32 overflow-y-auto max-h-[calc(100vh-250px)]">
          {/* Profile Section */}
          <div className="px-4 pb-2 relative">
            {/* Bio */}
            <p className="text-white/80 text-sm leading-relaxed mb-4 px-2">
              {displayData.bio}
            </p>

            {/* 3D Avatar Section */}
            <div className="mb-4 relative">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/30 shadow-2xl">
                <div className="flex flex-col items-center">
                  <div className="mb-3 relative">
                    <Avatar3D
                      isLarge={true}
                      isTalking={isTalking || isTTSPlaying}
                      avatarStyle={avatarSettings?.avatar_type as any || 'realistic'}
                      mood={avatarSettings?.avatar_mood as any || 'friendly'}
                      onInteraction={() => setIsTalking(!isTalking)}
                    />
                    {/* Talk to Me button on avatar */}
                    <Button
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500/80 hover:bg-blue-600/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/30"
                      onClick={() => {
                        setActiveTab('chat');
                        setIsTalking(true);
                        speak("Hello! I'm ready to chat with you.");
                        setTimeout(() => setIsTalking(false), 2000);
                      }}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Talk to Me
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4 px-2">
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-full font-medium shadow-lg transition-all duration-300 text-sm"
              >
                Subscribe - $9.99/mo
              </Button>
              <Button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                  isFollowing 
                    ? 'bg-slate-700 text-white border border-slate-600' 
                    : 'bg-slate-800/50 text-white border border-slate-600 hover:bg-slate-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-slate-800/50 text-white hover:bg-slate-700 border border-slate-600"
              >
                <Users className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4 px-2">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{displayData.stats.conversations}</div>
                <div className="text-white/60 text-xs">Total Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{displayData.stats.followers.toLocaleString()}</div>
                <div className="text-white/60 text-xs">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{displayData.stats.engagement}</div>
                <div className="text-white/60 text-xs">Engagement Score</div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 rounded-lg p-1 mb-4">
                <TabsTrigger 
                  value="posts" 
                  className="text-white/70 data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-md transition-all duration-200"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="text-white/70 data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-md transition-all duration-200"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="product" 
                  className="text-white/70 data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-md transition-all duration-200"
                >
                  Product
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <TabsContent value="posts" className="space-y-4 pb-6">
                <Card className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-white/90 text-sm mb-3">
                      Welcome to my AI avatar profile! I'm excited to connect and have meaningful conversations about technology and innovation.
                    </p>
                    <div className="flex justify-between items-center text-white/60 text-xs">
                      <span>2 hours ago</span>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          24
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          8
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="space-y-4 pb-6">
                <div className="bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm rounded-xl p-4 max-h-80 overflow-y-auto space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {displayData.displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm mb-1">
                        Hi there! I'm ready to chat. What would you like to talk about today? 
                        {isTalking && <span className="animate-pulse ml-2">I'm listening...</span>}
                      </p>
                      <div className="text-white/60 text-xs">Just now</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3 max-w-xs">
                      <p className="text-white/90 text-sm">Hey! How's your day going?</p>
                      <div className="text-white/60 text-xs mt-1 text-right">2 mins ago</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-bold">
                      U
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {displayData.displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm mb-1">
                        Great! I've been having amazing conversations today. What brings you here?
                      </p>
                      <div className="text-white/60 text-xs">1 min ago</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="product" className="space-y-4 pb-6">
                <Card className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">1-on-1 Consultation</h4>
                    <p className="text-white/70 text-sm mb-3">Personal AI consultation session</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm px-6 py-2 rounded-full">
                      $99.99
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Fixed Bottom Section - Always Visible */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50">
          {/* Chat Input - Always Visible */}
          <div className="p-4 pb-2">
            <div className="relative">
              <Input
                placeholder="Ask me anything..."
                value={message + (isListening ? ` ${transcript}` : '')}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-white/50 rounded-full py-2 pl-4 pr-20 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <EmojiPicker 
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onEmojiSelect={handleEmojiSelect}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`rounded-full w-8 h-8 p-0 transition-all duration-200 ${
                    isListening 
                      ? 'text-red-500 hover:text-red-400 bg-red-500/20' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={handleVoiceInput}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                  onClick={handleSendMessage}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Social Media Icons - Always Visible */}
          <div className="flex justify-center items-center gap-3 pb-4 px-4">
            {socialIcons.map(({ icon: Icon, url, color }, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-800/50 border border-slate-700/50 ${color} hover:bg-slate-700 transition-all duration-200 flex items-center justify-center`}
                onClick={() => url && window.open(url, '_blank')}
              >
                <Icon className="w-3 h-3" />
              </button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <EllipsisVertical className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => setIsShareOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full w-8 h-8 p-0 shadow-lg transition-all duration-300"
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profileUrl={profileUrl}
        username={displayData.username}
      />
    </div>
  );
};

export default ProfilePage;
