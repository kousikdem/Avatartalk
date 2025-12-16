import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format, parseISO, eachDayOfInterval } from 'date-fns';

export interface PlatformAnalyticsData {
  // User Analytics
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowthTrend: { date: string; total: number; new: number }[];
  activeUsers: number;

  // Products Analytics
  totalProducts: number;
  publishedProducts: number;
  totalProductSales: number;
  totalProductRevenue: number;
  platformProductFees: number;
  productSalesTrend: { date: string; sales: number; revenue: number; fees: number }[];
  topSellingProducts: { id: string; title: string; seller: string; sales: number; revenue: number }[];

  // Orders Analytics
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  ordersTrend: { date: string; total: number; completed: number; pending: number }[];

  // Subscription Analytics
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalSubscriptionRevenue: number;
  platformSubscriptionFees: number;
  subscriptionTrend: { date: string; new: number; active: number; revenue: number }[];

  // Token Analytics
  totalTokensSold: number;
  totalTokenRevenue: number;
  totalTokensUsed: number;
  tokenUsageTrend: { date: string; sold: number; used: number; revenue: number }[];

  // Virtual Collaboration Analytics
  totalEvents: number;
  totalBookings: number;
  collaborationRevenue: number;
  collaborationTrend: { date: string; events: number; bookings: number; revenue: number }[];

  // Engagement Analytics
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalFollows: number;
  engagementTrend: { date: string; posts: number; likes: number; comments: number; follows: number }[];

  // AI Analytics
  totalAIConversations: number;
  totalAIMessages: number;
  aiUsageTrend: { date: string; conversations: number; messages: number; tokens: number }[];

  // Revenue Analytics
  totalPlatformRevenue: number;
  revenueTrend: { date: string; products: number; subscriptions: number; tokens: number; total: number }[];

  // Geographic Analytics
  usersByCountry: { country: string; count: number }[];

  // Top Performers
  topSellers: { id: string; name: string; email: string; revenue: number; sales: number }[];
  topCreators: { id: string; name: string; followers: number; engagement: number }[];
}

interface DateRange {
  start: Date;
  end: Date;
}

export const usePlatformAnalytics = (dateRange?: DateRange) => {
  const [analytics, setAnalytics] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultRange = {
    start: subDays(new Date(), 30),
    end: new Date()
  };

  const range = dateRange || defaultRange;

  const generateDateRange = (start: Date, end: Date) => {
    return eachDayOfInterval({ start, end }).map(date => format(date, 'yyyy-MM-dd'));
  };

  const fetchPlatformAnalytics = useCallback(async () => {
    try {
      const startDate = format(startOfDay(range.start), 'yyyy-MM-dd');
      const endDate = format(endOfDay(range.end), 'yyyy-MM-dd');
      const dates = generateDateRange(range.start, range.end);

      const today = format(new Date(), 'yyyy-MM-dd');
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      // Fetch all platform data in parallel
      const [
        usersData,
        productsData,
        ordersData,
        subscriptionsData,
        tokenPurchasesData,
        tokenUsageData,
        eventsData,
        postsData,
        likesData,
        commentsData,
        followsData,
        aiChatData
      ] = await Promise.all([
        // All users
        supabase.from('profiles').select('id, email, full_name, created_at, followers_count'),
        // All products
        supabase.from('products').select('id, title, user_id, status, views_count, created_at'),
        // All orders
        supabase.from('orders')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // All subscriptions
        supabase.from('subscriptions')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // Token purchases
        supabase.from('token_purchases')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // Token usage
        supabase.from('daily_token_usage')
          .select('*')
          .gte('day', startDate)
          .lte('day', endDate),
        // Events
        supabase.from('events').select('*'),
        // Posts
        supabase.from('posts')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // Likes
        supabase.from('likes')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // Comments
        supabase.from('comments')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // Follows
        supabase.from('follows')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),
        // AI Chat history
        supabase.from('ai_chat_history')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
      ]);

      const users = usersData.data || [];
      const products = productsData.data || [];
      const orders = ordersData.data || [];
      const subscriptions = subscriptionsData.data || [];
      const tokenPurchases = tokenPurchasesData.data || [];
      const tokenUsage = tokenUsageData.data || [];
      const events = eventsData.data || [];
      const posts = postsData.data || [];
      const likes = likesData.data || [];
      const comments = commentsData.data || [];
      const follows = followsData.data || [];
      const aiChats = aiChatData.data || [];

      // User analytics
      const newUsersToday = users.filter(u => u.created_at && format(parseISO(u.created_at), 'yyyy-MM-dd') === today).length;
      const newUsersThisWeek = users.filter(u => u.created_at && u.created_at >= weekAgo).length;
      const newUsersThisMonth = users.filter(u => u.created_at && u.created_at >= monthAgo).length;

      const userGrowthTrend = dates.map(date => {
        const usersUpToDate = users.filter(u => u.created_at && u.created_at <= date + 'T23:59:59').length;
        const newOnDate = users.filter(u => u.created_at && format(parseISO(u.created_at), 'yyyy-MM-dd') === date).length;
        return { date, total: usersUpToDate, new: newOnDate };
      });

      // Orders analytics
      const completedOrders = orders.filter(o => o.payment_status === 'completed');
      const pendingOrders = orders.filter(o => o.payment_status === 'pending');
      const failedOrders = orders.filter(o => o.payment_status === 'failed');

      const totalProductRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const platformProductFees = completedOrders.reduce((sum, o) => sum + (o.platform_fee || 0), 0);

      const productSalesTrend = dates.map(date => {
        const dayOrders = completedOrders.filter(o => 
          format(parseISO(o.created_at), 'yyyy-MM-dd') === date
        );
        return {
          date,
          sales: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          fees: dayOrders.reduce((sum, o) => sum + (o.platform_fee || 0), 0)
        };
      });

      const ordersTrend = dates.map(date => {
        const dayOrders = orders.filter(o => 
          format(parseISO(o.created_at), 'yyyy-MM-dd') === date
        );
        return {
          date,
          total: dayOrders.length,
          completed: dayOrders.filter(o => o.payment_status === 'completed').length,
          pending: dayOrders.filter(o => o.payment_status === 'pending').length
        };
      });

      // Top selling products
      const productSalesMap = new Map<string, { sales: number; revenue: number }>();
      completedOrders.forEach(order => {
        if (!order.product_id) return;
        const current = productSalesMap.get(order.product_id) || { sales: 0, revenue: 0 };
        productSalesMap.set(order.product_id, {
          sales: current.sales + order.quantity,
          revenue: current.revenue + (order.total_amount || 0)
        });
      });

      const topSellingProducts = products
        .filter(p => productSalesMap.has(p.id))
        .map(p => ({
          id: p.id,
          title: p.title,
          seller: users.find(u => u.id === p.user_id)?.full_name || 'Unknown',
          sales: productSalesMap.get(p.id)?.sales || 0,
          revenue: productSalesMap.get(p.id)?.revenue || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Subscription analytics
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const totalSubscriptionRevenue = subscriptions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const platformSubscriptionFees = totalSubscriptionRevenue * 0.5; // 50% platform fee

      const subscriptionTrend = dates.map(date => {
        const daySubs = subscriptions.filter(s => 
          format(parseISO(s.created_at), 'yyyy-MM-dd') === date
        );
        return {
          date,
          new: daySubs.length,
          active: daySubs.filter(s => s.status === 'active').length,
          revenue: daySubs.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
        };
      });

      // Token analytics
      const completedTokenPurchases = tokenPurchases.filter(t => t.status === 'completed');
      const totalTokensSold = completedTokenPurchases.reduce((sum, t) => sum + (Number(t.tokens_purchased) || 0), 0);
      const totalTokenRevenue = completedTokenPurchases.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const totalTokensUsed = tokenUsage.reduce((sum, t) => sum + (Number(t.total_tokens) || 0), 0);

      const tokenUsageTrend = dates.map(date => {
        const dayPurchases = completedTokenPurchases.filter(t => 
          format(parseISO(t.created_at || ''), 'yyyy-MM-dd') === date
        );
        const dayUsage = tokenUsage.filter(t => t.day === date);
        return {
          date,
          sold: dayPurchases.reduce((sum, t) => sum + (Number(t.tokens_purchased) || 0), 0),
          used: dayUsage.reduce((sum, t) => sum + (Number(t.total_tokens) || 0), 0),
          revenue: dayPurchases.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        };
      });

      // Engagement trend
      const engagementTrend = dates.map(date => {
        return {
          date,
          posts: posts.filter(p => format(parseISO(p.created_at), 'yyyy-MM-dd') === date).length,
          likes: likes.filter(l => format(parseISO(l.created_at), 'yyyy-MM-dd') === date).length,
          comments: comments.filter(c => format(parseISO(c.created_at), 'yyyy-MM-dd') === date).length,
          follows: follows.filter(f => format(parseISO(f.created_at), 'yyyy-MM-dd') === date).length
        };
      });

      // AI usage trend
      const aiUsageTrend = dates.map(date => {
        const dayChats = aiChats.filter(c => 
          format(parseISO(c.created_at), 'yyyy-MM-dd') === date
        );
        const dayTokenUsage = tokenUsage.filter(t => t.day === date);
        return {
          date,
          conversations: new Set(dayChats.map(c => c.visitor_session_id || c.visitor_id)).size,
          messages: dayChats.length,
          tokens: dayTokenUsage.reduce((sum, t) => sum + (Number(t.total_tokens) || 0), 0)
        };
      });

      // Revenue trend
      const totalPlatformRevenue = platformProductFees + platformSubscriptionFees + totalTokenRevenue;
      const revenueTrend = dates.map(date => {
        const productFees = productSalesTrend.find(p => p.date === date)?.fees || 0;
        const subRevenue = (subscriptionTrend.find(s => s.date === date)?.revenue || 0) * 0.5;
        const tokenRev = tokenUsageTrend.find(t => t.date === date)?.revenue || 0;
        return {
          date,
          products: productFees,
          subscriptions: subRevenue,
          tokens: tokenRev,
          total: productFees + subRevenue + tokenRev
        };
      });

      // Top sellers
      const sellerRevenueMap = new Map<string, { revenue: number; sales: number }>();
      completedOrders.forEach(order => {
        const current = sellerRevenueMap.get(order.seller_id) || { revenue: 0, sales: 0 };
        sellerRevenueMap.set(order.seller_id, {
          revenue: current.revenue + (order.seller_earnings || 0),
          sales: current.sales + 1
        });
      });

      const topSellers = Array.from(sellerRevenueMap.entries())
        .map(([sellerId, data]) => {
          const user = users.find(u => u.id === sellerId);
          return {
            id: sellerId,
            name: user?.full_name || 'Unknown',
            email: user?.email || '',
            revenue: data.revenue,
            sales: data.sales
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Top creators
      const topCreators = users
        .map(u => ({
          id: u.id,
          name: u.full_name || 'Unknown',
          followers: u.followers_count || 0,
          engagement: (u.followers_count || 0) * 10 // Simplified engagement score
        }))
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 10);

      setAnalytics({
        // Users
        totalUsers: users.length,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        userGrowthTrend,
        activeUsers: users.filter(u => u.created_at && u.created_at >= monthAgo).length,

        // Products
        totalProducts: products.length,
        publishedProducts: products.filter(p => p.status === 'published').length,
        totalProductSales: completedOrders.length,
        totalProductRevenue,
        platformProductFees,
        productSalesTrend,
        topSellingProducts,

        // Orders
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        failedOrders: failedOrders.length,
        ordersTrend,

        // Subscriptions
        totalSubscriptions: subscriptions.length,
        activeSubscriptions,
        totalSubscriptionRevenue,
        platformSubscriptionFees,
        subscriptionTrend,

        // Tokens
        totalTokensSold,
        totalTokenRevenue,
        totalTokensUsed,
        tokenUsageTrend,

        // Virtual Collaboration
        totalEvents: events.length,
        totalBookings: 0,
        collaborationRevenue: 0,
        collaborationTrend: dates.map(date => ({ date, events: 0, bookings: 0, revenue: 0 })),

        // Engagement
        totalPosts: posts.length,
        totalLikes: likes.length,
        totalComments: comments.length,
        totalFollows: follows.length,
        engagementTrend,

        // AI
        totalAIConversations: new Set(aiChats.map(c => c.visitor_session_id || c.visitor_id)).size,
        totalAIMessages: aiChats.length,
        aiUsageTrend,

        // Revenue
        totalPlatformRevenue,
        revenueTrend,

        // Geographic
        usersByCountry: [], // Would need user location data

        // Top performers
        topSellers,
        topCreators
      });

    } catch (error) {
      console.error('Error fetching platform analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    fetchPlatformAnalytics();
  }, [fetchPlatformAnalytics]);

  return {
    analytics,
    loading,
    refetch: fetchPlatformAnalytics
  };
};
