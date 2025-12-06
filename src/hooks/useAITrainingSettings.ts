import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AITrainingSettings {
  id: string;
  user_id: string;
  welcome_message_enabled: boolean;
  welcome_message_text: string;
  welcome_message_trigger: 'first_open' | 'first_interaction';
  welcome_message_language: string;
  custom_variables: Array<{ name: string; value: string; description?: string }>;
  global_describe_text: string | null;
  global_describe_priority: boolean;
  engagement_score_weight: Record<string, number>;
}

interface AITopic {
  id: string;
  user_id: string;
  topic_name: string;
  topic_priority: number;
  authority: 'authoritative' | 'adaptive' | 'conversational';
  describe_text: string | null;
  describe_priority: boolean;
  do_rules: string[];
  avoid_rules: string[];
  sample_prompts: string[];
  keywords: string[];
  describe_history: Array<{ text: string; timestamp: string; version: number }>;
  is_active: boolean;
}

interface AIFollowUp {
  id: string;
  topic_id: string | null;
  user_id: string;
  question_text: string;
  question_type: 'choice' | 'open' | 'boolean' | 'rating';
  choices: string[];
  presentation: 'inline' | 'modal' | 'suggestion';
  conditions: Record<string, any>;
  probability_pct: number;
  max_per_session: number;
  cooldown_seconds: number;
  always_ask: boolean;
  analytics_id: string | null;
  analytics_description: string | null;
  is_active: boolean;
}

const defaultSettings: Omit<AITrainingSettings, 'id' | 'user_id'> = {
  welcome_message_enabled: true,
  welcome_message_text: 'Hi! How can I help you today?',
  welcome_message_trigger: 'first_open',
  welcome_message_language: 'en',
  custom_variables: [],
  global_describe_text: null,
  global_describe_priority: false,
  engagement_score_weight: { chat_count: 5, visit_count: 1, response_time: 2, follow_up_completion: 3 }
};

export const useAITrainingSettings = () => {
  const [settings, setSettings] = useState<AITrainingSettings | null>(null);
  const [topics, setTopics] = useState<AITopic[]>([]);
  const [followUps, setFollowUps] = useState<AIFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch or create settings
      let { data: settingsData, error } = await supabase
        .from('ai_training_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create default
        const { data: newSettings, error: createError } = await supabase
          .from('ai_training_settings')
          .insert({ user_id: user.id, ...defaultSettings })
          .select()
          .single();

        if (createError) throw createError;
        settingsData = newSettings;
      } else if (error) {
        throw error;
      }

      setSettings(settingsData as unknown as AITrainingSettings);

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('ai_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('topic_priority', { ascending: false });

      if (topicsError) throw topicsError;
      setTopics((topicsData || []) as unknown as AITopic[]);

      // Fetch follow-ups
      const { data: followUpsData, error: followUpsError } = await supabase
        .from('ai_follow_ups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (followUpsError) throw followUpsError;
      setFollowUps((followUpsData || []) as unknown as AIFollowUp[]);

    } catch (error) {
      console.error('Error fetching AI settings:', error);
      toast({
        title: "Error",
        description: "Failed to load AI training settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateSettings = useCallback(async (updates: Partial<AITrainingSettings>) => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('ai_training_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data as unknown as AITrainingSettings);
      toast({ title: "Settings saved", description: "AI training settings updated successfully" });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [settings, toast]);

  // Topic CRUD
  const createTopic = useCallback(async (topic: Partial<AITopic>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_topics')
        .insert({ 
          user_id: user.id, 
          topic_name: topic.topic_name || 'New Topic',
          topic_priority: topic.topic_priority || 10,
          authority: topic.authority || 'adaptive',
          describe_text: topic.describe_text || null,
          describe_priority: topic.describe_priority || false,
          do_rules: topic.do_rules || [],
          avoid_rules: topic.avoid_rules || [],
          sample_prompts: topic.sample_prompts || [],
          keywords: topic.keywords || [],
          describe_history: [],
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setTopics(prev => [data as unknown as AITopic, ...prev]);
      toast({ title: "Topic created", description: "New topic added successfully" });
      return data as unknown as AITopic;
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({ title: "Error", description: "Failed to create topic", variant: "destructive" });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateTopic = useCallback(async (id: string, updates: Partial<AITopic>) => {
    setIsSaving(true);
    try {
      // If describe_text is being updated, save to history
      const existingTopic = topics.find(t => t.id === id);
      if (existingTopic && updates.describe_text && updates.describe_text !== existingTopic.describe_text) {
        const history = existingTopic.describe_history || [];
        if (existingTopic.describe_text) {
          const newHistory = [
            { text: existingTopic.describe_text, timestamp: new Date().toISOString(), version: history.length + 1 },
            ...history.slice(0, 4) // Keep last 5
          ];
          updates.describe_history = newHistory;
        }
      }

      const { data, error } = await supabase
        .from('ai_topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTopics(prev => prev.map(t => t.id === id ? data as unknown as AITopic : t));
      toast({ title: "Topic updated", description: "Topic saved successfully" });
    } catch (error) {
      console.error('Error updating topic:', error);
      toast({ title: "Error", description: "Failed to update topic", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [topics, toast]);

  const deleteTopic = useCallback(async (id: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('ai_topics').delete().eq('id', id);
      if (error) throw error;
      setTopics(prev => prev.filter(t => t.id !== id));
      setFollowUps(prev => prev.filter(f => f.topic_id !== id));
      toast({ title: "Topic deleted", description: "Topic removed successfully" });
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({ title: "Error", description: "Failed to delete topic", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Follow-up CRUD
  const createFollowUp = useCallback(async (followUp: Partial<AIFollowUp>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_follow_ups')
        .insert({
          user_id: user.id,
          topic_id: followUp.topic_id || null,
          question_text: followUp.question_text || 'Would you like to know more?',
          question_type: followUp.question_type || 'choice',
          choices: followUp.choices || ['Yes', 'No'],
          presentation: followUp.presentation || 'inline',
          conditions: followUp.conditions || {},
          probability_pct: followUp.probability_pct || 100,
          max_per_session: followUp.max_per_session || 3,
          cooldown_seconds: followUp.cooldown_seconds || 300,
          always_ask: followUp.always_ask || false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setFollowUps(prev => [data as unknown as AIFollowUp, ...prev]);
      toast({ title: "Follow-up created", description: "Follow-up question added" });
      return data as unknown as AIFollowUp;
    } catch (error) {
      console.error('Error creating follow-up:', error);
      toast({ title: "Error", description: "Failed to create follow-up", variant: "destructive" });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateFollowUp = useCallback(async (id: string, updates: Partial<AIFollowUp>) => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('ai_follow_ups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setFollowUps(prev => prev.map(f => f.id === id ? data as unknown as AIFollowUp : f));
      toast({ title: "Follow-up updated" });
    } catch (error) {
      console.error('Error updating follow-up:', error);
      toast({ title: "Error", description: "Failed to update follow-up", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteFollowUp = useCallback(async (id: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('ai_follow_ups').delete().eq('id', id);
      if (error) throw error;
      setFollowUps(prev => prev.filter(f => f.id !== id));
      toast({ title: "Follow-up deleted" });
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      toast({ title: "Error", description: "Failed to delete follow-up", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    topics,
    followUps,
    isLoading,
    isSaving,
    fetchSettings,
    updateSettings,
    createTopic,
    updateTopic,
    deleteTopic,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
  };
};
