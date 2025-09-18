import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Eye, TrendingUp } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivity {
  id: string;
  type: 'follow' | 'visit' | 'like';
  user: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  timestamp: string;
}

interface RealtimeFollowWidgetProps {
  currentUserId?: string;
}

const RealtimeFollowWidget: React.FC<RealtimeFollowWidgetProps> = ({ currentUserId }) => {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [onlineFollowers, setOnlineFollowers] = useState<string[]>([]);
  const [showAllFollowers, setShowAllFollowers] = useState(false);
  
  const { 
    followers, 
    following, 
    followersCount, 
    followingCount, 
    loading,
    refetch 
  } = useFollows(currentUserId);

  // Real-time activity tracking
  useEffect(() => {
    if (!currentUserId) return;

    // Set up real-time subscriptions for follow activities
    const followsChannel = supabase
      .channel('follow-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${currentUserId}`
        },
        async (payload) => {
          // Fetch user info for new follower
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', payload.new.follower_id)
            .single();

          if (userProfile) {
            const newActivity: RecentActivity = {
              id: payload.new.id,
              type: 'follow',
              user: userProfile,
              timestamp: payload.new.created_at
            };
            
            setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
          }
          
          refetch();
        }
      )
      .subscribe();

    // Set up subscription for profile visits
    const visitsChannel = supabase
      .channel('profile-visits')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_visitors',
          filter: `visited_profile_id=eq.${currentUserId}`
        },
        async (payload) => {
          if (payload.new.visitor_id) {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', payload.new.visitor_id)
              .single();

            if (userProfile) {
              const newActivity: RecentActivity = {
                id: payload.new.id,
                type: 'visit',
                user: userProfile,
                timestamp: payload.new.visited_at
              };
              
              setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(visitsChannel);
    };
  }, [currentUserId, refetch]);

  // Fetch initial recent activity
  useEffect(() => {
    if (!currentUserId) return;

    const fetchRecentActivity = async () => {
      try {
        // Get recent follows
        const { data: recentFollows } = await supabase
          .from('follows')
          .select(`
            id,
            created_at,
            follower:profiles!follows_follower_id_fkey(username, display_name, avatar_url)
          `)
          .eq('following_id', currentUserId)
          .order('created_at', { ascending: false })
          .limit(3);

        // Get recent profile visits
        const { data: recentVisits } = await supabase
          .from('profile_visitors')
          .select(`
            id,
            visited_at,
            visitor:profiles!profile_visitors_visitor_id_fkey(username, display_name, avatar_url)
          `)
          .eq('visited_profile_id', currentUserId)
          .not('visitor_id', 'is', null)
          .order('visited_at', { ascending: false })
          .limit(2);

        const activities: RecentActivity[] = [];

        recentFollows?.forEach(follow => {
          if (follow.follower) {
            activities.push({
              id: follow.id,
              type: 'follow',
              user: follow.follower,
              timestamp: follow.created_at
            });
          }
        });

        recentVisits?.forEach(visit => {
          if (visit.visitor) {
            activities.push({
              id: visit.id,
              type: 'visit',
              user: visit.visitor,
              timestamp: visit.visited_at
            });
          }
        });

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    fetchRecentActivity();
  }, [currentUserId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'visit':
        return <Eye className="w-4 h-4 text-green-500" />;
      case 'like':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'follow':
        return `${activity.user.display_name || activity.user.username} started following you`;
      case 'visit':
        return `${activity.user.display_name || activity.user.username} visited your profile`;
      case 'like':
        return `${activity.user.display_name || activity.user.username} liked your post`;
      default:
        return `${activity.user.display_name || activity.user.username} interacted with you`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Activity
        </CardTitle>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Badge variant="secondary">{followersCount}</Badge>
            <span className="text-gray-600">Followers</span>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary">{followingCount}</Badge>
            <span className="text-gray-600">Following</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Recent Activity */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={activity.user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {(activity.user.display_name || activity.user.username)[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 truncate">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp))} ago
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent Followers */}
        {followers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Recent Followers</h4>
              {followers.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllFollowers(!showAllFollowers)}
                  className="text-xs"
                >
                  {showAllFollowers ? 'Show Less' : 'View All'}
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {(showAllFollowers ? followers : followers.slice(0, 3)).map((follow) => (
                <div key={follow.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={follow.follower?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {(follow.follower?.display_name || follow.follower?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {follow.follower?.display_name || follow.follower?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">@{follow.follower?.username || 'username'}</p>
                  </div>
                  {onlineFollowers.includes(follow.follower_id) && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeFollowWidget;