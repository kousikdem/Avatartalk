
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  subscriber_id: string;
  subscribed_to_id: string;
  subscription_type: string;
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  expires_at?: string;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch subscriptions where current user is the subscribed_to
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscribed_to_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      setSubscriptions(data || []);
      setSubscriberCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (subscribedToId: string, price: number = 9.99) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to subscribe",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('subscriptions')
        .insert([{
          subscriber_id: user.id,
          subscribed_to_id: subscribedToId,
          price: price,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully subscribed!",
      });

      await fetchSubscriptions();
      return true;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    subscriberCount,
    loading,
    createSubscription,
    refetch: fetchSubscriptions
  };
};
