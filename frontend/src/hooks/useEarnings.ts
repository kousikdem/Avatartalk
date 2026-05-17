import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';

export interface SaleItem {
  id: string;
  type: 'product' | 'virtual_collab' | 'post' | 'subscription';
  title: string;
  /** Earning in INR base (already normalized). Used for aggregation/conversion. */
  amount: number;
  /** Original amount in `currency` (in major units, e.g. rupees/dollars). */
  originalAmount: number;
  /** Currency code of the original payment (e.g. INR, USD). */
  currency: string;
  buyerName: string;
  createdAt: string;
}

export interface EarningsData {
  /** All values are in INR (base). UI converts to display currency via useCurrency.formatPrice */
  totalEarnings: number;
  productEarnings: number;
  virtualCollabEarnings: number;
  postEarnings: number;
  subscriptionEarnings: number;
  recentSales: SaleItem[];
}

/**
 * Database amounts (orders.seller_earnings, orders.amount, post_unlocks.payment_amount,
 * subscriptions.price) are stored in the smallest unit of their currency
 * (paise for INR, cents for USD, etc.). We convert them to major units first,
 * then normalise to INR using current exchange rates.
 */
const toMajorUnits = (raw: number, currency: string): number => {
  if (!raw || isNaN(raw)) return 0;
  const code = (currency || 'INR').toUpperCase();
  // JPY has no sub-unit
  if (code === 'JPY') return raw;
  // Heuristic: if value is suspiciously small (< 10) treat as already-major (rupees/dollars),
  // otherwise treat as minor (paise/cents). All our flows store as minor units (paise/cents),
  // so default to /100.
  return raw / 100;
};

export const useEarnings = () => {
  const { convertAnyToINR } = useCurrency();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    productEarnings: 0,
    virtualCollabEarnings: 0,
    postEarnings: 0,
    subscriptionEarnings: 0,
    recentSales: [],
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchEarnings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      const uid = session.user.id;
      setUserId(uid);

      // Fetch orders as seller
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', uid)
        .in('payment_status', ['captured', 'completed', 'paid'])
        .order('created_at', { ascending: false });

      // Fetch subscriptions to this user
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscribed_to_id', uid)
        .eq('status', 'active');

      // Fetch paid post unlocks (posts owned by this user)
      const { data: postUnlocks } = await supabase
        .from('post_unlocks')
        .select('id, post_id, payment_amount, payment_currency, unlocked_at')
        .order('unlocked_at', { ascending: false });

      // Fetch user's posts to filter unlocks for own posts
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id, title')
        .eq('user_id', uid);

      // Fetch products to categorize orders
      const { data: products } = await supabase
        .from('products')
        .select('id, title, product_type')
        .eq('user_id', uid);

      const productMap = new Map(products?.map(p => [p.id, p]) || []);
      const postMap = new Map(userPosts?.map(p => [p.id, p]) || []);
      const userPostIds = new Set(userPosts?.map(p => p.id) || []);
      const allOrders = orders || [];
      const allSubs = subscriptions || [];

      let productEarnings = 0;
      let virtualCollabEarnings = 0;
      let postEarnings = 0;
      const recentSales: SaleItem[] = [];

      allOrders.forEach((order: any) => {
        const product = productMap.get(order.product_id);
        const rawEarning = Number(order.seller_earnings) || 0;
        const currency = (order.currency || 'INR').toUpperCase();
        const originalMajor = toMajorUnits(rawEarning, currency);
        const inrAmount = convertAnyToINR(originalMajor, currency);

        const type = product?.product_type === 'virtual_meeting' ? 'virtual_collab' : 'product';
        if (type === 'virtual_collab') {
          virtualCollabEarnings += inrAmount;
        } else {
          productEarnings += inrAmount;
        }

        recentSales.push({
          id: order.id,
          type,
          title: product?.title || 'Product',
          amount: inrAmount,
          originalAmount: originalMajor,
          currency,
          buyerName: 'Buyer',
          createdAt: order.created_at,
        });
      });

      // Process paid post unlocks for this user's posts
      const ownPostUnlocks = (postUnlocks || []).filter((u: any) => userPostIds.has(u.post_id));
      ownPostUnlocks.forEach((unlock: any) => {
        const postInfo = postMap.get(unlock.post_id);
        const currency = (unlock.payment_currency || 'INR').toUpperCase();
        const rawAmount = Number(unlock.payment_amount) || 0;
        const originalMajor = toMajorUnits(rawAmount, currency);
        const platformFee = originalMajor * 0.1; // 10% platform fee
        const earningOriginal = originalMajor - platformFee;
        const inrAmount = convertAnyToINR(earningOriginal, currency);
        postEarnings += inrAmount;

        recentSales.push({
          id: unlock.id,
          type: 'post',
          title: postInfo?.title || 'Paid Post',
          amount: inrAmount,
          originalAmount: earningOriginal,
          currency,
          buyerName: 'Buyer',
          createdAt: unlock.unlocked_at,
        });
      });

      let subscriptionEarnings = 0;
      allSubs.forEach((sub: any) => {
        const currency = (sub.currency || 'INR').toUpperCase();
        const rawPrice = Number(sub.price) || 0;
        // subscriptions.price could be stored in major units in some setups — treat conservatively
        const originalMajor = toMajorUnits(rawPrice, currency);
        const inrAmount = convertAnyToINR(originalMajor, currency);
        subscriptionEarnings += inrAmount;
        recentSales.push({
          id: sub.id,
          type: 'subscription',
          title: 'Subscription',
          amount: inrAmount,
          originalAmount: originalMajor,
          currency,
          buyerName: 'Subscriber',
          createdAt: sub.created_at,
        });
      });

      // Sort by date
      recentSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalEarnings = productEarnings + virtualCollabEarnings + postEarnings + subscriptionEarnings;

      setEarnings({
        totalEarnings,
        productEarnings,
        virtualCollabEarnings,
        postEarnings,
        subscriptionEarnings,
        recentSales: recentSales.slice(0, 50),
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  }, [convertAnyToINR]);

  // Real-time subscription for orders
  useEffect(() => {
    fetchEarnings();

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const channel = supabase
        .channel('earnings-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${session.user.id}`
        }, () => fetchEarnings())
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `subscribed_to_id=eq.${session.user.id}`
        }, () => fetchEarnings())
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'post_unlocks',
        }, () => fetchEarnings())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    let cleanup: (() => void) | undefined;
    setupRealtime().then(fn => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [fetchEarnings]);

  return { earnings, loading, userId, refetch: fetchEarnings };
};
