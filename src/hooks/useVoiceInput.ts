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
  const recognitionRef = useRef<any>(null);
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

  const startListening = useCallback((options: VoiceInputOptions = {}) => {
    if (!initializeRecognition()) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults || true;
    recognition.language = options.language || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: CustomSpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript);
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event: CustomSpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Only show errors that are actionable, ignore 'no-speech' and 'aborted'
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast({
          title: "Voice Input Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking again",
          variant: "default",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  }, [initializeRecognition, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSupported()
  };
};