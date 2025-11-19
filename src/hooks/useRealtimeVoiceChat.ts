import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useRealtimeVoiceChat = (profileId?: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      console.log('🎤 Recording started with Faster-Whisper config');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !profileId) return;

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          // Combine audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            if (!base64Audio) {
              throw new Error('Failed to convert audio');
            }

            console.log('🔄 Sending to realtime voice chat pipeline...');
            console.log('📊 Pipeline: Faster-Whisper → Mixtral 8x7B → OpenVoice');

            // Send to realtime voice chat function
            const { data, error } = await supabase.functions.invoke('realtime-voice-chat', {
              body: {
                audio: base64Audio,
                profileId: profileId,
                conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
                voice: 'alloy', // OpenVoice voice setting
              }
            });

            if (error) throw error;

            if (data.success) {
              // Update conversation history
              setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: data.transcription },
                { role: 'assistant', content: data.response }
              ]);

              // Play the audio response
              const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
              await audio.play();

              toast({
                title: "Voice processed",
                description: `Transcribed: "${data.transcription}"`,
              });
            }
          };
        } catch (error) {
          console.error('Error processing voice:', error);
          toast({
            title: "Error",
            description: "Failed to process voice input",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
          resolve();
        }
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }, [profileId, conversationHistory, toast]);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    isRecording,
    isProcessing,
    conversationHistory,
    startRecording,
    stopRecording,
    clearHistory,
  };
};
