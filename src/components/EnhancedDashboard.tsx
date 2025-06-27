
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
  Zap, Brain, Heart, Smile, Briefcase, Gamepad2, Sparkles, Upload, Image
} from 'lucide-react';

type AvatarStyle = 'realistic' | 'cartoon' | 'anime' | 'minimal';
type AvatarMood = 'professional' | 'friendly' | 'mysterious';

const EnhancedDashboard = () => {
  const [isPublic, setIsPublic] = useState(true);
  const [personality, setPersonality] = useState([50]);
  const [voiceSpeed, setVoiceSpeed] = useState([50]);
  const [friendliness, setFriendliness] = useState([70]);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('realistic');
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('friendly');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [setupProgress, setSetupProgress] = useState(85);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAvatar = () => {
    // Avatar creation logic will be implemented here
    console.log('Creating avatar with uploaded image:', uploadedImage);
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-8">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Avatar Studio
              </h1>
              <p className="text-gray-600 mt-2">Build your AI personality and interactive profile</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-blue-400 text-blue-600 bg-blue-50">
                Setup {setupProgress}% Complete
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
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
            <Card className="bg-white border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-500" />
                    Live Avatar
                  </span>
                  <div className="flex items-center space-x-2">
                    {isPublic ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-red-500" />}
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
                    className="w-full gradient-button"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Test Voice & Animation
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 border-blue-400 text-blue-600 hover:bg-blue-50">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-purple-400 text-purple-600 hover:bg-purple-50">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>

                  {/* Avatar Creation Section */}
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm font-medium">Upload Image to Create Avatar</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="flex-1 text-sm border-gray-300"
                        />
                        <Button variant="outline" size="sm" className="border-gray-300">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {uploadedImage && (
                      <div className="text-center">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded" 
                          className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-blue-200"
                        />
                        <p className="text-xs text-gray-600">Image uploaded successfully</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleCreateAvatar}
                      disabled={!uploadedImage}
                      className="w-full gradient-button-alt disabled:from-gray-300 disabled:to-gray-400"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Create Avatar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white border-2 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                  Profile Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">1,432</div>
                    <div className="text-sm text-blue-500">Total Chats</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">289</div>
                    <div className="text-sm text-green-500">Followers</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">87%</div>
                    <div className="text-sm text-purple-500">Engagement</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">4.8</div>
                    <div className="text-sm text-orange-500">Rating</div>
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
              <TabsList className="grid w-full grid-cols-6 bg-gray-100 border border-gray-200">
                <TabsTrigger value="profile" className="data-[state=active]:gradient-button">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="avatar" className="data-[state=active]:gradient-button">
                  <Palette className="w-4 h-4 mr-2" />
                  Avatar
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:gradient-button">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="personality" className="data-[state=active]:gradient-button">
                  <Brain className="w-4 h-4 mr-2" />
                  Mind
                </TabsTrigger>
                <TabsTrigger value="responses" className="data-[state=active]:gradient-button">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="links" className="data-[state=active]:gradient-button">
                  <Link className="w-4 h-4 mr-2" />
                  Links
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card className="bg-white border-2 border-blue-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Identity & Branding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="displayName" className="text-gray-700">Display Name</Label>
                        <Input 
                          id="displayName" 
                          defaultValue="Alex Digital" 
                          className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-gray-700">Custom URL</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">
                            avatartalk.bio/
                          </span>
                          <Input 
                            id="username" 
                            defaultValue="alexdigital" 
                            className="rounded-l-none bg-white border-gray-300 text-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="role" className="text-gray-700">Role/Profession</Label>
                      <Select defaultValue="creator">
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
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
                      <Label htmlFor="bio" className="text-gray-700">Bio (160 chars max)</Label>
                      <Textarea 
                        id="bio" 
                        defaultValue="AI-powered digital creator helping people unlock their potential 🚀"
                        className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                        rows={3}
                        maxLength={160}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Avatar Tab */}
              <TabsContent value="avatar" className="space-y-6">
                <Card className="bg-white border-2 border-purple-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Avatar Customization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-gray-700 mb-4 block">Avatar Style</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(['realistic', 'cartoon', 'anime', 'minimal'] as AvatarStyle[]).map((style) => (
                          <Button
                            key={style}
                            variant={avatarStyle === style ? "default" : "outline"}
                            className={`h-20 ${avatarStyle === style ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
                      <Label className="text-gray-700 mb-4 block">Personality Templates</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personalityTemplates.map((template) => (
                          <Button
                            key={template.name}
                            variant={avatarMood === template.mood ? "default" : "outline"}
                            className={`p-4 h-auto justify-start ${avatarMood === template.mood ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
                <Card className="bg-white border-2 border-green-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Voice & Speech Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-gray-700">Voice Type</Label>
                      <Select defaultValue="female-professional">
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
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
                        <Label className="text-gray-700 mb-4 block">
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
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>Slow</span>
                          <span>Normal</span>
                          <span>Fast</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button 
                        className="flex-1 gradient-button"
                        onClick={handleVoiceTest}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test Voice
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                      >
                        <Mic className={`w-4 h-4 mr-2 ${isVoiceRecording ? 'text-red-500' : ''}`} />
                        {isVoiceRecording ? 'Stop Recording' : 'Record Voice'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personality Tab */}
              <TabsContent value="personality" className="space-y-6">
                <Card className="bg-white border-2 border-pink-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">AI Personality Tuning</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-gray-700 mb-4 block">
                        Friendliness Level: {friendliness[0]}%
                      </Label>
                      <Slider
                        value={friendliness}
                        onValueChange={setFriendliness}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Professional</span>
                        <span>Balanced</span>
                        <span>Very Friendly</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-700 mb-4 block">
                        Response Style: {personality[0] < 30 ? 'Concise' : personality[0] > 70 ? 'Detailed' : 'Balanced'}
                      </Label>
                      <Slider
                        value={personality}
                        onValueChange={setPersonality}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Brief</span>
                        <span>Moderate</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h4 className="text-gray-800 font-medium mb-2">Conversation Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Technology', 'Business', 'Creative', 'Lifestyle', 'Education'].map((topic) => (
                            <Badge key={topic} variant="outline" className="border-blue-400 text-blue-600 cursor-pointer hover:bg-blue-100">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <h4 className="text-gray-800 font-medium mb-2">Interaction Style</h4>
                        <div className="space-y-2 text-sm text-gray-700">
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
                <Card className="bg-white border-2 border-yellow-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Pre-defined Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-gray-800">What do you do?</span>
                        <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-600 hover:bg-yellow-100">Edit</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-gray-800">How can I work with you?</span>
                        <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-600 hover:bg-yellow-100">Edit</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-gray-800">What are your rates?</span>
                        <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-600 hover:bg-yellow-100">Edit</Button>
                      </div>
                    </div>
                    <Button className="w-full gradient-button-alt">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Response
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-6">
                <Card className="bg-white border-2 border-indigo-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Social Links & Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {socialPlatforms.map((platform) => (
                        <div key={platform.name} className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <platform.icon className={`w-5 h-5 ${platform.color}`} />
                          <Input
                            placeholder={`${platform.name} Profile URL`}
                            className="bg-white border-gray-300 text-gray-800 flex-1"
                          />
                          <Button size="sm" variant="outline" className="border-indigo-400 text-indigo-600 hover:bg-indigo-100">Remove</Button>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full gradient-button">
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
