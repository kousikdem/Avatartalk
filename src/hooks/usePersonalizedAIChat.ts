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
    // Client-side validation
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
      // Call the personalized AI response function
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
        text: data.response || "I'm Avatartalk personalized AI powered by Mistral 7B. Sorry, I couldn't process that request.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm Avatartalk personalized AI powered by Mistral 7B, and I'm having trouble responding right now. Please try again.",
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
      text: `Hi! I'm ${avatarName}, powered by Avatartalk personalized AI using Mistral 7B. How can I help you today?`,
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