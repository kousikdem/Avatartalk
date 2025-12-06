import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIFollowUp {
  id: string;
  user_id: string;
  topic_id: string | null;
  question_text: string;
  question_type: 'choice' | 'open' | 'rating' | 'boolean';
  choices: string[];
  conditions: Record<string, any>;
  probability_pct: number;
  max_per_session: number;
  cooldown_seconds: number;
  always_ask: boolean;
  is_active: boolean;
  presentation: 'inline' | 'modal' | 'suggest_button';
  analytics_id: string | null;
  analytics_description: string | null;
  created_at: string;
  updated_at: string;
}

export const useAIFollowUps = () => {
  const [followUps, setFollowUps] = useState<AIFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFollowUps = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_follow_ups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFollowUps((data || []).map(fu => ({
        ...fu,
        choices: Array.isArray(fu.choices) ? fu.choices : [],
        conditions: typeof fu.conditions === 'object' && fu.conditions !== null ? fu.conditions : {}
      })) as AIFollowUp[]);
    } catch (error) {
      console.error('Error fetching AI follow-ups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFollowUp = useCallback(async (followUp: Partial<AIFollowUp>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_follow_ups')
        .insert({
          user_id: user.id,
          topic_id: followUp.topic_id || null,
          question_text: followUp.question_text || 'New Question',
          question_type: followUp.question_type || 'choice',
          choices: followUp.choices || [],
          conditions: followUp.conditions || {},
          probability_pct: followUp.probability_pct || 100,
          max_per_session: followUp.max_per_session || 3,
          cooldown_seconds: followUp.cooldown_seconds || 300,
          always_ask: followUp.always_ask || false,
          is_active: followUp.is_active !== false,
          presentation: followUp.presentation || 'inline',
          analytics_id: followUp.analytics_id || null,
          analytics_description: followUp.analytics_description || null
        })
        .select()
        .single();

      if (error) throw error;

      await fetchFollowUps();
      toast({ title: "Follow-up Created", description: "New follow-up question has been added" });
      return data;
    } catch (error: any) {
      console.error('Error creating follow-up:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  }, [fetchFollowUps, toast]);

  const updateFollowUp = useCallback(async (id: string, updates: Partial<AIFollowUp>) => {
    try {
      const { error } = await supabase
        .from('ai_follow_ups')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await fetchFollowUps();
      toast({ title: "Follow-up Updated", description: "Changes have been saved" });
    } catch (error: any) {
      console.error('Error updating follow-up:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  }, [fetchFollowUps, toast]);

  const deleteFollowUp = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_follow_ups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchFollowUps();
      toast({ title: "Follow-up Deleted", description: "Follow-up question has been removed" });
    } catch (error: any) {
      console.error('Error deleting follow-up:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  }, [fetchFollowUps, toast]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  return {
    followUps,
    loading,
    fetchFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
  };
};
