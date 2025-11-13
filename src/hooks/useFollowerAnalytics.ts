import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { subDays, format } from 'date-fns';

interface AnalyticsData {
  date: string;
  followers_gained: number;
  followers_lost: number;
  net_growth: number;
  total_followers: number;
}

interface GrowthStats {
  today: number;
  week: number;
  month: number;
  chartData: { date: string; followers: number }[];
}

export const useFollowerAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [growthStats, setGrowthStats] = useState<GrowthStats>({
    today: 0,
    week: 0,
    month: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async (days: number = 30) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      const targetUserId = userId || currentUser.user?.id;
      
      if (!targetUserId) return;

      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('follower_analytics')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (error) throw error;

      setAnalytics(data || []);

      // Calculate growth stats
      const today = data?.find(d => d.date === format(new Date(), 'yyyy-MM-dd'));
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      const weekData = data?.filter(d => d.date >= weekAgo) || [];
      const monthData = data?.filter(d => d.date >= monthAgo) || [];

      const weekGrowth = weekData.reduce((sum, d) => sum + d.net_growth, 0);
      const monthGrowth = monthData.reduce((sum, d) => sum + d.net_growth, 0);

      // Format chart data
      const chartData = (data || []).map(d => ({
        date: format(new Date(d.date), 'MMM dd'),
        followers: d.total_followers
      }));

      setGrowthStats({
        today: today?.net_growth || 0,
        week: weekGrowth,
        month: monthGrowth,
        chartData
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  return {
    analytics,
    growthStats,
    loading,
    refetchAnalytics: fetchAnalytics
  };
};
