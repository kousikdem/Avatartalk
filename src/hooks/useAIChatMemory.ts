import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMemory {
  id: string;
  profile_id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_metadata: Record<string, any>;
  session_count: number;
  total_messages: number;
  first_visit_at: string;
  last_visit_at: string;
  engagement_score: number;
  follow_ups_shown: number;
  follow_ups_completed: number;
  last_topics: string[];
  preferences: Record<string, any>;
  welcome_shown: boolean;
}

export const useAIChatMemory = () => {
  const [memory, setMemory] = useState<ChatMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getOrCreateMemory = useCallback(async (profileId: string, visitorId: string) => {
    setIsLoading(true);
    try {
      // Try to get existing memory
      let { data, error } = await supabase
        .from('ai_chat_memory')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visitor_id', visitorId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create new memory
        const { data: newMemory, error: createError } = await supabase
          .from('ai_chat_memory')
          .insert({
            profile_id: profileId,
            visitor_id: visitorId,
            session_count: 1,
            total_messages: 0,
            engagement_score: 0,
            follow_ups_shown: 0,
            follow_ups_completed: 0,
            last_topics: [],
            preferences: {},
            welcome_shown: false
          })
          .select()
          .single();

        if (createError) throw createError;
        data = newMemory;
      } else if (error) {
        throw error;
      } else if (data) {
        // Update session count and last visit
        const { data: updatedMemory, error: updateError } = await supabase
          .from('ai_chat_memory')
          .update({
            session_count: (data.session_count || 0) + 1,
            last_visit_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .select()
          .single();

        if (!updateError && updatedMemory) {
          data = updatedMemory;
        }
      }

      setMemory(data as ChatMemory);
      return data as ChatMemory;
    } catch (error) {
      console.error('Error getting/creating chat memory:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMemory = useCallback(async (updates: Partial<ChatMemory>) => {
    if (!memory) return;
    try {
      const { data, error } = await supabase
        .from('ai_chat_memory')
        .update(updates)
        .eq('id', memory.id)
        .select()
        .single();

      if (error) throw error;
      setMemory(data as ChatMemory);
      return data as ChatMemory;
    } catch (error) {
      console.error('Error updating chat memory:', error);
      return null;
    }
  }, [memory]);

  const markWelcomeShown = useCallback(async () => {
    return updateMemory({ welcome_shown: true });
  }, [updateMemory]);

  const incrementMessages = useCallback(async () => {
    if (!memory) return;
    const newCount = (memory.total_messages || 0) + 1;
    // Calculate engagement score (1-100)
    const baseScore = Math.min(100, Math.floor(
      (newCount * 5) + 
      (memory.session_count * 10) + 
      (memory.follow_ups_completed * 15)
    ));
    return updateMemory({ 
      total_messages: newCount,
      engagement_score: Math.min(100, baseScore)
    });
  }, [memory, updateMemory]);

  const recordFollowUpShown = useCallback(async () => {
    if (!memory) return;
    return updateMemory({ 
      follow_ups_shown: (memory.follow_ups_shown || 0) + 1 
    });
  }, [memory, updateMemory]);

  const recordFollowUpCompleted = useCallback(async () => {
    if (!memory) return;
    const newCompleted = (memory.follow_ups_completed || 0) + 1;
    const newScore = Math.min(100, (memory.engagement_score || 0) + 5);
    return updateMemory({ 
      follow_ups_completed: newCompleted,
      engagement_score: newScore
    });
  }, [memory, updateMemory]);

  const addTopicToHistory = useCallback(async (topicName: string) => {
    if (!memory) return;
    const lastTopics = memory.last_topics || [];
    const newTopics = [topicName, ...lastTopics.filter(t => t !== topicName)].slice(0, 5);
    return updateMemory({ last_topics: newTopics });
  }, [memory, updateMemory]);

  const setVisitorInfo = useCallback(async (name?: string, email?: string, metadata?: Record<string, any>) => {
    const updates: Partial<ChatMemory> = {};
    if (name) updates.visitor_name = name;
    if (email) updates.visitor_email = email;
    if (metadata) updates.visitor_metadata = { ...memory?.visitor_metadata, ...metadata };
    return updateMemory(updates);
  }, [memory, updateMemory]);

  return {
    memory,
    isLoading,
    getOrCreateMemory,
    updateMemory,
    markWelcomeShown,
    incrementMessages,
    recordFollowUpShown,
    recordFollowUpCompleted,
    addTopicToHistory,
    setVisitorInfo
  };
};
