import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PostWithProfile {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  metadata?: any;
  is_paid?: boolean;
  price?: number;
  profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export const useRealtimePosts = (userId?: string, feedType: 'user' | 'following' | 'public' = 'user') => {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setIsLoading(true);
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
            const { data: follows } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', userId);
            
            if (follows && follows.length > 0) {
              const followingIds = follows.map(f => f.following_id);
              query = query.in('user_id', followingIds);
            } else {
              setPosts([]);
              setIsLoading(false);
              return;
            }
          }
          break;
        case 'public':
          // Show all public posts
          break;
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

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
      setIsLoading(false);
    }
  };

  const createPost = async (postData: {
    content: string;
    media_url?: string;
    media_type?: string;
    post_type?: string;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: userId,
          content: postData.content,
          media_url: postData.media_url,
          media_type: postData.media_type,
          post_type: postData.post_type || 'text',
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
      
      // Add new post to the beginning of the list
      setPosts(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updatePost = async (postId: string, updates: Partial<PostWithProfile>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      // Update post in local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId ? data : post
        )
      );
      
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      // Remove post from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementViews = async (postId: string) => {
    try {
      const { data } = await supabase
        .from('posts')
        .select('views_count')
        .eq('id', postId)
        .single();
        
      if (data) {
        const { error } = await supabase
          .from('posts')
          .update({ views_count: data.views_count + 1 })
          .eq('id', postId);
          
        if (!error) {
          setPosts(prev => 
            prev.map(post => 
              post.id === postId 
                ? { ...post, views_count: post.views_count + 1 }
                : post
            )
          );
        }
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchPosts();

    // Subscribe to posts changes
    const postsChannel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new post with profile data
            const { data } = await supabase
              .from('posts')
              .select(`
                *,
                profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              // Check if this post should be included based on feed type
              let shouldInclude = false;
              
              switch (feedType) {
                case 'user':
                  shouldInclude = data.user_id === userId;
                  break;
                case 'following':
                  // Check if the post author is being followed
                  if (userId) {
                    const { data: follow } = await supabase
                      .from('follows')
                      .select('id')
                      .eq('follower_id', userId)
                      .eq('following_id', data.user_id)
                      .maybeSingle();
                    shouldInclude = !!follow;
                  }
                  break;
                case 'public':
                  shouldInclude = true;
                  break;
              }

              if (shouldInclude) {
                setPosts(prev => [data, ...prev]);
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update existing post
            const { data } = await supabase
              .from('posts')
              .select(`
                *,
                profile:profiles!posts_user_id_fkey(username, display_name, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setPosts(prev => 
                prev.map(post => 
                  post.id === data.id ? data : post
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted post
            setPosts(prev => 
              prev.filter(post => post.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to likes changes to update counts
    const likesChannel = supabase
      .channel('posts-likes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: 'like_type=eq.post'
        },
        async (payload) => {
          const newPayload = payload.new as any;
          const oldPayload = payload.old as any;
          
          if (newPayload?.post_id || oldPayload?.post_id) {
            const postId = newPayload?.post_id || oldPayload?.post_id;
            
            // Fetch updated post data
            const { data } = await supabase
              .from('posts')
              .select('likes_count')
              .eq('id', postId)
              .single();

            if (data) {
              setPosts(prev => 
                prev.map(post => 
                  post.id === postId 
                    ? { ...post, likes_count: data.likes_count }
                    : post
                )
              );
            }
          }
        }
      )
      .subscribe();

    // Subscribe to comments changes to update counts
    const commentsChannel = supabase
      .channel('posts-comments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: 'comment_type=eq.post'
        },
        async (payload) => {
          const newPayload = payload.new as any;
          const oldPayload = payload.old as any;
          
          if (newPayload?.post_id || oldPayload?.post_id) {
            const postId = newPayload?.post_id || oldPayload?.post_id;
            
            // Fetch updated post data
            const { data } = await supabase
              .from('posts')
              .select('comments_count')
              .eq('id', postId)
              .single();

            if (data) {
              setPosts(prev => 
                prev.map(post => 
                  post.id === postId 
                    ? { ...post, comments_count: data.comments_count }
                    : post
                )
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [userId, feedType]);

  return {
    posts,
    isLoading,
    isCreating,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    refetch: fetchPosts
  };
};