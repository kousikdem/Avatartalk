import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format, parseISO, eachDayOfInterval } from 'date-fns';

export interface AnalyticsData {
  // Products Analytics
  totalProducts: number;
  totalProductViews: number;
  totalProductSales: number;
  totalProductEarnings: number;
  physicalProductSales: number;
  digitalProductSales: number;
  physicalProductEarnings: number;
  digitalProductEarnings: number;
  productViewsTrend: { date: string; views: number }[];
  productSalesTrend: { date: string; sales: number; earnings: number }[];
  topProducts: { id: string; title: string; views: number; sales: number; earnings: number }[];

  // Virtual Collaboration Analytics
  totalCollaborations: number;
  totalBookings: number;
  totalCollaborationEarnings: number;
  collaborationTrend: { date: string; bookings: number; earnings: number }[];

  // Feed/Posts Analytics
  totalPosts: number;
  totalPostViews: number;
  totalPostLikes: number;
  totalPostComments: number;
  postEngagementTrend: { date: string; views: number; likes: number; comments: number }[];

  // Followers Analytics
  totalFollowers: number;
  totalFollowing: number;
  followerGrowthTrend: { date: string; followers: number; gained: number; lost: number }[];
  
  // Engagement Analytics
  profileViews: number;
  totalConversations: number;
  engagementScore: number;
  engagementTrend: { date: string; views: number; conversations: number }[];

  // Subscription Analytics
  totalSubscribers: number;
  totalSubscriptionEarnings: number;
  subscriptionTrend: { date: string; subscribers: number; earnings: number }[];

  // Geographic Analytics
  viewsByLocation: { country: string; views: number }[];

  // Overall Analytics
  totalEarnings: number;
  earningsTrend: { date: string; products: number; subscriptions: number; collaborations: number; total: number }[];

  // Link Clicks
  linkClicks: number;
  linkClicksTrend: { date: string; clicks: number }[];
}

interface DateRange {
  start: Date;
  end: Date;
}

export const useAnalytics = (dateRange?: DateRange) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const defaultRange = {
    start: subDays(new Date(), 30),
    end: new Date()
  };

  const range = dateRange || defaultRange;

  const generateDateRange = (start: Date, end: Date) => {
    return eachDayOfInterval({ start, end }).map(date => format(date, 'yyyy-MM-dd'));
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      const user = session.user;
      setUserId(user.id);

      const startDate = format(startOfDay(range.start), 'yyyy-MM-dd');
      const endDate = format(endOfDay(range.end), 'yyyy-MM-dd');
      const dates = generateDateRange(range.start, range.end);

      // Fetch all data in parallel
      const [
        productsData,
        ordersData,
        postsData,
        followsData,
        followerAnalyticsData,
        userStatsData,
        subscriptionsData,
        eventsData,
        likesData,
        commentsData,
        profileVisitorsData
      ] = await Promise.all([
        // Products
        supabase.from('products').select('*').eq('user_id', user.id),
        // Orders (as seller)
        supabase.from('orders')
          .select('*')
          .eq('seller_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // Posts
        supabase.from('posts').select('*').eq('user_id', user.id),
        // Follows (followers)
        supabase.from('follows').select('*').eq('following_id', user.id),
        // Follower Analytics
        supabase.from('follower_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date'),
        // User Stats
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
        // Subscriptions
        supabase.from('subscriptions')
          .select('*')
          .eq('subscribed_to_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // Events (Virtual Collaboration)
        supabase.from('events').select('*').eq('user_id', user.id),
        // Likes on user's posts
        supabase.from('likes')
          .select('*, posts!inner(user_id)')
          .eq('posts.user_id', user.id),
        // Comments on user's posts
        supabase.from('comments')
          .select('*, posts!inner(user_id)')
          .eq('posts.user_id', user.id),
        // Profile visitors
        supabase.from('profile_visitors')
          .select('*')
          .eq('visited_profile_id', user.id)
          .gte('visited_at', startDate)
          .lte('visited_at', endDate + 'T23:59:59')
      ]);

      const products = productsData.data || [];
      const orders = ordersData.data || [];
      const posts = postsData.data || [];
      const follows = followsData.data || [];
      const followerAnalytics = followerAnalyticsData.data || [];
      const userStats = userStatsData.data;
      const subscriptions = subscriptionsData.data || [];
      const events = eventsData.data || [];
      const likes = likesData.data || [];
      const comments = commentsData.data || [];
      const profileVisitors = profileVisitorsData.data || [];

      // Calculate product analytics
      const totalProductViews = products.reduce((sum, p) => sum + (p.views_count || 0), 0);
      const completedOrders = orders.filter(o => o.payment_status === 'completed');
      const physicalOrders = completedOrders.filter(o => {
        const product = products.find(p => p.id === o.product_id);
        return product?.product_type === 'physical';
      });
      const digitalOrders = completedOrders.filter(o => {
        const product = products.find(p => p.id === o.product_id);
        return product?.product_type === 'digital';
      });

      // Product sales trend
      const productSalesTrend = dates.map(date => {
        const dayOrders = completedOrders.filter(o => 
          format(parseISO(o.created_at), 'yyyy-MM-dd') === date
        );
        return {
          date,
          sales: dayOrders.length,
          earnings: dayOrders.reduce((sum, o) => sum + (o.seller_earnings || 0), 0)
        };
      });

      // Top products
      const productSalesMap = new Map<string, { sales: number; earnings: number }>();
      completedOrders.forEach(order => {
        const current = productSalesMap.get(order.product_id) || { sales: 0, earnings: 0 };
        productSalesMap.set(order.product_id, {
          sales: current.sales + order.quantity,
          earnings: current.earnings + (order.seller_earnings || 0)
        });
      });

      const topProducts = products
        .map(p => ({
          id: p.id,
          title: p.title,
          views: p.views_count || 0,
          sales: productSalesMap.get(p.id)?.sales || 0,
          earnings: productSalesMap.get(p.id)?.earnings || 0
        }))
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10);

      // Post engagement trend
      const postEngagementTrend = dates.map(date => {
        const dayLikes = likes.filter(l => 
          format(parseISO(l.created_at), 'yyyy-MM-dd') === date
        ).length;
        const dayComments = comments.filter(c => 
          format(parseISO(c.created_at), 'yyyy-MM-dd') === date
        ).length;
        return {
          date,
          views: 0, // Would need post views tracking
          likes: dayLikes,
          comments: dayComments
        };
      });

      // Follower growth trend
      const followerGrowthTrend = dates.map(date => {
        const dayAnalytics = followerAnalytics.find(fa => fa.date === date);
        return {
          date,
          followers: dayAnalytics?.total_followers || follows.length,
          gained: dayAnalytics?.followers_gained || 0,
          lost: dayAnalytics?.followers_lost || 0
        };
      });

      // Subscription trend
      const subscriptionTrend = dates.map(date => {
        const daySubs = subscriptions.filter(s => 
          format(parseISO(s.created_at), 'yyyy-MM-dd') === date
        );
        return {
          date,
          subscribers: daySubs.length,
          earnings: daySubs.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
        };
      });

      // Profile views trend
      const engagementTrend = dates.map(date => {
        const dayVisitors = profileVisitors.filter(v => 
          format(parseISO(v.visited_at), 'yyyy-MM-dd') === date
        ).length;
        return {
          date,
          views: dayVisitors,
          conversations: 0 // Would need chat tracking per day
        };
      });

      // Total earnings trend
      const earningsTrend = dates.map(date => {
        const productEarnings = productSalesTrend.find(p => p.date === date)?.earnings || 0;
        const subEarnings = subscriptionTrend.find(s => s.date === date)?.earnings || 0;
        return {
          date,
          products: productEarnings,
          subscriptions: subEarnings,
          collaborations: 0, // Would need booking earnings
          total: productEarnings + subEarnings
        };
      });

      // Views by location (from profile visitors metadata if available)
      const locationCounts = new Map<string, number>();
      profileVisitors.forEach(visitor => {
        const country = (visitor as any).country || 'Unknown';
        locationCounts.set(country, (locationCounts.get(country) || 0) + 1);
      });
      const viewsByLocation = Array.from(locationCounts.entries())
        .map(([country, views]) => ({ country, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Calculate totals
      const totalProductEarnings = completedOrders.reduce((sum, o) => sum + (o.seller_earnings || 0), 0);
      const totalSubscriptionEarnings = subscriptions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

      setAnalytics({
        // Products
        totalProducts: products.length,
        totalProductViews,
        totalProductSales: completedOrders.length,
        totalProductEarnings,
        physicalProductSales: physicalOrders.length,
        digitalProductSales: digitalOrders.length,
        physicalProductEarnings: physicalOrders.reduce((sum, o) => sum + (o.seller_earnings || 0), 0),
        digitalProductEarnings: digitalOrders.reduce((sum, o) => sum + (o.seller_earnings || 0), 0),
        productViewsTrend: dates.map(date => ({ date, views: 0 })), // Would need daily view tracking
        productSalesTrend,
        topProducts,

        // Virtual Collaboration
        totalCollaborations: events.length,
        totalBookings: 0, // Would need bookings table
        totalCollaborationEarnings: 0,
        collaborationTrend: dates.map(date => ({ date, bookings: 0, earnings: 0 })),

        // Feed/Posts
        totalPosts: posts.length,
        totalPostViews: posts.reduce((sum, p) => sum + (p.views_count || 0), 0),
        totalPostLikes: likes.length,
        totalPostComments: comments.length,
        postEngagementTrend,

        // Followers
        totalFollowers: follows.length,
        totalFollowing: userStats?.following_count || 0,
        followerGrowthTrend,

        // Engagement
        profileViews: profileVisitors.length,
        totalConversations: userStats?.total_conversations || 0,
        engagementScore: Number(userStats?.engagement_score) || 0,
        engagementTrend,

        // Subscriptions
        totalSubscribers: subscriptions.filter(s => s.status === 'active').length,
        totalSubscriptionEarnings,
        subscriptionTrend,

        // Geographic
        viewsByLocation,

        // Overall
        totalEarnings: totalProductEarnings + totalSubscriptionEarnings,
        earningsTrend,

        // Links
        linkClicks: userStats?.profile_views || 0, // Placeholder
        linkClicksTrend: dates.map(date => ({ date, clicks: 0 }))
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    userId,
    refetch: fetchAnalytics
  };
};
