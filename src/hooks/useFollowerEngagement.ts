import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EngagementData {
  id: string;
  follower_id: string;
  profile_visits: number;
  link_clicks: number;
  chat_interactions: number;
  post_likes: number;
  post_comments: number;
  product_purchases: number;
  engagement_score: number;
  last_interaction_at?: string;
  follower?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export const useFollowerEngagement = (userId?: string) => {
  const [engagement, setEngagement] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEngagement = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      const targetUserId = userId || currentUser.user?.id;
      
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('follower_engagement')
        .select('*')
        .eq('user_id', targetUserId)
        .order('engagement_score', { ascending: false });

      if (error) throw error;

      // Fetch follower profiles separately
      if (data && data.length > 0) {
        const followerIds = data.map(d => d.follower_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', followerIds);

        const enrichedData = data.map(engagement => ({
          ...engagement,
          follower: profiles?.find(p => p.id === engagement.follower_id)
        })) as EngagementData[];

        setEngagement(enrichedData);
        setLoading(false);
        return;
      }

      if (error) throw error;

      setEngagement(data || []);
    } catch (error) {
      console.error('Error fetching engagement:', error);
      toast({
        title: "Error",
        description: "Failed to load engagement data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackEngagement = async (
    followerId: string,
    type: 'profile_visit' | 'link_click' | 'chat' | 'post_like' | 'comment' | 'purchase'
  ) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const updateField = {
        profile_visit: 'profile_visits',
        link_click: 'link_clicks',
        chat: 'chat_interactions',
        post_like: 'post_likes',
        comment: 'post_comments',
        purchase: 'product_purchases'
      }[type];

      // Check if engagement record exists
      const { data: existing } = await supabase
        .from('follower_engagement')
        .select('*')
        .eq('user_id', currentUser.user.id)
        .eq('follower_id', followerId)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from('follower_engagement')
          .update({
            [updateField]: (existing[updateField] || 0) + 1,
            last_interaction_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('follower_engagement')
          .insert({
            user_id: currentUser.user.id,
            follower_id: followerId,
            [updateField]: 1,
            last_interaction_at: new Date().toISOString()
          });
      }

      await fetchEngagement();
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  };

  useEffect(() => {
    fetchEngagement();
  }, [userId]);

  return {
    engagement,
    loading,
    trackEngagement,
    refetchEngagement: fetchEngagement
  };
};
