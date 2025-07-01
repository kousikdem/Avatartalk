
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, Share2, Gift, Package, Settings, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! Welcome to my profile!", sender: 'avatar', timestamp: new Date() },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        text: message,
        sender: 'user' as const,
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
      
      // Simulate avatar response
      setTimeout(() => {
        const avatarResponse = {
          id: chatMessages.length + 2,
          text: "Thanks for your message! I'll get back to you soon.",
          sender: 'avatar' as const,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, avatarResponse]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src="/placeholder.svg" alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">John Doe</h1>
              <p className="text-gray-600 mb-3">@johndoe</p>
              <p className="text-gray-700 mb-4">
                Digital creator passionate about technology and innovation. 
                Let's connect and share ideas!
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Tech Enthusiast</Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">Creator</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 font-semibold transition-all duration-200 ${
                  isFollowing 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              
              <Button 
                variant="outline" 
                className="px-6 py-2 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Talk to Me
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              About
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Gifts/Product
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="h-96 overflow-y-auto mb-4 space-y-3 bg-gray-50 rounded-lg p-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800 border'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600">
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">About Me</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-700">
                      I'm a passionate digital creator with expertise in technology and innovation. 
                      I love connecting with people and sharing knowledge through engaging content.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Technology</Badge>
                      <Badge variant="outline">AI & Machine Learning</Badge>
                      <Badge variant="outline">Web Development</Badge>
                      <Badge variant="outline">Digital Marketing</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                    <p className="text-gray-700">Available for collaborations and partnerships.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gifts" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Gifts & Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                      <Gift className="w-8 h-8 text-blue-500" />
                    </div>
                    <h4 className="font-medium mb-2">Digital Course</h4>
                    <p className="text-sm text-gray-600 mb-3">Learn the fundamentals of web development</p>
                    <Button size="sm" className="w-full">$29.99</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="font-medium mb-2">Consultation</h4>
                    <p className="text-sm text-gray-600 mb-3">1-on-1 tech consultation session</p>
                    <Button size="sm" className="w-full">$99.99</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-purple-500" />
                    </div>
                    <h4 className="font-medium mb-2">Support Me</h4>
                    <p className="text-sm text-gray-600 mb-3">Buy me a coffee to support my work</p>
                    <Button size="sm" className="w-full">$5.00</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <Input defaultValue="John Doe" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <Input defaultValue="johndoe" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <Textarea 
                      defaultValue="Digital creator passionate about technology and innovation. Let's connect and share ideas!"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Social Media Links</label>
                    <div className="space-y-2">
                      <Input placeholder="Twitter/X URL" />
                      <Input placeholder="Instagram URL" />
                      <Input placeholder="LinkedIn URL" />
                      <Input placeholder="Website URL" />
                    </div>
                  </div>
                  
                  <Button className="w-full">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
