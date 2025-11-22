import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export const useQAPairs = () => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchQAPairs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('qa_pairs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQaPairs(data.map(item => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        category: item.category,
        tags: item.tags
      })));
    } catch (error) {
      console.error('Error fetching Q&A pairs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Q&A pairs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addQAPair = useCallback(async (qaPair: Omit<QAPair, 'id'>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('qa_pairs')
        .insert({
          user_id: user.id,
          question: qaPair.question,
          answer: qaPair.answer,
          category: qaPair.category,
          tags: qaPair.tags
        })
        .select()
        .single();

      if (error) throw error;

      const newPair = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        tags: data.tags
      };

      setQaPairs(prev => [newPair, ...prev]);
      
      toast({
        title: "Success",
        description: "Q&A pair added successfully",
      });

      return newPair;
    } catch (error) {
      console.error('Error adding Q&A pair:', error);
      toast({
        title: "Error",
        description: "Failed to add Q&A pair",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateQAPair = useCallback(async (id: string, updates: Partial<Omit<QAPair, 'id'>>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('qa_pairs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPair = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        tags: data.tags
      };

      setQaPairs(prev => prev.map(pair => 
        pair.id === id ? updatedPair : pair
      ));

      toast({
        title: "Success",
        description: "Q&A pair updated successfully",
      });
    } catch (error) {
      console.error('Error updating Q&A pair:', error);
      toast({
        title: "Error",
        description: "Failed to update Q&A pair",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteQAPair = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('qa_pairs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQaPairs(prev => prev.filter(pair => pair.id !== id));
      
      toast({
        title: "Success",
        description: "Q&A pair deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting Q&A pair:', error);
      toast({
        title: "Error",
        description: "Failed to delete Q&A pair",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    qaPairs,
    isLoading,
    fetchQAPairs,
    addQAPair,
    updateQAPair,
    deleteQAPair
  };
};