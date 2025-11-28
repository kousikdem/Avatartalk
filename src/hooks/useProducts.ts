
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views_count'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [data as Product, ...prev]);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
      throw error;
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

  useEffect(() => {
    fetchProducts();

    // Set up realtime subscription for products
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev]);
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    products,
    isLoading,
    fetchProducts,
    createProduct,
    uploadThumbnail,
  };
};
