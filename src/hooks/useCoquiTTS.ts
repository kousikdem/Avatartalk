import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CoquiTTSOptions {
  voice?: string;
  speed?: number;
  language?: string;
}

interface CoquiSTTOptions {
  language?: string;
  continuous?: boolean;
}

export const useCoquiTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const { toast } = useToast();

  // Preload voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          setVoicesLoaded(true);
          console.log('🔊 TTS Voices loaded:', voices.length);
        }
      };
      
      // Load voices immediately if already available
      loadVoices();
      
      // Also listen for voiceschanged event (Chrome loads voices async)
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const synthesizeSpeech = useCallback(async (text: string, options: CoquiTTSOptions = {}) => {
    if (!text.trim()) {
      console.log('TTS: Empty text, skipping');
      return;
    }

    setIsLoading(true);
    
    try {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser');
        setIsLoading(false);
        return;
      }

      // Cancel any ongoing speech first
      speechSynthesis.cancel();
      
      // Small delay to ensure cancel completes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Wait for voices to be available
      let voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait up to 1 second for voices to load
        await new Promise<void>((resolve) => {
          const checkVoices = () => {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve();
            }
          };
          speechSynthesis.addEventListener('voiceschanged', checkVoices, { once: true });
          setTimeout(() => resolve(), 1000);
        });
        voices = speechSynthesis.getVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed || 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = options.language || 'en-US';
      
      // Set voice - prioritize English voices
      if (voices.length > 0) {
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const selectedVoice = englishVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('google')
        ) || englishVoices[0] || voices[0];
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
        setIsLoading(false);
        // Only show toast for actual critical errors, not interruptions or common issues
        if (event.error !== 'interrupted' && event.error !== 'canceled' && event.error !== 'not-allowed') {
          console.log('TTS error type:', event.error);
        }
      };

      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [toast]);

  const startRecording = useCallback(async (options: CoquiSTTOptions = {}) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      const audioChunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert to base64 for transmission
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            setIsLoading(true);
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });
            
            if (error) throw error;
            
            console.log('Coqui STT result:', data);
            
            toast({
              title: "Speech Recognition",
              description: `Transcribed: ${data.text}`,
            });
            
          } catch (error) {
            console.error('Speech-to-text error:', error);
            toast({
              title: "STT Error",
              description: "Failed to transcribe speech",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

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
    startRecording,
    stopRecording,
    stopSpeech,
    getVoices,
    isLoading,
    isPlaying,
    isRecording,
    isSupported: 'speechSynthesis' in window && 'MediaRecorder' in window
  };
};
