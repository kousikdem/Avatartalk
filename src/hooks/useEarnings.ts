import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EarningsData {
  totalEarnings: number;
  productEarnings: number;
  virtualCollabEarnings: number;
  postEarnings: number;
  subscriptionEarnings: number;
  recentSales: Array<{
    id: string;
    type: 'product' | 'virtual_collab' | 'post' | 'subscription';
    title: string;
    amount: number;
    buyerName: string;
    createdAt: string;
  }>;
}

export const useEarnings = () => {
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
        .eq('payment_status', 'captured')
        .order('created_at', { ascending: false });

      // Fetch subscriptions to this user
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscribed_to_id', uid)
        .eq('status', 'active');

      // Fetch products to categorize orders
      const { data: products } = await supabase
        .from('products')
        .select('id, title, product_type')
        .eq('user_id', uid);

      const productMap = new Map(products?.map(p => [p.id, p]) || []);
      const allOrders = orders || [];
      const allSubs = subscriptions || [];

      let productEarnings = 0;
      let virtualCollabEarnings = 0;
      let postEarnings = 0;
      const recentSales: EarningsData['recentSales'] = [];

      allOrders.forEach(order => {
        const product = productMap.get(order.product_id);
        const earning = order.seller_earnings || 0;
        const type = product?.product_type === 'virtual_meeting' ? 'virtual_collab' : 'product';
        
        if (type === 'virtual_collab') {
          virtualCollabEarnings += earning;
        } else {
          productEarnings += earning;
        }

        recentSales.push({
          id: order.id,
          type,
          title: product?.title || 'Product',
          amount: earning,
          buyerName: 'Buyer',
          createdAt: order.created_at,
        });
      });

      const subscriptionEarnings = allSubs.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

      allSubs.forEach(sub => {
        recentSales.push({
          id: sub.id,
          type: 'subscription',
          title: 'Subscription',
          amount: Number(sub.price) || 0,
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
  }, []);

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
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    let cleanup: (() => void) | undefined;
    setupRealtime().then(fn => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [fetchEarnings]);

  return { earnings, loading, userId, refetch: fetchEarnings };
};
