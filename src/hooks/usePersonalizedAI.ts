
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

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: { action: 'list_trainings' }
      });

      if (response.error) throw response.error;
      
      const { trainings: fetchedTrainings } = response.data;
      setTrainings(fetchedTrainings || []);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI trainings",
        variant: "destructive"
      });
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
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'create_training',
          trainingData,
          personalitySettings
        }
      });

      if (response.error) throw response.error;
      
      const { training } = response.data;
      setTrainings(prev => [training, ...prev]);
      setCurrentTraining(training);
      
      toast({
        title: "Success",
        description: "AI training created successfully"
      });
      
      return training;
    } catch (error) {
      console.error('Error creating training:', error);
      toast({
        title: "Error",
        description: "Failed to create AI training",
        variant: "destructive"
      });
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
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'update_training',
          trainingId,
          trainingData,
          personalitySettings
        }
      });

      if (response.error) throw response.error;
      
      const { training } = response.data;
      setTrainings(prev => prev.map(t => t.id === trainingId ? training : t));
      setCurrentTraining(training);
      
      toast({
        title: "Success",
        description: "AI training updated successfully"
      });
      
      return training;
    } catch (error) {
      console.error('Error updating training:', error);
      toast({
        title: "Error",
        description: "Failed to update AI training",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const trainModel = useCallback(async (trainingId: string) => {
    setIsTraining(true);
    try {
      console.log('🚀 Starting LlamaIndex → LLaMA 3 training pipeline...');
      
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'train_model',
          trainingId
        }
      });

      if (response.error) {
        console.error('Training error:', response.error);
        throw response.error;
      }
      
      const result = response.data;
      
      console.log('✅ Training completed:', result);
      
      toast({
        title: "🎉 AI Training Complete!",
        description: `LlamaIndex → LLaMA 3 model training completed successfully. Model ID: ${result.modelId}`,
      });
      
      // Refresh trainings to get updated status
      await fetchTrainings();
      
      return result;
    } catch (error) {
      console.error('Error training model:', error);
      toast({
        title: "❌ Training Failed",
        description: error instanceof Error ? error.message : "Failed to train AI model with LlamaIndex",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsTraining(false);
    }
  }, [toast, fetchTrainings]);

  const getTraining = useCallback(async (trainingId: string) => {
    try {
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'get_training',
          trainingId
        }
      });

      if (response.error) throw response.error;
      
      const { training } = response.data;
      setCurrentTraining(training);
      return training;
    } catch (error) {
      console.error('Error fetching training:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI training",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const processDocuments = useCallback(async (documents: any[]) => {
    setIsLoading(true);
    try {
      console.log('📚 Processing documents with LlamaIndex...');
      
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'process_documents',
          documents
        }
      });

      if (response.error) throw response.error;
      
      const { processedDocuments, llamaIndexMetrics } = response.data;
      
      toast({
        title: "📄 Documents Processed",
        description: `${documents.length} documents processed with LlamaIndex. Generated ${llamaIndexMetrics.chunksGenerated} chunks.`
      });
      
      return processedDocuments;
    } catch (error) {
      console.error('Error processing documents:', error);
      toast({
        title: "Error",
        description: "Failed to process documents with LlamaIndex",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const processQAPairs = useCallback(async (qaPairs: any[]) => {
    setIsLoading(true);
    try {
      console.log('💬 Processing Q&A pairs for LLaMA 3...');
      
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'process_qa_pairs',
          qaPairs
        }
      });

      if (response.error) throw response.error;
      
      const { processedQA } = response.data;
      
      toast({
        title: "💭 Q&A Processed",
        description: `${qaPairs.length} Q&A pairs formatted for LLaMA 3 training`
      });
      
      return processedQA;
    } catch (error) {
      console.error('Error processing Q&A pairs:', error);
      toast({
        title: "Error",
        description: "Failed to process Q&A pairs",
        variant: "destructive"
      });
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
      const response = await supabase.functions.invoke('personalized-ai-training', {
        body: {
          action: 'llama3_fine_tune',
          datasetId,
          personalityConfig
        }
      });

      if (response.error) throw response.error;
      
      const { finetuneResult } = response.data;
      
      toast({
        title: "Success",
        description: `LLaMA 3 QLoRA fine-tuning completed: ${finetuneResult.model_id}`
      });
      
      return finetuneResult;
    } catch (error) {
      console.error('Error in LLaMA 3 fine-tuning:', error);
      toast({
        title: "Error",
        description: "Failed to complete LLaMA 3 fine-tuning",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsTraining(false);
    }
  }, [toast]);

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
