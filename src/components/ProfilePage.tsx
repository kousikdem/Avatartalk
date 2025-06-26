
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Star, 
  Users, 
  Calendar,
  MapPin,
  Share2,
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Github,
  UserPlus,
  Settings,
  MoreHorizontal,
  ArrowRight,
  Send,
  Mic,
  MicOff,
  Smile,
  Copy,
  QrCode,
  Download,
  Moon,
  Sun,
  UserCheck,
  Eye,
  ChevronRight
} from 'lucide-react';
import AvatarPreview from './AvatarPreview';
import VisitorAuth from './VisitorAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for authenticated user or visitor
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        // Check for visitor
        const visitorData = localStorage.getItem('visitorUser');
        if (visitorData) {
          setVisitor(JSON.parse(visitorData));
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mock profile data
  const profile = {
    name: "Emily Parker",
    username: "@emily",
    bio: "Exploring the boundaries of AI conversation. Let's create something amazing!",
    location: "San Francisco, CA",
    website: "emilyparker.com",
    joinDate: "March 2024",
    followers: "1.2K",
    following: "34",
    conversations: "352",
    engagementScore: "89",
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop",
    isVerified: true,
    isOnline: true,
    specialties: ["AI Technology", "Personal Branding", "Content Creation"],
    socialLinks: [
      { platform: "Twitter", url: "#", icon: Twitter },
      { platform: "LinkedIn", url: "#", icon: Linkedin },
      { platform: "Instagram", url: "#", icon: Instagram },
      { platform: "YouTube", url: "#", icon: Youtube },
      { platform: "GitHub", url: "#", icon: Github },
      { platform: "Website", url: "#", icon: Globe }
    ],
    projects: [
      { title: "AI Voice Assistant", url: "#", type: "Project" },
      { title: "Personal Blog", url: "#", type: "Link" },
      { title: "NFT Collection", url: "#", type: "NFT" }
    ],
    sampleResponses: [
      { question: "What's your favorite AI trend?", response: "I'm fascinated by multimodal AI..." },
      { question: "How do you see the future of AI?", response: "AI will become more conversational..." },
      { question: "What advice for AI beginners?", response: "Start with curiosity and experiment..." }
    ]
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Profile link copied to clipboard",
    });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message Sent!",
        description: "Your message has been sent to Emily's AI avatar",
      });
      setMessage('');
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice Recording",
        description: "Listening... Speak your message",
      });
    } else {
      toast({
        title: "Recording Stopped",
        description: "Processing your voice message...",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show visitor auth if no user or visitor
  if (!user && !visitor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to AvatarTalk.bio</h1>
          <p className="text-blue-200 mb-8">Connect with AI avatars and have meaningful conversations</p>
          <Button 
            onClick={() => setIsVisitorAuthOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Enter as Visitor
          </Button>
        </div>
        <VisitorAuth 
          isOpen={isVisitorAuthOpen} 
          onClose={() => setIsVisitorAuthOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'}`}>
      {/* Header */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <div className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${darkMode ? 'bg-slate-800/50 text-white' : 'bg-white/50 text-slate-800'}`}>
            AvatarTalk.bio
          </div>
        </div>
        
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-full w-10 h-10 p-0 backdrop-blur-sm ${darkMode ? 'bg-slate-800/50 text-white hover:bg-slate-700/50' : 'bg-white/50 text-slate-800 hover:bg-white/70'}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={`rounded-full w-10 h-10 p-0 backdrop-blur-sm ${darkMode ? 'bg-slate-800/50 text-white hover:bg-slate-700/50' : 'bg-white/50 text-slate-800 hover:bg-white/70'}`}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 ring-4 ring-blue-500/30 mb-2">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>EP</AvatarFallback>
            </Avatar>
            {profile.isOnline && (
              <div className="absolute bottom-2 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {profile.name}
          </h1>
          <p className={`text-lg mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            {profile.username}
          </p>
          <p className={`max-w-md mx-auto mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {profile.bio}
          </p>
        </div>

        {/* Avatar Section */}
        <Card className={`mb-8 overflow-hidden ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-slate-200'} backdrop-blur-sm`}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 max-w-md">
                <AvatarPreview showControls={true} isLarge={true} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Talk to Me
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-10 h-10 p-0 ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {profile.conversations}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Total Conversations
                    </div>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {profile.followers}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Followers / {profile.following}
                    </div>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {profile.engagementScore}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Engagement Score
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Box */}
        <Card className={`mb-8 ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-slate-200'} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`flex-1 ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'}`}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceToggle}
                className={`w-10 h-10 p-0 ${isRecording ? 'bg-red-500 border-red-500 text-white' : ''} ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`w-10 h-10 p-0 ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full grid-cols-3 ${darkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
            <TabsTrigger value="overview" className={`${darkMode ? 'data-[state=active]:bg-slate-700' : 'data-[state=active]:bg-slate-100'}`}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="responses" className={`${darkMode ? 'data-[state=active]:bg-slate-700' : 'data-[state=active]:bg-slate-100'}`}>
              Talk Logs/Responses
            </TabsTrigger>
            <TabsTrigger value="projects" className={`${darkMode ? 'data-[state=active]:bg-slate-700' : 'data-[state=active]:bg-slate-100'}`}>
              Projects/Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={`${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-slate-200'} backdrop-blur-sm`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                      <span className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                      <span className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Joined {profile.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                      <a href={`https://${profile.website}`} className="text-blue-500 hover:text-blue-400">
                        {profile.website}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-slate-200'} backdrop-blur-sm`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>Social & Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {profile.socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${darkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        <social.icon className="w-5 h-5" />
                        <span className="text-sm">{social.platform}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="responses" className="mt-6">
            <Card className={`${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-slate-200'} backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>Sample Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.sampleResponses.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                      <div className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {item.question}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.response}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <Card className={`${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-slate-200'} backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>Projects & Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.projects.map((project, index) => (
                    <a
                      key={index}
                      href={project.url}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${darkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {project.title}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {project.type}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Share Menu */}
        {showShareMenu && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className={`w-full max-w-sm mx-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <CardHeader>
                <CardTitle className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>Share Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowShareMenu(false)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
