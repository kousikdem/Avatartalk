
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Star, 
  Users, 
  Calendar,
  MapPin,
  Link2,
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
  ArrowRight
} from 'lucide-react';
import AvatarPreview from './AvatarPreview';
import AuthModal from './AuthModal';
import DemoLogin from './DemoLogin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoLoginOpen, setIsDemoLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for authenticated user
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    }
  };

  // Mock profile data
  const profile = {
    name: "Sarah Chen",
    username: "@sarahchen",
    bio: "Digital creator & AI enthusiast. Building the future of personal branding with AI avatars. 🚀",
    location: "San Francisco, CA",
    website: "sarahchen.com",
    joinDate: "March 2024",
    followers: "12.5K",
    following: "1.2K",
    conversations: "2.8K",
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop",
    isVerified: true,
    specialties: ["AI Technology", "Personal Branding", "Content Creation"],
    socialLinks: [
      { platform: "Instagram", url: "#", icon: Instagram },
      { platform: "Twitter", url: "#", icon: Twitter },
      { platform: "YouTube", url: "#", icon: Youtube },
      { platform: "LinkedIn", url: "#", icon: Linkedin }
    ],
    recentConversations: [
      { topic: "AI Avatar Setup", duration: "5 min", rating: 5 },
      { topic: "Personal Branding Tips", duration: "8 min", rating: 5 },
      { topic: "Content Strategy", duration: "12 min", rating: 4 }
    ]
  };

  const quickActions = [
    { title: "Schedule Consultation", icon: Calendar, color: "bg-blue-500" },
    { title: "Download Resources", icon: ExternalLink, color: "bg-green-500" },
    { title: "Join Community", icon: Users, color: "bg-purple-500" },
    { title: "Get Updates", icon: Mail, color: "bg-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/10 to-purple-950/10">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600/20 to-purple-600/20 overflow-hidden">
        <img 
          src={profile.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
        
        {/* Mobile Menu */}
        <div className="absolute top-4 right-4 md:hidden">
          <Button variant="ghost" size="sm" className="text-white bg-black/20 backdrop-blur-sm">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-gray-800/60 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 ring-4 ring-blue-500/30">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                    {profile.isVerified && (
                      <Badge className="bg-blue-500 text-white">Verified</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-400 mb-2">{profile.username}</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">{profile.bio}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {profile.joinDate}
                    </div>
                  </div>

                  {/* Auth/Demo Buttons */}
                  <div className="w-full space-y-3 mb-4">
                    {!user ? (
                      <>
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          onClick={() => setIsAuthModalOpen(true)}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Sign Up / Login
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                          onClick={() => setIsDemoLoginOpen(true)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Try Demo Login
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-green-400 text-sm">Welcome, {user.user_metadata?.full_name || user.email}!</div>
                        <Button 
                          variant="outline" 
                          className="w-full border-gray-600 text-gray-300"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800/50"
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      {isFollowing ? (
                        <>
                          <Heart className="w-4 h-4 mr-2 fill-current text-red-500" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 w-full text-center">
                    <div>
                      <div className="text-xl font-bold text-white">{profile.followers}</div>
                      <div className="text-xs text-gray-400">Followers</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{profile.following}</div>
                      <div className="text-xs text-gray-400">Following</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{profile.conversations}</div>
                      <div className="text-xs text-gray-400">Chats</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card className="bg-gray-800/60 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-gray-800/60 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href={`https://${profile.website}`} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                    <Globe className="w-5 h-5" />
                    {profile.website}
                  </a>
                  {profile.socialLinks.map((social, index) => (
                    <a key={index} href={social.url} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                      <social.icon className="w-5 h-5" />
                      {social.platform}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Avatar & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar Interaction */}
            <Card className="bg-gray-800/60 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white text-xl">Chat with Sarah's Avatar</CardTitle>
                    <p className="text-gray-400 mt-1">AI-powered conversations available 24/7</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{profile.rating}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">Online</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <AvatarPreview showControls={true} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Start a conversation about:</h3>
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50">
                          💡 AI Avatar Creation Tips
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50">
                          🚀 Personal Branding Strategy
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50">
                          📱 Content Creation Ideas
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Conversation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Mobile Optimized */}
            <Card className="bg-gray-800/60 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button key={index} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 p-4 h-auto flex-col gap-2">
                      <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Conversations */}
            <Card className="bg-gray-800/60 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.recentConversations.map((conv, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{conv.topic}</div>
                        <div className="text-gray-400 text-sm">{conv.duration} duration</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < conv.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                          ))}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Demo Login Modal */}
      <DemoLogin 
        isOpen={isDemoLoginOpen} 
        onClose={() => setIsDemoLoginOpen(false)} 
      />
    </div>
  );
};

export default ProfilePage;
