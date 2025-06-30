
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Initialize speech synthesis
  const initializeTTS = () => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      return true;
    }
    return false;
  };

  // Text to Speech function
  const speak = async (text: string, options: TTSOptions = {}) => {
    if (!text.trim()) return;

    if (!initializeTTS()) {
      toast({
        title: "TTS Not Supported",
        description: "Speech synthesis is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Cancel any ongoing speech
      if (synthRef.current) {
        synthRef.current.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set options
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Set voice if specified
      if (options.voice) {
        const voices = synthRef.current?.getVoices() || [];
        const selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes(options.voice!.toLowerCase())
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      utterance.onerror = (error) => {
        console.error('TTS Error:', error);
        setIsPlaying(false);
        setIsLoading(false);
        toast({
          title: "TTS Error",
          description: "Failed to convert text to speech",
          variant: "destructive",
        });
      };

      // Speak the text
      synthRef.current?.speak(utterance);

    } catch (error) {
      console.error('TTS Error:', error);
      setIsLoading(false);
      toast({
        title: "TTS Error",
        description: "Failed to convert text to speech",
        variant: "destructive",
      });
    }
  };

  // Stop speaking
  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  // Pause speaking
  const pause = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
    }
  };

  // Resume speaking
  const resume = () => {
    if (synthRef.current) {
      synthRef.current.resume();
    }
  };

  // Get available voices
  const getVoices = () => {
    if (synthRef.current) {
      return synthRef.current.getVoices();
    }
    return [];
  };

  return {
    speak,
    stop,
    pause,
    resume,
    getVoices,
    isPlaying,
    isLoading,
    isSupported: 'speechSynthesis' in window
  };
};
