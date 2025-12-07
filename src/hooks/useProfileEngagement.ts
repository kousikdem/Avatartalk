import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileEngagement {
  totalConversations: number;
  followersCount: number;
  loyaltyScore: number;
  isNewUser: boolean;
  profileViews: number;
  totalProductsSold: number;
}

export const useProfileEngagement = (profileId: string | null) => {
  const [engagement, setEngagement] = useState<ProfileEngagement>({
    totalConversations: 0,
    followersCount: 0,
    loyaltyScore: 0,
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

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Stats error:', statsError);
      }

      // Count ALL chat messages from users (total conversations = all user messages)
      const { count: totalUserMessages } = await supabase
        .from('ai_chat_history')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('sender', 'user');

      // Count total chat messages (both user and avatar)
      const { count: totalMessages } = await supabase
        .from('ai_chat_history')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);

      // Get followers count from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', profileId)
        .maybeSingle();

      // Count completed orders for this seller
      const { count: productsSoldCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', profileId)
        .eq('payment_status', 'completed');

      // Count profile visits
      const { count: profileViewsCount } = await supabase
        .from('profile_visitors')
        .select('*', { count: 'exact', head: true })
        .eq('visited_profile_id', profileId);

      // Calculate engagement metrics
      const followers = profileData?.followers_count || stats?.followers_count || 0;
      const conversations = totalUserMessages || 0; // All user messages = conversations
      const messages = totalMessages || 0;
      const productsSold = productsSoldCount || stats?.total_products_sold || 0;
      const profileViews = profileViewsCount || stats?.profile_views || 0;
      
      // Loyalty score formula: weighted combination capped at 100
      const rawScore = (
        (followers * 3) + 
        (conversations * 5) + 
        (messages * 2) + 
        (productsSold * 15) +
        (profileViews * 1)
      );
      
      // Normalize to 1-100 scale using logarithmic scaling
      const loyaltyScore = Math.min(100, Math.max(1, Math.round(
        rawScore > 0 ? Math.log10(rawScore + 1) * 25 : 1
      )));

      // Check if user is new (created within last 7 days or has low loyalty)
      const isNew = loyaltyScore < 20 || (stats?.is_new_user ?? conversations < 5);

      setEngagement({
        totalConversations: conversations,
        followersCount: followers,
        loyaltyScore: loyaltyScore,
        isNewUser: isNew,
        profileViews: profileViews,
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
      loyaltyScore: Math.min(100, prev.loyaltyScore + 1)
    }));
  }, [profileId]);

  return {
    engagement,
    loading,
    refetch: fetchEngagement,
    incrementConversation
  };
};
