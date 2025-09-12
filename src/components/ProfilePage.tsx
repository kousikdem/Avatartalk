import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFollows } from '@/hooks/useFollows';
import { usePersonalizedAI } from '@/hooks/usePersonalizedAI';
import { usePosts } from '@/hooks/usePosts';
import FuturisticAvatar3D from './FuturisticAvatar3D';
import LikeButton from './LikeButton';
import {
  MessageCircle,
  Share2,
  Heart,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mic,
  Smile,
  Users,
  ArrowDown,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Globe,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  profile_pic_url?: string;
  profession: string;
}

interface AvatarConfiguration {
  id: string;
  user_id: string;
  avatar_name: string;
  gender: string;
  age_category: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  eye_color: string;
  height: number;
  current_pose: string;
  current_expression: string;
}

interface UserStats {
  total_conversations: number;
  followers_count: number;
  engagement_score: number;
}

interface Post {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url?: string;
  is_free: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'avatar';
  senderName?: string;
  senderAvatar?: string;
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTalking, setIsTalking] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [topChatMessage, setTopChatMessage] = useState('');
  const { toast } = useToast();

  const {
    followersCount,
    followingCount,
    isFollowing,
    followUser,
    unfollowUser,
    loading: followsLoading
  } = useFollows(profile?.id);

  const { trainings, currentTraining } = usePersonalizedAI();
  const { posts: userPosts, isLoading: postsLoading, fetchPosts } = usePosts(profile?.id);

  // Initialize chat messages
  useEffect(() => {
    if (profile) {
      const initialMessages: ChatMessage[] = [
        {
          id: '1',
          content: `Hi there! I'm ${profile.display_name || profile.username}. How can I help you today?`,
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          sender: 'avatar',
          senderName: profile.display_name || profile.username,
          senderAvatar: profile.avatar_url || profile.profile_pic_url
        },
        {
          id: '2', 
          content: "Hello! I'd love to learn more about your experience with AI development.",
          timestamp: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
          sender: 'user',
          senderName: currentUser?.email?.split('@')[0] || 'User',
          senderAvatar: undefined
        },
        {
          id: '3',
          content: "I've been working with AI for over 5 years! I specialize in conversational AI and machine learning. What specific area interests you most?",
          timestamp: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
          sender: 'avatar',
          senderName: profile.display_name || profile.username,
          senderAvatar: profile.avatar_url || profile.profile_pic_url
        }
      ];
      setChatMessages(initialMessages);
    }
  }, [profile, currentUser]);

  // Memoize profile data for performance
  const profileData = useMemo(() => ({
    displayName: profile?.display_name || profile?.username || 'Unknown User',
    username: profile?.username || '',
    bio: profile?.bio || "Exploring the boundaries of AI conversation. Let's create something amazing!",
    avatarInitial: (profile?.display_name?.[0] || profile?.username?.[0] || 'U').toUpperCase()
  }), [profile]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      // First fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        throw new Error('Profile not found');
      }

      setProfile(profileData);

      // Now fetch related data using the profile ID
      const [statsResponse, productsResponse, avatarResponse] = await Promise.all([
        supabase.from('user_stats').select('*').eq('user_id', profileData.id).maybeSingle(),
        supabase.from('products').select('*').eq('user_id', profileData.id).eq('status', 'published').order('created_at', { ascending: false }).limit(6),
        supabase.from('avatar_configurations').select('*').eq('user_id', profileData.id).eq('is_active', true).maybeSingle()
      ]);

      setUserStats(statsResponse.data);
      setProducts(productsResponse.data || []);
      setAvatarConfig(avatarResponse.data);

      // Track profile visit (fire and forget)
      if (profileData.id !== currentUser?.id) {
        supabase.from('profile_visitors').insert({
          visitor_id: currentUser?.id || null,
          visited_profile_id: profileData.id,
        });
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !currentUser) return;
    
    if (isFollowing(profile.id)) {
      await unfollowUser(profile.id);
    } else {
      await followUser(profile.id);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = chatMessage.trim() || topChatMessage.trim();
    if (!messageContent || !profile || !currentUser) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      timestamp: new Date().toISOString(),
      sender: 'user',
      senderName: currentUser.email?.split('@')[0] || 'User',
      senderAvatar: undefined
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setTopChatMessage('');
    setIsTalking(true);
    
    // Store conversation in database
    try {
      await supabase.from('behavior_learning_data').insert({
        user_id: profile.id,
        interaction_type: 'chat_message',
        user_input: messageContent,
        ai_response: '',
        context_data: { 
          timestamp: new Date().toISOString(),
          sender: currentUser.email?.split('@')[0] || 'User'
        }
      });
    } catch (error) {
      console.error('Error storing chat message:', error);
    }
    
    // Simulate AI response based on personalized training
    setTimeout(async () => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `That's a great question! Based on my training, I can share some insights about that. ${profile.bio || 'Let me think about the best way to help you with this.'} Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date().toISOString(),
        sender: 'avatar',
        senderName: profile.display_name || profile.username,
        senderAvatar: profile.avatar_url || profile.profile_pic_url
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTalking(false);
      
      // Update conversation count in stats
      try {
        await supabase
          .from('user_stats')
          .update({ 
            total_conversations: (userStats?.total_conversations || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.id);
      } catch (error) {
        console.error('Error updating conversation count:', error);
      }
      
      toast({
        title: "AI Response",
        description: "Response generated using personalized AI training",
        duration: 3000,
      });
    }, 2000 + Math.random() * 2000); // Random delay 2-4 seconds
  };

  const shareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Profile link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/80">Loading avatar profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-slate-400">The requested profile could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-2">
      <motion.div
        className="w-full max-w-lg mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-slate-900/95 border-slate-700/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/50 min-h-[90vh]">
          <CardContent className="p-0">
            {/* Profile Header - Top Left Corner */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url || profile?.profile_pic_url ? (
                        <img 
                          src={profile.avatar_url || profile.profile_pic_url} 
                          alt={profileData.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-white">
                          {profileData.avatarInitial}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white leading-tight mb-0.5 truncate">
                    {profileData.displayName}
                  </h2>
                  <p className="text-slate-400 text-sm">@{profileData.username}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareProfile}
                className="text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/30 hover:bg-slate-700/50 transition-all duration-200"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-6 pb-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                {profileData.bio}
              </p>
            </div>

            {/* 3D Avatar Preview - Larger and More Prominent */}
            <div className="px-6 pb-6">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/40 via-blue-900/20 to-slate-800/40 border border-slate-600/30 shadow-inner">
                <FuturisticAvatar3D
                  isLarge={true}
                  isTalking={isTalking}
                  avatarStyle="holographic"
                  className="w-full h-80"
                  onInteraction={() => setIsTalking(!isTalking)}
                />
                <div className="absolute inset-0 rounded-3xl border border-blue-400/10 pointer-events-none" />
                
                {/* Floating Talk to Me Button */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 hover:from-blue-700/90 hover:to-cyan-700/90 text-white rounded-full w-14 h-14 p-0 backdrop-blur-sm border border-blue-400/30 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-110"
                    onClick={() => setIsTalking(true)}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons - Subscribe (left wider) and Follow (right) */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-5 gap-3">
                {/* Left Side - Subscribe Button (wider - 3 columns) */}
                <Button
                  className="col-span-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-2xl text-base font-semibold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 transition-all duration-300 hover:scale-[1.02] border-0 flex items-center justify-center gap-2"
                  onClick={() => setIsTalking(true)}
                >
                  <Sparkles className="h-5 w-5" />
                  Subscribe - $9.99/mo
                </Button>
                
                {/* Right Side - Follow Button (2 columns) with gradient */}
                {!isOwnProfile && currentUser ? (
                  <Button
                    variant={isFollowing(profile.id) ? "default" : "outline"}
                    className={`col-span-2 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 ${
                      isFollowing(profile.id) 
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white border-0 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40' 
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-0 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40'
                    }`}
                    onClick={handleFollow}
                    disabled={followsLoading}
                  >
                    {followsLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                    {isFollowing(profile.id) ? 'Following' : 'Follow'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="col-span-2 border-slate-500/30 bg-slate-800/40 text-slate-400 py-4 rounded-2xl text-base font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    disabled
                  >
                    <Users className="h-4 w-4" />
                    Follow
                  </Button>
                )}
              </div>
            </div>

            {/* Stats - Three Column Layout */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-slate-800/30 rounded-2xl py-4 backdrop-blur-sm border border-slate-700/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {userStats?.total_conversations || 0}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Conversations</div>
                </div>
                <div className="text-center bg-slate-800/30 rounded-2xl py-4 backdrop-blur-sm border border-slate-700/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {followersCount >= 1000 ? `${(followersCount/1000).toFixed(1)}K` : followersCount}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Followers</div>
                </div>
                <div className="text-center bg-slate-800/30 rounded-2xl py-4 backdrop-blur-sm border border-slate-700/20">
                  <div className="text-2xl font-bold text-white mb-1">
                    {Math.round(userStats?.engagement_score || 0)}%
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Engagement</div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="px-6 pb-4">
              <Tabs defaultValue="posts" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-slate-700/30 rounded-none p-0 h-auto">
                  <TabsTrigger 
                    value="posts" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white py-3 font-medium text-base transition-all duration-200 hover:text-slate-200"
                  >
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white py-3 font-medium text-base transition-all duration-200 hover:text-slate-200"
                  >
                    Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="products"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white py-3 font-medium text-base transition-all duration-200 hover:text-slate-200"
                  >
                    Products
                  </TabsTrigger>
                </TabsList>

                {/* Posts Tab */}
                <TabsContent value="posts" className="space-y-4 mt-6">
                  <AnimatePresence>
                    {userPosts.length > 0 ? (
                      userPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                              <p className="text-slate-300 mb-3 text-sm">{post.content}</p>
                              {post.media_url && (
                                <div className="mb-3 rounded-lg overflow-hidden">
                                  {post.media_type?.startsWith('image/') ? (
                                    <img src={post.media_url} alt="Post media" className="w-full h-auto" />
                                  ) : (
                                    <div className="bg-slate-700/50 p-3 rounded-lg">
                                      <p className="text-xs text-slate-400">Media: {post.media_type}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-600/20">
                                <div className="flex items-center gap-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex items-center gap-1 text-slate-400 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                  >
                                    <Heart className="w-3 h-3" />
                                    <span className="text-xs">{post.likes_count || 0}</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex items-center gap-1 text-slate-400 hover:text-blue-400 p-1 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span className="text-xs">{post.comments_count || 0}</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex items-center gap-1 text-slate-400 hover:text-green-400 p-1 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="text-xs text-slate-500">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                          <CardContent className="p-8 text-center">
                            <Sparkles className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                            <p className="text-slate-400 text-sm">No posts yet. Check back soon for updates!</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat" className="mt-6 space-y-4">
                  <div className="flex flex-col space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'avatar' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                            {message.sender === 'avatar' ? (
                              message.senderAvatar ? (
                                <img 
                                  src={message.senderAvatar} 
                                  alt={message.senderName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold text-white">
                                  {(message.senderName?.[0] || 'A').toUpperCase()}
                                </span>
                              )
                            ) : (
                              <span className="text-xs font-bold text-white">
                                {(message.senderName?.[0] || 'U').toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex-1 ${message.sender === 'avatar' ? 'flex justify-end' : ''}`}>
                          <div className={message.sender === 'avatar' ? '' : 'max-w-xs'}>
                            <div className={`px-4 py-3 rounded-2xl ${
                              message.sender === 'avatar' 
                                ? 'bg-slate-700/50 border border-slate-600/30 rounded-tr-md max-w-xs' 
                                : 'bg-blue-600/20 border border-blue-500/30 rounded-tl-md'
                            }`}>
                              <p className={`text-sm ${
                                message.sender === 'avatar' ? 'text-slate-200' : 'text-blue-100'
                              }`}>
                                {message.content}
                              </p>
                            </div>
                            <p className={`text-xs text-slate-500 mt-1 ${
                              message.sender === 'avatar' ? 'text-right' : ''
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTalking && (
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
                          <div className="w-full h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url || profile?.profile_pic_url ? (
                              <img 
                                src={profile.avatar_url || profile.profile_pic_url} 
                                alt={profileData.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white">
                                {profileData.avatarInitial}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex justify-end">
                          <div>
                            <div className="bg-slate-700/50 border border-slate-600/30 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                                <span className="text-xs text-slate-400">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-700/30 pt-4">
                    <form onSubmit={handleChatSubmit}>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Type your message..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="w-full bg-slate-800/40 border-slate-600/30 text-white placeholder-slate-400 pr-12 py-3 text-sm rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                          disabled={isTalking}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                          disabled={isTalking || !chatMessage.trim()}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="mt-6">
                  <AnimatePresence>
                    {products.length > 0 ? (
                      <div className="space-y-4">
                        {products.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-colors">
                              <CardContent className="p-4">
                                {product.thumbnail_url && (
                                  <div className="mb-3 rounded-lg overflow-hidden">
                                    <img src={product.thumbnail_url} alt={product.title} className="w-full h-24 object-cover" />
                                  </div>
                                )}
                                <h4 className="font-semibold text-white mb-2 text-sm">{product.title}</h4>
                                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{product.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="text-base font-bold text-blue-400">
                                    {product.is_free ? 'Free' : `$${product.price}`}
                                  </div>
                                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs">
                                    View
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                          <CardContent className="p-8 text-center">
                            <Globe className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                            <p className="text-slate-400 text-sm">No products available yet.</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </div>

            {/* Top Chat Input Box */}
            <div className="px-6 pt-4 pb-6 border-t border-slate-700/20">
              <form onSubmit={handleChatSubmit}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Send a quick message..."
                    value={topChatMessage}
                    onChange={(e) => setTopChatMessage(e.target.value)}
                    className="w-full bg-slate-800/40 border-slate-600/30 text-white placeholder-slate-400 pr-12 py-3 text-sm rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    disabled={isTalking}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                    disabled={isTalking || !topChatMessage.trim()}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Social Links Section */}
            <div className="px-6 pt-0 pb-6">

              {/* Social Links Row */}
              <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-200 min-w-[44px]"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-200 min-w-[44px]"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-200 min-w-[44px]"
                >
                  <Youtube className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-200 min-w-[44px]"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-200 min-w-[44px]"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-200 min-w-[44px]"
                >
                  <Globe className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={shareProfile}
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-200 min-w-[44px] ml-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;