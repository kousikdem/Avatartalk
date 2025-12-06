import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface WelcomeMessageSettings {
  enabled: boolean;
  text: string;
  trigger: 'first_open' | 'first_interaction';
  language: string;
  customVariables: Array<{ name: string; defaultValue: string; description: string }>;
}

export interface PersonaSettings {
  displayName: string;
  shortBio: string;
  brandValues: string[];
  tone: {
    voice: 'warm' | 'neutral' | 'professional' | 'playful' | 'edgy';
    formality: number;
    verbosity: number;
    humorLevel: number;
  };
  signaturePhrases: string[];
  primaryGoals: ('educate' | 'convert' | 'support' | 'entertain' | 'collect_leads')[];
}

export interface TopicRule {
  id: string;
  topicName: string;
  priority: number;
  authority: 'authoritative' | 'neutral' | 'deflect';
  doRules: string[];
  avoidRules: string[];
  samplePrompts: string[];
  keywords: string[];
  isActive: boolean;
}

export interface FollowUpQuestion {
  id: string;
  topicId?: string;
  questionText: string;
  questionType: 'choice' | 'open' | 'rating' | 'boolean';
  choices: string[];
  presentation: 'inline' | 'modal' | 'suggest_button';
  conditions: {
    visitCountLt?: number;
    subscriptionTierNot?: string;
    isNewVisitor?: boolean;
    lastMessageContains?: string;
  };
  probabilityPct: number;
  maxPerSession: number;
  cooldownSeconds: number;
  alwaysAsk: boolean;
  isActive: boolean;
}

export interface EngagementScoreWeight {
  chatCount: number;
  visitCount: number;
  responseTime: number;
  followUpCompletion: number;
}

export interface AITrainingSettings {
  id: string;
  userId: string;
  welcomeMessage: WelcomeMessageSettings;
  globalDescribeText: string;
  globalDescribePriority: boolean;
  engagementScoreWeight: EngagementScoreWeight;
}

export const useAITrainingSettings = () => {
  const [settings, setSettings] = useState<AITrainingSettings | null>(null);
  const [topics, setTopics] = useState<TopicRule[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch or create settings
      let { data: settingsData, error } = await supabase
        .from('ai_training_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!settingsData) {
        const { data: newSettings, error: insertError } = await supabase
          .from('ai_training_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        settingsData = newSettings;
      }

      const customVariables = Array.isArray(settingsData.custom_variables) 
        ? settingsData.custom_variables as Array<{ name: string; defaultValue: string; description: string }>
        : [];

      const engagementWeight = settingsData.engagement_score_weight as Record<string, number> || {};

      setSettings({
        id: settingsData.id,
        userId: settingsData.user_id,
        welcomeMessage: {
          enabled: settingsData.welcome_message_enabled ?? true,
          text: settingsData.welcome_message_text || 'Hi! How can I help you today?',
          trigger: (settingsData.welcome_message_trigger as 'first_open' | 'first_interaction') || 'first_open',
          language: settingsData.welcome_message_language || 'en',
          customVariables
        },
        globalDescribeText: settingsData.global_describe_text || '',
        globalDescribePriority: settingsData.global_describe_priority ?? false,
        engagementScoreWeight: {
          chatCount: engagementWeight.chat_count ?? 5,
          visitCount: engagementWeight.visit_count ?? 1,
          responseTime: engagementWeight.response_time ?? 2,
          followUpCompletion: engagementWeight.follow_up_completion ?? 3
        }
      });

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('ai_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('topic_priority', { ascending: false });

      if (topicsError) throw topicsError;

      setTopics((topicsData || []).map(t => ({
        id: t.id,
        topicName: t.topic_name,
        priority: t.topic_priority ?? 10,
        authority: (t.authority as 'authoritative' | 'neutral' | 'deflect') || 'neutral',
        doRules: Array.isArray(t.do_rules) ? t.do_rules as string[] : [],
        avoidRules: Array.isArray(t.avoid_rules) ? t.avoid_rules as string[] : [],
        samplePrompts: Array.isArray(t.sample_prompts) ? t.sample_prompts as string[] : [],
        keywords: Array.isArray(t.keywords) ? t.keywords as string[] : [],
        isActive: t.is_active ?? true
      })));

      // Fetch follow-ups
      const { data: followUpsData, error: followUpsError } = await supabase
        .from('ai_follow_ups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (followUpsError) throw followUpsError;

      setFollowUps((followUpsData || []).map(f => ({
        id: f.id,
        topicId: f.topic_id || undefined,
        questionText: f.question_text,
        questionType: (f.question_type as 'choice' | 'open' | 'rating' | 'boolean') || 'choice',
        choices: Array.isArray(f.choices) ? f.choices as string[] : [],
        presentation: (f.presentation as 'inline' | 'modal' | 'suggest_button') || 'inline',
        conditions: (f.conditions as FollowUpQuestion['conditions']) || {},
        probabilityPct: f.probability_pct ?? 100,
        maxPerSession: f.max_per_session ?? 3,
        cooldownSeconds: f.cooldown_seconds ?? 300,
        alwaysAsk: f.always_ask ?? false,
        isActive: f.is_active ?? true
      })));

    } catch (error) {
      console.error('Error fetching AI training settings:', error);
      toast({
        title: "Error",
        description: "Failed to load AI training settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveSettings = useCallback(async (newSettings: Partial<AITrainingSettings>) => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_training_settings')
        .update({
          welcome_message_enabled: newSettings.welcomeMessage?.enabled ?? settings.welcomeMessage.enabled,
          welcome_message_text: newSettings.welcomeMessage?.text ?? settings.welcomeMessage.text,
          welcome_message_trigger: newSettings.welcomeMessage?.trigger ?? settings.welcomeMessage.trigger,
          welcome_message_language: newSettings.welcomeMessage?.language ?? settings.welcomeMessage.language,
          custom_variables: newSettings.welcomeMessage?.customVariables ?? settings.welcomeMessage.customVariables,
          global_describe_text: newSettings.globalDescribeText ?? settings.globalDescribeText,
          global_describe_priority: newSettings.globalDescribePriority ?? settings.globalDescribePriority,
          engagement_score_weight: {
            chat_count: newSettings.engagementScoreWeight?.chatCount ?? settings.engagementScoreWeight.chatCount,
            visit_count: newSettings.engagementScoreWeight?.visitCount ?? settings.engagementScoreWeight.visitCount,
            response_time: newSettings.engagementScoreWeight?.responseTime ?? settings.engagementScoreWeight.responseTime,
            follow_up_completion: newSettings.engagementScoreWeight?.followUpCompletion ?? settings.engagementScoreWeight.followUpCompletion
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...newSettings } : prev);
      toast({
        title: "Settings Saved",
        description: "AI training settings updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [settings, toast]);

  // Topic CRUD operations
  const addTopic = useCallback(async (topic: Omit<TopicRule, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_topics')
        .insert({
          user_id: user.id,
          topic_name: topic.topicName,
          topic_priority: topic.priority,
          authority: topic.authority,
          do_rules: topic.doRules,
          avoid_rules: topic.avoidRules,
          sample_prompts: topic.samplePrompts,
          keywords: topic.keywords,
          is_active: topic.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const newTopic: TopicRule = {
        id: data.id,
        topicName: data.topic_name,
        priority: data.topic_priority ?? 10,
        authority: (data.authority as 'authoritative' | 'neutral' | 'deflect') || 'neutral',
        doRules: Array.isArray(data.do_rules) ? data.do_rules as string[] : [],
        avoidRules: Array.isArray(data.avoid_rules) ? data.avoid_rules as string[] : [],
        samplePrompts: Array.isArray(data.sample_prompts) ? data.sample_prompts as string[] : [],
        keywords: Array.isArray(data.keywords) ? data.keywords as string[] : [],
        isActive: data.is_active ?? true
      };

      setTopics(prev => [newTopic, ...prev]);
      toast({ title: "Topic Added", description: "Topic rule added successfully" });
      return newTopic;
    } catch (error) {
      console.error('Error adding topic:', error);
      toast({ title: "Error", description: "Failed to add topic", variant: "destructive" });
      throw error;
    }
  }, [toast]);

  const updateTopic = useCallback(async (id: string, updates: Partial<TopicRule>) => {
    try {
      const { error } = await supabase
        .from('ai_topics')
        .update({
          topic_name: updates.topicName,
          topic_priority: updates.priority,
          authority: updates.authority,
          do_rules: updates.doRules,
          avoid_rules: updates.avoidRules,
          sample_prompts: updates.samplePrompts,
          keywords: updates.keywords,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      toast({ title: "Topic Updated", description: "Topic rule updated successfully" });
    } catch (error) {
      console.error('Error updating topic:', error);
      toast({ title: "Error", description: "Failed to update topic", variant: "destructive" });
    }
  }, [toast]);

  const deleteTopic = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('ai_topics').delete().eq('id', id);
      if (error) throw error;
      setTopics(prev => prev.filter(t => t.id !== id));
      toast({ title: "Topic Deleted", description: "Topic rule deleted successfully" });
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({ title: "Error", description: "Failed to delete topic", variant: "destructive" });
    }
  }, [toast]);

  // Follow-up CRUD operations
  const addFollowUp = useCallback(async (followUp: Omit<FollowUpQuestion, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_follow_ups')
        .insert({
          user_id: user.id,
          topic_id: followUp.topicId || null,
          question_text: followUp.questionText,
          question_type: followUp.questionType,
          choices: followUp.choices,
          presentation: followUp.presentation,
          conditions: followUp.conditions,
          probability_pct: followUp.probabilityPct,
          max_per_session: followUp.maxPerSession,
          cooldown_seconds: followUp.cooldownSeconds,
          always_ask: followUp.alwaysAsk,
          is_active: followUp.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const newFollowUp: FollowUpQuestion = {
        id: data.id,
        topicId: data.topic_id || undefined,
        questionText: data.question_text,
        questionType: (data.question_type as 'choice' | 'open' | 'rating' | 'boolean') || 'choice',
        choices: Array.isArray(data.choices) ? data.choices as string[] : [],
        presentation: (data.presentation as 'inline' | 'modal' | 'suggest_button') || 'inline',
        conditions: (data.conditions as FollowUpQuestion['conditions']) || {},
        probabilityPct: data.probability_pct ?? 100,
        maxPerSession: data.max_per_session ?? 3,
        cooldownSeconds: data.cooldown_seconds ?? 300,
        alwaysAsk: data.always_ask ?? false,
        isActive: data.is_active ?? true
      };

      setFollowUps(prev => [newFollowUp, ...prev]);
      toast({ title: "Follow-up Added", description: "Follow-up question added successfully" });
      return newFollowUp;
    } catch (error) {
      console.error('Error adding follow-up:', error);
      toast({ title: "Error", description: "Failed to add follow-up", variant: "destructive" });
      throw error;
    }
  }, [toast]);

  const updateFollowUp = useCallback(async (id: string, updates: Partial<FollowUpQuestion>) => {
    try {
      const { error } = await supabase
        .from('ai_follow_ups')
        .update({
          topic_id: updates.topicId || null,
          question_text: updates.questionText,
          question_type: updates.questionType,
          choices: updates.choices,
          presentation: updates.presentation,
          conditions: updates.conditions,
          probability_pct: updates.probabilityPct,
          max_per_session: updates.maxPerSession,
          cooldown_seconds: updates.cooldownSeconds,
          always_ask: updates.alwaysAsk,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
      toast({ title: "Follow-up Updated", description: "Follow-up question updated successfully" });
    } catch (error) {
      console.error('Error updating follow-up:', error);
      toast({ title: "Error", description: "Failed to update follow-up", variant: "destructive" });
    }
  }, [toast]);

  const deleteFollowUp = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('ai_follow_ups').delete().eq('id', id);
      if (error) throw error;
      setFollowUps(prev => prev.filter(f => f.id !== id));
      toast({ title: "Follow-up Deleted", description: "Follow-up question deleted successfully" });
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      toast({ title: "Error", description: "Failed to delete follow-up", variant: "destructive" });
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
    saveSettings,
    addTopic,
    updateTopic,
    deleteTopic,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp
  };
};
