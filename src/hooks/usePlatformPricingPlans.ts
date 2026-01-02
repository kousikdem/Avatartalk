import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlatformFeature {
  icon: string;
  text: string;
  coming_soon?: boolean;
}

export interface PlatformPricingPlan {
  id: string;
  plan_key: string;
  plan_name: string;
  tagline: string | null;
  price_inr: number;
  price_usd: number;
  billing_cycle: string;
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  price_3_month_inr: number | null;
  price_6_month_inr: number | null;
  price_12_month_inr: number | null;
  price_3_month_usd: number | null;
  price_6_month_usd: number | null;
  price_12_month_usd: number | null;
  discount_3_month: number | null;
  discount_6_month: number | null;
  discount_12_month: number | null;
  ai_tokens_monthly: number;
  avatar_type: string;
  voice_minutes_monthly: number;
  voice_clone_enabled: boolean;
  custom_voice_enabled: boolean;
  training_storage_mb: number;
  doc_upload_enabled: boolean;
  web_training_enabled: boolean;
  qa_training_enabled: boolean;
  digital_products_enabled: boolean;
  physical_products_enabled: boolean;
  payments_enabled: boolean;
  promo_codes_enabled: boolean;
  subscription_button_enabled: boolean;
  multi_currency_enabled: boolean;
  basic_analytics: boolean;
  advanced_analytics: boolean;
  earnings_analytics: boolean;
  zoom_integration: boolean;
  google_calendar_readonly: boolean;
  google_calendar_full: boolean;
  google_meet_integration: boolean;
  api_access: boolean;
  shopify_integration: boolean;
  virtual_meetings_enabled: boolean;
  events_enabled: boolean;
  brand_collaborations: boolean;
  paid_events_enabled: boolean;
  team_enabled: boolean;
  multiple_admins: boolean;
  max_team_members: number;
  multilingual_ai: boolean;
  priority_ai_processing: boolean;
  unlimited_training_sources: boolean;
  multiple_avatars_per_profile: boolean;
  max_avatars: number;
  features_list: PlatformFeature[];
  offer_text: string | null;
  offer_badge: string | null;
  offer_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPlatformSubscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  plan_key: string;
  status: string;
  billing_cycle_months: number;
  price_paid: number;
  currency: string;
  starts_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export const usePlatformPricingPlans = () => {
  const [plans, setPlans] = useState<PlatformPricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlans((data || []) as unknown as PlatformPricingPlan[]);
    } catch (error) {
      console.error('Error fetching platform plans:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    refetch: fetchPlans
  };
};

export const useUserPlatformSubscription = () => {
  const [subscription, setSubscription] = useState<UserPlatformSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlatformPricingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_platform_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription(data as unknown as UserPlatformSubscription);
        
        // Fetch current plan details
        if (data.plan_id) {
          const { data: planData } = await supabase
            .from('platform_pricing_plans')
            .select('*')
            .eq('id', data.plan_id)
            .single();
          
          if (planData) {
            setCurrentPlan(planData as unknown as PlatformPricingPlan);
          }
        }
      } else {
        // User has no subscription, they're on free plan
        const { data: freePlan } = await supabase
          .from('platform_pricing_plans')
          .select('*')
          .eq('plan_key', 'free')
          .single();
        
        if (freePlan) {
          setCurrentPlan(freePlan as unknown as PlatformPricingPlan);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = subscription?.expires_at 
    ? new Date(subscription.expires_at) < new Date() 
    : false;

  const effectivePlanKey = isExpired ? 'free' : (subscription?.plan_key || 'free');

  useEffect(() => {
    fetchSubscription();

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  return {
    subscription,
    currentPlan,
    effectivePlanKey,
    isExpired,
    loading,
    refetch: fetchSubscription
  };
};

export const usePlatformPlanManagement = () => {
  const { toast } = useToast();

  // Token amounts per plan
  const planTokens: Record<string, number> = {
    free: 10000,
    creator: 1000000,  // 1M
    pro: 2000000,      // 2M
    business: 5000000, // 5M
  };

  const createPlan = async (planData: { plan_key: string; plan_name: string; [key: string]: unknown }) => {
    try {
      const { error } = await supabase
        .from('platform_pricing_plans')
        .insert([planData]);

      if (error) throw error;
      toast({ title: "Success", description: "Plan created successfully" });
      return true;
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({ title: "Error", description: "Failed to create plan", variant: "destructive" });
      return false;
    }
  };

  const updatePlan = async (planId: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from('platform_pricing_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;
      toast({ title: "Success", description: "Plan updated successfully" });
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({ title: "Error", description: "Failed to update plan", variant: "destructive" });
      return false;
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('platform_pricing_plans')
        .update({ is_active: false })
        .eq('id', planId);

      if (error) throw error;
      toast({ title: "Success", description: "Plan deactivated" });
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" });
      return false;
    }
  };

  const addTokensToUser = async (userId: string, tokensToAdd: number, reason: string = 'plan_activation') => {
    try {
      // Get current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = profile?.token_balance || 0;
      const newBalance = currentBalance + tokensToAdd;

      // Update token balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          token_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log the token event
      await supabase
        .from('token_events')
        .insert([{
          user_id: userId,
          change: tokensToAdd,
          balance_after: newBalance,
          reason: reason,
        }]);

      return true;
    } catch (error) {
      console.error('Error adding tokens:', error);
      return false;
    }
  };

  const upgradeUserPlan = async (userId: string, planKey: string, planId: string, isFirstTime: boolean = false) => {
    try {
      // Check if user has existing subscription
      const { data: existing } = await supabase
        .from('user_platform_subscriptions')
        .select('id, plan_key')
        .eq('user_id', userId)
        .maybeSingle();

      const previousPlanKey = existing?.plan_key || 'free';
      const isUpgrade = existing ? true : false;

      const subscriptionData = {
        user_id: userId,
        plan_id: planId,
        plan_key: planKey,
        status: 'active',
        billing_cycle_months: 1,
        price_paid: 0,
        starts_at: new Date().toISOString(),
        expires_at: planKey === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { upgraded_by_admin: true }
      };

      if (existing) {
        const { error } = await supabase
          .from('user_platform_subscriptions')
          .update(subscriptionData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_platform_subscriptions')
          .insert([subscriptionData]);
        if (error) throw error;
      }

      // Add tokens based on plan
      const tokensToAdd = planTokens[planKey] || 0;
      if (tokensToAdd > 0 && planKey !== 'free') {
        const reason = isUpgrade ? `plan_upgrade_${previousPlanKey}_to_${planKey}` : `plan_activation_${planKey}`;
        await addTokensToUser(userId, tokensToAdd, reason);
      }

      toast({ title: "Success", description: `User upgraded to ${planKey} plan with ${(tokensToAdd / 1000000).toFixed(1)}M tokens added` });
      return true;
    } catch (error) {
      console.error('Error upgrading user:', error);
      toast({ title: "Error", description: "Failed to upgrade user", variant: "destructive" });
      return false;
    }
  };

  const getAllPlans = async () => {
    const { data, error } = await supabase
      .from('platform_pricing_plans')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data as unknown as PlatformPricingPlan[];
  };

  return {
    createPlan,
    updatePlan,
    deletePlan,
    upgradeUserPlan,
    getAllPlans,
    addTokensToUser,
    planTokens,
  };
};
