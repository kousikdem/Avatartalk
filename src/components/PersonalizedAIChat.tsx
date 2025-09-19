import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Mic, Volume2, Bot, User } from 'lucide-react';
import { usePersonalizedAIChat } from '@/hooks/usePersonalizedAIChat';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface PersonalizedAIChatProps {
  userId?: string;
  avatarName?: string;
  avatarImage?: string;
  className?: string;
}

const PersonalizedAIChat: React.FC<PersonalizedAIChatProps> = ({
  userId,
  avatarName = "AI Assistant",
  avatarImage,
  className = ""
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { messages, isLoading, sendMessage, initializeChat, clearMessages } = usePersonalizedAIChat();
  const { toast } = useToast();

  // Initialize chat with personalized greeting
  useEffect(() => {
    if (avatarName && messages.length === 0) {
      initializeChat(avatarName);
    }
  }, [avatarName, initializeChat, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(message, userId, userId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Voice input stopped" : "Speak now to send a message",
    });
  };

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
    toast({
      title: isSpeaking ? "Speech Stopped" : "Speech Started",
      description: isSpeaking ? "Text-to-speech disabled" : "AI responses will be spoken",
    });
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  return (
    <Card className={`h-96 flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>Personalized AI Chat</span>
            <span className="text-sm font-normal text-muted-foreground">
              powered by Llama 3.1
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-xs"
          >
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-3 p-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-3">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src={avatarImage} />
                      <AvatarFallback>
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className={`mt-1 text-xs text-muted-foreground ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarImage} />
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your personalized AI anything..."
              disabled={isLoading}
              className="pr-12"
            />
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={toggleRecording}
            className={`${isRecording ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={toggleSpeech}
            className={`${isSpeaking ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-xs text-center text-muted-foreground">
          Powered by Avatartalk Personalized AI • Llama 3.1 • Real-time Learning
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedAIChat;