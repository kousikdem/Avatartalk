import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { useToast } from '@/hooks/use-toast';
import { Send, Smile, Mic, MicOff } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ChatBox: React.FC = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { 
    isListening, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported 
  } = useVoiceInput();
  const { synthesizeSpeech } = useCoquiTTS();
  const { toast } = useToast();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleVoiceInput = () => {
    if (!isSupported) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening({
        continuous: false,
        interimResults: true,
        language: 'en-US'
      });
    }
  };

  // Update chat message when transcript changes
  useEffect(() => {
    if (transcript) {
      setChatMessage(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async () => {
    const messageText = chatMessage.trim();
    if (!messageText) return;

    const newMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // AI response simulation
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `Thanks for your message: "${messageText}". I'm here to help!`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      synthesizeSpeech(aiResponse.text);
    }, 1000);
  };

  return (
    <Card className="neo-card h-96">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex-1 space-y-4 overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        
        {/* Compact Chat Input */}
        <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-background/50 to-muted/50 rounded-full border border-border/50 backdrop-blur-sm">
          <div className="flex-1 relative">
            <Input
              value={chatMessage || interimTranscript}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-1 pl-4 h-8"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-6 w-6 p-0 hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20 hover:text-yellow-600 hover:scale-110 transition-all duration-300"
          >
            <Smile className="h-2.5 w-2.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={`rounded-full h-6 w-6 p-0 transition-all duration-300 hover:scale-110 ${
              isListening 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg' 
                : 'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-600'
            }`}
          >
            {isListening ? <MicOff className="h-2.5 w-2.5" /> : <Mic className="h-2.5 w-2.5" />}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="rounded-full h-6 w-6 p-0 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-110 transition-all duration-300 shadow-md"
          >
            <Send className="h-2.5 w-2.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};