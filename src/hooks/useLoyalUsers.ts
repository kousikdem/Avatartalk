import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoyalUser {
  id: string;
  visitorId: string;
  username?: string;
  displayName: string;
  avatarUrl?: string;
  loyaltyScore: number;
  totalMessages: number;
  totalVisits: number;
  followUpsCompleted: number;
  lastInteractionAt: string;
  rank: number;
}

// Fixed loyalty score weights
const LOYALTY_WEIGHTS = {
  chatMessage: 2,
  profileVisit: 1, // Once per day
  responseTimeBonus: 1,
  followUpCompletion: 2
};

export const useLoyalUsers = (profileId: string | null, limit: number = 10) => {
  const [loyalUsers, setLoyalUsers] = useState<LoyalUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoyalUsers = useCallback(async () => {
    if (!profileId) return;

    try {
      setLoading(true);

      // Fetch chat memory data with engagement metrics - only registered users (visitor_id not null and not anonymous)
      const { data: memoryData, error: memoryError } = await supabase
        .from('ai_chat_memory')
        .select(`
          visitor_id,
          visitor_name,
          total_messages,
          session_count,
          follow_ups_completed,
          engagement_score,
          last_visit_at,
          first_visit_at
        `)
        .eq('profile_id', profileId)
        .not('visitor_id', 'is', null)
        .order('engagement_score', { ascending: false })
        .limit(limit * 2); // Fetch more to filter out anonymous

      if (memoryError) {
        console.error('Error fetching chat memory:', memoryError);
        return;
      }

      // Filter out anonymous visitors (those with visitor_id starting with 'anonymous' or null)
      const registeredMemory = memoryData?.filter(m => 
        m.visitor_id && 
        !m.visitor_id.startsWith('anonymous') && 
        !m.visitor_id.startsWith('anon-')
      ) || [];

      // Fetch profile visitors for visit counts
      const { data: visitorsData } = await supabase
        .from('profile_visitors')
        .select('visitor_id, visit_count')
        .eq('visited_profile_id', profileId)
        .not('visitor_id', 'is', null);

      const visitCountMap = new Map(
        visitorsData?.map(v => [v.visitor_id, v.visit_count || 1]) || []
      );

      // Get unique visitor IDs that have profiles
      const visitorIds = registeredMemory
        .map(m => m.visitor_id)
        .filter((id): id is string => !!id);

      if (visitorIds.length === 0) {
        setLoyalUsers([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for these visitors
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, profile_pic_url, avatar_url')
        .in('id', visitorIds);

      const profileMap = new Map(
        profilesData?.map(p => [p.id, p]) || []
      );

      // Calculate loyalty scores and build user list - ONLY registered users with profiles
      const users: LoyalUser[] = registeredMemory
        .filter(memory => memory.visitor_id && profileMap.has(memory.visitor_id))
        .map(memory => {
          const profile = profileMap.get(memory.visitor_id!);
          const visitCount = visitCountMap.get(memory.visitor_id!) || memory.session_count || 1;
          
          // Calculate raw loyalty score using fixed weights
          // Chat Messages * 2 + Profile Visits * 1 + Follow-up Completion * 2
          const rawScore = (
            (memory.total_messages || 0) * LOYALTY_WEIGHTS.chatMessage +
            visitCount * LOYALTY_WEIGHTS.profileVisit +
            (memory.follow_ups_completed || 0) * LOYALTY_WEIGHTS.followUpCompletion
          );

          return {
            id: memory.visitor_id!,
            visitorId: memory.visitor_id!,
            username: profile?.username,
            displayName: profile?.display_name || profile?.username || 'User',
            avatarUrl: profile?.profile_pic_url || profile?.avatar_url,
            loyaltyScore: rawScore,
            totalMessages: memory.total_messages || 0,
            totalVisits: visitCount,
            followUpsCompleted: memory.follow_ups_completed || 0,
            lastInteractionAt: memory.last_visit_at || memory.first_visit_at || new Date().toISOString(),
            rank: 0
          };
        });

      // Sort by loyalty score descending and assign ranks
      users.sort((a, b) => b.loyaltyScore - a.loyaltyScore);
      users.forEach((user, index) => {
        user.rank = index + 1;
      });

      setLoyalUsers(users.slice(0, limit));
    } catch (error) {
      console.error('Error fetching loyal users:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId, limit]);

  useEffect(() => {
    fetchLoyalUsers();
  }, [fetchLoyalUsers]);

  // Real-time updates
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`loyal-users-${profileId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_chat_memory',
          filter: `profile_id=eq.${profileId}`
        },
        () => {
          console.log('💎 Chat memory updated - refreshing loyal users');
          fetchLoyalUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_chat_history',
          filter: `profile_id=eq.${profileId}`
        },
        () => {
          console.log('💬 Chat history updated - refreshing loyal users');
          fetchLoyalUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_visitors'
        },
        () => {
          console.log('👁️ Profile visitors updated - refreshing loyal users');
          fetchLoyalUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchLoyalUsers]);

  return {
    loyalUsers,
    loading,
    refetch: fetchLoyalUsers
  };
};
