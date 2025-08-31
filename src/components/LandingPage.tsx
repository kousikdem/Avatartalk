
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Zap, 
  Users, 
  Star, 
  ArrowRight, 
  Play,
  Mic,
  Bot,
  Sparkles,
  Globe,
  UserCircle,
  Users as UsersIcon,
  Eye
} from 'lucide-react';
import MainAuth from './MainAuth';
import VisitorAuth from './VisitorAuth';

const LandingPage = () => {
  const [isMainAuthOpen, setIsMainAuthOpen] = useState(false);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);

  const features = [
    {
      icon: Bot,
      title: "AI Avatar Creation",
      description: "Create your unique AI avatar that represents your personality and expertise",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageSquare,
      title: "Intelligent Conversations",
      description: "Engage in meaningful conversations powered by advanced AI technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Mic,
      title: "Voice & Text Chat",
      description: "Communicate naturally through voice or text with real-time responses",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with people worldwide and share your AI avatar publicly",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "1M+", label: "Conversations" },
    { number: "99%", label: "Satisfaction" },
    { number: "24/7", label: "Availability" }
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-300 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Next-Gen AI Avatars
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Your AI Avatar
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Build intelligent AI avatars that represent you, engage with visitors, and create meaningful conversations 24/7
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="gradient-button px-8 py-6 text-lg"
              onClick={() => setIsMainAuthOpen(true)}
            >
              <UserCircle className="w-5 h-5 mr-2" />
              Create Your Avatar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg"
              className="gradient-button-alt px-8 py-6 text-lg"
              onClick={() => setIsVisitorAuthOpen(true)}
            >
              <UsersIcon className="w-5 h-5 mr-2" />
              Explore Profiles
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="bg-gradient-to-r from-white to-gray-50 border-purple-300 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:border-purple-400 px-8 py-6 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => window.location.href = '/?view=pricing'}
            >
              <Zap className="w-5 h-5 mr-2" />
              View Pricing
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create engaging AI avatars and meaningful conversations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="gradient-card border-blue-200">
            <CardContent className="p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already building amazing AI avatars and engaging with their audiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="gradient-button px-8 py-6 text-lg"
                  onClick={() => setIsMainAuthOpen(true)}
                >
                  <UserCircle className="w-5 h-5 mr-2" />
                  Start Building
                </Button>
                <Button 
                  size="lg"
                  className="gradient-button-alt px-8 py-6 text-lg"
                  onClick={() => setIsVisitorAuthOpen(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Try Demo
                </Button>
                <Link to="/emily">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-gradient-to-r from-white to-green-50 border-green-300 text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-green-400 px-8 py-6 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Sample Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Auth Modals */}
      <MainAuth 
        isOpen={isMainAuthOpen} 
        onClose={() => setIsMainAuthOpen(false)} 
      />

      <VisitorAuth 
        isOpen={isVisitorAuthOpen} 
        onClose={() => setIsVisitorAuthOpen(false)} 
      />
    </div>
  );
};

export default LandingPage;
