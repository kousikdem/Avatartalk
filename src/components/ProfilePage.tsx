import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/useProfile';
import { useProfileManager } from '@/hooks/useProfileManager';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Send,
  Smile,
  Mic,
  MicOff,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { FaPinterest, FaReddit, FaTiktok, FaSnapchat, FaWhatsapp, FaTelegram, FaDiscord } from 'react-icons/fa';

interface ProfilePageProps {
  userId?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId = "demo-user" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [showMoreSocial, setShowMoreSocial] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { profile, socialLinks, userStats, loading } = useProfile(userId);
  const { profileData, updateField } = useProfileManager();
  const { 
    isListening, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported 
  } = useVoiceInput();
  const { synthesizeSpeech, isPlaying } = useCoquiTTS();
  const { toast } = useToast();

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof typeof profileData, value);
  };

  const handleVoiceInput = () => {
    if (!isSupported) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening({
        continuous: false,
        interimResults: true,
        language: 'en-US'
      });
    }
  };

  // Update chat message when transcript changes
  React.useEffect(() => {
    if (transcript) {
      setChatMessage(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async () => {
    const messageText = chatMessage.trim();
    if (!messageText) return;

    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // AI response simulation
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `Thanks for your message: "${messageText}". I'm here to help!`,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      synthesizeSpeech(aiResponse.text);
    }, 1000);
  };

  const shareOptions = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/sharer/sharer.php?u=', gradient: 'from-blue-500 to-blue-700' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/intent/tweet?url=', gradient: 'from-blue-400 to-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/sharing/share-offsite/?url=', gradient: 'from-blue-600 to-blue-800' },
    { name: 'Pinterest', icon: FaPinterest, url: 'https://pinterest.com/pin/create/button/?url=', gradient: 'from-red-500 to-pink-600' },
    { name: 'Reddit', icon: FaReddit, url: 'https://reddit.com/submit?url=', gradient: 'from-orange-500 to-red-600' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/', gradient: 'from-pink-500 via-purple-500 to-orange-400' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/', gradient: 'from-red-600 to-red-700' },
    { name: 'TikTok', icon: FaTiktok, url: 'https://tiktok.com/', gradient: 'from-gray-800 to-gray-900' },
    { name: 'Snapchat', icon: FaSnapchat, url: 'https://snapchat.com/', gradient: 'from-yellow-400 to-yellow-500' },
    { name: 'WhatsApp', icon: FaWhatsapp, url: 'https://wa.me/?text=', gradient: 'from-green-500 to-green-600' },
    { name: 'Telegram', icon: FaTelegram, url: 'https://t.me/share/url?url=', gradient: 'from-blue-400 to-blue-500' },
    { name: 'Discord', icon: FaDiscord, url: 'https://discord.com/', gradient: 'from-indigo-500 to-purple-600' },
  ];

  const handleShare = (platform: string, url: string) => {
    const shareUrl = `${url}${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="neo-card border-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-2xl">
                <AvatarImage src={profile?.profile_pic_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {profile?.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {profile?.display_name || 'User Name'}
                  </h1>
                  <p className="text-muted-foreground">@{profile?.username || 'username'}</p>
                </div>

                <p className="text-foreground/80 max-w-2xl">
                  {profile?.bio || 'This user hasn\'t added a bio yet.'}
                </p>

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">{userStats?.total_conversations || 0}</div>
                    <div className="stat-label">Conversations</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{userStats?.followers_count || 0}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{userStats?.engagement_score || 0}%</div>
                    <div className="stat-label">Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="tab-navigation w-full">
            <TabsTrigger value="posts" className="tab-trigger">Posts</TabsTrigger>
            <TabsTrigger value="chat" className="tab-trigger">Chat</TabsTrigger>
            <TabsTrigger value="products" className="tab-trigger">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {/* Sample Posts */}
            {[1, 2].map((i) => (
              <Card key={i} className="neo-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile?.display_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <p className="mb-4">This is a sample post #{i}. Great to connect with everyone!</p>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500 hover:to-pink-500 hover:text-white hover:scale-105 transition-all duration-300 border border-red-500/30"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {12 + i}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:scale-105 transition-all duration-300 border border-blue-500/30"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {3 + i}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500 hover:to-emerald-500 hover:text-white hover:scale-105 transition-all duration-300 border border-green-500/30"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="neo-card h-96">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Ultra Compact Chat Input */}
                <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-background/50 to-muted/50 rounded-full border border-border/50 backdrop-blur-sm">
                  <div className="flex-1 relative">
                    <Input
                      value={chatMessage || interimTranscript}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-1 pl-4 h-9"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-7 w-7 p-0 hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20 hover:text-yellow-600 hover:scale-110 transition-all duration-300"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceInput}
                    className={`rounded-full h-7 w-7 p-0 transition-all duration-300 hover:scale-110 ${
                      isListening 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg' 
                        : 'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-600'
                    }`}
                  >
                    {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="rounded-full h-7 w-7 p-0 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-110 transition-all duration-300 shadow-md"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="neo-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Featured Products
                </h3>
                <p className="text-muted-foreground">No products available yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Social Links with reduced spacing */}
        <div className="flex flex-wrap justify-center gap-2 relative mt-2">
          {/* Main Social Icons */}
          <div className="flex gap-2">
            {[
              { icon: Twitter, url: socialLinks?.twitter, gradient: 'from-blue-400 to-blue-600' },
              { icon: Linkedin, url: socialLinks?.linkedin, gradient: 'from-blue-600 to-blue-800' },
              { icon: Facebook, url: socialLinks?.facebook, gradient: 'from-blue-500 to-blue-700' },
              { icon: Instagram, url: socialLinks?.instagram, gradient: 'from-pink-500 via-purple-500 to-orange-400' },
              { icon: Globe, url: socialLinks?.website, gradient: 'from-green-500 to-emerald-600' }
            ].map(({ icon: Icon, url, gradient }, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradient} text-white hover:scale-110 hover:shadow-lg transition-all duration-300 p-0`}
                onClick={() => url && window.open(url, '_blank')}
              >
                <Icon className="w-3 h-3" />
              </Button>
            ))}
          </div>

          {/* More Options Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoreSocial(!showMoreSocial)}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:scale-110 hover:shadow-lg transition-all duration-300 p-0"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
            
            {showMoreSocial && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-xl z-10">
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 hover:text-red-500">
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-600/20 hover:text-pink-500">
                    <FaPinterest className="w-4 h-4" />
                    Pinterest
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-600/20 hover:text-orange-500">
                    <FaReddit className="w-4 h-4" />
                    Reddit
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm hover:bg-gradient-to-r hover:from-gray-800/20 hover:to-gray-900/20 hover:text-gray-300">
                    <FaTiktok className="w-4 h-4" />
                    TikTok
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Share Button with Zoom Effect */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-125 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:rotate-6 p-0"
            >
              <Share2 className="w-3 h-3" />
            </Button>
            
            {showShareMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-2xl z-20 min-w-[240px]">
                <div className="grid grid-cols-4 gap-2">
                  {shareOptions.map(({ name, icon: Icon, url, gradient }) => (
                    <Button
                      key={name}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(name, url)}
                      className={`flex flex-col items-center gap-1 p-2 h-auto rounded-lg bg-gradient-to-r ${gradient} text-white hover:scale-105 transition-all duration-300 hover:shadow-md`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{name}</span>
                    </Button>
                  ))}
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
