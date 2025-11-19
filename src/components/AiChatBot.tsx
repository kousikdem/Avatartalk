import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Loader2,
  MessageSquare,
  Volume2,
  VolumeX
} from 'lucide-react';
import { usePersonalizedAIChat } from '@/hooks/usePersonalizedAIChat';
import { supabase } from '@/integrations/supabase/client';

interface AiChatBotProps {
  avatarName?: string;
  avatarImage?: string;
  personality?: string;
  profileId?: string;
  onMessageSent?: (message: string) => void;
}

const AiChatBot: React.FC<AiChatBotProps> = ({ 
  avatarName = "AI Assistant", 
  avatarImage,
  personality = "friendly",
  profileId,
  onMessageSent 
}) => {
  const { messages: aiMessages, isLoading: aiLoading, sendMessage, initializeChat } = usePersonalizedAIChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize chat and get user ID
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    initUser();
    initializeChat(avatarName);
  }, [avatarName]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage;
    setInputMessage('');

    // Use profileId if provided, otherwise use current userId
    const targetProfileId = profileId || userId;
    
    if (targetProfileId) {
      await sendMessage(messageText, targetProfileId, userId || undefined);
    }

    if (onMessageSent) {
      onMessageSent(messageText);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
  };

  const handleSpeechToggle = () => {
    setIsSpeaking(!isSpeaking);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [aiMessages]);

  return (
    <Card className="h-96 flex flex-col bg-white border-2 border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarImage} />
              <AvatarFallback>
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{avatarName}</div>
              <Badge variant="outline" className="text-xs border-green-400 text-green-600 bg-green-50">
                Online
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeechToggle}
              className={`w-8 h-8 p-0 ${isSpeaking ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {aiMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {aiLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                    <div className="flex items-center space-x-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-sm text-gray-600">Typing...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceInput}
              className={`w-8 h-8 p-0 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 border-gray-300"
              disabled={aiLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || aiLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiChatBot;
