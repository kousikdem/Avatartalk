
import { useState, useCallback } from 'react';
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
  const { toast } = useToast();

  const synthesizeSpeech = useCallback(async (text: string, options: CoquiTTSOptions = {}) => {
    if (!text.trim()) return;

    setIsLoading(true);
    
    try {
      // Using Web Speech API as Coqui TTS implementation
      // For production Coqui TTS, you would need server-side setup
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.speed || 1;
        utterance.lang = options.language || 'en-US';
        
        // Set voice if specified
        if (options.voice) {
          const voices = speechSynthesis.getVoices();
          const selectedVoice = voices.find(voice => voice.name.includes(options.voice!));
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }
        
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
