import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCoquiTTS } from './useCoquiTTS';

interface VoiceRecording {
  id: string;
  filename: string;
  file_path: string;
  duration?: number;
  transcription?: string;
  processing_status?: string;
  created_at: string;
}

export const useVoiceRecordings = () => {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { startRecording, stopRecording, isRecording: coquiRecording } = useCoquiTTS();

  const fetchRecordings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('voice_recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voice recordings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startNewRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunks.current = [];
      setRecordingDuration(0);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await saveRecording(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
        }
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Voice recording in progress...",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCurrentRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }
  }, []);

  const saveRecording = useCallback(async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to storage
      const fileName = `${user.id}/recording_${Date.now()}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Save to database
      const { data, error } = await supabase
        .from('voice_recordings')
        .insert({
          user_id: user.id,
          filename: `recording_${Date.now()}.webm`,
          file_path: uploadData.path,
          duration: recordingDuration,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setRecordings(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Voice recording saved successfully",
      });

      // Transcribe the recording using Coqui STT
      try {
        await transcribeRecording(data.id, audioBlob);
      } catch (transcriptionError) {
        console.error('Transcription failed:', transcriptionError);
        // Continue even if transcription fails
      }

      return data;
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Error",
        description: "Failed to save recording",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [recordingDuration, toast]);

  const transcribeRecording = useCallback(async (recordingId: string, audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      
      const base64Audio = await base64Promise;
      
      // Send to edge function for transcription
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });
      
      if (error) throw error;
      
      // Update recording with transcription
      await supabase
        .from('voice_recordings')
        .update({ 
          transcription: data.text,
          processing_status: 'completed'
        })
        .eq('id', recordingId);
      
      // Update local state
      setRecordings(prev => prev.map(rec => 
        rec.id === recordingId 
          ? { ...rec, transcription: data.text, processing_status: 'completed' }
          : rec
      ));
      
    } catch (error) {
      console.error('Error transcribing recording:', error);
      // Update recording with error status
      await supabase
        .from('voice_recordings')
        .update({ processing_status: 'error' })
        .eq('id', recordingId);
      
      setRecordings(prev => prev.map(rec => 
        rec.id === recordingId 
          ? { ...rec, processing_status: 'error' }
          : rec
      ));
    }
  }, []);

  const uploadVoiceFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/upload_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data, error } = await supabase
        .from('voice_recordings')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: uploadData.path,
          duration: 0, // Will be updated after processing
          processing_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setRecordings(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Voice file uploaded successfully",
      });

      return data;
    } catch (error) {
      console.error('Error uploading voice file:', error);
      toast({
        title: "Error",
        description: "Failed to upload voice file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteRecording = useCallback(async (id: string, filePath: string) => {
    setIsLoading(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('voice-recordings')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('voice_recordings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecordings(prev => prev.filter(rec => rec.id !== id));
      
      toast({
        title: "Success",
        description: "Recording deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast({
        title: "Error",
        description: "Failed to delete recording",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    recordings,
    isLoading,
    isRecording,
    recordingDuration,
    fetchRecordings,
    startNewRecording,
    stopCurrentRecording,
    uploadVoiceFile,
    deleteRecording,
    formatDuration
  };
};
