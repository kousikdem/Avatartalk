import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileEngagement {
  totalConversations: number;
  followersCount: number;
  engagementScore: number;
  isNewUser: boolean;
  profileViews: number;
  totalProductsSold: number;
}

export const useProfileEngagement = (profileId: string | null) => {
  const [engagement, setEngagement] = useState<ProfileEngagement>({
    totalConversations: 0,
    followersCount: 0,
    engagementScore: 0,
    isNewUser: false,
    profileViews: 0,
    totalProductsSold: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchEngagement = useCallback(async () => {
    if (!profileId) return;

    try {
      // Fetch user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', profileId)
        .maybeSingle();

      if (statsError) throw statsError;

      // Count unique conversations
      const { count: conversationCount } = await supabase
        .from('ai_chat_history')
        .select('visitor_id', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('sender', 'user');

      // Get followers count from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', profileId)
        .single();

      setEngagement({
        totalConversations: conversationCount || stats?.total_chats_received || 0,
        followersCount: profileData?.followers_count || stats?.followers_count || 0,
        engagementScore: stats?.engagement_score || 0,
        isNewUser: stats?.is_new_user ?? true,
        profileViews: stats?.profile_views || 0,
        totalProductsSold: stats?.total_products_sold || 0,
      });
    } catch (error) {
      console.error('Error fetching engagement:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // Initial fetch
  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`profile-engagement-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${profileId}`
        },
        () => {
          fetchEngagement();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${profileId}`
        },
        () => {
          fetchEngagement();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_chat_history',
          filter: `profile_id=eq.${profileId}`
        },
        () => {
          fetchEngagement();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchEngagement]);

  return {
    engagement,
    loading,
    refetch: fetchEngagement
  };
};
