
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

  const handleEdgeFunctionError = useCallback((error: any, operation: string) => {
    console.error(`❌ ${operation} failed:`, error);
    
    let errorMessage = `Failed to ${operation.toLowerCase()}`;
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
    
    return { success: false, error: errorMessage };
  }, [toast]);

  const invokeEdgeFunction = useCallback(async (body: any, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Edge function attempt ${attempt}/${retries}:`, body.action);
        
        const response = await supabase.functions.invoke('personalized-ai-training', {
          body
        });

        if (response.error) {
          console.error(`❌ Edge function error (attempt ${attempt}):`, response.error);
          
          if (attempt === retries) {
            throw new Error(response.error.message || 'Edge function failed');
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        console.log(`✅ Edge function success (attempt ${attempt}):`, response.data?.success);
        return response;
        
      } catch (error) {
        console.error(`❌ Edge function exception (attempt ${attempt}):`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }, []);

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await invokeEdgeFunction({
        action: 'list_trainings'
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to fetch trainings');
      }
      
      const fetchedTrainings = response.data.trainings || [];
      setTrainings(fetchedTrainings);
      
      console.log(`✅ Fetched ${fetchedTrainings.length} trainings`);
      
    } catch (error) {
      handleEdgeFunctionError(error, 'Fetch trainings');
    } finally {
      setIsLoading(false);
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError]);

  const createTraining = useCallback(async (
    trainingData: TrainingData,
    personalitySettings: PersonalitySettings
  ) => {
    setIsLoading(true);
    try {
      const response = await invokeEdgeFunction({
        action: 'create_training',
        trainingData,
        personalitySettings
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to create training');
      }
      
      const training = response.data.training;
      setTrainings(prev => [training, ...prev]);
      setCurrentTraining(training);
      
      toast({
        title: "Success",
        description: "AI training created successfully with Mixtral 8x7B + Scikit-learn"
      });
      
      return training;
    } catch (error) {
      handleEdgeFunctionError(error, 'Create training');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError, toast]);

  const updateTraining = useCallback(async (
    trainingId: string,
    trainingData: TrainingData,
    personalitySettings: PersonalitySettings
  ) => {
    setIsLoading(true);
    try {
      const response = await invokeEdgeFunction({
        action: 'update_training',
        trainingId,
        trainingData,
        personalitySettings
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to update training');
      }
      
      const training = response.data.training;
      setTrainings(prev => prev.map(t => t.id === trainingId ? training : t));
      setCurrentTraining(training);
      
      toast({
        title: "Success",
        description: "AI training updated successfully"
      });
      
      return training;
    } catch (error) {
      handleEdgeFunctionError(error, 'Update training');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError, toast]);

  const trainModel = useCallback(async (trainingId: string) => {
    setIsTraining(true);
    try {
      const response = await invokeEdgeFunction({
        action: 'train_model',
        trainingId
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to train model');
      }
      
      toast({
        title: "Success",
        description: "Mixtral 8x7B model trained successfully with personalized data"
      });
      
      // Refresh trainings to get updated status
      await fetchTrainings();
      
      return response.data;
    } catch (error) {
      handleEdgeFunctionError(error, 'Train model');
      throw error;
    } finally {
      setIsTraining(false);
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError, toast, fetchTrainings]);

  const getTraining = useCallback(async (trainingId: string) => {
    try {
      const response = await invokeEdgeFunction({
        action: 'get_training',
        trainingId
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to fetch training');
      }
      
      const training = response.data.training;
      setCurrentTraining(training);
      return training;
    } catch (error) {
      handleEdgeFunctionError(error, 'Get training');
      throw error;
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError]);

  const processDocuments = useCallback(async (documents: any[]) => {
    setIsLoading(true);
    try {
      const response = await invokeEdgeFunction({
        action: 'process_documents',
        documents
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to process documents');
      }
      
      const processedDocuments = response.data.processedDocuments;
      
      toast({
        title: "Success",
        description: `${documents.length} documents processed for Mixtral 8x7B training`
      });
      
      return processedDocuments;
    } catch (error) {
      handleEdgeFunctionError(error, 'Process documents');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError, toast]);

  const processQAPairs = useCallback(async (qaPairs: any[]) => {
    setIsLoading(true);
    try {
      const response = await invokeEdgeFunction({
        action: 'process_qa_pairs',
        qaPairs
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to process Q&A pairs');
      }
      
      const processedQA = response.data.processedQA;
      
      toast({
        title: "Success",
        description: `${qaPairs.length} Q&A pairs processed for training`
      });
      
      return processedQA;
    } catch (error) {
      handleEdgeFunctionError(error, 'Process Q&A pairs');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError, toast]);

  const llamaFineTune = useCallback(async (
    datasetId: string,
    personalityConfig: PersonalitySettings
  ) => {
    setIsTraining(true);
    try {
      const response = await invokeEdgeFunction({
        action: 'llama3_fine_tune',
        datasetId,
        personalityConfig
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Failed to complete LLaMA 3 fine-tuning');
      }
      
      const finetuneResult = response.data.finetuneResult;
      
      toast({
        title: "Success",
        description: `Mixtral 8x7B QLoRA fine-tuning completed: ${finetuneResult.model_id}`
      });
      
      return finetuneResult;
    } catch (error) {
      handleEdgeFunctionError(error, 'LLaMA 3 fine-tuning');
      throw error;
    } finally {
      setIsTraining(false);
    }
  }, [invokeEdgeFunction, handleEdgeFunctionError, toast]);

  const saveDraft = useCallback(async (
    trainingData: TrainingData,
    personalitySettings: PersonalitySettings
  ) => {
    if (currentTraining) {
      return await updateTraining(currentTraining.id, trainingData, personalitySettings);
    } else {
      return await createTraining(trainingData, personalitySettings);
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
