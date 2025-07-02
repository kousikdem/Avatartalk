
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
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white rounded-full w-10 h-10 p-0"
              onClick={() => setShowAvatarPreview(!showAvatarPreview)}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Settings className="w-3 h-3" />
              </div>
            </Button>
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
                    className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 p-0 text-white"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 p-0 text-white"
                    onClick={() => setIsTalking(!isTalking)}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center gap-4 mb-6">
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </Button>
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Button>
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.355-.293 1.176-.334 1.345-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </Button>
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </Button>
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Button>
              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </Button>
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
