
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PersonalitySettings {
  tone: string;
  style: string;
  expertise: string[];
  responseLength: string;
}

interface TrainingData {
  name: string;
  qaPairs: Array<{
    question: string;
    answer: string;
    context?: string;
  }>;
  documents: Array<{
    id: string;
    content: string;
    metadata?: any;
  }>;
  apiData: Array<{
    endpoint: string;
    data: any;
  }>;
}

interface TrainingRecord {
  id: string;
  user_id: string;
  training_name: string;
  personality_settings: PersonalitySettings;
  training_data: TrainingData;
  model_status: string;
  training_progress: number;
  voice_model_id?: string;
  created_at: string;
  updated_at: string;
}

export const usePersonalizedAI = () => {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTraining, setCurrentTraining] = useState<TrainingRecord | null>(null);
  const { toast } = useToast();

  const handleError = (error: any, action: string) => {
    console.error(`Error in ${action}:`, error);
    
    let errorMessage = `Failed to ${action}`;
    if (error?.message) {
      errorMessage = error.message;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const createTraining = useCallback(async (
    trainingData: TrainingData,
    personalitySettings: PersonalitySettings
  ) => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'create_training',
          trainingData,
          personalitySettings
        }
      });

      if (error) throw error;

      if (data?.success && data?.training) {
        setTrainings(prev => [data.training, ...prev]);
        setCurrentTraining(data.training);
        
        toast({
          title: "Training Created",
          description: "AI training record has been created successfully",
        });
        
        return data.training;
      }
    } catch (error) {
      handleError(error, 'create training');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateTraining = useCallback(async (
    trainingId: string,
    trainingData: TrainingData,
    personalitySettings: PersonalitySettings
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'update_training',
          trainingId,
          trainingData,
          personalitySettings
        }
      });

      if (error) throw error;

      if (data?.success && data?.training) {
        setTrainings(prev => 
          prev.map(t => t.id === trainingId ? data.training : t)
        );
        setCurrentTraining(data.training);
        
        toast({
          title: "Training Updated",
          description: "AI training record has been updated successfully",
        });
        
        return data.training;
      }
    } catch (error) {
      handleError(error, 'update training');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startTraining = useCallback(async (trainingId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'train_model',
          trainingId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Training Started",
          description: "AI model training has been initiated",
        });
        
        return data;
      }
    } catch (error) {
      handleError(error, 'start training');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'list_trainings'
        }
      });

      if (error) throw error;

      if (data?.success && data?.trainings) {
        setTrainings(data.trainings);
      }
    } catch (error) {
      handleError(error, 'fetch trainings');
      setTrainings([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getTraining = useCallback(async (trainingId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'get_training',
          trainingId
        }
      });

      if (error) throw error;

      if (data?.success && data?.training) {
        setCurrentTraining(data.training);
        return data.training;
      }
    } catch (error) {
      handleError(error, 'get training');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    trainings,
    currentTraining,
    isLoading,
    createTraining,
    updateTraining,
    startTraining,
    fetchTrainings,
    getTraining
  };
};
