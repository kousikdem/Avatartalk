import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VirtualProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  product_type: 'one_to_one' | 'webinar' | 'brand_collaboration' | 'recurring';
  price: number;
  currency: string;
  duration_mins: number;
  capacity: number;
  provider: 'google_meet' | 'zoom' | 'manual';
  auto_generate_link: boolean;
  status: 'draft' | 'published' | 'hidden';
  timezone: string;
  scheduling_mode: 'scheduled' | 'instant' | 'recurring';
  available_slots: any[];
  booking_form_fields: any[];
  refund_policy: string;
  refund_days: number;
  thumbnail_url?: string;
  event_date?: string;
  manual_link?: string;
  join_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VirtualBooking {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  scheduled_at: string;
  duration_mins: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'captured' | 'refunded';
  amount: number;
  platform_fee: number;
  seller_earnings: number;
  join_url?: string;
  meeting_id?: string;
  buyer_info: any;
  promo_code_id?: string;
  discount_amount?: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
}

export interface HostIntegrations {
  id: string;
  user_id: string;
  google_connected: boolean;
  google_email?: string;
  zoom_connected: boolean;
  zoom_email?: string;
  calendar_sync_enabled: boolean;
}

export const useVirtualCollaborations = () => {
  const [products, setProducts] = useState<VirtualProduct[]>([]);
  const [bookings, setBookings] = useState<VirtualBooking[]>([]);
  const [integrations, setIntegrations] = useState<HostIntegrations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch virtual collaboration products from events table
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform events to virtual products format
      const virtualProducts: VirtualProduct[] = (data || []).map(event => ({
        id: event.id,
        user_id: event.user_id,
        title: event.title,
        description: event.description || '',
        product_type: (event.event_type as any) || 'one_to_one',
        price: 0, // Will be stored in metadata
        currency: 'INR',
        duration_mins: Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000),
        capacity: (event.attendees as any[])?.length || 10,
        provider: event.location?.includes('Zoom') ? 'zoom' : event.location?.includes('Manual') ? 'manual' : 'google_meet',
        auto_generate_link: true,
        status: event.status === 'upcoming' ? 'published' : 'draft',
        timezone: 'Asia/Kolkata',
        scheduling_mode: 'scheduled',
        available_slots: [],
        booking_form_fields: [],
        refund_policy: '24 hour full refund',
        refund_days: 1,
        thumbnail_url: event.thumbnail_url,
        event_date: event.start_time,
        join_url: event.location?.startsWith('http') ? event.location : undefined,
        created_at: event.created_at,
        updated_at: event.updated_at
      }));

      setProducts(virtualProducts);
    } catch (error) {
      console.error('Error fetching virtual products:', error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, use orders table filtered by virtual collaboration products
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform orders to bookings format
      const virtualBookings: VirtualBooking[] = (data || [])
        .filter(order => (order.metadata as any)?.is_virtual_collaboration)
        .map(order => ({
          id: order.id,
          product_id: order.product_id || '',
          buyer_id: order.buyer_id,
          seller_id: order.seller_id,
          scheduled_at: (order.metadata as any)?.scheduled_at || order.created_at,
          duration_mins: (order.metadata as any)?.duration_mins || 60,
          status: order.order_status as any,
          payment_status: order.payment_status as any,
          amount: order.amount,
          platform_fee: order.platform_fee || 0,
          seller_earnings: order.seller_earnings || 0,
          join_url: (order.metadata as any)?.join_url,
          meeting_id: (order.metadata as any)?.meeting_id,
          buyer_info: (order.metadata as any)?.buyer_info || {},
          promo_code_id: (order.metadata as any)?.promo_code_id,
          discount_amount: order.discount_amount || 0,
          razorpay_order_id: order.razorpay_order_id,
          razorpay_payment_id: order.razorpay_payment_id,
          created_at: order.created_at
        }));

      setBookings(virtualBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, []);

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

      if (data) {
        setIntegrations({
          id: data.id,
          user_id: data.user_id,
          google_connected: data.google_connected || false,
          google_email: data.google_email || undefined,
          zoom_connected: data.zoom_connected || false,
          zoom_email: data.zoom_email || undefined,
          calendar_sync_enabled: data.calendar_sync_enabled || false
        });
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  }, []);

  const createProduct = async (productData: Partial<VirtualProduct>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + (productData.duration_mins || 60));

      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: productData.title,
          description: productData.description,
          event_type: productData.product_type,
          start_time: new Date().toISOString(),
          end_time: endTime.toISOString(),
          location: productData.provider === 'google_meet' ? 'Google Meet' : productData.provider === 'zoom' ? 'Zoom' : 'Virtual',
          status: productData.status === 'published' ? 'upcoming' : 'draft',
          attendees: []
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Product created",
        description: "Your virtual collaboration has been created successfully.",
      });

      fetchProducts();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create virtual collaboration.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<VirtualProduct>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          event_type: updates.product_type,
          status: updates.status === 'published' ? 'upcoming' : 'draft',
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product updated",
        description: "Your virtual collaboration has been updated.",
      });

      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update virtual collaboration.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      
      toast({
        title: "Product deleted",
        description: "Your virtual collaboration has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const connectGoogle = async () => {
    toast({
      title: "Coming Soon",
      description: "Google Meet & Calendar integration will be available soon.",
    });
  };

  const connectZoom = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: "Error",
          description: "Please log in to connect Zoom.",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('user-zoom-oauth', {
        body: {},
        headers: {},
      });

      // Use direct fetch with query params
      const response = await fetch(
        `https://hnxnvdzrwbtmcohdptfq.supabase.co/functions/v1/user-zoom-oauth?action=get_auth_url`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get Zoom auth URL');
      }

      const result = await response.json();
      return result.auth_url;
    } catch (error: any) {
      console.error('Zoom connect error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate Zoom connection.",
        variant: "destructive"
      });
      return null;
    }
  };

  const createZoomMeeting = async (topic: string, durationMins: number, startTime?: string, timezone?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://hnxnvdzrwbtmcohdptfq.supabase.co/functions/v1/user-zoom-oauth?action=create_meeting`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic,
            duration_mins: durationMins,
            start_time: startTime,
            timezone,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meeting');
      }

      const result = await response.json();
      return result.meeting;
    } catch (error: any) {
      console.error('Create Zoom meeting error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create Zoom meeting.",
        variant: "destructive"
      });
      return null;
    }
  };

  const disconnectZoom = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://hnxnvdzrwbtmcohdptfq.supabase.co/functions/v1/user-zoom-oauth?action=disconnect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to disconnect Zoom');
      }

      toast({
        title: "Disconnected",
        description: "Zoom has been disconnected successfully.",
      });

      fetchIntegrations();
    } catch (error: any) {
      console.error('Disconnect Zoom error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Zoom.",
        variant: "destructive"
      });
    }
  };

  const disconnectIntegration = async (provider: 'google' | 'zoom') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = provider === 'google' 
        ? { google_connected: false, google_email: null }
        : { zoom_connected: false, zoom_email: null };

      const { error } = await supabase
        .from('host_integrations')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchBookings(), fetchIntegrations()]);
      setIsLoading(false);
    };
    init();
  }, [fetchProducts, fetchBookings, fetchIntegrations]);

  return {
    products,
    bookings,
    integrations,
    isLoading,
    fetchProducts,
    fetchBookings,
    fetchIntegrations,
    createProduct,
    updateProduct,
    deleteProduct,
    connectGoogle,
    connectZoom,
    createZoomMeeting,
    disconnectZoom,
    disconnectIntegration
  };
};
