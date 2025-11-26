import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  price_amount: number;
  currency: string;
  billing_cycle: string;
  trial_days: number | null;
  benefits: any;
  badge: any;
  active: boolean;
  require_follow: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubscriptionPlans = (profileId?: string) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlans = async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('profile_id', profileId)
        .eq('active', true)
        .order('price_amount', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<SubscriptionPlan, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('subscription_plans')
        .insert([{
          profile_id: user.id,
          title: planData.title,
          description: planData.description,
          price_amount: planData.price_amount,
          currency: planData.currency,
          billing_cycle: planData.billing_cycle,
          trial_days: planData.trial_days,
          benefits: planData.benefits,
          badge: planData.badge,
          active: planData.active ?? true,
          require_follow: planData.require_follow ?? true
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });

      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription plan",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePlan = async (planId: string, updates: Partial<SubscriptionPlan>) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });

      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ active: false })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription plan deactivated",
      });

      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription plan",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [profileId]);

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans
  };
};
