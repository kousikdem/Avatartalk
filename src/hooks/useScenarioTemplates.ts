import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScenarioTemplate {
  id: string;
  template_name: string;
  template_type: string;
  personality_preset: {
    formality: number;
    verbosity: number;
    friendliness: number;
    mode: 'human' | 'robot' | 'adaptive';
  };
  training_prompts: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useScenarioTemplates = () => {
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scenario_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('template_name');

      if (error) throw error;
      
      setTemplates((data || []) as unknown as ScenarioTemplate[]);
    } catch (error) {
      console.error('Error fetching scenario templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scenario templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createTemplate = useCallback(async (
    templateData: Omit<ScenarioTemplate, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scenario_templates')
        .insert({
          template_name: templateData.template_name,
          template_type: templateData.template_type,
          personality_preset: templateData.personality_preset,
          training_prompts: templateData.training_prompts,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data as unknown as ScenarioTemplate, ...prev]);
      
      toast({
        title: "Success",
        description: "Scenario template created successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating scenario template:', error);
      toast({
        title: "Error",
        description: "Failed to create scenario template",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateTemplate = useCallback(async (
    templateId: string,
    templateData: Partial<ScenarioTemplate>
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scenario_templates')
        .update({
          template_name: templateData.template_name,
          template_type: templateData.template_type,
          personality_preset: templateData.personality_preset,
          training_prompts: templateData.training_prompts
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => prev.map(t => t.id === templateId ? data as unknown as ScenarioTemplate : t));
      
      toast({
        title: "Success",
        description: "Scenario template updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating scenario template:', error);
      toast({
        title: "Error",
        description: "Failed to update scenario template",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('scenario_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      toast({
        title: "Success",
        description: "Scenario template deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting scenario template:', error);
      toast({
        title: "Error",
        description: "Failed to delete scenario template",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const applyTemplate = useCallback((template: ScenarioTemplate) => {
    return {
      personalitySettings: template.personality_preset,
      trainingPrompts: template.training_prompts,
      templateType: template.template_type
    };
  }, []);

  return {
    templates,
    isLoading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate
  };
};