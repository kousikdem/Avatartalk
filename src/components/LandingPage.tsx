
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
  Star,
  Brain,
  Mic,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Award,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  DollarSign
} from 'lucide-react';
import AvatarPreview from './AvatarPreview';

const LandingPage = () => {
  const features = [
    {
      icon: User,
      title: "3D Avatar Creation",
      description: "Create stunning, lifelike avatars with advanced customization options"
    },
    {
      icon: Brain,
      title: "AI-Powered Conversations",
      description: "Intelligent responses that adapt to your personality and tone"
    },
    {
      icon: Mic,
      title: "Voice Cloning",
      description: "Upload your voice or choose from premium voice options"
    },
    {
      icon: Link,
      title: "Smart Link-in-Bio",
      description: "Dynamic links that change based on visitor behavior"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Speak to your global audience in their native language"
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Full control over who can interact with your avatar"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Creators" },
    { number: "2M+", label: "Conversations" },
    { number: "98%", label: "User Satisfaction" },
    { number: "24/7", label: "Avatar Availability" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      content: "My avatar has revolutionized how I connect with my audience. It's like having a personal assistant that never sleeps!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Business Coach",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      content: "The voice cloning feature is incredible. My clients feel like they're talking directly to me, even when I'm offline."
    },
    {
      name: "Elena Vasquez",
      role: "Artist",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      content: "AvatarTalk.bio has helped me showcase my art in ways I never imagined. The interactive experience is mind-blowing!"
    }
  ];

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' }
  ];

  const handlePricingClick = () => {
    window.location.href = '/?view=pricing';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20">
      {/* Hero Section */}
      <div className="pt-20 pb-16 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-blue-400 text-sm font-medium">The Future of Personal Branding</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Link in Bio AI Avatar
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                That Engages 24/7
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create an AI-powered avatar that represents you 24/7. Engage with your audience, 
              answer questions, and build relationships even when you're away. The ultimate 
              evolution of link-in-bio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg rounded-2xl shadow-2xl shadow-blue-500/25"
              >
                Create Your Avatar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 px-8 py-4 text-lg rounded-2xl backdrop-blur-sm"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-500/50 text-purple-300 hover:bg-gradient-to-r hover:from-purple-800/50 hover:to-pink-800/50 px-8 py-4 text-lg rounded-2xl backdrop-blur-sm"
                onClick={handlePricingClick}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                View Pricing
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Avatar Display */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <AvatarPreview isLarge={true} showControls={true} />
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse shadow-lg">
                Live
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-r from-gray-900/20 via-blue-900/10 to-purple-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Powered by Advanced AI Technology
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to create an engaging, intelligent digital presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
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

      {/* Testimonials Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by Creators Worldwide
            </h2>
            <div className="flex justify-center items-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="text-gray-300 ml-2">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-800/40 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <div className="text-white font-medium">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Ready to Meet Your AI Avatar?
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of creators who are already using AI avatars to transform their online presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg rounded-2xl shadow-2xl shadow-blue-500/25"
            >
              Start Creating - It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 px-8 py-4 text-lg rounded-2xl backdrop-blur-sm"
            >
              <Play className="w-5 h-5 mr-2" />
              See It In Action
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with Social Links */}
      <footer className="py-12 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AvatarTalk.bio
              </span>
              <p className="text-gray-400 text-sm mt-2">Create your AI avatar today</p>
            </div>
            
            <div className="flex space-x-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-gray-400 text-sm">
            © 2024 AvatarTalk.bio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
