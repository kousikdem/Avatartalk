
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Share2, 
  Youtube, 
  Instagram, 
  Calendar,
  FileText,
  Mic,
  Send,
  Moon,
  Heart,
  Eye,
  Users,
  TrendingUp,
  Star,
  MapPin,
  Globe,
  Coffee,
  Briefcase,
  GraduationCap,
  Music,
  Camera,
  Palette,
  Code,
  Zap,
  Gift
} from 'lucide-react';

const ProfilePage = () => {
  const [question, setQuestion] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isFollowing, setIsFollowing] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'avatar',
      message: "Hey there! I'm Abigail, welcome to my digital space! 👋 Feel free to ask me anything about my work, projects, or just chat!"
    }
  ]);

  const socialLinks = [
    { icon: Youtube, label: 'YouTube Channel', color: 'text-red-500', url: '#', followers: '125K' },
    { icon: Instagram, label: 'Instagram', color: 'text-pink-500', url: '#', followers: '89K' },
    { icon: Calendar, label: 'Book a 1:1 Call', color: 'text-blue-500', url: '#', price: '$99' },
    { icon: FileText, label: 'Free Design Guide', color: 'text-green-500', url: '#', downloads: '2.3K' },
    { icon: Coffee, label: 'Buy Me a Coffee', color: 'text-orange-500', url: '#' },
    { icon: Gift, label: 'My Course - 50% OFF', color: 'text-purple-500', url: '#', badge: 'LIMITED' },
  ];

  const interests = [
    { icon: Palette, label: 'Design', color: 'bg-pink-500/20 text-pink-400' },
    { icon: Camera, label: 'Photography', color: 'bg-blue-500/20 text-blue-400' },
    { icon: Music, label: 'Music', color: 'bg-purple-500/20 text-purple-400' },
    { icon: Code, label: 'Tech', color: 'bg-green-500/20 text-green-400' },
  ];

  const achievements = [
    { icon: Star, label: 'Top Creator 2024', color: 'text-yellow-400' },
    { icon: TrendingUp, label: '1M+ Views', color: 'text-blue-400' },
    { icon: Users, label: '50K Community', color: 'text-green-400' },
  ];

  const handleSendMessage = () => {
    if (!question.trim()) return;
    
    setChatMessages(prev => [...prev, 
      { type: 'user', message: question },
      { type: 'avatar', message: "Thanks for your question! I'm processing that and will get back to you with a thoughtful response. 🤔✨" }
    ]);
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      {/* Header */}
      <header className="p-4 flex justify-between items-center backdrop-blur-lg bg-gray-900/50">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AvatarTalk.bio
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-400">
            <Moon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pb-8">
        {/* Profile Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-1 mb-4">
              <img 
                src="/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png" 
                alt="Abigail" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h1 className="text-2xl font-bold text-white">Abigail Chen</h1>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Verified</Badge>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1" />
              Creative Director
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              San Francisco
            </div>
          </div>

          <p className="text-gray-300 mb-4 leading-relaxed">
            ✨ Creative mind & design enthusiast<br/>
            🎨 Helping creators build beautiful brands<br/>
            💬 Always here to chat and inspire!
          </p>

          {/* Interests */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {interests.map((interest, index) => (
              <Badge key={index} className={`${interest.color} border-0`}>
                <interest.icon className="w-3 h-3 mr-1" />
                {interest.label}
              </Badge>
            ))}
          </div>

          {/* Achievements */}
          <div className="flex justify-center space-x-4 mb-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <achievement.icon className={`w-5 h-5 ${achievement.color} mx-auto mb-1`} />
                <div className="text-xs text-gray-400">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Avatar Card */}
        <Card className="bg-gray-800/40 border-gray-700 mb-6 overflow-hidden backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="relative">
              <div className="h-80 bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                <div className="w-64 h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center relative">
                  <img 
                    src="/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png" 
                    alt="Avatar" 
                    className="w-full h-full object-cover rounded-3xl"
                  />
                  <div className="absolute inset-0 rounded-3xl border border-white/10"></div>
                  <div className="absolute bottom-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Online
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
          <Button 
            variant={isFollowing ? "default" : "outline"}
            className={`${isFollowing ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600 text-gray-300 hover:bg-gray-800'} font-semibold py-3 rounded-2xl`}
            size="lg"
            onClick={() => setIsFollowing(!isFollowing)}
          >
            <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-4 text-center mb-6">
          <div>
            <div className="text-2xl font-bold text-white">1.2K</div>
            <div className="text-sm text-gray-400">Chats</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">15.8K</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">89%</div>
            <div className="text-sm text-gray-400">Response Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">4.9</div>
            <div className="text-sm text-gray-400">Rating</div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="links" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              <Globe className="w-4 h-4 mr-2" />
              Links
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              <Users className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="chat" className="space-y-4">
              {/* Chat Messages */}
              <Card className="bg-gray-800/40 border-gray-700 backdrop-blur-sm max-h-80 overflow-y-auto">
                <CardContent className="p-4 space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-200'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Chat Input */}
              <Card className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Input
                      placeholder="Ask me anything..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 flex-1"
                    />
                    <Button size="sm" className="p-2 bg-gray-700 hover:bg-gray-600">
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="p-2 bg-blue-600 hover:bg-blue-700" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-3">
              {socialLinks.map((link, index) => (
                <Card key={index} className="bg-gray-800/40 border-gray-700 backdrop-blur-sm hover:bg-gray-800/60 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <link.icon className={`w-5 h-5 mr-3 ${link.color}`} />
                        <div>
                          <span className="text-white font-medium">{link.label}</span>
                          {link.followers && (
                            <div className="text-sm text-gray-400">{link.followers} followers</div>
                          )}
                          {link.downloads && (
                            <div className="text-sm text-gray-400">{link.downloads} downloads</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {link.badge && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">{link.badge}</Badge>
                        )}
                        {link.price && (
                          <Badge className="bg-green-500/20 text-green-400">{link.price}</Badge>
                        )}
                        <Button size="sm" variant="ghost" className="text-gray-400">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <Card className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Background
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    I'm a passionate creative director with over 8 years of experience in digital design 
                    and brand strategy. I love helping creators and businesses tell their stories through 
                    beautiful, meaningful design.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Experience</div>
                      <div className="text-white">8+ Years</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Projects</div>
                      <div className="text-white">200+</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    What I'm Up To
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>🚀 Launching a new design course next month</div>
                    <div>📱 Working on a mobile app for creators</div>
                    <div>🎨 Redesigning my studio space</div>
                    <div>☕ Always available for coffee chats!</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Social Footer */}
        <div className="flex justify-center space-x-6 mt-8 pt-6 border-t border-gray-800">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Eye className="w-4 h-4 mr-2" />
            {Math.floor(Math.random() * 1000) + 500} views today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
