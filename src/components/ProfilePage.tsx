
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Avatar3D from './Avatar3D';
import VisitorAuth from './VisitorAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  Plus,
  Image,
  Video,
  Link as LinkIcon,
  HelpCircle,
  FileText,
  Camera,
  Paperclip,
  Facebook,
  Instagram,
  Twitter,
  Pinterest,
  Youtube
} from 'lucide-react';

interface Post {
  id: string;
  type: 'video' | 'photo' | 'link' | 'integration' | 'qa' | 'text';
  content: string;
  media?: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  isUser: boolean;
}

const ProfilePage = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
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

    // Mock data
    setPosts([
      {
        id: '1',
        type: 'text',
        content: 'Just launched my new AI avatar! Excited to connect with everyone.',
        timestamp: new Date(Date.now() - 3600000),
        likes: 24,
        comments: 8
      },
      {
        id: '2',
        type: 'qa',
        content: 'Q: What\'s your favorite AI trend? A: I\'m fascinated by multimodal AI and how it\'s changing conversations.',
        timestamp: new Date(Date.now() - 7200000),
        likes: 18,
        comments: 5
      }
    ]);

    setChatMessages([
      {
        id: '1',
        message: 'Hello! Tell me about your AI expertise.',
        response: 'Hi there! I specialize in AI conversation design and helping people create engaging digital experiences.',
        timestamp: new Date(Date.now() - 1800000),
        isUser: false
      }
    ]);

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
      { platform: "LinkedIn", url: "#", icon: Globe },
      { platform: "Instagram", url: "#", icon: Instagram },
      { platform: "YouTube", url: "#", icon: Youtube },
      { platform: "Facebook", url: "#", icon: Facebook },
      { platform: "Pinterest", url: "#", icon: Pinterest }
    ],
    projects: [
      { title: "AI Voice Assistant", url: "#", type: "Project" },
      { title: "Personal Blog", url: "#", type: "Link" },
      { title: "NFT Collection", url: "#", type: "NFT" }
    ]
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Profile link copied to clipboard",
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${profile.name}'s AI Avatar on AvatarTalk.bio`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      instagram: url, // Instagram doesn't support direct URL sharing
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
      youtube: url, // YouTube doesn't support direct URL sharing
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
    
    toast({
      title: "Shared!",
      description: `Shared on ${platform}`,
    });
    setShowShareMenu(false);
  };

  const processWithLlama = async (input: string) => {
    setIsProcessing(true);
    try {
      // Mock Llama 4 processing - in production, this would call actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const responses = [
        "That's a fascinating question! Based on my training, I'd say...",
        "I understand what you're asking. Let me break this down for you...",
        "Great point! Here's my perspective on that topic...",
        "Thanks for sharing that. Here's what I think about it..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)] + 
        " " + input.split(' ').reverse().join(' ').toLowerCase();
      
      return randomResponse;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message;
      setMessage('');
      
      // Add user message to chat
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        message: userMessage,
        response: '',
        timestamp: new Date(),
        isUser: true
      };
      
      setChatMessages(prev => [...prev, newUserMessage]);
      
      // Process with Llama 4
      const response = await processWithLlama(userMessage);
      
      // Add AI response
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: userMessage,
        response: response,
        timestamp: new Date(),
        isUser: false
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "Message Sent!",
        description: "Your message has been processed by AI",
      });
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice Recording",
        description: "Listening... Speak your message",
      });
      // Mock voice input after 3 seconds
      setTimeout(() => {
        setMessage("Hello, this is a voice message converted to text!");
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    setShowChatBox(value.length > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800">Loading...</div>
      </div>
    );
  }

  // Show visitor auth if no user or visitor
  if (!user && !visitor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to AvatarTalk.bio</h1>
          <p className="text-gray-600 mb-8">Connect with AI avatars and have meaningful conversations</p>
          <Button 
            onClick={() => setIsVisitorAuthOpen(true)}
            className="gradient-button"
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
    <div className="min-h-screen bg-white text-gray-800">
      {/* Profile Content - No Header */}
      <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-b-3xl p-6 text-white">
        {/* Profile Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <Avatar className="w-20 h-20 ring-4 ring-white/30 mb-2">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>EP</AvatarFallback>
            </Avatar>
            {profile.isOnline && (
              <div className="absolute bottom-2 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
          <p className="text-blue-200 mb-3">{profile.username}</p>
          <p className="text-blue-100 text-sm max-w-sm mx-auto">{profile.bio}</p>
        </div>

        {/* Avatar Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <Avatar3D 
            isLarge={true} 
            isTalking={isTalking}
            avatarStyle="realistic"
            mood="friendly"
            onInteraction={() => setIsTalking(!isTalking)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            className="flex-1 bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => setIsTalking(!isTalking)}
          >
            Talk to Me
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsFollowing(!isFollowing)}
            className="px-6 border-white/30 text-white hover:bg-white/20"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-10 h-10 p-0 border-white/30 text-white hover:bg-white/20"
          >
            <UserCheck className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold">{profile.conversations}</div>
            <div className="text-blue-200 text-sm">Total Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{profile.followers}</div>
            <div className="text-blue-200 text-sm">Followers / {profile.following}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{profile.engagementScore}</div>
            <div className="text-blue-200 text-sm">Engagement Score</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 mt-6">
            <TabsTrigger value="posts" className="data-[state=active]:bg-white">
              Posts
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-white">
              Chat
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white">
              Projects/Links
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6 space-y-4">
            {/* Posts List */}
            {posts.map((post) => (
              <Card key={post.id} className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback>EP</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{profile.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {post.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-red-500">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-500">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Chat Messages</span>
                  {isProcessing && (
                    <Badge variant="outline" className="text-blue-600">
                      Processing with Llama 4...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((chat) => (
                  <div key={chat.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                        {chat.message}
                      </div>
                    </div>
                    {chat.response && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-xs">
                          {chat.response}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects/Links Tab */}
          <TabsContent value="projects" className="mt-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Projects & Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.projects.map((project, index) => (
                    <a
                      key={index}
                      href={project.url}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-800">{project.title}</div>
                        <div className="text-sm text-gray-600">{project.type}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Chat Box - Auto-appears when typing */}
        <AnimatePresence>
          {showChatBox && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-32 left-4 right-4 max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto z-40"
            >
              <div className="space-y-4">
                {chatMessages.slice(-3).map((chat) => (
                  <div key={chat.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs text-sm">
                        {chat.message}
                      </div>
                    </div>
                    {chat.response && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 p-2 rounded-lg max-w-xs text-sm">
                          {chat.response}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Chat Input - Modern UI */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="max-w-4xl mx-auto">
            {/* Message Input with Modern UI */}
            <div className="bg-gray-50 rounded-full p-2 mb-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={message}
                  onChange={handleMessageChange}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 rounded-full hover:bg-gray-200"
                >
                  <Smile className="w-5 h-5 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={`w-10 h-10 p-0 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200'}`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-gray-600" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isProcessing}
                  className="gradient-button w-10 h-10 p-0 rounded-full"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Modern Social Links Row */}
            <div className="flex items-center justify-center space-x-6 bg-gray-50 rounded-full py-3 px-6">
              {profile.socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-gray-600 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-white"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareMenu(true)}
                className="text-gray-600 hover:text-blue-500 p-2 rounded-full hover:bg-white"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add bottom padding to account for fixed input */}
        <div className="h-40"></div>
      </div>

      {/* Enhanced Share Menu */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-sm mx-4 bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Share Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-blue-50"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                Share on Facebook
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-blue-50"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-pink-50"
                onClick={() => handleShare('instagram')}
              >
                <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                Share on Instagram
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-red-50"
                onClick={() => handleShare('pinterest')}
              >
                <Pinterest className="w-4 h-4 mr-2 text-red-600" />
                Share on Pinterest
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-red-50"
                onClick={() => handleShare('youtube')}
              >
                <Youtube className="w-4 h-4 mr-2 text-red-600" />
                Share on YouTube
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-blue-50"
                onClick={() => handleShare('linkedin')}
              >
                <Globe className="w-4 h-4 mr-2 text-blue-700" />
                Share on LinkedIn
              </Button>
              <Separator />
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
  );
};

export default ProfilePage;
