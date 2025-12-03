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

      // Count unique conversations (distinct visitor sessions)
      const { count: conversationCount } = await supabase
        .from('ai_chat_history')
        .select('visitor_id, visitor_session_id', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('sender', 'user');

      // Get followers count from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', profileId)
        .single();

      // Count total chat messages for engagement calculation
      const { count: totalMessages } = await supabase
        .from('ai_chat_history')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);

      // Calculate dynamic engagement score
      const followers = profileData?.followers_count || stats?.followers_count || 0;
      const conversations = conversationCount || stats?.total_chats_received || 0;
      const messages = totalMessages || 0;
      const productsSold = stats?.total_products_sold || 0;
      
      // Engagement formula: weighted combination of metrics
      const dynamicEngagement = Math.round(
        (followers * 2) + 
        (conversations * 5) + 
        (messages * 1) + 
        (productsSold * 10) +
        (stats?.profile_views || 0) * 0.5
      );

      setEngagement({
        totalConversations: conversations,
        followersCount: followers,
        engagementScore: dynamicEngagement || stats?.engagement_score || 0,
        isNewUser: stats?.is_new_user ?? true,
        profileViews: stats?.profile_views || 0,
        totalProductsSold: productsSold,
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

  // Subscribe to realtime updates for all relevant tables
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`profile-engagement-${profileId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${profileId}`
        },
        () => {
          console.log('📊 User stats updated - refreshing engagement');
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
          console.log('👥 Follows updated - refreshing engagement');
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
          console.log('💬 New chat message - refreshing engagement');
          fetchEngagement();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileId}`
        },
        () => {
          console.log('👤 Profile updated - refreshing engagement');
          fetchEngagement();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchEngagement]);

  // Increment engagement on interaction
  const incrementConversation = useCallback(async () => {
    if (!profileId) return;
    
    // Optimistically update local state
    setEngagement(prev => ({
      ...prev,
      totalConversations: prev.totalConversations + 1,
      engagementScore: prev.engagementScore + 5
    }));
  }, [profileId]);

  return {
    engagement,
    loading,
    refetch: fetchEngagement,
    incrementConversation
  };
};
