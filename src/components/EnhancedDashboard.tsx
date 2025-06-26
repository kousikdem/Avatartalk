import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import Avatar3D from './Avatar3D';
import { motion } from 'framer-motion';
import { 
  User, Palette, Volume2, MessageSquare, Link, BarChart3, Settings,
  Eye, EyeOff, Plus, Youtube, Instagram, Shield, Bell, Globe, Trash2,
  Download, Mic, Play, Pause, Copy, QrCode, Share2, Moon, Sun,
  Zap, Brain, Heart, Smile, Briefcase, Gamepad2, Sparkles
} from 'lucide-react';

type AvatarStyle = 'realistic' | 'cartoon' | 'anime' | 'minimal';
type AvatarMood = 'professional' | 'friendly' | 'mysterious';

const EnhancedDashboard = () => {
  const [isPublic, setIsPublic] = useState(true);
  const [personality, setPersonality] = useState([50]);
  const [voiceSpeed, setVoiceSpeed] = useState([50]);
  const [friendliness, setFriendliness] = useState([70]);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('realistic');
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('friendly');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [setupProgress, setSetupProgress] = useState(85);

  const socialPlatforms = [
    { name: 'YouTube', icon: Youtube, color: 'text-red-500', url: '' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500', url: '' },
    { name: 'Twitter', icon: Globe, color: 'text-blue-400', url: '' },
    { name: 'LinkedIn', icon: Briefcase, color: 'text-blue-600', url: '' },
    { name: 'Discord', icon: Gamepad2, color: 'text-indigo-500', url: '' },
  ];

  const personalityTemplates = [
    { name: 'Professional Coach', icon: Briefcase, mood: 'professional' as AvatarMood },
    { name: 'Friendly Guide', icon: Heart, mood: 'friendly' as AvatarMood },
    { name: 'Creative Entertainer', icon: Sparkles, mood: 'friendly' as AvatarMood },
    { name: 'Mysterious Advisor', icon: Brain, mood: 'mysterious' as AvatarMood },
  ];

  const handleVoiceTest = () => {
    setIsTalking(true);
    setTimeout(() => setIsTalking(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Progress */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text">
                Avatar Studio
              </h1>
              <p className="text-blue-200 mt-2">Build your AI personality and interactive profile</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-blue-400 text-blue-300">
                Setup {setupProgress}% Complete
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="text-blue-200 hover:text-white hover:bg-blue-800/50"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-800/50 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${setupProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Preview & Stats */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Avatar Preview */}
            <Card className="neo-glass border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-400" />
                    Live Avatar
                  </span>
                  <div className="flex items-center space-x-2">
                    {isPublic ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar3D 
                  isLarge={true} 
                  isTalking={isTalking}
                  avatarStyle={avatarStyle}
                  mood={avatarMood}
                  onInteraction={() => setIsTalking(!isTalking)}
                />
                
                <div className="mt-6 w-full space-y-3">
                  <Button 
                    onClick={handleVoiceTest}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Test Voice & Animation
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 border-blue-500/50 text-blue-300">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-purple-500/50 text-purple-300">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="neo-glass border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Profile Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">1,432</div>
                    <div className="text-sm text-blue-200">Total Chats</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/20">
                    <div className="text-2xl font-bold text-green-400">289</div>
                    <div className="text-sm text-green-200">Followers</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">87%</div>
                    <div className="text-sm text-purple-200">Engagement</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400">4.8</div>
                    <div className="text-sm text-orange-200">Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Configuration */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-blue-500/30">
                <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="avatar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <Palette className="w-4 h-4 mr-2" />
                  Avatar
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="personality" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <Brain className="w-4 h-4 mr-2" />
                  Mind
                </TabsTrigger>
                <TabsTrigger value="responses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="links" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
                  <Link className="w-4 h-4 mr-2" />
                  Links
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card className="neo-glass border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Identity & Branding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="displayName" className="text-blue-200">Display Name</Label>
                        <Input 
                          id="displayName" 
                          defaultValue="Alex Digital" 
                          className="bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-blue-200">Custom URL</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-blue-500/30 bg-slate-800/50 text-blue-300 text-sm">
                            avatartalk.bio/
                          </span>
                          <Input 
                            id="username" 
                            defaultValue="alexdigital" 
                            className="rounded-l-none bg-slate-800/50 border-blue-500/30 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="role" className="text-blue-200">Role/Profession</Label>
                      <Select defaultValue="creator">
                        <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-blue-500/30">
                          <SelectItem value="creator">Creator</SelectItem>
                          <SelectItem value="coach">Life Coach</SelectItem>
                          <SelectItem value="artist">Artist</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="educator">Educator</SelectItem>
                          <SelectItem value="influencer">Influencer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio" className="text-blue-200">Bio (160 chars max)</Label>
                      <Textarea 
                        id="bio" 
                        defaultValue="AI-powered digital creator helping people unlock their potential 🚀"
                        className="bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300"
                        rows={3}
                        maxLength={160}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Avatar Tab */}
              <TabsContent value="avatar" className="space-y-6">
                <Card className="neo-glass border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Avatar Customization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-blue-200 mb-4 block">Avatar Style</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(['realistic', 'cartoon', 'anime', 'minimal'] as AvatarStyle[]).map((style) => (
                          <Button
                            key={style}
                            variant={avatarStyle === style ? "default" : "outline"}
                            className={`h-20 ${avatarStyle === style ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'border-blue-500/30 text-blue-300'}`}
                            onClick={() => setAvatarStyle(style)}
                          >
                            <div className="text-center">
                              <div className="capitalize font-medium">{style}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-blue-200 mb-4 block">Personality Templates</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personalityTemplates.map((template) => (
                          <Button
                            key={template.name}
                            variant={avatarMood === template.mood ? "default" : "outline"}
                            className={`p-4 h-auto justify-start ${avatarMood === template.mood ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'border-blue-500/30 text-blue-300'}`}
                            onClick={() => setAvatarMood(template.mood)}
                          >
                            <template.icon className="w-5 h-5 mr-3" />
                            <div className="text-left">
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm opacity-70 capitalize">{template.mood} mood</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice" className="space-y-6">
                <Card className="neo-glass border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Voice & Speech Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-blue-200">Voice Type</Label>
                      <Select defaultValue="female-professional">
                        <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-blue-500/30">
                          <SelectItem value="female-professional">Female Professional</SelectItem>
                          <SelectItem value="male-friendly">Male Friendly</SelectItem>
                          <SelectItem value="female-energetic">Female Energetic</SelectItem>
                          <SelectItem value="male-calm">Male Calm</SelectItem>
                          <SelectItem value="neutral-ai">Neutral AI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-blue-200 mb-4 block">
                          Speech Speed: {voiceSpeed[0]}%
                        </Label>
                        <Slider
                          value={voiceSpeed}
                          onValueChange={setVoiceSpeed}
                          max={150}
                          min={50}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-blue-400 mt-2">
                          <span>Slow</span>
                          <span>Normal</span>
                          <span>Fast</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleVoiceTest}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test Voice
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-blue-500/30 text-blue-300"
                        onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                      >
                        <Mic className={`w-4 h-4 mr-2 ${isVoiceRecording ? 'text-red-400' : ''}`} />
                        {isVoiceRecording ? 'Stop Recording' : 'Record Voice'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personality Tab */}
              <TabsContent value="personality" className="space-y-6">
                <Card className="neo-glass border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">AI Personality Tuning</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-blue-200 mb-4 block">
                        Friendliness Level: {friendliness[0]}%
                      </Label>
                      <Slider
                        value={friendliness}
                        onValueChange={setFriendliness}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-blue-400 mt-2">
                        <span>Professional</span>
                        <span>Balanced</span>
                        <span>Very Friendly</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-blue-200 mb-4 block">
                        Response Style: {personality[0] < 30 ? 'Concise' : personality[0] > 70 ? 'Detailed' : 'Balanced'}
                      </Label>
                      <Slider
                        value={personality}
                        onValueChange={setPersonality}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-blue-400 mt-2">
                        <span>Brief</span>
                        <span>Moderate</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-blue-500/30">
                        <h4 className="text-white font-medium mb-2">Conversation Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Technology', 'Business', 'Creative', 'Lifestyle', 'Education'].map((topic) => (
                            <Badge key={topic} variant="outline" className="border-blue-400 text-blue-300 cursor-pointer hover:bg-blue-500/20">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-purple-500/30">
                        <h4 className="text-white font-medium mb-2">Interaction Style</h4>
                        <div className="space-y-2 text-sm text-blue-200">
                          <div>✓ Asks follow-up questions</div>
                          <div>✓ Uses emojis moderately</div>
                          <div>✓ Provides actionable advice</div>
                          <div>✓ Remembers context</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Responses Tab */}
              <TabsContent value="responses" className="space-y-6">
                <Card className="neo-glass border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Pre-defined Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-yellow-500/30">
                        <span className="text-white">What do you do?</span>
                        <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10">Edit</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-yellow-500/30">
                        <span className="text-white">How can I work with you?</span>
                        <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10">Edit</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-yellow-500/30">
                        <span className="text-white">What are your rates?</span>
                        <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10">Edit</Button>
                      </div>
                    </div>
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Response
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-6">
                <Card className="neo-glass border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Social Links & Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {socialPlatforms.map((platform) => (
                        <div key={platform.name} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-indigo-500/30">
                          <platform.icon className={`w-5 h-5 ${platform.color}`} />
                          <Input
                            placeholder={`${platform.name} Profile URL`}
                            className="bg-slate-700/50 border-indigo-400/30 text-white flex-1"
                          />
                          <Button size="sm" variant="outline" className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10">Remove</Button>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Link
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
