
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, Users, BarChart3, Smile, Mic, Settings, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Avatar3D from '@/components/Avatar3D';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState('/lovable-uploads/fd5c2456-b137-4f5e-92b6-91e67819b497.png');
  const [displayName, setDisplayName] = useState('Emily Parker');
  const [username, setUsername] = useState('emily');
  const [bio, setBio] = useState('Exploring the boundaries of AI conversation. Let\'s create something amazing!');
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState<'realistic' | 'cartoon' | 'anime' | 'minimal'>('realistic');
  const [avatarMood, setAvatarMood] = useState<'professional' | 'friendly' | 'mysterious'>('friendly');

  const handleSendMessage = () => {
    if (message.trim()) {
      setIsTalking(true);
      // Simulate AI response
      setTimeout(() => {
        setIsTalking(false);
      }, 3000);
      setMessage('');
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Main Profile Container */}
      <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl bg-gradient-to-br from-slate-800 to-slate-900 min-h-screen relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 flex justify-between items-center z-10">
          <h1 className="text-white text-xl lg:text-2xl font-semibold">AvatarTalk.bio</h1>
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => setShowAvatarPreview(!showAvatarPreview)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="pt-20 lg:pt-24 pb-8 px-6 lg:px-8 text-center relative">
          {/* Background Blur Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/50 to-slate-900"></div>
          
          <div className="relative z-10">
            {/* Avatar Preview Toggle */}
            {showAvatarPreview ? (
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-4">
                  <Avatar3D
                    isLarge={true}
                    isTalking={isTalking}
                    avatarStyle={avatarStyle}
                    mood={avatarMood}
                    onInteraction={() => setIsTalking(!isTalking)}
                  />
                </div>
                
                {/* Avatar Controls */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  <select
                    value={avatarStyle}
                    onChange={(e) => setAvatarStyle(e.target.value as any)}
                    className="bg-white/10 text-white border border-white/20 rounded px-3 py-1 text-sm backdrop-blur"
                  >
                    <option value="realistic" className="text-black">Realistic</option>
                    <option value="cartoon" className="text-black">Cartoon</option>
                    <option value="anime" className="text-black">Anime</option>
                    <option value="minimal" className="text-black">Minimal</option>
                  </select>
                  
                  <select
                    value={avatarMood}
                    onChange={(e) => setAvatarMood(e.target.value as any)}
                    className="bg-white/10 text-white border border-white/20 rounded px-3 py-1 text-sm backdrop-blur"
                  >
                    <option value="professional" className="text-black">Professional</option>
                    <option value="friendly" className="text-black">Friendly</option>
                    <option value="mysterious" className="text-black">Mysterious</option>
                  </select>
                </div>
                
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 mb-4"
                  onClick={() => setShowAvatarPreview(false)}
                >
                  Use This Avatar
                </Button>
              </div>
            ) : (
              <div className="mb-6 relative group">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 mx-auto border-4 border-white/20 shadow-2xl cursor-pointer" onClick={() => setShowAvatarPreview(true)}>
                  <AvatarImage src={profileImage} alt="Profile" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl lg:text-3xl font-bold">
                    {displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                
                {/* 3D Avatar Preview indicator */}
                <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Name and Username */}
            <div className="mb-4">
              <h2 className="text-white text-3xl lg:text-4xl font-bold mb-2">{displayName}</h2>
              <p className="text-white/70 text-lg lg:text-xl">@{username}</p>
            </div>

            {/* Bio */}
            <p className="text-white/90 text-base lg:text-lg leading-relaxed mb-8 max-w-sm lg:max-w-md mx-auto">
              {bio}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8 justify-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 lg:px-10 py-3 lg:py-4 rounded-full font-semibold text-base lg:text-lg flex-1 max-w-40 lg:max-w-48"
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
                variant="outline"
                className={`px-8 lg:px-10 py-3 lg:py-4 rounded-full font-semibold text-base lg:text-lg border-2 flex-1 max-w-32 lg:max-w-40 ${
                  isFollowing 
                    ? 'bg-white/10 border-white/30 text-white hover:bg-white/20' 
                    : 'bg-transparent border-white/30 text-white hover:bg-white/10'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 lg:gap-12 mb-8">
              <div className="text-center">
                <div className="text-white text-2xl lg:text-3xl font-bold">352</div>
                <div className="text-white/60 text-sm lg:text-base">Total Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-white text-2xl lg:text-3xl font-bold">1.2K</div>
                <div className="text-white/60 text-sm lg:text-base">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-white text-2xl lg:text-3xl font-bold">89</div>
                <div className="text-white/60 text-sm lg:text-base">Engagement Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 lg:px-8">
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
                    onClick={() => setIsTalking(!isTalking)}
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
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm mb-3">
                        Hi there! I'm ready to chat. What would you like to talk about today? 
                        {isTalking && <span className="animate-pulse">I'm listening...</span>}
                      </p>
                      <div className="text-white/60 text-xs">Just now</div>
                    </div>
                  </div>
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
    </div>
  );
};

export default ProfilePage;
