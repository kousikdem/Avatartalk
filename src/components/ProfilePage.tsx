
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, Users, BarChart3, Smile, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState('/lovable-uploads/fd5c2456-b137-4f5e-92b6-91e67819b497.png');
  const [displayName, setDisplayName] = useState('Emily Parker');
  const [username, setUsername] = useState('emily');
  const [bio, setBio] = useState('Exploring the boundaries of AI conversation. Let\'s create something amazing!');

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Main Profile Container */}
      <div className="max-w-md mx-auto bg-gradient-to-br from-slate-800 to-slate-900 min-h-screen relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <h1 className="text-white text-xl font-semibold">AvatarTalk.bio</h1>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="pt-20 pb-8 px-6 text-center relative">
          {/* Background Blur Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/50 to-slate-900"></div>
          
          <div className="relative z-10">
            {/* Avatar */}
            <div className="mb-6">
              <Avatar className="w-32 h-32 mx-auto border-4 border-white/20 shadow-2xl">
                <AvatarImage src={profileImage} alt="Profile" className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                  {displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Username */}
            <div className="mb-4">
              <h2 className="text-white text-3xl font-bold mb-2">{displayName}</h2>
              <p className="text-white/70 text-lg">@{username}</p>
            </div>

            {/* Bio */}
            <p className="text-white/90 text-base leading-relaxed mb-8 max-w-sm mx-auto">
              {bio}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8 justify-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-base flex-1 max-w-40"
                onClick={() => setActiveTab('chat')}
              >
                Talk to Me
              </Button>
              <Button
                onClick={() => setIsFollowing(!isFollowing)}
                variant="outline"
                className={`px-8 py-3 rounded-full font-semibold text-base border-2 flex-1 max-w-32 ${
                  isFollowing 
                    ? 'bg-white/10 border-white/30 text-white hover:bg-white/20' 
                    : 'bg-transparent border-white/30 text-white hover:bg-white/10'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-white text-2xl font-bold">352</div>
                <div className="text-white/60 text-sm">Total Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-white text-2xl font-bold">1.2K</div>
                <div className="text-white/60 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-white text-2xl font-bold">89</div>
                <div className="text-white/60 text-sm">Engagement Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 rounded-full p-1 mb-6">
              <TabsTrigger 
                value="posts" 
                className="rounded-full text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="rounded-full text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="gifts" 
                className="rounded-full text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                Projects/Gifts
              </TabsTrigger>
            </TabsList>

            {/* Chat Input - Always Visible */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  placeholder="Ask me anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-white/10 backdrop-blur border-white/20 text-white placeholder:text-white/50 rounded-full pl-4 pr-16 py-3 text-base"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 rounded-full w-8 h-8 p-0"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 rounded-full w-8 h-8 p-0"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab Contents */}
            <TabsContent value="posts" className="space-y-4 pb-6">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <p className="text-white/90 text-sm">
                    Welcome to my profile! I'm excited to connect and have meaningful conversations about AI and technology.
                  </p>
                  <div className="flex justify-between items-center mt-3 text-white/60 text-xs">
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
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-4">
                  <p className="text-white/90 text-sm mb-3">
                    Hi there! I'm ready to chat. What would you like to talk about today?
                  </p>
                  <div className="text-white/60 text-xs">Just now</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gifts" className="space-y-4 pb-6">
              <div className="grid gap-4">
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">1-on-1 Consultation</h4>
                    <p className="text-white/70 text-sm mb-3">Personal AI consultation session</p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      $99.99
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Desktop View - Hidden on Mobile */}
      <div className="hidden lg:block fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-md w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            {/* Desktop content mirrors mobile but in a contained card */}
            <div className="p-8 text-center">
              <div className="mb-6">
                <Avatar className="w-40 h-40 mx-auto border-4 border-white/20 shadow-2xl">
                  <AvatarImage src={profileImage} alt="Profile" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-bold">
                    {displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mb-6">
                <h2 className="text-white text-4xl font-bold mb-2">{displayName}</h2>
                <p className="text-white/70 text-xl">@{username}</p>
              </div>

              <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-sm mx-auto">
                {bio}
              </p>

              <div className="flex gap-4 mb-8 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-semibold text-lg">
                  Talk to Me
                </Button>
                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  variant="outline"
                  className={`px-10 py-4 rounded-full font-semibold text-lg border-2 ${
                    isFollowing 
                      ? 'bg-white/10 border-white/30 text-white hover:bg-white/20' 
                      : 'bg-transparent border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>

              <div className="flex justify-center gap-12 mb-8">
                <div className="text-center">
                  <div className="text-white text-3xl font-bold">352</div>
                  <div className="text-white/60">Total Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-3xl font-bold">1.2K</div>
                  <div className="text-white/60">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-3xl font-bold">89</div>
                  <div className="text-white/60">Engagement Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
