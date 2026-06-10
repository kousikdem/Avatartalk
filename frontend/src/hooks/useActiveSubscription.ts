import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveSubscription {
  id: string;
  subscriber_id: string;
  subscribed_to_id: string;
  plan_id: string;
  status: string;
  expires_at: string | null;
  subscription_type: string;
  plan?: {
    title: string;
    badge: {
      text: string;
      color: string;
    } | null;
  };
}

export const useActiveSubscription = (subscriberId?: string, subscribedToId?: string) => {
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subscriberId || !subscribedToId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            id,
            subscriber_id,
            subscribed_to_id,
            plan_id,
            status,
            expires_at,
            subscription_type
          `)
          .eq('subscriber_id', subscriberId)
          .eq('subscribed_to_id', subscribedToId)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Fetch plan details for badge
          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('title, badge')
            .eq('id', data.plan_id)
            .single();

          setSubscription({
            ...data,
            plan: planData ? {
              title: planData.title,
              badge: planData.badge as { text: string; color: string } | null
            } : undefined
          });
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Real-time subscription updates — wrapped in try/catch and using a
    // unique channel name so React StrictMode double-mount can't crash
    // the page with "cannot add postgres_changes callbacks after subscribe()".
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      const channelName = `subscription-${subscriberId}-${subscribedToId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `subscriber_id=eq.${subscriberId}`
          },
          () => {
            fetchSubscription();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[useActiveSubscription] realtime subscription skipped:', (err as Error)?.message);
    }

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
  }, [subscriberId, subscribedToId]);

  const isActiveSubscriber = subscription?.status === 'active' && 
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date());

  return {
    subscription,
    isActiveSubscriber,
    loading,
    badgeConfig: subscription?.plan?.badge || { text: 'Subscriber', color: '#6366f1' }
  };
};
