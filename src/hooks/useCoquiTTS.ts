
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CoquiTTSOptions {
  voice?: string;
  speed?: number;
  language?: string;
}

export const useCoquiTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const synthesizeSpeech = useCallback(async (text: string, options: CoquiTTSOptions = {}) => {
    if (!text.trim()) return;

    setIsLoading(true);
    
    try {
      // For now, we'll use the Web Speech API as a fallback
      // Coqui TTS would require server-side implementation
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.speed || 1;
        utterance.lang = options.language || 'en-US';
        
        utterance.onstart = () => {
          setIsPlaying(true);
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setIsLoading(false);
          toast({
            title: "TTS Error",
            description: "Failed to synthesize speech",
            variant: "destructive",
          });
        };

        speechSynthesis.speak(utterance);
      } else {
        throw new Error('Speech synthesis not supported');
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "TTS Error",
        description: "Text-to-speech is not available",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  const getVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }, []);

  return {
    synthesizeSpeech,
    stopSpeech,
    getVoices,
    isLoading,
    isPlaying,
    isSupported: 'speechSynthesis' in window
  };
};
