import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sun, Moon, UserCircle, Gift, MessageSquare, Sparkles, FileText, Rocket, Volume2,
  Smile, Mic, Send, Twitter, Linkedin, Youtube, Instagram, MoreVertical, Share2,
} from 'lucide-react';
import DemoPostCard from '../DemoPostCard';
import DemoProductCard from '../DemoProductCard';
import { demoPosts, demoProducts, demoVirtualCollabProducts } from '../demoData';

const RealisticDemoAvatar3D = lazy(() => import('../../RealisticDemoAvatar3D'));

/** Numbered feature indicator pinned onto the profile card. */
export const Marker: React.FC<{
  n: number;
  active: number | null;
  onHover?: (n: number | null) => void;
  className?: string;
}> = ({ n, active, onHover, className = '' }) => {
  const isActive = active === n;
  return (
    <span
      data-marker={n}
      data-testid={`profile-marker-${n}`}
      onMouseEnter={() => onHover?.(n)}
      onMouseLeave={() => onHover?.(null)}
      className={`absolute z-20 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold text-white cursor-default select-none
        bg-gradient-to-br from-fuchsia-500 to-violet-600 ring-2 ring-white shadow-lg shadow-violet-500/40 transition-transform duration-300
        ${isActive ? 'scale-125' : ''} ${className}`}
    >
      {!isActive && <span className="absolute inset-0 rounded-full bg-fuchsia-400/60 animate-ping" style={{ animationDuration: '2.4s' }} />}
      <span className="relative">{n}</span>
    </span>
  );
};

const demoConversationScript = [
  { sender: 'user' as const, text: 'Hey! What is AvatarTalk?' },
  { sender: 'ai' as const, text: "🎙️ I'm Kousik's AI avatar — I talk, answer questions, share links and sell products 24/7 from one smart bio-link! 🚀" },
  { sender: 'user' as const, text: 'Can I book a meeting with you?' },
  { sender: 'ai' as const, text: '📅 Sure! Pick a Zoom or Google Meet slot in the Product tab — I\'ll confirm it instantly. ✨' },
];

interface KousikProfileCardProps {
  activeMarker?: number | null;
  onMarkerHover?: (n: number | null) => void;
}

/**
 * Faithful replica of a real AvatarTalk public profile (same layout, aspect
 * ratio and components as /:username) for @kousik — Kousik Kar.
 */
const KousikProfileCard: React.FC<KousikProfileCardProps> = ({ activeMarker = null, onMarkerHover }) => {
  const [demoActiveTab, setDemoActiveTab] = useState<'posts' | 'chat' | 'product'>('chat');
  const [demoMessage, setDemoMessage] = useState('');
  const [isDemoThemeDark, setIsDemoThemeDark] = useState(true);
  const [demoChatMessages, setDemoChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; id: number }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let i = 0;
    const next = () => {
      if (i >= demoConversationScript.length) return;
      setIsTyping(true);
      const msg = demoConversationScript[i];
      timeoutId = setTimeout(() => {
        setIsTyping(false);
        setDemoChatMessages((prev) => [...prev, { ...msg, id: i }]);
        i++;
        timeoutId = setTimeout(next, msg.sender === 'ai' ? 2600 : 600);
      }, msg.sender === 'ai' ? 1200 + msg.text.length * 8 : 800);
    };
    timeoutId = setTimeout(next, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

  const activeMarkerValue = activeMarker;
  const onMarkerHoverValue = onMarkerHover;

  return (
        <div className={`${isDemoThemeDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'} rounded-3xl shadow-2xl overflow-hidden border relative`} data-testid="kousik-profile-card">
      {/* Profile Header */}
      <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
        <Marker n={1} active={activeMarkerValue} onHover={onMarkerHoverValue} className="left-1.5 top-2" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg">
              <div className={`w-full h-full rounded-full ${isDemoThemeDark ? 'bg-slate-800' : 'bg-white'} flex items-center justify-center`}>
                <span className={`text-lg font-bold ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>KK</span>
              </div>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 ${isDemoThemeDark ? 'border-slate-900' : 'border-white'} shadow-sm`} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 text-left ml-3">
          <h3 className={`text-xl font-bold leading-tight mb-0.5 truncate ${isDemoThemeDark ? 'text-white' : 'text-gray-900'}`}>Kousik Kar</h3>
          <p className={`text-sm ${isDemoThemeDark ? 'text-slate-400' : 'text-gray-600'}`}>@kousik</p>
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
          Founder @AvatarTalk · Chat with my AI avatar 24/7 — ask anything, book a call or grab my products.
        </p>
      </div>
    
      {/* 3D Avatar Preview - Realistic Avatar */}
      <div className="px-6 pb-6">
        <div className={`relative rounded-3xl overflow-hidden ${isDemoThemeDark ? 'bg-gradient-to-br from-slate-800/40 via-blue-900/20 to-slate-800/40 border-slate-600/30' : 'bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-white border-gray-200'} border shadow-inner`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          
          {/* Realistic 3D Avatar with React Three Fiber */}
          <Suspense fallback={<div className="h-56 flex items-center justify-center"><div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" /></div>}>
            <RealisticDemoAvatar3D isTalking={true} />
          </Suspense>
          
          {/* 3D Animated Rings */}
          <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/30 pointer-events-none animate-pulse"></div>
          <div className="absolute inset-2 rounded-3xl border border-purple-400/20 pointer-events-none animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -inset-1 rounded-3xl border border-cyan-400/20 pointer-events-none animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Gift Button - Bottom Left */}
          <div className="absolute bottom-3 left-4 z-10">
            <Marker n={3} active={activeMarkerValue} onHover={onMarkerHoverValue} className="-right-4 -top-4" />
            <Button
              size="icon"
              className="rounded-full w-10 h-10 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl animate-pulse hover:animate-none transition-all border-2 border-white/30"
            >
              <Gift className="w-5 h-5" />
            </Button>
          </div>
          
          <Marker n={2} active={activeMarkerValue} onHover={onMarkerHoverValue} className="left-3 top-3" />
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
      <div className="relative px-6 pb-4">
        <Marker n={4} active={activeMarkerValue} onHover={onMarkerHoverValue} className="-right-0.5 top-1" />
        <div className="grid grid-cols-5 gap-2">
          <Button
            size="sm"
            className="col-span-3 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Subscribe - ₹99/mo
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
      <div className="relative px-6 pb-4">
        <Marker n={5} active={activeMarkerValue} onHover={onMarkerHoverValue} className="-right-0.5 top-2" />
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
      <div className="relative px-6 pb-6">
        <Marker n={6} active={activeMarkerValue} onHover={onMarkerHoverValue} className="-right-0.5 top-1" />
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
  );
};

export default KousikProfileCard;
