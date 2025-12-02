import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'avatar';
  senderName?: string;
  senderAvatar?: string;
  richData?: {
    buttons?: Array<{ text: string; url: string }>;
    links?: Array<{ url: string; title: string; preview: string }>;
    documents?: Array<{ filename: string; type: string; preview: string }>;
  };
}

interface ChatHistoryRecord {
  id: string;
  profile_id: string;
  visitor_id: string | null;
  visitor_session_id: string | null;
  message: string;
  sender: string;
  rich_data: any;
  created_at: string;
}

export const useAIChatHistory = (profileId: string | null, visitorId: string | null) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID for anonymous users
    const stored = sessionStorage.getItem('chat_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chat_session_id', newId);
    return newId;
  });

  const loadChatHistory = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    try {
      // Use type assertion since ai_chat_history is a new table
      let query = (supabase as any)
        .from('ai_chat_history')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true })
        .limit(100);

      // Filter by visitor_id if logged in, or session_id if anonymous
      if (visitorId) {
        query = query.eq('visitor_id', visitorId);
      } else {
        query = query.eq('visitor_session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const messages: ChatMessage[] = (data || []).map((record: ChatHistoryRecord) => ({
        id: record.id,
        content: record.message,
        timestamp: record.created_at,
        sender: record.sender as 'user' | 'avatar',
        richData: record.rich_data || undefined,
      }));

      setChatHistory(messages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId, visitorId, sessionId]);

  const saveMessage = useCallback(async (
    message: string,
    sender: 'user' | 'avatar',
    richData?: any
  ): Promise<ChatMessage | null> => {
    if (!profileId) return null;

    try {
      const { data, error } = await (supabase as any)
        .from('ai_chat_history')
        .insert({
          profile_id: profileId,
          visitor_id: visitorId || null,
          visitor_session_id: visitorId ? null : sessionId,
          message,
          sender,
          rich_data: richData || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: ChatMessage = {
        id: data.id,
        content: data.message,
        timestamp: data.created_at,
        sender: data.sender as 'user' | 'avatar',
        richData: data.rich_data as ChatMessage['richData'] || undefined,
      };

      setChatHistory(prev => [...prev, newMessage]);
      
      // Update chat stats
      if (sender === 'user') {
        await updateChatStats(visitorId, profileId);
      }

      return newMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }, [profileId, visitorId, sessionId]);

  const updateChatStats = async (senderId: string | null, receiverId: string) => {
    try {
      // Update receiver's total_chats_received
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('total_chats_received')
        .eq('user_id', receiverId)
        .maybeSingle();

      if (existingStats) {
        await supabase
          .from('user_stats')
          .update({ 
            total_chats_received: (existingStats.total_chats_received || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', receiverId);
      }
    } catch (error) {
      console.error('Error updating chat stats:', error);
    }
  };

  // Load history on mount
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`chat-history-${profileId}-${visitorId || sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_chat_history',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          const record = payload.new as ChatHistoryRecord;
          
          // Only add if it's for this visitor/session
          if ((visitorId && record.visitor_id === visitorId) ||
              (!visitorId && record.visitor_session_id === sessionId)) {
            const newMessage: ChatMessage = {
              id: record.id,
              content: record.message,
              timestamp: record.created_at,
              sender: record.sender as 'user' | 'avatar',
              richData: record.rich_data as ChatMessage['richData'] || undefined,
            };
            
            setChatHistory(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, visitorId, sessionId]);

  return {
    chatHistory,
    loading,
    saveMessage,
    loadChatHistory,
    sessionId
  };
};
