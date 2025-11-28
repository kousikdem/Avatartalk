import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  amount: number;
  currency: string;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  shipping_address?: any;
  order_status: string;
  fulfillment_status?: string | null;
  platform_fee: number;
  seller_earnings: number;
  metadata?: any;
  tracking_number?: string | null;
  order_notes?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const useOrders = (userId?: string, role: 'buyer' | 'seller' = 'buyer') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const column = role === 'buyer' ? 'buyer_id' : 'seller_id';
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async (checkoutData: {
    productId: string;
    variantId?: string;
    quantity?: number;
    shippingAddress?: any;
    discountCode?: string;
    currency?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('product-checkout', {
        body: checkoutData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout",
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifyPayment = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('product-payment-verify', {
        body: paymentData
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Error",
        description: "Payment verification failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to order changes
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: userId ? `${role === 'buyer' ? 'buyer_id' : 'seller_id'}=eq.${userId}` : undefined
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? payload.new as Order : order
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role]);

  return {
    orders,
    isLoading,
    fetchOrders,
    createCheckout,
    verifyPayment
  };
};