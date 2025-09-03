import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarConfiguration {
  id?: string;
  user_id?: string;
  avatar_name: string;
  gender: string;
  age_category: string;
  height: number;
  weight: number;
  muscle_definition: number;
  body_fat: number;
  head_size: number;
  face_width: number;
  jawline: number;
  cheekbones: number;
  eye_size: number;
  eye_distance: number;
  eye_shape: string;
  eye_color: string;
  nose_size: number;
  nose_width: number;
  nose_shape: string;
  mouth_width: number;
  lip_thickness: number;
  lip_shape: string;
  ear_size: number;
  ear_position: number;
  ear_shape: string;
  skin_tone: string;
  skin_texture: string;
  hair_style: string;
  hair_color: string;
  hair_length: number;
  clothing_top?: string;
  clothing_bottom?: string;
  shoes?: string;
  accessories: any[];
  current_pose: string;
  current_expression: string;
  is_active: boolean;
  thumbnail_url?: string;
  model_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAvatarConfigurations = () => {
  const [configurations, setConfigurations] = useState<AvatarConfiguration[]>([]);
  const [currentConfig, setCurrentConfig] = useState<AvatarConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load all avatar configurations for the current user
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      // For now, return empty configurations since table doesn't exist yet
      setConfigurations([]);
      setCurrentConfig(null);
    } catch (error) {
      console.error('Error in loadConfigurations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save a new or update existing avatar configuration
  const saveConfiguration = async (config: Partial<AvatarConfiguration>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save avatar configurations",
          variant: "destructive",
        });
        return;
      }

      // Prepare the configuration data for database
      const configData = {
        user_id: user.id,
        avatar_name: config.avatarName || config.avatar_name || 'My Avatar',
        gender: config.gender || 'male',
        age_category: getAgeCategory(config.age || 25),
        height: config.height || 170,
        weight: config.weight || 70,
        muscle_definition: config.muscle || 50,
        body_fat: config.fat || 20,
        head_size: config.headSize || 50,
        face_width: config.faceWidth || 50,
        jawline: config.jawline || 50,
        cheekbones: config.cheekbones || 50,
        eye_size: config.eyeSize || 50,
        eye_distance: config.eyeDistance || 50,
        eye_shape: config.eyeShape || 'almond',
        eye_color: config.eyeColor || '#8B4513',
        nose_size: config.noseSize || 50,
        nose_width: config.noseWidth || 50,
        nose_shape: config.noseShape || 'straight',
        mouth_width: config.mouthWidth || 50,
        lip_thickness: config.lipThickness || 50,
        lip_shape: config.lipShape || 'normal',
        ear_size: config.earSize || 50,
        ear_position: config.earPosition || 50,
        ear_shape: config.earShape || 'normal',
        skin_tone: config.skinTone || '#F1C27D',
        skin_texture: config.skinTexture || 'smooth',
        hair_style: config.hairStyle || 'medium',
        hair_color: config.hairColor || '#8B4513',
        hair_length: config.hairLength || 50,
        clothing_top: config.clothingTop,
        clothing_bottom: config.clothingBottom,
        shoes: config.shoes,
        accessories: config.accessories || [],
        current_pose: config.currentPose || 'standing',
        current_expression: config.currentExpression || 'neutral',
        is_active: true,
        thumbnail_url: config.thumbnail_url,
        model_url: config.model_url
      };

      let result;
      
      if (config.id) {
        // Update existing configuration
        result = await supabase
          .from('avatar_configurations')
          .update(configData)
          .eq('id', config.id)
          .select();
      } else {
        // Deactivate other configurations first
        await supabase
          .from('avatar_configurations')
          .update({ is_active: false })
          .eq('user_id', user.id);
        
        // Insert new configuration
        result = await supabase
          .from('avatar_configurations')
          .insert(configData)
          .select();
      }

      if (result.error) {
        console.error('Error saving avatar configuration:', result.error);
        toast({
          title: "Error",
          description: "Failed to save avatar configuration",
          variant: "destructive",
        });
        return;
      }

      if (result.data && result.data[0]) {
        setCurrentConfig(result.data[0]);
        await loadConfigurations(); // Refresh the list
        
        toast({
          title: "Success",
          description: "Avatar configuration saved successfully",
        });
      }

    } catch (error) {
      console.error('Error in saveConfiguration:', error);
      toast({
        title: "Error",
        description: "Failed to save avatar configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete an avatar configuration
  const deleteConfiguration = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('avatar_configurations')
        .delete()
        .eq('id', configId);

      if (error) {
        console.error('Error deleting avatar configuration:', error);
        toast({
          title: "Error",
          description: "Failed to delete avatar configuration",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Avatar configuration deleted successfully",
      });

      await loadConfigurations(); // Refresh the list
      
    } catch (error) {
      console.error('Error in deleteConfiguration:', error);
      toast({
        title: "Error",
        description: "Failed to delete avatar configuration",
        variant: "destructive",
      });
    }
  };

  // Set a configuration as active
  const setActiveConfiguration = async (configId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Deactivate all configurations
      await supabase
        .from('avatar_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate the selected configuration
      const { data, error } = await supabase
        .from('avatar_configurations')
        .update({ is_active: true })
        .eq('id', configId)
        .select();

      if (error) {
        console.error('Error setting active configuration:', error);
        return;
      }

      if (data && data[0]) {
        setCurrentConfig(data[0]);
        await loadConfigurations(); // Refresh the list
      }

    } catch (error) {
      console.error('Error in setActiveConfiguration:', error);
    }
  };

  // Helper function to determine age category
  const getAgeCategory = (age: number): string => {
    if (age < 18) return 'child';
    if (age < 30) return 'young_adult';
    if (age < 50) return 'adult';
    if (age < 65) return 'middle_aged';
    return 'senior';
  };

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  return {
    configurations,
    currentConfig,
    loading,
    saving,
    loadConfigurations,
    saveConfiguration,
    deleteConfiguration,
    setActiveConfiguration,
    setCurrentConfig
  };
};