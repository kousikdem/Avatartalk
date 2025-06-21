
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  User, 
  MessageSquare, 
  Link, 
  Zap,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';
import AvatarPreview from './AvatarPreview';

const LandingPage = () => {
  const features = [
    {
      icon: User,
      title: "3D Avatar Creation",
      description: "Create stunning, personalized avatars that represent you perfectly"
    },
    {
      icon: MessageSquare,
      title: "AI-Powered Conversations",
      description: "Engage visitors with intelligent, natural conversations"
    },
    {
      icon: Link,
      title: "Link-in-Bio Platform",
      description: "Centralize all your important links and content in one place"
    },
    {
      icon: Zap,
      title: "Voice Integration",
      description: "Add voice responses and personality to your avatar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/10 to-gray-950">
      {/* Hero Section */}
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-blue-400 text-sm font-medium">The Future of Personal Branding</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Create Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Talking Avatar
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your online presence with AI-powered avatars that speak, engage, and represent you 24/7. 
              The ultimate link-in-bio experience that your audience will never forget.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-2xl"
              >
                Create Your Avatar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg rounded-2xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Avatar Display */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              <AvatarPreview isLarge={true} />
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Live
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Stand Out
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to make your online presence unforgettable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/40 border-gray-700 backdrop-blur-sm hover:bg-gray-800/60 transition-all">
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-blue-400 mb-2" />
                  <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by Creators Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">
                    "AvatarTalk.bio completely transformed how I connect with my audience. 
                    The AI conversations feel incredibly natural!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
                    <div>
                      <div className="text-white font-medium">Sarah Johnson</div>
                      <div className="text-gray-400 text-sm">Content Creator</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your Avatar?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of creators who are already using AI avatars to engage their audience
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-2xl"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
