import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Fixed loyalty score weights - same as in AIResponsePerspective
const LOYALTY_WEIGHTS = {
  chatMessage: 2,
  profileVisit: 1, // once per day
  responseTime: 1,
  followUpCompletion: 2
};

interface ProfileEngagement {
  totalConversations: number;
  followersCount: number;
  loyaltyScore: number;
  isNewUser: boolean;
  profileViews: number;
  totalProductsSold: number;
  totalPostViews: number;
  totalProductViews: number;
}

export const useProfileEngagement = (profileId: string | null) => {
  const [engagement, setEngagement] = useState<ProfileEngagement>({
    totalConversations: 0,
    followersCount: 0,
    loyaltyScore: 0,
    isNewUser: false,
    profileViews: 0,
    totalProductsSold: 0,
    totalPostViews: 0,
    totalProductViews: 0,
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

      // Use user_stats.profile_views as single source of truth for profile views
      const { data: profileViewsData } = await supabase
        .from('user_stats')
        .select('profile_views')
        .eq('user_id', profileId)
        .maybeSingle();
      const profileViewsCount = profileViewsData?.profile_views || 0;

      // Get total post views
      const { data: postsData } = await supabase
        .from('posts')
        .select('views_count')
        .eq('user_id', profileId);

      const totalPostViews = postsData?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;

      // Get total product views
      const { data: productsData } = await supabase
        .from('products')
        .select('views_count')
        .eq('user_id', profileId);

      const totalProductViews = productsData?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;

      // Get follow-up completions from ai_chat_memory
      const { data: memoryData } = await supabase
        .from('ai_chat_memory')
        .select('follow_ups_completed')
        .eq('profile_id', profileId);

      const totalFollowUpsCompleted = memoryData?.reduce((sum, m) => sum + (m.follow_ups_completed || 0), 0) || 0;

      // Calculate engagement metrics
      const followers = profileData?.followers_count || stats?.followers_count || 0;
      const conversations = totalUserMessages || 0; // All user messages = conversations
      const messages = totalMessages || 0;
      const productsSold = productsSoldCount || stats?.total_products_sold || 0;
      const profileViews = profileViewsCount || 0;
      
      // Loyalty score formula using fixed weights (raw score, no normalization)
      // Chat Messages * 2 + Profile Visits * 1 + Response Time Bonus * 1 + Follow-up Completion * 2
      const rawScore = (
        (messages * LOYALTY_WEIGHTS.chatMessage) + 
        (profileViews * LOYALTY_WEIGHTS.profileVisit) + 
        (followers * LOYALTY_WEIGHTS.responseTime) + // Using followers as proxy for response engagement
        (totalFollowUpsCompleted * LOYALTY_WEIGHTS.followUpCompletion) +
        (productsSold * 5) // Bonus for purchases
      );

      // Check if user is new (has low engagement or few conversations)
      const isNew = rawScore < 100 || (stats?.is_new_user ?? conversations < 5);

      setEngagement({
        totalConversations: conversations,
        followersCount: followers,
        loyaltyScore: rawScore,
        isNewUser: isNew,
        profileViews: profileViews,
        totalProductsSold: productsSold,
        totalPostViews,
        totalProductViews,
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_visitors',
          filter: `visited_profile_id=eq.${profileId}`
        },
        () => {
          console.log('👁️ Profile visit - refreshing engagement');
          fetchEngagement();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload: any) => {
          if (payload.new?.user_id === profileId) {
            console.log('📝 Post views updated - refreshing engagement');
            fetchEngagement();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products'
        },
        (payload: any) => {
          if (payload.new?.user_id === profileId) {
            console.log('🛍️ Product views updated - refreshing engagement');
            fetchEngagement();
          }
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
    
    // Optimistically update local state with raw score increment
    setEngagement(prev => ({
      ...prev,
      totalConversations: prev.totalConversations + 1,
      loyaltyScore: prev.loyaltyScore + LOYALTY_WEIGHTS.chatMessage
    }));
  }, [profileId]);

  return {
    engagement,
    loading,
    refetch: fetchEngagement,
    incrementConversation
  };
};
