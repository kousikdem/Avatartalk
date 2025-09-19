import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

export const usePersonalizedAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string, profileId?: string, userId?: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Call the personalized AI response function
      const { data, error } = await supabase.functions.invoke('personalized-ai-response', {
        body: {
          userMessage,
          profileId: profileId || userId,
          userId
        }
      });

      if (error) {
        throw error;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm Avatartalk personalized AI powered by Llama 3.1. How can I assist you today?",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm Avatartalk personalized AI powered by Llama 3.1, and I'm experiencing some technical difficulties. Please try again in a moment.",
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
      text: `Hello! I'm ${avatarName}, your personalized AI assistant powered by Avatartalk's advanced Llama 3.1 technology. I've been trained on your personal data and preferences to provide tailored responses. How may I assist you today?`,
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