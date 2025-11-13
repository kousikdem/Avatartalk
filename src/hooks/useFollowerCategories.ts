import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  category_name: string;
  description?: string;
  color: string;
  created_at: string;
}

interface CategoryAssignment {
  id: string;
  following_id: string;
  category_id: string;
  category?: Category;
}

export const useFollowerCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<CategoryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('follower_categories')
        .select('*')
        .eq('user_id', currentUser.user.id)
        .order('category_name');

      if (categoriesError) throw categoriesError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('follower_category_assignments')
        .select(`
          *,
          category:follower_categories(*)
        `)
        .eq('user_id', currentUser.user.id);

      if (assignmentsError) throw assignmentsError;

      setCategories(categoriesData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, description?: string, color?: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follower_categories')
        .insert({
          user_id: currentUser.user.id,
          category_name: name,
          description,
          color: color || '#6366f1'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category created successfully",
      });

      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('follower_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const assignToCategory = async (followingId: string, categoryId: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follower_category_assignments')
        .insert({
          user_id: currentUser.user.id,
          following_id: followingId,
          category_id: categoryId
        });

      if (error) throw error;

      await fetchCategories();
    } catch (error: any) {
      console.error('Error assigning category:', error);
    }
  };

  const removeFromCategory = async (followingId: string, categoryId: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follower_category_assignments')
        .delete()
        .eq('user_id', currentUser.user.id)
        .eq('following_id', followingId)
        .eq('category_id', categoryId);

      if (error) throw error;

      await fetchCategories();
    } catch (error: any) {
      console.error('Error removing from category:', error);
    }
  };

  const getCategoriesForFollowing = (followingId: string): Category[] => {
    return assignments
      .filter(a => a.following_id === followingId)
      .map(a => a.category)
      .filter((c): c is Category => c !== undefined);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    assignments,
    loading,
    createCategory,
    deleteCategory,
    assignToCategory,
    removeFromCategory,
    getCategoriesForFollowing,
    refetchCategories: fetchCategories
  };
};
