
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PersonalitySettings {
  formality: number;
  verbosity: number;
  friendliness: number;
  mode: 'human' | 'robot' | 'adaptive';
  behavior_learning: boolean;
}

interface TrainingData {
  name: string;
  qaPairs?: any[];
  documents?: any[];
  voiceRecordings?: any[];
  apiData?: any[];
  behaviorData?: any[];
}

interface PersonalizedTraining {
  id: string;
  training_name: string;
  personality_settings: PersonalitySettings;
  voice_settings: any;
  training_data: TrainingData;
  model_status: 'draft' | 'training' | 'completed' | 'error';
  training_progress: number;
  voice_model_id?: string;
  scenario_template?: string;
  created_at: string;
  updated_at: string;
}

export const usePersonalizedAI = () => {
  const [trainings, setTrainings] = useState<PersonalizedTraining[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [currentTraining, setCurrentTraining] = useState<PersonalizedTraining | null>(null);
  const { toast } = useToast();

  const handleError = (error: any, action: string) => {
    console.error(`Error in ${action}:`, error);
    
    let errorMessage = `Failed to ${action}`;
    
    if (error?.code === '42501') {
      errorMessage = 'Access denied. Please check your permissions or contact support.';
    } else if (error?.message?.includes('row-level security')) {
      errorMessage = 'Database access restricted. Please ensure you are properly authenticated.';
    } else if (error?.message?.includes('not authenticated')) {
      errorMessage = 'Please log in to continue.';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: { action: 'list_trainings' }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      const { trainings: fetchedTrainings } = response.data || {};
      setTrainings(fetchedTrainings || []);
    } catch (error) {
      handleError(error, 'fetch AI trainings');
      // Set empty array on error to prevent UI issues
      setTrainings([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createTraining = useCallback(async (
    trainingData: TrainingData,
    personalitySettings: PersonalitySettings
  ) => {
    setIsLoading(true);
    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'create_training',
          trainingData,
          personalitySettings
        }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      const { training } = response.data || {};
      if (training) {
        setTrainings(prev => [training, ...prev]);
        setCurrentTraining(training);
        
        toast({
          title: "Success",
          description: "AI training created successfully"
        });
        
        return training;
      } else {
        throw new Error('No training data returned from server');
      }
    } catch (error) {
      handleError(error, 'create AI training');
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'update_training',
          trainingId,
          trainingData,
          personalitySettings
        }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      const { training } = response.data || {};
      if (training) {
        setTrainings(prev => prev.map(t => t.id === trainingId ? training : t));
        setCurrentTraining(training);
        
        toast({
          title: "Success",
          description: "AI training updated successfully"
        });
        
        return training;
      } else {
        throw new Error('No training data returned from server');
      }
    } catch (error) {
      handleError(error, 'update AI training');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const trainModel = useCallback(async (trainingId: string) => {
    setIsTraining(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'train_model',
          trainingId
        }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      toast({
        title: "Success",
        description: "AI model training completed successfully"
      });
      
      // Refresh trainings to get updated status
      await fetchTrainings();
      
      return response.data;
    } catch (error) {
      handleError(error, 'train AI model');
      throw error;
    } finally {
      setIsTraining(false);
    }
  }, [toast, fetchTrainings]);

  const getTraining = useCallback(async (trainingId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'get_training',
          trainingId
        }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      const { training } = response.data || {};
      if (training) {
        setCurrentTraining(training);
        return training;
      } else {
        throw new Error('Training not found');
      }
    } catch (error) {
      handleError(error, 'fetch AI training');
      throw error;
    }
  }, [toast]);

  const processDocuments = useCallback(async (documents: any[]) => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'process_documents',
          documents
        }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      const { processedDocuments } = response.data || {};
      
      toast({
        title: "Success",
        description: `${documents.length} documents processed for LLaMA 3 training`
      });
      
      return processedDocuments || [];
    } catch (error) {
      handleError(error, 'process documents');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const processQAPairs = useCallback(async (qaPairs: any[]) => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'process_qa_pairs',
          qaPairs
        }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      const { processedQA } = response.data || {};
      
      toast({
        title: "Success",
        description: `${qaPairs.length} Q&A pairs processed for training`
      });
      
      return processedQA || [];
    } catch (error) {
      handleError(error, 'process Q&A pairs');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const llamaFineTune = useCallback(async (
    datasetId: string,
    personalityConfig: PersonalitySettings
  ) => {
    setIsTraining(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'llama3_fine_tune',
          datasetId,
          personalityConfig
        }
      });

      if (response.error) {
        console.error('Function response error:', response.error);
        throw response.error;
      }
      
      const { finetuneResult } = response.data || {};
      
      toast({
        title: "Success",
        description: `LLaMA 3 QLoRA fine-tuning completed: ${finetuneResult?.model_id || 'Model ready'}`
      });
      
      return finetuneResult || {};
    } catch (error) {
      handleError(error, 'complete LLaMA 3 fine-tuning');
      throw error;
    } finally {
      setIsTraining(false);
    }
  }, [toast]);

  const saveDraft = useCallback(async (
    trainingData: TrainingData,
    personalitySettings: PersonalitySettings
  ) => {
    try {
      if (currentTraining) {
        return await updateTraining(currentTraining.id, trainingData, personalitySettings);
      } else {
        return await createTraining(trainingData, personalitySettings);
      }
    } catch (error) {
      // Error already handled in create/update functions
      throw error;
    }
  }, [currentTraining, updateTraining, createTraining]);

  return {
    trainings,
    isLoading,
    isTraining,
    currentTraining,
    fetchTrainings,
    createTraining,
    updateTraining,
    trainModel,
    getTraining,
    saveDraft,
    processDocuments,
    processQAPairs,
    llamaFineTune,
    setCurrentTraining
  };
};
