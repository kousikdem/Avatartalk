import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Image, Video, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import PostCard from './PostCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ExtendedPost {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface SocialFeedProps {
  userId?: string;
  showCreatePost?: boolean;
  feedType?: 'user' | 'following' | 'public';
}

const SocialFeed: React.FC<SocialFeedProps> = ({ 
  userId, 
  showCreatePost = true,
  feedType = 'user'
}) => {
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  // Fetch posts based on feed type
  useEffect(() => {
    fetchPosts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, feedType]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
        `);

      switch (feedType) {
        case 'user':
          if (userId) {
            query = query.eq('user_id', userId);
          }
          break;
        case 'following':
          if (userId) {
            // Get posts from users that current user follows
            const { data: follows } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', userId);
            
            if (follows && follows.length > 0) {
              const followingIds = follows.map(f => f.following_id);
              query = query.in('user_id', followingIds);
            } else {
              // If not following anyone, return empty array
              setPosts([]);
              setLoading(false);
              return;
            }
          }
          break;
        case 'public':
          // Show all public posts (no filter)
          break;
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: currentUser.id,
          content: newPostContent.trim(),
          post_type: 'text',
          likes_count: 0,
          comments_count: 0,
          views_count: 0
        }])
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setPosts(prev => [data, ...prev]);
      setNewPostContent('');
      setShowPostModal(false);
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handlePostUpdate = (updatedPost: ExtendedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handleMediaUpload = async (file: File) => {
    if (!currentUser) return;

    setUploadingMedia(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures') // Using existing bucket
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Create post with media
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: currentUser.id,
          content: newPostContent.trim() || 'Shared a photo',
          post_type: 'media',
          media_url: publicUrl,
          media_type: file.type,
          likes_count: 0,
          comments_count: 0,
          views_count: 0
        }])
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setPosts(prev => [data, ...prev]);
      setNewPostContent('');
      setShowPostModal(false);
      
      toast({
        title: "Success",
        description: "Post with media created successfully!",
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Create Post Section */}
      {showCreatePost && currentUser && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {(currentUser.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={() => setShowPostModal(true)}
                  className="w-full justify-start text-left text-gray-500 hover:text-gray-700"
                >
                  What's on your mind?
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPostModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="font-semibold mb-4">Create Post</h3>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="mb-4"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMediaUpload(file);
                    }}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        {uploadingMedia ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Image className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPostModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() && !uploadingMedia}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onPostUpdate={handlePostUpdate}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <PlusCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">
                {feedType === 'user' 
                  ? "Share your first post to get started!" 
                  : feedType === 'following'
                    ? "Follow some users to see their posts here"
                    : "Be the first to share something interesting!"
                }
              </p>
              {showCreatePost && currentUser && (
                <Button onClick={() => setShowPostModal(true)}>
                  Create Post
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;