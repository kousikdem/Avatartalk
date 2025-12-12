import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price_inr: number;
  price_usd: number | null;
  is_popular: boolean;
  bonus_tokens: number;
}

interface TokenEvent {
  id: string;
  change: number;
  balance_after: number;
  reason: string;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
}

interface DailyUsage {
  day: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  message_count: number;
}

export const useTokens = () => {
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [monthlyQuota, setMonthlyQuota] = useState<number>(0);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [events, setEvents] = useState<TokenEvent[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTokenBalance = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('token_balance, monthly_token_quota')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching token balance:', error);
        return;
      }
      setTokenBalance(data?.token_balance ?? 0);
      setMonthlyQuota(data?.monthly_token_quota ?? 0);
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('tokens', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('token_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching token events:', error);
    }
  }, []);

  const fetchDailyUsage = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_token_usage')
        .select('*')
        .eq('user_id', user.id)
        .order('day', { ascending: false })
        .limit(30);

      if (error) throw error;
      setDailyUsage(data || []);
    } catch (error) {
      console.error('Error fetching daily usage:', error);
    }
  }, []);

  const purchaseTokens = async (packageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase tokens",
          variant: "destructive"
        });
        return null;
      }

      const selectedPackage = packages.find(p => p.id === packageId);
      if (!selectedPackage) {
        toast({
          title: "Package Not Found",
          description: "Selected token package not found",
          variant: "destructive"
        });
        return null;
      }

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('token-purchase-create-order', {
        body: {
          packageId,
          userId: user.id
        }
      });

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create order');
      }

      return {
        orderId: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: orderData.key_id,
        packageId,
        tokens: selectedPackage.tokens + selectedPackage.bonus_tokens
      };
    } catch (error) {
      console.error('Error creating token purchase:', error);
      toast({
        title: "Purchase Error",
        description: error instanceof Error ? error.message : "Failed to initiate purchase",
        variant: "destructive"
      });
      return null;
    }
  };

  const verifyPurchase = async (
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    packageId: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.functions.invoke('token-purchase-verify', {
        body: {
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          razorpay_signature: razorpaySignature,
          package_id: packageId,
          user_id: user.id
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Payment verification failed');
      }

      toast({
        title: "Purchase Successful!",
        description: `${data.tokens_credited} tokens have been added to your account`,
      });

      // Refresh balance
      await fetchTokenBalance();
      await fetchEvents();

      return true;
    } catch (error) {
      console.error('Error verifying purchase:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Payment verification failed",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTokenBalance(),
        fetchPackages(),
        fetchEvents(),
        fetchDailyUsage()
      ]);
      setLoading(false);
    };

    loadData();

    // Subscribe to token balance changes
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('token-balance-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          if (payload.new && 'token_balance' in payload.new) {
            setTokenBalance(payload.new.token_balance as number);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [fetchTokenBalance, fetchPackages, fetchEvents, fetchDailyUsage]);

  return {
    tokenBalance,
    monthlyQuota,
    packages,
    events,
    dailyUsage,
    loading,
    purchaseTokens,
    verifyPurchase,
    refetch: fetchTokenBalance
  };
};
