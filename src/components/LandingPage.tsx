
import React, { useState } from 'react';
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
  Users as UsersIcon
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Next-Gen AI Avatars
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Create Your AI Avatar
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Build intelligent AI avatars that represent you, engage with visitors, and create meaningful conversations 24/7
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg"
              onClick={() => setIsMainAuthOpen(true)}
            >
              <UserCircle className="w-5 h-5 mr-2" />
              Create Your Avatar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 px-8 py-6 text-lg"
              onClick={() => setIsVisitorAuthOpen(true)}
            >
              <UsersIcon className="w-5 h-5 mr-2" />
              Explore Profiles
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg"
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
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-300 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Everything you need to create engaging AI avatars and meaningful conversations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already building amazing AI avatars and engaging with their audiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg"
                  onClick={() => setIsMainAuthOpen(true)}
                >
                  <UserCircle className="w-5 h-5 mr-2" />
                  Start Building
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 px-8 py-6 text-lg"
                  onClick={() => setIsVisitorAuthOpen(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Try Demo
                </Button>
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
