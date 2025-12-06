import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIChatMemory {
  id: string;
  profile_id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_metadata: Record<string, any>;
  session_count: number;
  total_messages: number;
  last_topics: string[];
  preferences: Record<string, any>;
  engagement_score: number;
  welcome_shown: boolean;
  follow_ups_shown: number;
  follow_ups_completed: number;
  first_visit_at: string;
  last_visit_at: string;
  created_at: string;
  updated_at: string;
}

export const useAIChatMemory = (profileId: string | null) => {
  const [memories, setMemories] = useState<AIChatMemory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = useCallback(async () => {
    if (!profileId) return;

    try {
      const { data, error } = await supabase
        .from('ai_chat_memory')
        .select('*')
        .eq('profile_id', profileId)
        .order('last_visit_at', { ascending: false });

      if (error) throw error;

      setMemories((data || []).map(m => ({
        ...m,
        last_topics: Array.isArray(m.last_topics) ? m.last_topics : [],
        preferences: typeof m.preferences === 'object' && m.preferences !== null ? m.preferences : {},
        visitor_metadata: typeof m.visitor_metadata === 'object' && m.visitor_metadata !== null ? m.visitor_metadata : {}
      })) as AIChatMemory[]);
    } catch (error) {
      console.error('Error fetching chat memories:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const getOrCreateMemory = useCallback(async (
    visitorId: string,
    visitorData?: { name?: string; email?: string; metadata?: Record<string, any> }
  ) => {
    if (!profileId) return null;

    try {
      // Try to get existing memory
      const { data: existing, error: fetchError } = await supabase
        .from('ai_chat_memory')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // Update last visit and session count
        const existingMetadata = typeof existing.visitor_metadata === 'object' && existing.visitor_metadata !== null
          ? existing.visitor_metadata as Record<string, any>
          : {};
        const { data: updated, error: updateError } = await supabase
          .from('ai_chat_memory')
          .update({
            session_count: (existing.session_count || 0) + 1,
            last_visit_at: new Date().toISOString(),
            visitor_name: visitorData?.name || existing.visitor_name,
            visitor_email: visitorData?.email || existing.visitor_email,
            visitor_metadata: { ...existingMetadata, ...visitorData?.metadata },
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updated as AIChatMemory;
      }

      // Create new memory
      const { data: created, error: createError } = await supabase
        .from('ai_chat_memory')
        .insert({
          profile_id: profileId,
          visitor_id: visitorId,
          visitor_name: visitorData?.name || null,
          visitor_email: visitorData?.email || null,
          visitor_metadata: visitorData?.metadata || {},
          session_count: 1,
          total_messages: 0,
          last_topics: [],
          preferences: {},
          engagement_score: 0,
          welcome_shown: false,
          follow_ups_shown: 0,
          follow_ups_completed: 0,
          first_visit_at: new Date().toISOString(),
          last_visit_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      return created as AIChatMemory;
    } catch (error) {
      console.error('Error getting/creating chat memory:', error);
      return null;
    }
  }, [profileId]);

  const updateMemory = useCallback(async (
    visitorId: string,
    updates: Partial<AIChatMemory>
  ) => {
    if (!profileId) return;

    try {
      const { error } = await supabase
        .from('ai_chat_memory')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('profile_id', profileId)
        .eq('visitor_id', visitorId);

      if (error) throw error;
      await fetchMemories();
    } catch (error) {
      console.error('Error updating chat memory:', error);
    }
  }, [profileId, fetchMemories]);

  const incrementMessageCount = useCallback(async (visitorId: string) => {
    if (!profileId) return;

    try {
      const { data: memory } = await supabase
        .from('ai_chat_memory')
        .select('total_messages, engagement_score')
        .eq('profile_id', profileId)
        .eq('visitor_id', visitorId)
        .single();

      if (memory) {
        // Calculate new engagement score (0-100 scale)
        const newMessageCount = (memory.total_messages || 0) + 1;
        const newEngagementScore = Math.min(100, Math.round(
          (newMessageCount * 2) + (memory.engagement_score || 0) * 0.8
        ));

        await supabase
          .from('ai_chat_memory')
          .update({
            total_messages: newMessageCount,
            engagement_score: newEngagementScore,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', profileId)
          .eq('visitor_id', visitorId);
      }
    } catch (error) {
      console.error('Error incrementing message count:', error);
    }
  }, [profileId]);

  const markWelcomeShown = useCallback(async (visitorId: string) => {
    if (!profileId) return;

    try {
      await supabase
        .from('ai_chat_memory')
        .update({ welcome_shown: true, updated_at: new Date().toISOString() })
        .eq('profile_id', profileId)
        .eq('visitor_id', visitorId);
    } catch (error) {
      console.error('Error marking welcome shown:', error);
    }
  }, [profileId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  return {
    memories,
    loading,
    fetchMemories,
    getOrCreateMemory,
    updateMemory,
    incrementMessageCount,
    markWelcomeShown
  };
};
