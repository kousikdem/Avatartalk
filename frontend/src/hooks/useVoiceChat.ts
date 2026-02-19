import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceChatOptions {
  profileId: string;
  userId?: string;
  conversationHistory?: any[];
}

interface VoiceChatResponse {
  transcription: string;
  textResponse: string;
  audioResponse: string;
}

export const useVoiceChat = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const { toast } = useToast();

  const processVoiceChat = useCallback(async (
    audioBase64: string,
    options: VoiceChatOptions
  ): Promise<VoiceChatResponse | null> => {
    setIsProcessing(true);
    
    try {
      console.log('🎙️ Sending voice to backend for processing...');
      
      // Call the voice-chat-stream edge function
      const { data, error } = await supabase.functions.invoke('voice-chat-stream', {
        body: {
          audio: audioBase64,
          profileId: options.profileId,
          userId: options.userId,
          conversationHistory: options.conversationHistory || []
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to process voice chat');
      }

      console.log('✅ Voice processing complete:', {
        transcription: data.transcription,
        hasAudio: !!data.audioResponse
      });

      return {
        transcription: data.transcription,
        textResponse: data.textResponse,
        audioResponse: data.audioResponse
      };

    } catch (error) {
      console.error('❌ Voice chat error:', error);
      toast({
        title: "Voice Processing Error",
        description: error instanceof Error ? error.message : "Failed to process voice input",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const playAudioResponse = useCallback(async (audioBase64: string) => {
    try {
      setIsPlayingAudio(true);
      
      // Convert base64 to audio blob
      const audioData = atob(audioBase64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Audio Playback Error",
          description: "Failed to play audio response",
          variant: "destructive",
        });
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlayingAudio(false);
      toast({
        title: "Audio Error",
        description: "Could not play audio response",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopAudio = useCallback(() => {
    setIsPlayingAudio(false);
    // Audio elements will handle cleanup via onended
  }, []);

  return {
    isProcessing,
    isPlayingAudio,
    processVoiceChat,
    playAudioResponse,
    stopAudio
  };
};
