
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
  Award
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

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: ["1 Avatar", "Basic customization", "5 conversations/day", "Email support"]
    },
    {
      name: "Creator",
      price: "$19/mo",
      description: "For serious content creators",
      features: ["3 Avatars", "Advanced customization", "Unlimited conversations", "Voice cloning", "Analytics"]
    },
    {
      name: "Business",
      price: "$49/mo",
      description: "For teams and businesses",
      features: ["Unlimited avatars", "Team collaboration", "Custom branding", "API access", "Priority support"]
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
                Your Digital Twin
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                That Never Sleeps
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Avatar Display */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              <AvatarPreview isLarge={true} showControls={true} />
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
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
              Powered by Advanced AI Technology
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to create an engaging, intelligent digital presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/40 border-gray-700 backdrop-blur-sm hover:bg-gray-800/60 transition-all hover:scale-105">
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

      {/* Pricing Section */}
      <div className="py-16 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-400 text-lg">Start free, upgrade as you grow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`bg-gray-800/40 border-gray-700 backdrop-blur-sm ${index === 1 ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    {plan.price}
                    {plan.price !== "Free" && <span className="text-lg text-gray-400">/month</span>}
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${index === 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {plan.price === "Free" ? "Get Started" : "Upgrade Now"}
                  </Button>
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
            Ready to Meet Your Digital Twin?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of creators who are already using AI avatars to transform their online presence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-2xl"
            >
              Start Creating - It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg rounded-2xl"
            >
              <Play className="w-5 h-5 mr-2" />
              See It In Action
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
