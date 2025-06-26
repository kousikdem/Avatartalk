
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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface AiChatBotProps {
  avatarName?: string;
  avatarImage?: string;
  personality?: string;
  onMessageSent?: (message: string) => void;
}

const AiChatBot: React.FC<AiChatBotProps> = ({ 
  avatarName = "AI Assistant", 
  avatarImage,
  personality = "friendly",
  onMessageSent 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm ${avatarName}. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAiResponse(inputMessage, personality),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
      if (onMessageSent) {
        onMessageSent(inputMessage);
      }
    }, 1500);
  };

  const generateAiResponse = (userInput: string, personality: string): string => {
    const responses = {
      friendly: [
        "That's a great question! Let me think about that for you.",
        "I'd be happy to help you with that! Here's what I think...",
        "Thanks for asking! From my perspective...",
        "Interesting point! I believe...",
        "I appreciate you sharing that with me. Here's my take..."
      ],
      professional: [
        "Thank you for your inquiry. Based on my analysis...",
        "I understand your concern. Let me provide you with a comprehensive response.",
        "Your question is well-formulated. Here's my professional assessment...",
        "I appreciate the opportunity to address this matter.",
        "Allow me to provide you with a detailed explanation..."
      ],
      mysterious: [
        "Ah, you seek answers... but are you prepared for what you might find?",
        "The question you ask opens doors to deeper mysteries...",
        "In the shadows of knowledge, I find your answer...",
        "Some truths are hidden in plain sight...",
        "The universe whispers its secrets to those who listen..."
      ]
    };

    const personalityResponses = responses[personality as keyof typeof responses] || responses.friendly;
    return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would be implemented here
  };

  const handleSpeechToggle = () => {
    setIsSpeaking(!isSpeaking);
    // Text-to-speech logic would be implemented here
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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
              {messages.map((message) => (
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
            
            {isLoading && (
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
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceToggle}
              className={`w-10 h-10 p-0 ${isRecording ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 text-gray-600'}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border-gray-300"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
