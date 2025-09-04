import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFollows } from '@/hooks/useFollows';
import FuturisticAvatar3D from './FuturisticAvatar3D';
import {
  MessageCircle,
  UserPlus,
  UserMinus,
  Share,
  Heart,
  Eye,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mic,
  Smile,
  Send,
  Sparkles,
  Users,
  TrendingUp,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  profession: string;
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

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  const {
    followersCount,
    followingCount,
    isFollowing,
    followUser,
    unfollowUser,
    loading: followsLoading
  } = useFollows(profile?.id);

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
      // Fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Fetch user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      setUserStats(statsData);

      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setPosts(postsData || []);

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      setProducts(productsData || []);

      // Track profile visit
      if (profileData.id !== currentUser?.id) {
        await supabase
          .from('profile_visitors')
          .insert({
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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setIsTalking(true);
    toast({
      title: "Message Sent",
      description: `"${chatMessage}" - AI will respond shortly`,
      duration: 3000,
    });
    
    // Simulate AI response
    setTimeout(() => {
      setIsTalking(false);
    }, 3000);
    
    setChatMessage('');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/80">Loading avatar profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
          <p className="text-white/60">The requested profile could not be found.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-slate-800/80 to-purple-800/50 border-purple-500/30 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* 3D Avatar */}
                <div className="flex-shrink-0">
                  <FuturisticAvatar3D
                    isLarge={true}
                    isTalking={isTalking}
                    avatarStyle="holographic"
                    className="w-80 h-80"
                    onInteraction={() => setIsTalking(!isTalking)}
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {profile.display_name || profile.username}
                      </h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={shareProfile}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <Share className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xl text-cyan-400 mb-2">@{profile.username}</p>
                    {profile.profession && (
                      <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30">
                        {profile.profession}
                      </Badge>
                    )}
                  </div>

                  <p className="text-lg text-white/80 leading-relaxed">
                    {profile.bio || "Exploring the boundaries of AI conversation. Let's create something amazing!"}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center lg:justify-start">
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-500/30"
                      onClick={() => setIsTalking(true)}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Talk to Me
                    </Button>
                    
                    {!isOwnProfile && currentUser && (
                      <Button
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 px-8 py-3 rounded-full"
                        onClick={handleFollow}
                        disabled={followsLoading}
                      >
                        {isFollowing(profile.id) ? (
                          <>
                            <UserMinus className="w-5 h-5 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-purple-500/30">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-1">
                        {userStats?.total_conversations || 352}
                      </div>
                      <div className="text-sm text-white/60">Total Conversations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-1">
                        {followersCount || 1200}
                      </div>
                      <div className="text-sm text-white/60">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-400 mb-1">
                        {userStats?.engagement_score || 89}
                      </div>
                      <div className="text-sm text-white/60">Engagement Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-purple-500/30 rounded-2xl p-1">
              <TabsTrigger 
                value="posts" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="chat"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="products"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600"
              >
                <Globe className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id} className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <p className="text-white/90 mb-4">{post.content}</p>
                      {post.media_url && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          {post.media_type?.startsWith('image/') ? (
                            <img src={post.media_url} alt="Post media" className="w-full h-auto" />
                          ) : (
                            <div className="bg-slate-700/50 p-4 rounded-lg">
                              <p className="text-sm text-white/60">Media: {post.media_type}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-6 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments_count}
                        </div>
                        <div className="ml-auto">
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <p className="text-white/60">No posts yet. Check back soon for updates!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white mb-2">Start a Conversation</h3>
                    <p className="text-white/60">
                      Ask {profile.display_name || profile.username} anything! Their AI avatar will respond.
                    </p>
                  </div>
                  
                  <form onSubmit={handleChatSubmit} className="space-y-4">
                    <div className="relative">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Ask me anything..."
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-white/40 pr-24 py-6 text-lg rounded-2xl"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-purple-400 hover:text-purple-300 p-2"
                        >
                          <Mic className="w-5 h-5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-purple-400 hover:text-purple-300 p-2"
                        >
                          <Smile className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 py-6 rounded-2xl text-lg font-semibold"
                      disabled={!chatMessage.trim()}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-colors">
                      <CardContent className="p-6">
                        {product.thumbnail_url && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <img src={product.thumbnail_url} alt={product.title} className="w-full h-32 object-cover" />
                          </div>
                        )}
                        <h4 className="font-semibold text-white mb-2">{product.title}</h4>
                        <p className="text-sm text-white/60 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-cyan-400">
                            {product.is_free ? 'Free' : `$${product.price}`}
                          </div>
                          <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <p className="text-white/60">No products available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Social Links Footer */}
        <motion.div
          className="mt-12 pt-8 border-t border-purple-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-6">
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              <Twitter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              <Facebook className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              <Instagram className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              <Youtube className="w-5 h-5" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-purple-500/30" />
            <Button variant="ghost" size="sm" onClick={shareProfile} className="text-cyan-400 hover:text-cyan-300">
              <Share className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;