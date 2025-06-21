
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import AvatarPreview from './AvatarPreview';
import { 
  User, 
  Palette, 
  Volume2, 
  MessageSquare, 
  Link, 
  BarChart3, 
  Settings,
  Eye,
  EyeOff,
  Plus,
  Youtube,
  Instagram
} from 'lucide-react';

const Dashboard = () => {
  const [isPublic, setIsPublic] = React.useState(true);
  const [personality, setPersonality] = React.useState([50]);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Avatar Dashboard</h1>
          <p className="text-gray-400 mt-2">Customize your AI avatar and manage your profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Avatar Preview
                  <div className="flex items-center space-x-2">
                    {isPublic ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-red-500" />}
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AvatarPreview isLarge={true} showControls={true} />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-900/50 border-gray-800 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Conversations</span>
                  <span className="text-white font-semibold">432</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Followers</span>
                  <span className="text-white font-semibold">1,289</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Engagement Level</span>
                  <span className="text-green-400 font-semibold">56%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Configuration */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="avatar" className="data-[state=active]:bg-blue-600">
                  <Palette className="w-4 h-4 mr-2" />
                  Avatar
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-blue-600">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="responses" className="data-[state=active]:bg-blue-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Responses
                </TabsTrigger>
                <TabsTrigger value="links" className="data-[state=active]:bg-blue-600">
                  <Link className="w-4 h-4 mr-2" />
                  Links
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                        <Input 
                          id="displayName" 
                          defaultValue="Abigail" 
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-gray-300">Username</Label>
                        <Input 
                          id="username" 
                          defaultValue="demo" 
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-gray-300">Role</Label>
                      <Select defaultValue="creator">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="creator">Creator</SelectItem>
                          <SelectItem value="coach">Coach</SelectItem>
                          <SelectItem value="artist">Artist</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="educator">Educator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                      <Textarea 
                        id="bio" 
                        defaultValue="Creative mind 👋 Here to chat and explore!"
                        className="bg-gray-800 border-gray-700 text-white"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="avatar" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Avatar Customization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Avatar Style</Label>
                      <Select defaultValue="realistic">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="cartoon">Cartoon</SelectItem>
                          <SelectItem value="anime">Anime</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Hair Style</Label>
                        <Select defaultValue="bob">
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="bob">Bob Cut</SelectItem>
                            <SelectItem value="long">Long Hair</SelectItem>
                            <SelectItem value="short">Short Hair</SelectItem>
                            <SelectItem value="curly">Curly Hair</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Clothing Style</Label>
                        <Select defaultValue="business">
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Voice & Personality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-gray-300">Voice Type</Label>
                      <Select defaultValue="female-professional">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="female-professional">Female Professional</SelectItem>
                          <SelectItem value="male-friendly">Male Friendly</SelectItem>
                          <SelectItem value="female-energetic">Female Energetic</SelectItem>
                          <SelectItem value="male-calm">Male Calm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-4 block">
                        Personality: Friendly ← → Formal
                      </Label>
                      <Slider
                        value={personality}
                        onValueChange={setPersonality}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>Friendly</span>
                        <span>Balanced</span>
                        <span>Formal</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Preview Voice
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="responses" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Pre-defined Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                        <span className="text-white">What do you do?</span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                        <span className="text-white">How can I work with you?</span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                        <span className="text-white">What are your rates?</span>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Response
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="links" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Social Links & Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <Youtube className="w-5 h-5 text-red-500" />
                        <Input 
                          placeholder="YouTube Channel URL" 
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                        <Button size="sm" variant="outline">Remove</Button>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <Input 
                          placeholder="Instagram Profile URL" 
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                        <Button size="sm" variant="outline">Remove</Button>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Link
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
