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
  Youtube
} from 'lucide-react';
import Avatar3D from '@/components/Avatar3D';
import ShareModal from '@/components/ShareModal';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [avatarSettings, setAvatarSettings] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setTimeout(() => setIsTalking(false), 3000);
      setMessage('');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/20 to-purple-900/20"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,hsl(263_70%_50%/0.1)_360deg)]"></div>
      
      {/* Main Profile Container */}
      <div className="relative z-10 max-w-sm mx-auto min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pt-8">
          <h1 className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AvatarTalk.bio
          </h1>
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white rounded-full w-10 h-10 p-0"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white rounded-full w-10 h-10 p-0"
              onClick={() => setShowAvatarPreview(!showAvatarPreview)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setIsShareOpen(true)}
              className="neo-button-primary text-xs px-3 h-8"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-6 pb-8 text-center relative">
          {/* Avatar Section */}
          <div className="mb-6 relative">
            {showAvatarPreview ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 relative">
                  <Avatar3D
                    isLarge={true}
                    isTalking={isTalking}
                    avatarStyle={avatarSettings?.avatar_type as any || 'realistic'}
                    mood={avatarSettings?.avatar_mood as any || 'friendly'}
                    onInteraction={() => setIsTalking(!isTalking)}
                  />
                </div>
                
                {/* Avatar Controls */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  <select
                    value={avatarSettings?.avatar_type || 'realistic'}
                    onChange={(e) => handleAvatarSettingsChange('avatar_type', e.target.value)}
                    className="neo-input text-xs py-1 px-2"
                  >
                    <option value="realistic" className="text-black">Realistic</option>
                    <option value="cartoon" className="text-black">Cartoon</option>
                    <option value="anime" className="text-black">Anime</option>
                    <option value="minimal" className="text-black">Minimal</option>
                  </select>
                  
                  <select
                    value={avatarSettings?.avatar_mood || 'friendly'}
                    onChange={(e) => handleAvatarSettingsChange('avatar_mood', e.target.value)}
                    className="neo-input text-xs py-1 px-2"
                  >
                    <option value="professional" className="text-black">Professional</option>
                    <option value="friendly" className="text-black">Friendly</option>
                    <option value="mysterious" className="text-black">Mysterious</option>
                  </select>
                </div>
                
                <Button
                  size="sm"
                  className="neo-button-primary mb-4 text-xs"
                  onClick={() => setShowAvatarPreview(false)}
                >
                  Use This Avatar
                </Button>
              </div>
            ) : (
              <div className="relative group cursor-pointer" onClick={() => setShowAvatarPreview(true)}>
                <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-500 to-purple-500 p-1 avatar-glow floating-animation">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={displayData.profileImage} alt="Profile" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                      {displayData.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* 3D Avatar indicator */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Name and Username */}
          <div className="mb-4">
            <h2 className="text-white text-3xl font-bold mb-2 gradient-text">
              {displayData.displayName}
            </h2>
            <p className="text-white/70 text-lg">@{displayData.username}</p>
          </div>

          {/* Bio */}
          <p className="text-white/90 text-base leading-relaxed mb-8 max-w-xs mx-auto">
            {displayData.bio}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8 justify-center">
            <Button
              className="neo-button-primary flex-1 max-w-32"
              onClick={() => {
                setActiveTab('chat');
                setIsTalking(true);
                setTimeout(() => setIsTalking(false), 2000);
              }}
            >
              Talk to Me
            </Button>
            <Button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`neo-button-secondary flex-1 max-w-28 ${
                isFollowing ? 'bg-white/10' : ''
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>

          {/* Stats */}
          <div className="stats-grid mb-8">
            <div className="stat-item">
              <div className="stat-number">{displayData.stats.conversations}</div>
              <div className="stat-label">Conversations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{displayData.stats.followers}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{displayData.stats.engagement}</div>
              <div className="stat-label">Engagement</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="tab-navigation mb-6">
              <TabsTrigger value="posts" className="tab-trigger">
                Posts
              </TabsTrigger>
              <TabsTrigger value="chat" className="tab-trigger">
                Chat
              </TabsTrigger>
              <TabsTrigger value="gifts" className="tab-trigger">
                Products
              </TabsTrigger>
            </div>

            {/* Chat Input - Always Visible */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  placeholder="Ask me anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="neo-input pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => setIsTalking(!isTalking)}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="social-icons mb-6">
              {socialIcons.map(({ icon: Icon, url, color }, index) => (
                <button
                  key={index}
                  className={`social-icon ${color}`}
                  onClick={() => url && window.open(url, '_blank')}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <TabsContent value="posts" className="space-y-4 pb-6">
              <Card className="neo-card">
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
              <Card className="neo-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {displayData.displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm mb-3">
                        Hi there! I'm ready to chat. What would you like to talk about today? 
                        {isTalking && <span className="animate-pulse ml-2">I'm listening...</span>}
                      </p>
                      <div className="text-white/60 text-xs">Just now</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gifts" className="space-y-4 pb-6">
              <Card className="neo-card">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">1-on-1 Consultation</h4>
                  <p className="text-white/70 text-sm mb-3">Personal AI consultation session</p>
                  <Button className="neo-button-primary text-sm">
                    $99.99
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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