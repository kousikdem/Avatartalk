import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { callPaymentApi } from '@/lib/payment-api';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return;
      }
      const user = session.user;

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;

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

      // Create Razorpay order via FastAPI server-side endpoint
      const totalTokens = selectedPackage.tokens + selectedPackage.bonus_tokens;
      const orderData = await callPaymentApi<any>('/api/payment/token-purchase/create-order', {
        tokens: totalTokens,
        amount_inr: selectedPackage.price_inr,
        package_id: packageId,
      });

      return {
        orderId: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: orderData.key_id,
        purchaseId: orderData.purchase_id,
        packageId,
        tokens: totalTokens,
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
    _packageId: string,
    purchaseId?: string,
  ) => {
    try {
      const data = await callPaymentApi<any>('/api/payment/token-purchase/verify', {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: razorpaySignature,
        purchase_id: purchaseId,
      });

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

    // -----------------------------------------------------------------
    // Realtime subscription for token balance changes
    // -----------------------------------------------------------------
    // Bug fix (P2 backlog): the previous implementation declared an
    // `async setupSubscription()` that returned a cleanup function and
    // then called it from useEffect WITHOUT awaiting — so the cleanup
    // was lost and the channel name `token-balance-changes` was reused
    // across re-mounts. On React StrictMode double-mount the second
    // `.on(...)` registration fired AFTER the first `.subscribe()` had
    // already been called on the cached channel of the same name,
    // producing the `cannot add postgres_changes callbacks after
    // subscribe()` runtime error.
    //
    // Fix:
    //  1) Generate a unique channel name per mount.
    //  2) Capture the channel synchronously via a ref so the useEffect
    //     cleanup can always remove it.
    //  3) Wrap setup in try/catch — realtime failures must never crash
    //     the hook (token balance still loads via fetchTokenBalance).
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled || !session?.user) return;
        const user = session.user;

        const uniqueChannelName = `token-balance-changes:${user.id}:${
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2)
        }`;

        const ch = supabase.channel(uniqueChannelName);

        // IMPORTANT: register the `.on(...)` listener BEFORE `.subscribe()`.
        ch.on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        }, (payload) => {
          if (payload.new && 'token_balance' in payload.new) {
            setTokenBalance(payload.new.token_balance as number);
          }
        });

        ch.subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn(`[useTokens] realtime ${uniqueChannelName} status=${status}`);
          }
        });

        if (cancelled) {
          // hook unmounted between getSession() and here — clean up immediately
          supabase.removeChannel(ch);
          return;
        }
        channel = ch;
      } catch (err) {
        console.warn('[useTokens] realtime setup failed (non-fatal):', err);
      }
    })();

    return () => {
      cancelled = true;
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // ignore — realtime might already be torn down
        }
        channel = null;
      }
    };
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
