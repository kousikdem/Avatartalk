import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed' | 'free_shipping';
  discount_value: number;
  active: boolean;
  auto_apply: boolean;
  combinable: boolean;
  max_uses: number | null;
  current_uses: number;
  max_uses_per_user: number | null;
  min_order_value: number | null;
  min_quantity: number;
  starts_at: string | null;
  expires_at: string | null;
  applicable_product_ids: string[] | null;
  scope: string;
  seller_id: string;
  priority: number;
  target_buyer_type: string;
  target_product_type: string;
  free_shipping: boolean;
  flash_sale: boolean;
  recurring_schedule: any | null;
  created_by_type: string;
  analytics_data: {
    redemptions?: number;
    revenue_generated?: number;
    revenue_lost?: number;
    conversion_rate?: number;
  } | null;
  fraud_flags: any[] | null;
  targeting_rules: any;
  created_at: string;
  updated_at: string;
  description?: string | null;
}

export interface CreatePromoData {
  code: string;
  discount_type: 'percent' | 'fixed' | 'free_shipping';
  discount_value: number;
  description?: string;
  active?: boolean;
  auto_apply?: boolean;
  combinable?: boolean;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
  min_order_value?: number | null;
  min_quantity?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  applicable_product_ids?: string[] | null;
  scope?: string;
  priority?: number;
  target_buyer_type?: string;
  target_product_type?: string;
  free_shipping?: boolean;
  flash_sale?: boolean;
  targeting_rules?: any;
}

export const usePromos = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPromos = async (sellerId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('discount_codes')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPromos((data || []) as PromoCode[]);
    } catch (error) {
      console.error('Error fetching promos:', error);
      toast({
        title: "Error",
        description: "Failed to load promo codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPromo = async (promoData: CreatePromoData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('discount_codes')
        .insert([{
          ...promoData,
          seller_id: user.id,
          current_uses: 0,
          analytics_data: {
            redemptions: 0,
            revenue_generated: 0,
            revenue_lost: 0,
            conversion_rate: 0
          }
        }])
        .select()
        .single();

      if (error) throw error;

      setPromos(prev => [data as PromoCode, ...prev]);
      toast({
        title: "Success",
        description: "Promo code created successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating promo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePromo = async (promoId: string, updates: Partial<CreatePromoData>) => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .update(updates)
        .eq('id', promoId)
        .select()
        .single();

      if (error) throw error;

      setPromos(prev => prev.map(p => p.id === promoId ? data as PromoCode : p));
      toast({
        title: "Success",
        description: "Promo code updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating promo:', error);
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePromo = async (promoId: string) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', promoId);

      if (error) throw error;

      setPromos(prev => prev.filter(p => p.id !== promoId));
      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting promo:', error);
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      });
      throw error;
    }
  };

  const togglePromoStatus = async (promoId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ active })
        .eq('id', promoId);

      if (error) throw error;

      setPromos(prev => prev.map(p => p.id === promoId ? { ...p, active } : p));
      toast({
        title: "Success",
        description: `Promo ${active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling promo status:', error);
      toast({
        title: "Error",
        description: "Failed to update promo status",
        variant: "destructive",
      });
    }
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    const fetchUserPromos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchPromos(user.id);
      }
    };

    fetchUserPromos();

    const channel = supabase
      .channel('promo-codes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discount_codes'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPromos(prev => [payload.new as PromoCode, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPromos(prev => prev.map(promo => 
              promo.id === (payload.new as any).id ? payload.new as PromoCode : promo
            ));
          } else if (payload.eventType === 'DELETE') {
            setPromos(prev => prev.filter(promo => promo.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    promos,
    isLoading,
    fetchPromos,
    createPromo,
    updatePromo,
    deletePromo,
    togglePromoStatus,
    generatePromoCode,
  };
};