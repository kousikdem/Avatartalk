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
  Loader2,
  Volume2,
  VolumeX,
  Square
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  hasAudio?: boolean;
}

interface VoiceTextChatProps {
  avatarName?: string;
  avatarImage?: string;
  profileId?: string;
}

const VoiceTextChat: React.FC<VoiceTextChatProps> = ({ 
  avatarName = "AI Assistant", 
  avatarImage,
  profileId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecorder();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    initUser();

    // Initialize chat
    const initialMessage: Message = {
      id: '1',
      text: `Hi! I'm ${avatarName}, your personalized AI assistant powered by Mixtral 8x7B. I understand your preferences and can respond with both text and voice using OpenVoice. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date(),
      hasAudio: false
    };
    setMessages([initialMessage]);
  }, [avatarName]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Create placeholder for AI response
    const aiMessageId = (Date.now() + 1).toString();
    const placeholderMessage: Message = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      hasAudio: voiceEnabled
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const targetProfileId = profileId || userId;
      
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      console.log('📤 Sending message with streaming...');
      
      // Use streaming coordinator for real-time response
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/streaming-coordinator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userMessage: messageText,
            profileId: targetProfileId,
            userId,
            conversationHistory
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Streaming error:', errorText);
        throw new Error(`Streaming request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'text_delta' && data.content) {
                  accumulatedText += data.content;
                  
                  // Update AI message in real-time
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, text: accumulatedText }
                      : msg
                  ));
                } else if (data.type === 'done') {
                  console.log('✅ Streaming completed');
                }
              } catch (e) {
                console.error('Error parsing stream data:', e);
              }
            }
          }
        }
      }

      // Generate voice for final response if enabled
      if (voiceEnabled && accumulatedText && accumulatedText.trim()) {
        console.log('🎤 Generating personalized voice using OpenVoice...');
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
            body: { 
              text: accumulatedText,
              user_id: userId,
              profile_id: targetProfileId
            }
          });

          if (!ttsError && ttsData?.audio) {
            console.log('✅ Playing personalized voice response');
            await playAudio(ttsData.audio);
          } else {
            console.error('OpenVoice generation error:', ttsError);
            toast({
              title: "Voice Generation Failed",
              description: "Text response received, but voice generation failed.",
              variant: "default",
            });
          }
        } catch (voiceError) {
          console.error('Voice processing error:', voiceError);
        }
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      // Update placeholder with error
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: "I'm having trouble responding right now. Please try again." }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = () => {
    handleSendMessage(inputMessage);
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      const transcription = await stopRecording();
      if (transcription && transcription.trim()) {
        handleSendMessage(transcription);
      } else if (transcription === '') {
        toast({
          title: "No Speech Detected",
          description: "Please speak clearly and try again.",
          variant: "default",
        });
      }
    } else {
      await startRecording();
      toast({
        title: "Recording Started",
        description: "Speak now using Faster-Whisper STT...",
        variant: "default",
      });
    }
  };

  const toggleVoiceOutput = () => {
    if (isPlaying) {
      stopAudio();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <Card className="h-[600px] flex flex-col bg-gradient-to-b from-background to-muted/20 border-2 border-primary/20 shadow-xl">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={avatarImage} />
              <AvatarFallback className="bg-primary/10">
                <Bot className="w-6 h-6 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-foreground">{avatarName}</div>
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                Online
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceOutput}
              className={`w-9 h-9 p-0 ${voiceEnabled ? 'text-primary' : 'text-muted-foreground'}`}
              title={voiceEnabled ? 'Voice output enabled' : 'Voice output disabled'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {isPlaying && (
              <Badge variant="secondary" className="text-xs">
                Speaking...
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef}>
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {message.sender === 'ai' ? (
                      <>
                        <AvatarImage src={avatarImage} />
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="w-4 h-4 text-primary" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-accent">U</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 text-foreground border border-border/50'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    {message.hasAudio && (
                      <div className="flex items-center mt-1 text-xs opacity-70">
                        <Volume2 className="w-3 h-3 mr-1" />
                        <span>Voice response</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="flex items-center space-x-2 bg-muted/50 rounded-2xl px-4 py-2 border border-border/50">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </motion.div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleTextSubmit()}
              placeholder="Type your message or use voice..."
              disabled={isLoading || isRecording || isProcessing}
              className="flex-1 bg-background border-border/50"
            />
            <Button
              onClick={handleVoiceToggle}
              disabled={isLoading || isProcessing}
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              className="flex-shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRecording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleTextSubmit}
              disabled={!inputMessage.trim() || isLoading || isRecording}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {isRecording && (
            <p className="text-xs text-muted-foreground mt-2 text-center animate-pulse">
              🎤 Recording... Click stop when finished
            </p>
          )}
          {isProcessing && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Processing voice input...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceTextChat;
