import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceCloning {
  id: string;
  original_voice_path: string;
  cloned_voice_path?: string;
  voice_model_id?: string;
  clone_status: 'processing' | 'completed' | 'error';
  voice_settings: any;
  created_at: string;
  updated_at: string;
}

export const useVoiceCloning = () => {
  const [clonings, setClonings] = useState<VoiceCloning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [currentCloning, setCurrentCloning] = useState<VoiceCloning | null>(null);
  const { toast } = useToast();

  const startVoiceCloning = useCallback(async (
    originalVoicePath: string,
    voiceSettings: any = {}
  ) => {
    setIsCloning(true);
    try {
      const response = await supabase.functions.invoke('voice-cloning', {
        body: {
          action: 'start_cloning',
          voiceData: { originalPath: originalVoicePath },
          voiceSettings
        }
      });

      if (response.error) throw response.error;
      
      const { cloning } = response.data;
      setClonings(prev => [cloning, ...prev]);
      setCurrentCloning(cloning);
      
      toast({
        title: "Success",
        description: "Voice cloning started successfully"
      });
      
      return cloning;
    } catch (error) {
      console.error('Error starting voice cloning:', error);
      toast({
        title: "Error",
        description: "Failed to start voice cloning",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCloning(false);
    }
  }, [toast]);

  const getCloningStatus = useCallback(async (cloningId: string) => {
    try {
      const response = await supabase.functions.invoke('voice-cloning', {
        body: {
          action: 'get_cloning_status',
          cloningId
        }
      });

      if (response.error) throw response.error;
      
      const { cloning } = response.data;
      setCurrentCloning(cloning);
      
      // Update the cloning in the list
      setClonings(prev => prev.map(c => c.id === cloningId ? cloning : c));
      
      return cloning;
    } catch (error) {
      console.error('Error getting cloning status:', error);
      toast({
        title: "Error",
        description: "Failed to get cloning status",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const synthesizeWithClonedVoice = useCallback(async (
    text: string,
    voiceModelId: string
  ) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('voice-cloning', {
        body: {
          action: 'synthesize_with_cloned_voice',
          voiceData: { text, voiceModelId }
        }
      });

      if (response.error) throw response.error;
      
      const { audioContent } = response.data;
      
      toast({
        title: "Success",
        description: "Text synthesized with cloned voice"
      });
      
      return audioContent;
    } catch (error) {
      console.error('Error synthesizing with cloned voice:', error);
      toast({
        title: "Error",
        description: "Failed to synthesize with cloned voice",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchClonedVoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('voice-cloning', {
        body: { action: 'list_cloned_voices' }
      });

      if (response.error) throw response.error;
      
      const { clonings: fetchedClonings } = response.data;
      setClonings(fetchedClonings || []);
    } catch (error) {
      console.error('Error fetching cloned voices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cloned voices",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const playClonedVoice = useCallback(async (audioContent: string) => {
    try {
      // Convert base64 to audio blob and play
      const binaryString = atob(audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing cloned voice:', error);
      toast({
        title: "Error",
        description: "Failed to play cloned voice",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    clonings,
    isLoading,
    isCloning,
    currentCloning,
    startVoiceCloning,
    getCloningStatus,
    synthesizeWithClonedVoice,
    fetchClonedVoices,
    playClonedVoice,
    setCurrentCloning
  };
};