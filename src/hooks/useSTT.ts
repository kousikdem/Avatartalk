
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

// Use a different interface name to avoid conflicts
interface CustomSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

// Extend the Window interface without conflicts
declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new(): CustomSpeechRecognition;
    };
    SpeechRecognition?: {
      new(): CustomSpeechRecognition;
    };
  }
}

export const useSTT = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  const initializeSTT = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    return recognition;
  }, []);

  // Start listening
  const startListening = useCallback((options: STTOptions = {}) => {
    const recognition = initializeSTT();
    
    if (!recognition) {
      const errorMsg = "Speech recognition is not supported in this browser";
      setError(errorMsg);
      toast({
        title: "STT Not Supported",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    try {
      // Configure recognition
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = options.interimResults ?? true;
      recognition.lang = options.language || 'en-US';

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
        setInterimTranscript(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        const errorMsg = `Speech recognition error: ${event.error}`;
        setError(errorMsg);
        setIsListening(false);
        
        toast({
          title: "Speech Recognition Error",
          description: errorMsg,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      // Start recognition
      recognition.start();
      
    } catch (error) {
      const errorMsg = "Failed to start speech recognition";
      setError(errorMsg);
      toast({
        title: "STT Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }, [toast, initializeSTT]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Abort listening
  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    abortListening,
    clearTranscript,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
};
