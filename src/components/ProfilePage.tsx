import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFollows } from '@/hooks/useFollows';
import FuturisticAvatar3D from './FuturisticAvatar3D';
import {
  MessageCircle,
  UserPlus,
  UserMinus,
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
  TrendingUp,
  Gift,
  ChevronRight,
  Sparkles,
  Send,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="max-w-md mx-auto px-6 py-4">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl font-semibold text-white">
            AvatarTalk.bio
          </h1>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={shareProfile}
              className="text-white/70 hover:text-white p-2 rounded-full bg-white/10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-white">
                  {profile.display_name?.[0] || profile.username[0]}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-blue-300">@{profile.username}</p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-white/90 text-base leading-relaxed mb-6">
            {profile.bio || "Exploring the boundaries of AI conversation. Let's create something amazing!"}
          </p>

          {/* 3D Avatar */}
          <div className="mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
            <FuturisticAvatar3D
              isLarge={true}
              isTalking={isTalking}
              avatarStyle="holographic"
              className="w-full h-72"
              onInteraction={() => setIsTalking(!isTalking)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-base font-medium shadow-lg"
              onClick={() => setIsTalking(true)}
            >
              Talk to Me
            </Button>
            
            {!isOwnProfile && currentUser && (
              <Button
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10 py-4 rounded-2xl text-base font-medium"
                onClick={handleFollow}
                disabled={followsLoading}
              >
                {isFollowing(profile.id) ? 'Following' : 'Follow'}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white p-3 rounded-2xl bg-white/10"
            >
              <Users className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 mb-6">
            <div className="text-center bg-white/5 rounded-2xl py-4">
              <div className="text-2xl font-bold text-white mb-1">
                {userStats?.total_conversations || 352}
              </div>
              <div className="text-xs text-white/60">Total Conversations</div>
            </div>
            <div className="text-center bg-white/5 rounded-2xl py-4">
              <div className="text-2xl font-bold text-white mb-1">
                {followersCount >= 1000 ? `${(followersCount/1000).toFixed(1)}K` : followersCount || '1.2K'}
              </div>
              <div className="text-xs text-white/60">Followers</div>
            </div>
            <div className="text-center bg-white/5 rounded-2xl py-4">
              <div className="text-2xl font-bold text-white mb-1">
                {userStats?.engagement_score || 89}
              </div>
              <div className="text-xs text-white/60">Engagement Score</div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-white/20 rounded-none p-0 h-auto">
              <TabsTrigger 
                value="posts" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-white/70 data-[state=active]:text-white py-3 font-medium"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="chat"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-white/70 data-[state=active]:text-white py-3 font-medium"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-white/70 data-[state=active]:text-white py-3 font-medium"
              >
                Projects/Gifts
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
              <div className="text-center py-20">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold text-white mb-2">Start a Conversation</h3>
                <p className="text-white/60">
                  Ask {profile.display_name || profile.username} anything!
                </p>
              </div>
            </TabsContent>

            {/* Projects/Gifts Tab */}
            <TabsContent value="projects">
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

        {/* Chat Input */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <form onSubmit={handleChatSubmit} className="relative">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-20 py-4 text-base rounded-3xl backdrop-blur-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white p-2"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white p-2"
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="mt-8 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white p-2">
              <Twitter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white p-2">
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white p-2">
              <Youtube className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white p-2">
              <Facebook className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white p-2">
              <Instagram className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white p-2">
              <Globe className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={shareProfile}
              className="text-white/50 hover:text-white p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;