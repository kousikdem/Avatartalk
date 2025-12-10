import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VirtualProduct {
  id: string;
  user_id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  product_type: string;
  visibility: string;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  price_model: string;
  tax_rate: number | null;
  tax_inclusive: boolean | null;
  refund_policy: string | null;
  scheduling_mode: string;
  timezone: string;
  duration_mins: number;
  capacity: number;
  buffer_time_mins: number | null;
  min_booking_notice_hours: number | null;
  max_bookings_per_user: number | null;
  waitlist_enabled: boolean | null;
  waitlist_limit: number | null;
  meeting_provider: string;
  auto_generate_meeting_link: boolean | null;
  recording_allowed: boolean | null;
  join_link_visibility: string | null;
  booking_form_fields: any[];
  require_terms_consent: boolean | null;
  require_recording_consent: boolean | null;
  require_marketing_consent: boolean | null;
  send_calendar_invite: boolean | null;
  reminder_24h: boolean | null;
  reminder_1h: boolean | null;
  notify_host_on_booking: boolean | null;
  status: string;
  promo_codes_enabled: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface VirtualProductSlot {
  id: string;
  virtual_product_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface VirtualBooking {
  id: string;
  virtual_product_id: string;
  slot_id: string | null;
  buyer_id: string;
  seller_id: string;
  booking_status: string;
  booking_form_data: any;
  meeting_provider: string | null;
  meeting_id: string | null;
  join_url: string | null;
  password: string | null;
  calendar_event_id: string | null;
  amount: number;
  discount_amount: number | null;
  tax_amount: number | null;
  total_amount: number;
  currency: string;
  payment_status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  promo_code_id: string | null;
  platform_fee: number | null;
  seller_earnings: number | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostIntegration {
  id: string;
  user_id: string;
  google_connected: boolean;
  google_email: string | null;
  zoom_connected: boolean;
  zoom_email: string | null;
  calendar_sync_enabled: boolean;
  last_sync_at: string | null;
}

export const useVirtualProducts = () => {
  const [products, setProducts] = useState<VirtualProduct[]>([]);
  const [slots, setSlots] = useState<VirtualProductSlot[]>([]);
  const [bookings, setBookings] = useState<VirtualBooking[]>([]);
  const [integrations, setIntegrations] = useState<HostIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalEarnings: 0,
    totalProfit: 0,
    upcomingMeetings: 0,
    completedMeetings: 0
  });

  const fetchProducts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('virtual_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as VirtualProduct[]);
    } catch (error: any) {
      console.error('Error fetching virtual products:', error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch as seller
      const { data: sellerBookings, error: sellerError } = await supabase
        .from('virtual_bookings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (sellerError) throw sellerError;

      // Fetch as buyer
      const { data: buyerBookings, error: buyerError } = await supabase
        .from('virtual_bookings')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (buyerError) throw buyerError;

      const allBookings = [...(sellerBookings || []), ...(buyerBookings || [])];
      const uniqueBookings = allBookings.filter((booking, index, self) =>
        index === self.findIndex((b) => b.id === booking.id)
      );
      
      setBookings(uniqueBookings as VirtualBooking[]);

      // Calculate stats
      const paidBookings = uniqueBookings.filter(b => b.payment_status === 'paid' && b.seller_id === user.id);
      const totalSales = paidBookings.length;
      const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const platformFee = totalEarnings * 0.10; // 10% platform fee
      const totalProfit = totalEarnings - platformFee;
      const upcomingMeetings = uniqueBookings.filter(b => 
        b.booking_status === 'confirmed' && 
        new Date(b.scheduled_start || '') > new Date()
      ).length;
      const completedMeetings = uniqueBookings.filter(b => b.booking_status === 'completed').length;

      setStats({
        totalProducts: products.length,
        totalSales,
        totalEarnings: totalEarnings / 100,
        totalProfit: totalProfit / 100,
        upcomingMeetings,
        completedMeetings
      });
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  }, [products.length]);

  const fetchIntegrations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('host_integrations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIntegrations(data as HostIntegration | null);
    } catch (error: any) {
      console.error('Error fetching integrations:', error);
    }
  }, []);

  const createProduct = async (productData: Partial<VirtualProduct>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = {
        title: productData.title || 'Untitled',
        user_id: user.id,
        ...productData
      };

      const { data, error } = await supabase
        .from('virtual_products')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data as VirtualProduct, ...prev]);
      toast.success('Virtual product created successfully!');
      return data as VirtualProduct;
    } catch (error: any) {
      toast.error('Failed to create product: ' + error.message);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<VirtualProduct>) => {
    try {
      const { data, error } = await supabase
        .from('virtual_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? data as VirtualProduct : p));
      toast.success('Product updated successfully!');
      return data as VirtualProduct;
    } catch (error: any) {
      toast.error('Failed to update product: ' + error.message);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('virtual_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete product: ' + error.message);
      throw error;
    }
  };

  const createSlot = async (slotData: { virtual_product_id: string; start_time: string; end_time: string; capacity?: number }) => {
    try {
      const { data, error } = await supabase
        .from('virtual_product_slots')
        .insert([slotData])
        .select()
        .single();

      if (error) throw error;

      setSlots(prev => [...prev, data as VirtualProductSlot]);
      toast.success('Slot created successfully!');
      return data as VirtualProductSlot;
    } catch (error: any) {
      toast.error('Failed to create slot: ' + error.message);
      throw error;
    }
  };

  const fetchSlotsForProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('virtual_product_slots')
        .select('*')
        .eq('virtual_product_id', productId)
        .eq('is_available', true)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return (data || []) as VirtualProductSlot[];
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      return [];
    }
  };

  const saveIntegrations = async (updates: Partial<HostIntegration>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('host_integrations')
        .upsert({ user_id: user.id, ...updates })
        .select()
        .single();

      if (error) throw error;

      setIntegrations(data as HostIntegration);
      toast.success('Integration settings saved!');
      return data;
    } catch (error: any) {
      toast.error('Failed to save integrations: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchIntegrations()]);
      setLoading(false);
    };
    init();
  }, [fetchProducts, fetchIntegrations]);

  useEffect(() => {
    if (products.length > 0) {
      fetchBookings();
    }
  }, [products, fetchBookings]);

  return {
    products,
    slots,
    bookings,
    integrations,
    loading,
    stats,
    createProduct,
    updateProduct,
    deleteProduct,
    createSlot,
    fetchSlotsForProduct,
    saveIntegrations,
    refetch: async () => {
      await Promise.all([fetchProducts(), fetchBookings(), fetchIntegrations()]);
    }
  };
};
