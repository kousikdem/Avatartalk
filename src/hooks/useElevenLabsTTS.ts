import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ElevenLabsTTSOptions {
  voice_id?: string;
  model?: string;
  stability?: number;
  similarity_boost?: number;
}

export const useElevenLabsTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const synthesizeSpeech = useCallback(async (text: string, options: ElevenLabsTTSOptions = {}) => {
    if (!text.trim()) return;

    setIsLoading(true);
    
    try {
      // Use ElevenLabs edge function for high-quality TTS
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text,
          voice_id: options.voice_id || '9BWtsMINqrJLrRacOk9x' // Aria voice
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        // Convert base64 to audio blob
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onloadstart = () => {
          setIsPlaying(true);
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = (event) => {
          console.error('Audio playback error:', event);
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
          toast({
            title: "Playback Error",
            description: "Failed to play audio",
            variant: "destructive",
          });
        };

        setCurrentAudio(audio);
        await audio.play();
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      toast({
        title: "Voice Error",
        description: "Failed to generate speech with ElevenLabs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const stopSpeech = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  const getAvailableVoices = useCallback(() => {
    // ElevenLabs top voices with their IDs
    return [
      { id: '9BWtsMINqrJLrRacOK9x', name: 'Aria', description: 'Warm, engaging female voice' },
      { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Professional male voice' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Clear, articulate female voice' },
      { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Friendly female voice' },
      { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Casual male voice' },
      { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Distinguished male voice' },
      { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'Youthful male voice' },
      { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Dynamic male voice' }
    ];
  }, []);

  return {
    synthesizeSpeech,
    stopSpeech,
    getAvailableVoices,
    isLoading,
    isPlaying,
    isSupported: true // ElevenLabs always supported via API
  };
};