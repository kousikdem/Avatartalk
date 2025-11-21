import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Loader2, MessageSquare, Volume2 } from 'lucide-react';
import { useRealtimeVoiceChat } from '@/hooks/useRealtimeVoiceChat';
import { supabase } from '@/integrations/supabase/client';

const RealtimeVoiceChat: React.FC = () => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const { 
    isRecording, 
    isProcessing, 
    conversationHistory, 
    startRecording, 
    stopRecording,
    clearHistory 
  } = useRealtimeVoiceChat(profileId || undefined);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfileId(user.id);
      }
    };
    getUserProfile();
  }, []);

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            <span>Realtime Voice Chat</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Faster-Whisper STT
            </Badge>
            <Badge variant="outline" className="text-xs">
              Mistral 7B (Ollama)
            </Badge>
            <Badge variant="outline" className="text-xs">
              OpenVoice TTS
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {conversationHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-8 h-8 mr-2" />
              <span>Start talking to begin the conversation</span>
            </div>
          ) : (
            <div className="space-y-4">
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className={`rounded-full w-16 h-16 ${
              isRecording 
                ? 'bg-destructive hover:bg-destructive/90' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
          
          {conversationHistory.length > 0 && (
            <Button
              variant="outline"
              onClick={clearHistory}
              disabled={isProcessing || isRecording}
            >
              Clear History
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {isProcessing && (
            <p>Processing: Transcribing → AI Response → Voice Synthesis...</p>
          )}
          {isRecording && (
            <p className="text-destructive font-medium">Recording... Click to stop</p>
          )}
          {!isRecording && !isProcessing && (
            <p>Click the microphone to start talking</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Pipeline: Faster-Whisper (STT) → Mistral 7B via Ollama (LLM) → OpenVoice (TTS) + Web Scraper
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeVoiceChat;
