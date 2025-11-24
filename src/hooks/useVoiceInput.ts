import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

interface CustomSpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface CustomSpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface VoiceSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  language: string;
  onstart: (() => void) | null;
  onresult: ((event: CustomSpeechRecognitionEvent) => void) | null;
  onerror: ((event: CustomSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => VoiceSpeechRecognition;
    webkitSpeechRecognition?: new () => VoiceSpeechRecognition;
  }
}

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const isSupported = useCallback(() => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }, []);

  const initializeRecognition = useCallback(() => {
    if (!isSupported()) {
      toast({
        title: "Voice Input Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    return true;
  }, [isSupported, toast]);

  const startListening = useCallback(async (options: VoiceInputOptions = {}) => {
    try {
      // Use backend voice recognition via MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        setIsListening(false);
        setIsProcessing(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone...",
      });
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsListening(false);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopListening = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsProcessing(true);
      
      // Wait for recording to finish
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get recorded audio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Store for later use
        setTranscript(base64Audio);
        setIsProcessing(false);
        
        toast({
          title: "Processing Voice",
          description: "Voice recorded successfully. Send to process...",
        });
      };
      reader.readAsDataURL(audioBlob);
    }
    setIsListening(false);
  }, [toast]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isProcessing,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: 'MediaRecorder' in window
  };
};