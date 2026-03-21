
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  VolumeX,
  Loader2,
  Coins,
  Sun,
  Moon,
  Gift,
  Tag
} from 'lucide-react';
import MainAuth from './MainAuth';
import VisitorAuth from './VisitorAuth';
import RealisticDemoAvatar3D from './RealisticDemoAvatar3D';
import { usePlatformPricingPlans, PlatformFeature } from '@/hooks/usePlatformPricingPlans';
import DemoPostCard from './landing/DemoPostCard';
import DemoProductCard from './landing/DemoProductCard';
import { demoPosts, demoProducts, demoVirtualCollabProducts } from './landing/demoData';

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Star,
  creator: Zap,
  pro: Crown,
  business: Rocket,
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMainAuthOpen, setIsMainAuthOpen] = useState(false);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);
  const [demoActiveTab, setDemoActiveTab] = useState<'posts' | 'chat' | 'product'>('chat');
  const [demoMessage, setDemoMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isDemoThemeDark, setIsDemoThemeDark] = useState(true);
  const [demoChatMessages, setDemoChatMessages] = useState<Array<{sender: 'ai' | 'user'; text: string; id: number}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Sound control: start OFF by default so it doesn't auto-play unexpectedly
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [soundBtnVisible, setSoundBtnVisible] = useState(true);

  // Toggle sound on/off
  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    if (!next && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Text-to-speech function for AI messages (respects isSoundEnabled)
  const speakText = (text: string) => {
    if (!isSoundEnabled) return;
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Clean text from emojis for better speech
      const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to get a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-playing demo conversation
  const demoConversationScript = [
    { sender: 'user' as const, text: "Hey! What is AvatarTalk?" },
    { sender: 'ai' as const, text: "🎙️ AvatarTalk is your AI-powered clone avatar that talks, sells & engages visitors 24/7 through voice + text — all from a single smart bio-link! 🚀" },
    { sender: 'user' as const, text: "Sounds amazing! How can it help me grow?" },
    { sender: 'ai' as const, text: "🔥 Here's a special offer just for you!\n\n🎁 Get 30% OFF on the Creator Plan — includes AI voice + text responses, e-commerce store, membership plans & lead management.\n\n⏰ Limited time only! Tap 'Free Early Access' above to claim your spot. Let your AI avatar start selling while you sleep! 💰🎙️" },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let messageIndex = 0;

    const showNextMessage = () => {
      if (messageIndex >= demoConversationScript.length) return;
      
      setIsTyping(true);
      const msg = demoConversationScript[messageIndex];
      const typingDelay = msg.sender === 'ai' ? 1200 + msg.text.length * 8 : 800;
      
      timeoutId = setTimeout(() => {
        setIsTyping(false);
        setDemoChatMessages(prev => [...prev, { ...msg, id: messageIndex }]);
        
        // Speak AI messages automatically
        if (msg.sender === 'ai') {
          speakText(msg.text);
        }
        
        messageIndex++;
        timeoutId = setTimeout(showNextMessage, msg.sender === 'ai' ? 3000 : 600); // Longer delay for AI to allow speech
      }, typingDelay);
    };

    // Start after 1.5s
    timeoutId = setTimeout(showNextMessage, 1500);
    return () => {
      clearTimeout(timeoutId);
      // Stop any ongoing speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  const { plans, loading: plansLoading } = usePlatformPricingPlans();

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${tokens / 1000000}M`;
    if (tokens >= 1000) return `${tokens / 1000}K`;
    return tokens.toString();
  };

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
      quote: "AvatarTalk.Co transformed how I engage with my audience. My AI avatar handles visitor questions 24/7!",
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

  // Dynamic pricing plans from database - show all features
  // Discount percentages for different billing cycles
  const yearlyDiscountPercent = 20;
  
  const dynamicPricingPlans = plans.map(plan => {
    const PlanIcon = planIcons[plan.plan_key] || Star;
    const features = (plan.features_list || []) as PlatformFeature[];
    const originalPrice = plan.price_usd || Math.round((plan.price_inr || 0) * 0.012);
    const discountedPrice = Math.round(originalPrice * (1 - yearlyDiscountPercent / 100));
    const saveAmount = originalPrice - discountedPrice;
    
    return {
      id: plan.id,
      name: plan.plan_name,
      originalPrice: plan.plan_key === 'free' ? 0 : originalPrice,
      price: plan.plan_key === 'free' ? 'Free' : `$${discountedPrice}`,
      saveAmount: plan.plan_key === 'free' ? 0 : saveAmount,
      discountPercent: plan.plan_key === 'free' ? 0 : yearlyDiscountPercent,
      period: plan.plan_key === 'free' ? '' : '/month',
      description: plan.tagline || '',
      icon: PlanIcon,
      tokens: plan.ai_tokens_monthly,
      features: features.map(f => f.text),
      popular: plan.is_popular || false
    };
  });

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-16">
            {/* Left Side - Text & CTA */}
            <div className="flex-1 text-center lg:text-left order-1">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                INTRODUCING
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                AI Avatar for Bio-Link<br />in 60 Sec
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
                Create Smart 🎙️ Talking AI Avatar, 🧠 Intelligent Responses, 🛒 E-Commerce, 🔁 Membership Plans, 🎥 Live Collaboration, 📊 Lead Management, 💰 unlock new earning opportunities 24/7 — all in one smart link.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                <Button 
                  size="lg"
                  className="gradient-button px-8 py-4 text-lg"
                  onClick={() => setIsMainAuthOpen(true)}
                >
                  Free Early Access
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-gray-300 hover:bg-gray-50"
                >
                  See Example
                </Button>
              </div>

              {/* Trust badges */}
              <div className="hidden lg:flex items-center gap-6 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Setup in 60s</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>1K+ Creators</span>
                </div>
              </div>
            </div>

            {/* Right Side - Demo User Profile */}
            <div className="w-full max-w-sm flex-shrink-0 order-2">
              <div className={`${isDemoThemeDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'} rounded-3xl shadow-2xl overflow-hidden border hover:scale-[1.02] transition-all duration-500`} style={{ transform: 'perspective(1200px) rotateX(2deg) rotateY(-1deg)', transformStyle: 'preserve-3d' }}>
            {/* Profile Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg">
                    <div className={`w-full h-full rounded-full ${isDemoThemeDark ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center`}>
                      <span className={`text-lg font-bold ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>DA</span>
                    </div>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 ${isDemoThemeDark ? 'border-slate-900' : 'border-white'} shadow-sm`} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 text-left ml-3">
                <h3 className={`text-xl font-bold leading-tight mb-0.5 truncate ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>Demo Avatar</h3>
                <p className={`text-sm ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-600'}`}>@demouser</p>
              </div>
              
              {/* Right Side: Theme Toggle and Profile Button */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDemoThemeDark(!isDemoThemeDark)}
                  className={`${isDemoThemeDark ? 'text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-700/50' : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'} p-2 rounded-full transition-all duration-200`}
                >
                  {isDemoThemeDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                {/* Profile Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-0 rounded-full ${isDemoThemeDark ? 'bg-slate-800/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                    <div className={`w-full h-full rounded-full ${isDemoThemeDark ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center`}>
                      <UserCircle className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="px-6 pb-4">
              <p className={`text-sm leading-relaxed ${isDemoThemeDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Increase Your Brand value to 10X Through AvatarTalk's Clone Avatar.
              </p>
            </div>

            {/* 3D Avatar Preview - Realistic Avatar */}
            <div className="px-6 pb-6">
              <div className={`relative rounded-3xl overflow-hidden ${isDemoThemeDark ? 'bg-gradient-to-br from-slate-800/40 via-blue-900/20 to-slate-800/40 border-slate-600/30' : 'bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-white border-gray-200'} border shadow-inner`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                
                {/* Realistic 3D Avatar with React Three Fiber */}
                <RealisticDemoAvatar3D isTalking={true} />
                
                {/* 3D Animated Rings */}
                <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 pointer-events-none animate-pulse"></div>
                <div className="absolute inset-2 rounded-3xl border border-purple-400/20 pointer-events-none animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute -inset-1 rounded-3xl border border-cyan-400/20 pointer-events-none animate-pulse" style={{animationDelay: '1s'}}></div>
                
                {/* Gift Button - Bottom Left */}
                <div className="absolute bottom-3 left-4 z-10">
                  <Button
                    size="icon"
                    className="rounded-full w-10 h-10 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl animate-pulse hover:animate-none transition-all border-2 border-white/30"
                  >
                    <Gift className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Floating Talk Button - Center */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 py-2 backdrop-blur-sm border border-blue-400/30 shadow-lg hover:scale-110 transition-transform flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs font-medium">Talk to Me</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-5 gap-2">
                <Button
                  size="sm"
                  className="col-span-3 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Subscribe - $9.99/mo
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className={`col-span-2 ${isDemoThemeDark ? 'border-blue-500 text-blue-400 hover:bg-blue-600' : 'border-purple-500 text-purple-600 hover:bg-purple-600'} hover:text-white py-3 rounded-xl text-sm font-semibold`}
                >
                  Follow
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-2">
                <div className={`text-center rounded-xl py-2 backdrop-blur-sm border ${isDemoThemeDark ? 'bg-slate-800/30 border-slate-700/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}`}>
                  <div className={`text-lg font-bold mb-0.5 ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>847</div>
                  <div className={`text-xs font-medium ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-600'}`}>Conversations</div>
                </div>
                <div className={`text-center rounded-xl py-2 backdrop-blur-sm border ${isDemoThemeDark ? 'bg-slate-800/30 border-slate-700/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}`}>
                  <div className={`text-lg font-bold mb-0.5 ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>1.2K</div>
                  <div className={`text-xs font-medium ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-600'}`}>Followers</div>
                </div>
                <div className={`text-center rounded-xl py-2 backdrop-blur-sm border ${isDemoThemeDark ? 'bg-slate-800/30 border-slate-700/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}`}>
                  <div className={`text-lg font-bold mb-0.5 ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>94</div>
                  <div className={`text-xs font-medium ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-600'}`}>Loyalty</div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="px-6 pb-4">
              <div className={`border-b mb-4 ${isDemoThemeDark ? 'border-slate-700/30' : 'border-gray-200'}`}>
                <div className="flex">
                  <button 
                    onClick={() => setDemoActiveTab('posts')}
                    className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      demoActiveTab === 'posts' 
                        ? `${isDemoThemeDark ? 'text-white' : 'text-gray-900'} border-b-2 border-blue-500` 
                        : `${isDemoThemeDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Posts
                  </button>
                  <button 
                    onClick={() => setDemoActiveTab('chat')}
                    className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      demoActiveTab === 'chat' 
                        ? `${isDemoThemeDark ? 'text-white' : 'text-gray-900'} border-b-2 border-blue-500` 
                        : `${isDemoThemeDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                  <button 
                    onClick={() => setDemoActiveTab('product')}
                    className={`flex-1 px-4 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      demoActiveTab === 'product' 
                        ? `${isDemoThemeDark ? 'text-white' : 'text-gray-900'} border-b-2 border-blue-500` 
                        : `${isDemoThemeDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                    }`}
                  >
                    <Rocket className="w-4 h-4" /> Product
                  </button>
                </div>
              </div>

              {/* Posts Tab Content */}
              {demoActiveTab === 'posts' && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin-auto">
                  {demoPosts.map((post) => (
                    <DemoPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {/* Chat Tab Content */}
              {demoActiveTab === 'chat' && (
                <div className="space-y-4">
                  {/* Chat Messages - Auto-playing conversation */}
                  <div className="flex flex-col space-y-3 max-h-48 overflow-y-auto scrollbar-thin-auto" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                    {demoChatMessages.map((msg) => (
                      msg.sender === 'ai' ? (
                        <div key={msg.id} className="flex items-start gap-2 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                            <div className={`w-full h-full rounded-full ${isDemoThemeDark ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center`}>
                              <span className={`text-xs font-bold ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>DA</span>
                            </div>
                          </div>
                          <div className="flex-1 flex justify-end">
                            <div className={`${isDemoThemeDark ? 'bg-slate-700/50 border-slate-600/30' : 'bg-gray-100 border-gray-200'} border rounded-2xl rounded-tr-md px-3 py-2 max-w-xs`}>
                              <p className={`text-sm whitespace-pre-line ${isDemoThemeDark ? 'text-slate-200' : 'text-gray-800'}`}>{msg.text}</p>
                              <div className="flex items-center gap-1 mt-1.5">
                                <Volume2 className={`w-3 h-3 ${isDemoThemeDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                <span className={`text-[10px] font-medium ${isDemoThemeDark ? 'text-blue-400' : 'text-blue-500'}`}>Voice + Text</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={msg.id} className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-[2px] flex-shrink-0">
                            <div className={`w-full h-full rounded-full ${isDemoThemeDark ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center`}>
                              <span className={`text-xs font-bold ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>U</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className={`${isDemoThemeDark ? 'bg-blue-600/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded-2xl rounded-tl-md px-3 py-2 max-w-xs`}>
                              <p className={`text-sm ${isDemoThemeDark ? 'text-blue-100' : 'text-blue-800'}`}>{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                    {isTyping && (
                      <div className="flex items-start gap-2 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                          <div className={`w-full h-full rounded-full ${isDemoThemeDark ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center`}>
                            <span className={`text-xs font-bold ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>DA</span>
                          </div>
                        </div>
                        <div className="flex-1 flex justify-end">
                          <div className={`${isDemoThemeDark ? 'bg-slate-700/50 border-slate-600/30' : 'bg-gray-100 border-gray-200'} border rounded-2xl rounded-tr-md px-3 py-2`}>
                            <div className="flex gap-1">
                              <span className={`w-2 h-2 rounded-full ${isDemoThemeDark ? 'bg-slate-400' : 'bg-gray-400'} animate-bounce`} style={{animationDelay: '0ms'}}></span>
                              <span className={`w-2 h-2 rounded-full ${isDemoThemeDark ? 'bg-slate-400' : 'bg-gray-400'} animate-bounce`} style={{animationDelay: '150ms'}}></span>
                              <span className={`w-2 h-2 rounded-full ${isDemoThemeDark ? 'bg-slate-400' : 'bg-gray-400'} animate-bounce`} style={{animationDelay: '300ms'}}></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Box */}
                  <div className={`${isDemoThemeDark ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50' : 'bg-gray-50 border-gray-200'} rounded-2xl border px-3 py-2.5 flex items-center gap-2`}>
                    <Input
                      value={demoMessage}
                      onChange={(e) => setDemoMessage(e.target.value)}
                      placeholder="Type your message..."
                      className={`border-0 bg-transparent ${isDemoThemeDark ? 'text-white placeholder:text-slate-400' : 'text-gray-900 placeholder:text-gray-400'} flex-1 focus-visible:ring-0 p-0 text-sm h-auto`}
                    />
                    <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${isDemoThemeDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} rounded-full`}>
                      <Smile className={`w-3.5 h-3.5 ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    </Button>
                    <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${isDemoThemeDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} rounded-full`}>
                      <Mic className={`w-3.5 h-3.5 ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    </Button>
                    <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${isDemoThemeDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} rounded-full`}>
                      <Volume2 className={`w-3.5 h-3.5 ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      <Send className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Product Tab Content */}
              {demoActiveTab === 'product' && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin-auto">
                  {/* Digital Products */}
                  {demoProducts.slice(0, 2).map((product) => (
                    <DemoProductCard key={product.id} product={product} />
                  ))}
                  
                  {/* Virtual Collaboration Product */}
                  {demoVirtualCollabProducts.slice(0, 1).map((product) => (
                    <DemoProductCard key={product.id} product={product} />
                  ))}
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
                        
                        {/* Talking Mouth */}
                        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-10 h-3 border-b-2 border-slate-800 rounded-b-full animate-talk-mouth origin-top"></div>
                        
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
                        
                        {/* Arms with public speaking gestures */}
                        <div className="absolute -left-6 top-4 w-8 h-24 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-full shadow-lg animate-speak-hand-left origin-top-right">
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-amber-200 rounded-full shadow-md"></div>
                        </div>
                        <div className="absolute -right-6 top-4 w-8 h-24 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-full shadow-lg animate-speak-hand-right origin-top-left">
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

          {plansLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="flex flex-row flex-wrap justify-center gap-6">
              {dynamicPricingPlans.map((plan, index) => {
                const planGradients: Record<string, string> = {
                  Free: 'from-slate-400 to-slate-500',
                  Creator: 'from-blue-500 to-purple-500',
                  Pro: 'from-purple-500 to-pink-500',
                  Business: 'from-orange-500 to-red-500',
                };
                const gradient = planGradients[plan.name] || 'from-blue-500 to-purple-500';
                
                return (
                  <Card key={plan.id || index} className={`gradient-card p-6 relative w-full sm:w-[280px] flex-shrink-0 ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        Most Popular
                      </Badge>
                    )}
                    <div className="text-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      
                      {/* Pricing with Original, Discounted & Save */}
                      <div className="mb-2">
                        {plan.originalPrice > 0 && (
                          <div className="text-sm text-gray-400 line-through">
                            ${plan.originalPrice}/mo
                          </div>
                        )}
                        <div className="text-3xl font-extrabold text-gray-900">
                          {plan.price}
                          {plan.period && <span className="text-sm font-normal text-gray-600">{plan.period}</span>}
                        </div>
                        {plan.saveAmount > 0 && (
                          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                            <Tag className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-bold text-green-600">
                              Save ${plan.saveAmount}/mo ({plan.discountPercent}% off)
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {plan.description}
                      </p>
                      
                      {/* Token highlight */}
                      {plan.tokens > 0 && (
                        <div className={`flex items-center justify-center gap-1 mb-4 py-2 px-3 bg-gradient-to-r ${gradient}/10 rounded-lg`}>
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">{formatTokens(plan.tokens)} AI Tokens/mo</span>
                        </div>
                      )}
                      
                      <Button 
                        className={`w-full mb-4 ${plan.popular ? `bg-gradient-to-r ${gradient} hover:opacity-90` : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                        onClick={() => setIsMainAuthOpen(true)}
                      >
                        Get Started
                      </Button>
                      <ul className="text-left space-y-2 max-h-64 overflow-y-auto">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start text-gray-700 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/pricing')}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              View Full Pricing Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 px-10 py-6 text-xl font-bold shadow-2xl shadow-orange-500/40 border-2 border-white/20 animate-pulse hover:animate-none hover:scale-105 transition-all duration-300"
            onClick={() => setIsMainAuthOpen(true)}
          >
            <Rocket className="w-6 h-6 mr-3" />
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
                <span className="text-xl font-bold">AvatarTalk.Co</span>
              </div>
              <p className="text-gray-400 text-sm">
                Create AI avatars that represent you and engage with your audience 24/7.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://x.com/avatartalk_" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/avatartalkco/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/avatartalk.co/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/company/avatartalk-co/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/@avatartalk-co" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm mb-2">
              © 2024 All rights reserved by AvatarTalk.Co
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <Link to="/terms" className="hover:text-white">Terms</Link>
              <span>•</span>
              <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
              <span>•</span>
              <Link to="/refund-policy" className="hover:text-white">Refunds</Link>
            </div>
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

      {/* Floating Audio Sound Toggle Button */}
      {soundBtnVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
          {/* Tooltip label */}
          <div className={`
            text-xs font-medium px-3 py-1 rounded-full text-white transition-all duration-300
            ${isSoundEnabled
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30'
              : 'bg-gray-700/90 backdrop-blur-sm'
            }
          `}>
            {isSoundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </div>

          {/* Main floating button */}
          <button
            onClick={toggleSound}
            className={`
              relative w-14 h-14 rounded-full flex items-center justify-center
              transition-all duration-300 cursor-pointer select-none
              shadow-2xl hover:scale-110 active:scale-95
              border-2
              ${isSoundEnabled
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 border-purple-400/50 shadow-purple-500/40'
                : 'bg-gray-800/95 border-gray-600/50 shadow-gray-900/60 backdrop-blur-sm'
              }
            `}
            title={isSoundEnabled ? 'Click to mute sound' : 'Click to enable sound'}
            aria-label={isSoundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {/* Sound wave rings when speaking */}
            {isSpeaking && isSoundEnabled && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-purple-400/60 animate-ping" />
                <span className="absolute inset-[-6px] rounded-full border border-blue-400/30 animate-ping" style={{ animationDelay: '0.3s' }} />
              </>
            )}
            {/* Icon */}
            {isSoundEnabled ? (
              isSpeaking ? (
                <Volume2 className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400" />
            )}
          </button>

          {/* Close/dismiss button */}
          <button
            onClick={() => setSoundBtnVisible(false)}
            className="w-5 h-5 rounded-full bg-gray-700/70 hover:bg-gray-600/90 flex items-center justify-center transition-all"
            title="Dismiss"
            aria-label="Dismiss audio button"
          >
            <span className="text-gray-400 text-xs leading-none">✕</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
