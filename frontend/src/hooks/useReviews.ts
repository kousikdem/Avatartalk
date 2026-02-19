import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductReview {
  id: string;
  product_id: string;
  buyer_id: string;
  order_id: string | null;
  rating: number;
  review_text: string | null;
  review_photos: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  buyer?: {
    username: string;
    display_name: string;
    profile_pic_url: string;
  };
}

export const useReviews = (productId?: string) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async (targetProductId?: string) => {
    const idToFetch = targetProductId || productId;
    if (!idToFetch) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          buyer:profiles!product_reviews_buyer_id_fkey (
            username,
            display_name,
            profile_pic_url
          )
        `)
        .eq('product_id', idToFetch)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as any || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createReview = async (reviewData: {
    productId: string;
    orderId: string;
    rating: number;
    reviewText?: string;
    reviewPhotos?: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: reviewData.productId,
          order_id: reviewData.orderId,
          buyer_id: user.id,
          rating: reviewData.rating,
          review_text: reviewData.reviewText,
          review_photos: reviewData.reviewPhotos || [],
          is_verified_purchase: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });

      await fetchReviews(reviewData.productId);
      return data;
    } catch (error: any) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReview = async (reviewId: string, updates: {
    rating?: number;
    reviewText?: string;
    reviewPhotos?: string[];
  }) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({
          rating: updates.rating,
          review_text: updates.reviewText,
          review_photos: updates.reviewPhotos,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review updated successfully!",
      });

      await fetchReviews();
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review deleted successfully!",
      });

      await fetchReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const uploadReviewPhoto = async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      const filePath = `review-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading review photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();

      // Set up real-time subscription
      const channel = supabase
        .channel('product-reviews-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_reviews',
            filter: `product_id=eq.${productId}`
          },
          () => {
            fetchReviews();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [productId]);

  return {
    reviews,
    isLoading,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    uploadReviewPhoto
  };
};