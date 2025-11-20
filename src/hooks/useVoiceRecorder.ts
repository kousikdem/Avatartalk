import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      console.log('✅ Microphone access granted');
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📦 Audio chunk received:', event.data.size, 'bytes');
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      console.log('🔴 Recording started');

    } catch (error) {
      console.error('❌ Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        console.log('⚠️ No active recording to stop');
        resolve(null);
        return;
      }

      console.log('⏹️ Stopping recording...');

      mediaRecorderRef.current.onstop = async () => {
        if (chunksRef.current.length === 0) {
          console.log('⚠️ No audio data recorded');
          toast({
            title: "No Audio",
            description: "No speech detected. Please try again.",
            variant: "destructive",
          });
          setIsRecording(false);
          setIsProcessing(false);
          resolve(null);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('🎵 Audio blob size:', audioBlob.size, 'bytes');
        
        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setIsProcessing(true);

        try {
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            if (!base64Audio) {
              console.error('❌ Failed to convert audio to base64');
              setIsProcessing(false);
              resolve(null);
              return;
            }

            console.log('📤 Sending audio to Faster-Whisper for transcription...');
            
            // Call voice-to-text function
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            setIsProcessing(false);

            if (error || !data?.text) {
              console.error('❌ Transcription error:', error);
              toast({
                title: "Transcription Failed",
                description: error?.message || "Could not transcribe audio. Please try again.",
                variant: "destructive",
              });
              resolve(null);
              return;
            }

            console.log('✅ Transcription successful:', data.text);
            resolve(data.text || null);
          };
        } catch (error) {
          console.error('❌ Error processing recording:', error);
          setIsProcessing(false);
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [toast]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
};
