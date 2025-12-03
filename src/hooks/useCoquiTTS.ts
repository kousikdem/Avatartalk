
import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Preload voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          setVoicesLoaded(true);
          console.log('🔊 TTS voices loaded:', voices.length);
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;

      // Warm up speech synthesis
      const warmUp = new SpeechSynthesisUtterance('');
      warmUp.volume = 0;
      speechSynthesis.speak(warmUp);
      speechSynthesis.cancel();

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const synthesizeSpeech = useCallback(async (text: string, options: CoquiTTSOptions = {}) => {
    if (!text.trim()) return;

    // Check for speech synthesis support
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    setIsLoading(true);
    
    return new Promise<void>((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        
        utterance.rate = options.speed || 1;
        utterance.lang = options.language || 'en-US';
        utterance.volume = 1;
        utterance.pitch = 1;
        
        // Set voice if specified
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          if (options.voice) {
            const selectedVoice = voices.find(voice => 
              voice.name.toLowerCase().includes(options.voice!.toLowerCase()) ||
              voice.name.toLowerCase().includes('neural') ||
              voice.name.toLowerCase().includes('natural')
            );
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
          } else {
            // Try to find a natural sounding voice
            const preferredVoice = voices.find(voice => 
              voice.name.toLowerCase().includes('neural') ||
              voice.name.toLowerCase().includes('natural') ||
              voice.name.toLowerCase().includes('premium') ||
              voice.lang.startsWith('en')
            );
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }
          }
        }
        
        utterance.onstart = () => {
          console.log('🔊 TTS started speaking');
          setIsPlaying(true);
          setIsLoading(false);
        };
        
        utterance.onend = () => {
          console.log('🔊 TTS finished speaking');
          setIsPlaying(false);
          setIsLoading(false);
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          setIsPlaying(false);
          setIsLoading(false);
          
          // Only show toast for non-canceled errors
          if (event.error !== 'canceled' && event.error !== 'interrupted') {
            // Don't show toast for common non-critical errors
            console.warn('TTS playback issue:', event.error);
          }
          resolve(); // Resolve anyway to not block the flow
        };

        // Start speaking with a small delay to ensure proper initialization
        setTimeout(() => {
          speechSynthesis.speak(utterance);
        }, 50);

      } catch (error) {
        setIsLoading(false);
        setIsPlaying(false);
        console.error('TTS initialization error:', error);
        resolve(); // Resolve anyway to not block the flow
      }
    });
  }, []);

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
            
            console.log('STT result:', data);
            
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
      setIsLoading(false);
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
    voicesLoaded,
    isSupported: 'speechSynthesis' in window && 'MediaRecorder' in window
  };
};
