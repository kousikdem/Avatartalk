
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Zap } from 'lucide-react';

interface LlamaChatProps {
  onResponse: (response: string) => void;
  isProcessing?: boolean;
}

const LlamaChat: React.FC<LlamaChatProps> = ({ onResponse, isProcessing = false }) => {
  const [model, setModel] = useState('llama-4-turbo');

  const processWithLlama = async (input: string) => {
    try {
      // Mock Llama 4 processing - in production, this would integrate with actual Meta Llama 4 API
      const responses = {
        greeting: [
          "Hello! I'm excited to chat with you. What would you like to explore today?",
          "Hey there! I'm here to help with any questions or conversations you'd like to have.",
          "Hi! Ready to dive into some interesting discussions?"
        ],
        technical: [
          "That's a fascinating technical question! Let me break down the key concepts for you...",
          "Great technical query! Based on current research and best practices, here's what I think...",
          "Interesting technical challenge! Here's how I'd approach this problem..."
        ],
        creative: [
          "I love creative challenges! Let me put on my creative thinking cap and explore this with you...",
          "What an imaginative idea! Here's how we could develop this concept further...",
          "Creative thinking time! Let's brainstorm some innovative approaches..."
        ],
        general: [
          "That's an interesting perspective! Here's what I think about that topic...",
          "Great question! Based on my understanding, I'd say...",
          "Thanks for sharing that. Here's my take on the subject..."
        ]
      };

      // Simple categorization based on keywords
      let category = 'general';
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        category = 'greeting';
      } else if (lowerInput.includes('code') || lowerInput.includes('technical') || lowerInput.includes('api') || lowerInput.includes('programming')) {
        category = 'technical';
      } else if (lowerInput.includes('creative') || lowerInput.includes('design') || lowerInput.includes('art') || lowerInput.includes('story')) {
        category = 'creative';
      }

      const categoryResponses = responses[category as keyof typeof responses];
      const baseResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      
      // Add some context-aware continuation
      const continuation = ` I notice you mentioned "${input.split(' ').slice(0, 3).join(' ')}" - that's something I find particularly interesting because it connects to broader themes of human-AI interaction and creative collaboration.`;
      
      return baseResponse + continuation;
    } catch (error) {
      console.error('Error processing with Llama:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span>Powered by Meta Llama 4</span>
          </div>
          <Badge variant="outline" className="border-purple-300 text-purple-600">
            {model}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Ultra-fast responses</span>
          </div>
          <div className="flex items-center gap-1">
            {isProcessing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LlamaChat;
