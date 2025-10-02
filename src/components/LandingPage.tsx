
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
  Eye,
  FileText,
  Sliders,
  Volume2,
  Edit3,
  CheckCircle,
  Lightbulb,
  Brain,
  Heart,
  Mouse,
  Cat,
  Dog,
  Bird,
  Quote,
  Trophy,
  Shield,
  Rocket,
  Crown,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import MainAuth from './MainAuth';
import VisitorAuth from './VisitorAuth';

const LandingPage = () => {
  const [isMainAuthOpen, setIsMainAuthOpen] = useState(false);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);

  const features = [
    {
      icon: Bot,
      title: "Custom AI Avatars",
      description: "Create personalized 3D avatars with advanced customization options",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageSquare,
      title: "AI Chat Training",
      description: "Train your AI with documents, Q&A pairs, and personality settings",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Link Management",
      description: "Organize all your important links with detailed analytics",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Volume2,
      title: "Voice Cloning",
      description: "Clone your voice for authentic AI-powered responses",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Social Features",
      description: "Build your audience with followers, posts, and engagement",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Sliders,
      title: "Personality Settings",
      description: "Adjust formality, verbosity, and friendliness levels",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Eye,
      title: "Analytics Dashboard",
      description: "Track profile views, engagement, and visitor insights",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: Rocket,
      title: "Products & Services",
      description: "Sell digital products and services directly from your profile",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: FileText,
      title: "Document Training",
      description: "Upload PDFs, docs, and files to train your AI assistant",
      color: "from-blue-400 to-indigo-500"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Avatar",
      description: "Design your personalized 3D avatar with custom appearance and personality settings",
      icon: Bot
    },
    {
      step: "2", 
      title: "Train Your AI",
      description: "Upload documents, add Q&A pairs, and configure personality traits to match your style",
      icon: Brain
    },
    {
      step: "3",
      title: "Share Your Profile",
      description: "Get your unique link and start engaging with visitors through your AI assistant",
      icon: Globe
    }
  ];

  const trainingMethods = [
    {
      icon: MessageSquare,
      title: "Q&A Format",
      description: "Create question-answer pairs to teach your AI specific responses",
      animal: Cat
    },
    {
      icon: FileText,
      title: "Document Upload",
      description: "Upload PDFs, docs, and text files for comprehensive knowledge training",
      animal: Dog
    },
    {
      icon: Volume2,
      title: "Voice Training", 
      description: "Record voice samples to create personalized voice responses",
      animal: Bird
    },
    {
      icon: Edit3,
      title: "Manual Editing",
      description: "Fine-tune responses and personality traits with manual adjustments",
      animal: Mouse
    }
  ];

  const personalityTraits = [
    { name: "Formality", icon: Heart, description: "Professional to casual communication style" },
    { name: "Verbosity", icon: MessageSquare, description: "Brief to detailed response length" },
    { name: "Friendliness", icon: Sparkles, description: "Reserved to warm interaction tone" }
  ];

  const testimonials = [
    {
      quote: "AvatarTalk.bio transformed how I engage with my audience. My AI avatar handles visitor questions 24/7!",
      author: "Sarah Chen",
      role: "Content Creator",
      avatar: "👩‍💼"
    },
    {
      quote: "The AI training is incredibly intuitive. My avatar now represents my brand perfectly.",
      author: "Marcus Rodriguez", 
      role: "Digital Marketer",
      avatar: "👨‍💻"
    },
    {
      quote: "Best link-in-bio tool I've used. The analytics and AI features are game-changing.",
      author: "Emily Foster",
      role: "Entrepreneur",
      avatar: "👩‍🚀"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      icon: Star,
      features: [
        "1 AI Avatar",
        "Basic customization", 
        "5 conversations/day",
        "Email support",
        "Basic analytics"
      ],
      popular: false
    },
    {
      name: "Creator",
      price: "$19",
      period: "/month",
      description: "For serious content creators",
      icon: Zap,
      features: [
        "3 AI Avatars",
        "Advanced customization",
        "Unlimited conversations",
        "Voice cloning",
        "Advanced analytics",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Business", 
      price: "$49",
      period: "/month",
      description: "For teams and businesses",
      icon: Crown,
      features: [
        "Unlimited avatars",
        "Team collaboration",
        "White-label solution",
        "Custom integrations",
        "24/7 phone support",
        "Custom domain"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6 px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            INTRODUCING
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            AI Avatar for your<br />Link-in-Bio
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create a personalized AI assistant that greets visitors, responds to questions, 
            and represents you online. Share your links with a touch of personality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg"
              className="gradient-button px-8 py-4 text-lg"
              onClick={() => setIsMainAuthOpen(true)}
            >
              Early Access
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg border-gray-300 hover:bg-gray-50"
            >
              See Example
            </Button>
          </div>

          {/* Demo Avatar Preview with Tabs */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Header with Avatar */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-xl">
                  <Bot className="w-16 h-16 text-white" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">Demo Avatar</h3>
                  <p className="text-gray-600">@demouser</p>
                  <div className="flex items-center gap-4 justify-center sm:justify-start mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> 1.2K followers
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> 5.4K views
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    Subscribe $9.99/mo
                  </Button>
                  <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                    Follow
                  </Button>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-6 text-center sm:text-left">
                Exploring AI and technology. Creating innovative solutions with personalized AI avatars.
              </p>

              {/* Tabs Demo */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-8 overflow-x-auto">
                  <button className="px-4 py-3 text-blue-600 border-b-2 border-blue-600 font-semibold flex items-center gap-2 whitespace-nowrap">
                    <FileText className="w-4 h-4" /> Posts
                  </button>
                  <button className="px-4 py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 whitespace-nowrap">
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                  <button className="px-4 py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 whitespace-nowrap">
                    <Rocket className="w-4 h-4" /> Products
                  </button>
                </div>
              </div>

              {/* Demo Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <p className="text-gray-700 mb-3">
                    Just launched my new AI-powered project! Check it out 🚀
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> 234
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> 45
                    </span>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <p className="text-gray-700 mb-3">
                    New tutorial on AI avatar customization is now live!
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> 189
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> 32
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Features that make you stand out
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create your own AI avatar that speaks for you when you can't.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card text-center p-6 hover:shadow-xl transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Training Requirements */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Train Your AI Assistant
            </h2>
            <p className="text-lg text-gray-600">
              Teaching your AI is as simple as having a conversation
            </p>
          </div>

          {/* Training Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {trainingMethods.map((method, index) => (
              <Card key={index} className="gradient-card p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <method.icon className="w-5 h-5 text-white" />
                  </div>
                  <method.animal className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {method.description}
                </p>
              </Card>
            ))}
          </div>

          {/* AI Personality */}
          <Card className="gradient-card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              AI Personality Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {personalityTraits.map((trait, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <trait.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    {trait.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {trait.description}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: `${70 + index * 10}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Creators Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              See what our community is saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="gradient-card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-gray-300 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`gradient-card p-8 relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {plan.price}
                    {plan.period && <span className="text-lg text-gray-600">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  <Button 
                    className={`w-full mb-6 ${plan.popular ? 'gradient-button' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                    onClick={() => setIsMainAuthOpen(true)}
                  >
                    Get Started
                  </Button>
                  <ul className="text-left space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Create Your AI Avatar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who are already using AI to engage with their audience 24/7
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold"
            onClick={() => setIsMainAuthOpen(true)}
          >
            <Rocket className="w-5 h-5 mr-2" />
            Start Building Your Avatar
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">AvatarTalk.bio</span>
              </div>
              <p className="text-gray-400 text-sm">
                Create AI avatars that represent you and engage with your audience 24/7.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 All rights reserved by AvatarTalk.bio
            </p>
          </div>
        </div>
      </footer>

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
