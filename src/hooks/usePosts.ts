import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  post_type: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  link_clicks?: number;
  is_paid?: boolean;
  price?: number;
  currency?: string;
  is_subscriber_only?: boolean;
  subscription_plan_id?: string;
  poll_options?: { options: Array<{ id: string; text: string; votes: number }> };
  poll_votes?: Record<string, string>;
  link_thumbnail_url?: string;
  link_button_text?: string;
  link_button_url?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export const usePosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform poll_options and poll_votes from Json to proper types
      const transformedPosts = (data || []).map(post => ({
        ...post,
        poll_options: post.poll_options as Post['poll_options'],
        poll_votes: post.poll_votes as Post['poll_votes']
      }));
      
      setPosts(transformedPosts);
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

  const createPost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      
      const transformedPost = {
        ...data,
        poll_options: data.poll_options as Post['poll_options'],
        poll_votes: data.poll_votes as Post['poll_votes']
      };
      
      setPosts(prev => [transformedPost, ...prev]);
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      
      return transformedPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up realtime subscription for posts
    if (!userId) return;

    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPost = {
              ...payload.new,
              poll_options: payload.new.poll_options as Post['poll_options'],
              poll_votes: payload.new.poll_votes as Post['poll_votes']
            } as Post;
            setPosts(prev => [newPost, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(post => 
              post.id === payload.new.id ? {
                ...payload.new,
                poll_options: payload.new.poll_options as Post['poll_options'],
                poll_votes: payload.new.poll_votes as Post['poll_votes']
              } as Post : post
            ));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    posts,
    isLoading,
    fetchPosts,
    createPost,
  };
};
