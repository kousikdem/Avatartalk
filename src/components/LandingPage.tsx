
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Youtube,
  Share2,
  MoreVertical,
  Send,
  Smile,
  MicOff,
  VolumeX
} from 'lucide-react';
import MainAuth from './MainAuth';
import VisitorAuth from './VisitorAuth';

const LandingPage = () => {
  const [isMainAuthOpen, setIsMainAuthOpen] = useState(false);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);
  const [demoActiveTab, setDemoActiveTab] = useState<'posts' | 'chat' | 'product'>('chat');
  const [demoMessage, setDemoMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

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
      icon: UsersIcon,
      title: "Followers System",
      description: "Connect with your audience and grow your community organically",
      color: "from-violet-500 to-fuchsia-500"
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
    },
    {
      icon: Mic,
      title: "Voice Input & Output",
      description: "Interact naturally with voice commands and spoken responses",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Edit3,
      title: "Content Publishing",
      description: "Share posts, updates, and engage with your followers",
      color: "from-cyan-500 to-blue-500"
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

          {/* Demo User Profile - Medium 3D Floating Display */}
          <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 animate-[float_10s_ease-in-out_infinite] hover:scale-105 transition-transform duration-500" style={{ transform: 'perspective(1200px) rotateX(5deg) rotateY(-2deg)', transformStyle: 'preserve-3d' }}>
            {/* Profile Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">DA</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white leading-tight mb-0.5 truncate">Demo Avatar</h3>
                  <p className="text-slate-400 text-sm">@demouser</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/30"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-6 pb-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                Exploring AI and technology. Creating innovative solutions with personalized AI avatars.
              </p>
            </div>

            {/* 3D Avatar Preview - Realistic Avatar */}
            <div className="px-6 pb-6">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/40 via-blue-900/20 to-slate-800/40 border border-slate-600/30 shadow-inner">
                <div className="w-full h-80 bg-gradient-to-br from-blue-950/50 via-purple-950/30 to-slate-950/50 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                  
                  {/* Realistic 3D Avatar Representation with Enhanced 3D Moving Animation */}
                  <div className="relative animate-[float_4s_ease-in-out_infinite,wiggle_3s_ease-in-out_infinite]">
                    {/* Head */}
                    <div className="w-24 h-28 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full relative shadow-2xl animate-[tilt_2s_ease-in-out_infinite]">
                      {/* Eyes */}
                      <div className="absolute top-10 left-6 w-3 h-3 bg-slate-800 rounded-full">
                        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute top-10 right-6 w-3 h-3 bg-slate-800 rounded-full">
                        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      {/* Nose */}
                      <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-amber-400/50 rounded-full"></div>
                      {/* Smile */}
                      <div className="absolute top-18 left-1/2 transform -translate-x-1/2 w-8 h-2 border-b-2 border-slate-800 rounded-b-full"></div>
                      {/* Hair */}
                      <div className="absolute -top-2 left-2 right-2 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-t-full shadow-lg"></div>
                    </div>
                    
                    {/* Body */}
                    <div className="w-32 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-3xl mx-auto -mt-2 shadow-xl">
                      {/* Arms */}
                      <div className="absolute -left-4 top-2 w-6 h-20 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full transform -rotate-12 shadow-lg"></div>
                      <div className="absolute -right-4 top-2 w-6 h-20 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full transform rotate-12 shadow-lg"></div>
                    </div>
                  </div>
                  
                  {/* 3D Animated Rings */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 pointer-events-none animate-pulse"></div>
                  <div className="absolute inset-2 rounded-3xl border border-purple-400/20 pointer-events-none animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute -inset-1 rounded-3xl border border-cyan-400/20 pointer-events-none animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                
                {/* Floating Talk Button */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm border border-blue-400/30 shadow-lg hover:scale-110 transition-transform"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-5 gap-2">
                <Button
                  size="sm"
                  className="col-span-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white py-3 rounded-xl text-sm font-semibold"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Subscribe - $9.99/mo
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="col-span-2 border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white py-3 rounded-xl text-sm font-semibold"
                >
                  Follow
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center bg-slate-800/30 rounded-xl py-2 backdrop-blur-sm border border-slate-700/20">
                  <div className="text-lg font-bold text-white mb-0.5">847</div>
                  <div className="text-xs text-slate-400 font-medium">Conversations</div>
                </div>
                <div className="text-center bg-slate-800/30 rounded-xl py-2 backdrop-blur-sm border border-slate-700/20">
                  <div className="text-lg font-bold text-white mb-0.5">1.2K</div>
                  <div className="text-xs text-slate-400 font-medium">Followers</div>
                </div>
                <div className="text-center bg-slate-800/30 rounded-xl py-2 backdrop-blur-sm border border-slate-700/20">
                  <div className="text-lg font-bold text-white mb-0.5">94%</div>
                  <div className="text-xs text-slate-400 font-medium">Engagement</div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="px-6 pb-4">
              <div className="border-b border-slate-700/30 mb-4">
                <div className="flex">
                  <button 
                    onClick={() => setDemoActiveTab('posts')}
                    className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      demoActiveTab === 'posts' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Posts
                  </button>
                  <button 
                    onClick={() => setDemoActiveTab('chat')}
                    className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      demoActiveTab === 'chat' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                  <button 
                    onClick={() => setDemoActiveTab('product')}
                    className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      demoActiveTab === 'product' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Rocket className="w-4 h-4" /> Product
                  </button>
                </div>
              </div>

              {/* Posts Tab Content */}
              {demoActiveTab === 'posts' && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  <Card className="bg-slate-800/30 border-slate-700/30 p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 mb-2">Check out my latest AI project! 🚀</p>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>❤️ 124</span>
                          <span>💬 23</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-slate-800/30 border-slate-700/30 p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 mb-2">New tutorial on AI training coming soon! 🎯</p>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>❤️ 89</span>
                          <span>💬 15</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Chat Tab Content */}
              {demoActiveTab === 'chat' && (
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="flex flex-col space-y-3 max-h-48 overflow-y-auto pr-2">
                    {/* Avatar Message */}
                    <div className="flex items-start gap-2 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">DA</span>
                        </div>
                      </div>
                      <div className="flex-1 flex justify-end">
                        <div className="bg-slate-700/50 border border-slate-600/30 rounded-2xl rounded-tr-md px-3 py-2 max-w-xs">
                          <p className="text-sm text-slate-200">
                            Hi! I'm your AI assistant. How can I help you today?
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">U</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl rounded-tl-md px-3 py-2 max-w-xs">
                          <p className="text-sm text-blue-100">
                            Tell me about your services
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Response */}
                    <div className="flex items-start gap-2 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">DA</span>
                        </div>
                      </div>
                      <div className="flex-1 flex justify-end">
                        <div className="bg-slate-700/50 border border-slate-600/30 rounded-2xl rounded-tr-md px-3 py-2 max-w-xs">
                          <p className="text-sm text-slate-200">
                            I offer personalized AI solutions, avatar creation, and automated customer engagement. Let's discuss your needs!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input Box */}
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/50 px-3 py-2.5 flex items-center gap-2">
                    <Input
                      value={demoMessage}
                      onChange={(e) => setDemoMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="border-0 bg-transparent text-white placeholder:text-slate-400 flex-1 focus-visible:ring-0 p-0 text-sm h-auto"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 hover:bg-slate-700 rounded-full"
                    >
                      <Smile className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 hover:bg-slate-700 rounded-full"
                    >
                      <Mic className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 hover:bg-slate-700 rounded-full"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 hover:bg-slate-700 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Product Tab Content */}
              {demoActiveTab === 'product' && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/30 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-1">AI Consultation Package</h4>
                        <p className="text-xs text-slate-400 mb-2">60-min personalized AI strategy session</p>
                        <p className="text-lg font-bold text-blue-400">$199</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/30 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-1">Avatar Design Course</h4>
                        <p className="text-xs text-slate-400 mb-2">Complete guide to 3D avatar creation</p>
                        <p className="text-lg font-bold text-purple-400">$299</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Social Links & Share Button - Compact Layout */}
            <div className="px-6 pb-6">
              <div className="bg-slate-800/30 rounded-xl p-2.5 border border-slate-700/20">
                <div className="flex items-center justify-between">
                  {/* Left Side - Four Main Social Links */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="p-2 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 text-white rounded-full transition-all duration-300 w-8 h-8 shadow-lg border-0 hover:scale-110">
                      <Twitter className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 w-8 h-8 shadow-lg border-0 hover:scale-110">
                      <Linkedin className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-full transition-all duration-300 w-8 h-8 shadow-lg border-0 hover:scale-110">
                      <Youtube className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white rounded-full transition-all duration-300 w-8 h-8 shadow-lg border-0 hover:scale-110">
                      <Instagram className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  {/* Right Side - Three Dots and Share Button */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all w-8 h-8">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="px-3 py-2 h-8 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full transition-all duration-300 shadow-lg border-0 flex items-center gap-1.5 text-xs font-medium hover:scale-105">
                      <Share2 className="h-3 w-3" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Training Section - Redesigned */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Train your AI assistant in minutes
            </h2>
            <p className="text-lg text-gray-600">
              Teaching your AI is as simple as having a conversation
            </p>
          </div>

          <Card className="gradient-card p-8">
            {/* Training Methods */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Training Methods</h3>
              <div className="space-y-3">
                {trainingMethods.map((method, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                      <method.icon className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {method.title}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Personality Sliders */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">AI Personality</h3>
              <div className="space-y-6">
                {personalityTraits.map((trait, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        {trait.name}
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={70 + index * 10}
                        readOnly
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                        style={{
                          background: `linear-gradient(to right, rgb(124, 58, 237) 0%, rgb(124, 58, 237) ${70 + index * 10}%, rgb(229, 231, 235) ${70 + index * 10}%, rgb(229, 231, 235) 100%)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Q&A Pairs Section */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Teach Your AI with Q&A Pairs</h3>
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-300 hover:bg-purple-50">
                  Import Q&A
                </Button>
              </div>

              <div className="space-y-4">
                {/* Q&A Pair Example 1 */}
                <Card className="p-4 bg-gray-50 border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Q&A Pair #1</span>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 h-auto p-0">
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Question</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                        What services do you offer?
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Answer</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                        I specialize in digital marketing, content creation, and brand strategy for small businesses. My packages start at $1,200 for a complete marketing audit.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Q&A Pair Example 2 */}
                <Card className="p-4 bg-gray-50 border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Q&A Pair #2</span>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 h-auto p-0">
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Question</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                        How can I book a consultation with you?
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Answer</label>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                        You can book a 30-minute consultation through my calendar link. Just click on "Book a Consultation" in my profile links and select a time that works for you.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Add Another Pair Button */}
                <Button variant="outline" className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
                  <span className="text-xl mr-2">+</span> Add Another Q&A Pair
                </Button>
              </div>

              {/* Save Button */}
              <div className="mt-6">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 py-6 text-lg font-semibold">
                  Save & Train AI
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Realistic 3D Avatar Design Process */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Realistic 3D Avatar Design Process
            </h2>
            <p className="text-lg text-gray-600">
              Create stunning, lifelike avatars with our advanced 3D customization tools
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Process Steps */}
            <div className="space-y-6">
              <Card className="gradient-card p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Face Customization</h3>
                    <p className="text-gray-600">
                      Adjust facial features, skin tone, eye color, and expressions to match your unique style
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="gradient-card p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Body & Clothing</h3>
                    <p className="text-gray-600">
                      Choose from hundreds of outfits, accessories, and body customization options
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="gradient-card p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Animations & Poses</h3>
                    <p className="text-gray-600">
                      Add dynamic poses and animations to bring your avatar to life
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="gradient-card p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Export & Share</h3>
                    <p className="text-gray-600">
                      Export your avatar in multiple formats and share it across platforms
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: 3D Avatar Preview */}
            <div className="relative">
              <Card className="gradient-card p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-2xl">
                  <div className="w-full h-[500px] bg-gradient-to-br from-blue-950/50 via-purple-950/30 to-slate-950/50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                    
                    {/* 3D Floating Effect Background */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    {/* Enhanced Realistic 3D Avatar with Floating Animation */}
                    <div className="relative transform scale-150 animate-[float_6s_ease-in-out_infinite]" style={{
                      animation: 'float 6s ease-in-out infinite'
                    }}>
                      {/* Head with more detail */}
                      <div className="w-28 h-32 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-full relative shadow-2xl">
                        {/* Hair - More detailed */}
                        <div className="absolute -top-3 left-1 right-1 h-12 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-t-full shadow-lg">
                          <div className="absolute top-2 left-2 w-3 h-3 bg-slate-600 rounded-full opacity-50"></div>
                          <div className="absolute top-1 right-3 w-2 h-4 bg-slate-600 rounded-full opacity-40"></div>
                        </div>
                        
                        {/* Eyes with highlights */}
                        <div className="absolute top-12 left-7 w-4 h-4 bg-slate-800 rounded-full shadow-inner">
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute top-12 right-7 w-4 h-4 bg-slate-800 rounded-full shadow-inner">
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        
                        {/* Eyebrows */}
                        <div className="absolute top-10 left-6 w-5 h-1 bg-slate-700 rounded-full transform -rotate-6"></div>
                        <div className="absolute top-10 right-6 w-5 h-1 bg-slate-700 rounded-full transform rotate-6"></div>
                        
                        {/* Nose with shadow */}
                        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-3 h-4 bg-amber-400/60 rounded-full shadow-sm"></div>
                        
                        {/* Smile */}
                        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-10 h-3 border-b-2 border-slate-800 rounded-b-full"></div>
                        
                        {/* Ears */}
                        <div className="absolute top-14 -left-2 w-4 h-6 bg-amber-300 rounded-full shadow-md"></div>
                        <div className="absolute top-14 -right-2 w-4 h-6 bg-amber-300 rounded-full shadow-md"></div>
                      </div>
                      
                      {/* Neck */}
                      <div className="w-12 h-6 bg-gradient-to-b from-amber-300 to-amber-400 mx-auto -mt-1 rounded-b-lg shadow-md"></div>
                      
                      {/* Body - Professional attire */}
                      <div className="w-36 h-28 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 rounded-t-3xl mx-auto -mt-2 shadow-2xl relative overflow-hidden">
                        {/* Shirt collar */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-white rounded-b-full"></div>
                        
                        {/* Buttons */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 space-y-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto shadow-sm"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto shadow-sm"></div>
                          <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto shadow-sm"></div>
                        </div>
                        
                        {/* Arms */}
                        <div className="absolute -left-6 top-4 w-8 h-24 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-full transform -rotate-12 shadow-lg">
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-amber-200 rounded-full shadow-md"></div>
                        </div>
                        <div className="absolute -right-6 top-4 w-8 h-24 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-full transform rotate-12 shadow-lg">
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-amber-200 rounded-full shadow-md"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 3D Animated Rings */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 pointer-events-none animate-pulse"></div>
                    <div className="absolute inset-4 rounded-2xl border border-purple-400/20 pointer-events-none animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute -inset-2 rounded-2xl border border-cyan-400/20 pointer-events-none animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  <style>{`
                    @keyframes float {
                      0%, 100% { transform: translateY(0px) scale(1.5); }
                      50% { transform: translateY(-20px) scale(1.5); }
                    }
                  `}</style>

                  {/* Control Panel Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                    <div className="grid grid-cols-4 gap-2">
                      <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white text-xs">
                        <UserCircle className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-600 hover:text-white text-xs">
                        <Sparkles className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-600 hover:text-white text-xs">
                        <Zap className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-600 hover:text-white text-xs">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 py-6">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Creating
                  </Button>
                  <Button variant="outline" className="px-6 py-6 border-gray-300">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
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
                <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-2">
                  <Bot className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <Sparkles className="absolute -top-0.5 -right-0.5 w-2 h-2 text-yellow-300" fill="currentColor" />
                </div>
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
