
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Share2, 
  Youtube, 
  Instagram, 
  Calendar,
  FileText,
  Mic,
  Send,
  Moon
} from 'lucide-react';

const ProfilePage = () => {
  const [question, setQuestion] = useState('');
  const [activeTab, setActiveTab] = useState('responses');

  const socialLinks = [
    { icon: Youtube, label: 'YouTube', color: 'text-red-500', url: '#' },
    { icon: Instagram, label: 'Instagram', color: 'text-pink-500', url: '#' },
    { icon: Calendar, label: 'Book a Call', color: 'text-blue-500', url: '#' },
    { icon: FileText, label: 'Get My Guide', color: 'text-green-500', url: '#' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/d6afa97d-dc19-4ce0-9426-ba291ed29f50.png" 
            alt="AvatarTalk.bio" 
            className="h-6 w-auto"
          />
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
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 mb-4">
              <img 
                src="/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png" 
                alt="Abigail" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Abigail</h1>
          <p className="text-gray-400 text-sm">@demo</p>
          <p className="text-gray-300 mt-3 mb-6">Creative mind 👋 Here to chat and explore!</p>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl"
            size="lg"
          >
            Talk to Me
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-800 font-semibold py-3 rounded-2xl"
            size="lg"
          >
            Follow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 text-center mb-6">
          <div>
            <div className="text-2xl font-bold text-white">432</div>
            <div className="text-sm text-gray-400">Total Conversations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">1,289</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">56</div>
            <div className="text-sm text-gray-400">Engagement Level</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="responses" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              Responses
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="links" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
            >
              Links
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="responses" className="space-y-4">
              {/* Chat Interface */}
              <Card className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Input
                      placeholder="Ask me anything"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 flex-1"
                    />
                    <Button size="sm" className="p-2 bg-gray-700 hover:bg-gray-600">
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="p-2 bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              <Card className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-3">About</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    I'm a creative professional passionate about helping others bring their ideas to life. 
                    With years of experience in digital creativity and innovation, I love connecting with 
                    like-minded individuals and sharing knowledge.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-3">Recent Activity</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>• Answered 12 questions today</div>
                    <div>• Connected with 5 new followers</div>
                    <div>• Shared insights on creativity</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-3">
              {socialLinks.map((link, index) => (
                <Card key={index} className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left p-0 h-auto"
                    >
                      <link.icon className={`w-5 h-5 mr-3 ${link.color}`} />
                      <span className="text-white">{link.label}</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        {/* Social Footer */}
        <div className="flex justify-center space-x-6 mt-8 pt-6 border-t border-gray-800">
          <div className="flex space-x-4">
            {socialLinks.slice(0, 4).map((social, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <social.icon className="w-5 h-5" />
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            Share Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
