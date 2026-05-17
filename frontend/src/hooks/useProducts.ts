
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  user_id: string;
  title: string;
  product_type: string;
  description?: string;
  price?: number;
  is_free: boolean;
  free_for_subscribers?: boolean;
  status: string;
  thumbnail_url?: string;
  media_url?: string;
  media_type?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  
  // Extended fields
  product_category?: string;
  brand?: string;
  base_currency?: string;
  compare_at_price?: number;
  sku?: string;
  track_inventory?: boolean;
  inventory_quantity?: number;
  low_stock_threshold?: number;
  variants_enabled?: boolean;
  variants?: any[];
  shipping_enabled?: boolean;
  shipping_weight?: number;
  shipping_dimensions?: any;
  shipping_cost?: number;
  cod_enabled?: boolean;
  digital_assets?: any[];
  download_limit?: number;
  license_type?: string;
  seo_title?: string;
  seo_description?: string;
  slug?: string;
  tags?: string[];
  tax_class?: string;
  taxable?: boolean;
  shopify_product_id?: string;
  shopify_sync_enabled?: boolean;
  average_rating?: number | null;
  total_reviews?: number | null;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Only fetch products belonging to the authenticated user.
      // (Previously this fetched the entire products table, causing slow
      // loads and leaking other creators' data via RLS-friendly queries.)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProducts([]);
        setCurrentUserId(null);
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Failed to load products',
        description: error?.message || 'Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views_count'>) => {
    try {
      // Always stamp current user as owner (RLS requires it)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to create a product.');

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Failed to create product",
        description: error?.message || 'Please try again.',
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementViewCount = async (productId: string) => {
    try {
      await supabase.rpc('increment_product_views', {
        p_product_id: productId
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const uploadThumbnail = async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    }
  };

  const getProductById = useCallback((productId: string) => {
    return products.find(p => p.id === productId) || null;
  }, [products]);

  useEffect(() => {
    fetchProducts();

    let channel: any;
    let mounted = true;

    // Subscribe to realtime only for the current user's products to avoid
    // receiving updates for unrelated rows.
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      channel = supabase
        .channel('products-realtime-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setProducts(prev => {
                if (prev.some(p => p.id === (payload.new as any).id)) return prev;
                return [payload.new as Product, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              setProducts(prev => prev.map(product =>
                product.id === (payload.new as any).id ? payload.new as Product : product
              ));
            } else if (payload.eventType === 'DELETE') {
              setProducts(prev => prev.filter(product => product.id !== (payload.old as any).id));
            }
          }
        )
        .subscribe();
    })();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    currentUserId,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    incrementViewCount,
    uploadThumbnail,
    getProductById,
  };
};
