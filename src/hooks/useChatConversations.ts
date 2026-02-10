import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface ChatConversation {
  id: string;
  user_id: string;
  other_user_id: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    username: string;
    display_name: string;
    profile_pic_url: string;
  };
}

export const useChatConversations = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;

      const { data: convData, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`user_id.eq.${user.id},other_user_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch other user profiles
      const conversationsWithProfiles = await Promise.all(
        (convData || []).map(async (conv) => {
          const otherUserId = conv.user_id === user.id ? conv.other_user_id : conv.user_id;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, display_name, profile_pic_url')
            .eq('id', otherUserId)
            .single();

          return {
            ...conv,
            other_user: profileData,
          };
        })
      );

      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateConversation = async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to find existing conversation
      const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`and(user_id.eq.${user.id},other_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},other_user_id.eq.${user.id})`)
        .single();

      if (!fetchError && existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          other_user_id: otherUserId,
        })
        .select()
        .single();

      if (createError) throw createError;
      
      await fetchConversations();
      return newConv.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    conversations,
    loading,
    fetchConversations,
    getOrCreateConversation,
  };
};

export const useChatMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`chat_messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, message: string) => {
    if (!conversationId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          message: message,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    fetchMessages,
  };
};
