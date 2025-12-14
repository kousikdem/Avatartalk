import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  remainingBalance: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  tokenUsage?: TokenUsage;
  richData?: {
    buttons?: Array<{ text: string; url: string }>;
    links?: Array<{ url: string; title: string; preview: string }>;
    documents?: Array<{ filename: string; type: string; preview: string }>;
  };
}

export const usePersonalizedAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string, profileId?: string, userId?: string) => {
    const trimmedMessage = userMessage.trim();
    
    if (!trimmedMessage) {
      console.error('Message cannot be empty');
      return;
    }
    
    if (trimmedMessage.length > 2000) {
      console.error('Message must be 2000 characters or less');
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Your message is too long. Please keep it under 2000 characters.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: trimmedMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('personalized-ai-response', {
        body: {
          userMessage: trimmedMessage,
          profileId: profileId || userId,
          userId
        }
      });

      if (error) {
        throw error;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Sorry, I couldn't process that request.",
        sender: 'ai',
        timestamp: new Date(),
        richData: data.richData || undefined,
        tokenUsage: data.tokenUsage || undefined
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChat = (avatarName: string) => {
    const initialMessage: Message = {
      id: '1',
      text: `Hi! I'm ${avatarName}. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    initializeChat,
    clearMessages
  };
};