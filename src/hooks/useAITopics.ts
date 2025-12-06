import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AITopic {
  id: string;
  user_id: string;
  topic_name: string;
  keywords: string[];
  authority: 'authoritative' | 'neutral' | 'deflect';
  do_rules: string[];
  avoid_rules: string[];
  sample_prompts: string[];
  describe_text: string | null;
  describe_priority: boolean;
  describe_history: any[];
  is_active: boolean;
  topic_priority: number;
  created_at: string;
  updated_at: string;
}

export const useAITopics = () => {
  const [topics, setTopics] = useState<AITopic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTopics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('topic_priority', { ascending: false });

      if (error) throw error;

      setTopics((data || []).map(topic => ({
        ...topic,
        keywords: Array.isArray(topic.keywords) ? topic.keywords : [],
        do_rules: Array.isArray(topic.do_rules) ? topic.do_rules : [],
        avoid_rules: Array.isArray(topic.avoid_rules) ? topic.avoid_rules : [],
        sample_prompts: Array.isArray(topic.sample_prompts) ? topic.sample_prompts : [],
        describe_history: Array.isArray(topic.describe_history) ? topic.describe_history : []
      })) as AITopic[]);
    } catch (error) {
      console.error('Error fetching AI topics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTopic = useCallback(async (topic: Partial<AITopic>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_topics')
        .insert({
          user_id: user.id,
          topic_name: topic.topic_name || 'New Topic',
          keywords: topic.keywords || [],
          authority: topic.authority || 'neutral',
          do_rules: topic.do_rules || [],
          avoid_rules: topic.avoid_rules || [],
          sample_prompts: topic.sample_prompts || [],
          describe_text: topic.describe_text || null,
          describe_priority: topic.describe_priority || false,
          is_active: topic.is_active !== false,
          topic_priority: topic.topic_priority || 0
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTopics();
      toast({ title: "Topic Created", description: "New topic has been added" });
      return data;
    } catch (error: any) {
      console.error('Error creating topic:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  }, [fetchTopics, toast]);

  const updateTopic = useCallback(async (id: string, updates: Partial<AITopic>) => {
    try {
      const { error } = await supabase
        .from('ai_topics')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await fetchTopics();
      toast({ title: "Topic Updated", description: "Changes have been saved" });
    } catch (error: any) {
      console.error('Error updating topic:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  }, [fetchTopics, toast]);

  const deleteTopic = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTopics();
      toast({ title: "Topic Deleted", description: "Topic has been removed" });
    } catch (error: any) {
      console.error('Error deleting topic:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  }, [fetchTopics, toast]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return {
    topics,
    loading,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic
  };
};
