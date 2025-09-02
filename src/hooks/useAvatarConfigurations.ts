import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AvatarConfiguration {
  id?: string;
  user_id?: string;
  avatar_name: string;
  
  // Basic Info
  gender: 'male' | 'female' | 'non-binary';
  age_category: 'child' | 'teen' | 'adult' | 'senior';
  
  // Body Configuration
  height: number;
  weight: number;
  muscle_definition: number;
  body_fat: number;
  
  // Head & Face
  head_size: number;
  head_shape: string;
  face_width: number;
  jawline: number;
  cheekbones: number;
  
  // Eyes
  eye_shape: string;
  eye_size: number;
  eye_distance: number;
  eye_color: string;
  
  // Nose
  nose_size: number;
  nose_width: number;
  nose_shape: string;
  
  // Mouth & Lips
  mouth_width: number;
  lip_thickness: number;
  lip_shape: string;
  
  // Ears
  ear_size: number;
  ear_position: number;
  ear_shape: string;
  
  // Hair
  hair_style: string;
  hair_color: string;
  hair_length: number;
  
  // Skin
  skin_tone: string;
  skin_texture: string;
  
  // Pose & Expression
  current_pose: string;
  current_expression: string;
  
  // Clothing & Accessories
  clothing_top?: string;
  clothing_bottom?: string;
  shoes?: string;
  accessories: string[];
  
  // 3D Model Data
  model_url?: string;
  thumbnail_url?: string;
  
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const defaultAvatarConfig: Omit<AvatarConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  avatar_name: 'My Avatar',
  gender: 'male',
  age_category: 'adult',
  height: 170,
  weight: 70,
  muscle_definition: 50,
  body_fat: 20,
  head_size: 50,
  head_shape: 'oval',
  face_width: 50,
  jawline: 50,
  cheekbones: 50,
  eye_shape: 'almond',
  eye_size: 50,
  eye_distance: 50,
  eye_color: '#8B4513',
  nose_size: 50,
  nose_width: 50,
  nose_shape: 'straight',
  mouth_width: 50,
  lip_thickness: 50,
  lip_shape: 'normal',
  ear_size: 50,
  ear_position: 50,
  ear_shape: 'normal',
  hair_style: 'medium',
  hair_color: '#8B4513',
  hair_length: 50,
  skin_tone: '#F1C27D',
  skin_texture: 'smooth',
  current_pose: 'standing',
  current_expression: 'neutral',
  accessories: [],
  is_active: true,
};

export const useAvatarConfigurations = () => {
  const [configurations, setConfigurations] = useState<AvatarConfiguration[]>([]);
  const [currentConfig, setCurrentConfig] = useState<AvatarConfiguration>(defaultAvatarConfig);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('avatar_configurations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(config => ({
        ...config,
        accessories: Array.isArray(config.accessories) ? config.accessories.map(String) : [],
        gender: config.gender as 'male' | 'female' | 'non-binary',
        age_category: config.age_category as 'child' | 'teen' | 'adult' | 'senior',
      }));
      
      setConfigurations(transformedData);
      
      // Set active configuration as current
      const activeConfig = transformedData.find(config => config.is_active);
      if (activeConfig) {
        setCurrentConfig(activeConfig);
      }
    } catch (error) {
      console.error('Error fetching avatar configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load avatar configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async (config: Partial<AvatarConfiguration>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const configData = {
        ...config,
        user_id: user.id,
      };

      let result;
      if (config.id) {
        // Update existing configuration
        const { data, error } = await supabase
          .from('avatar_configurations')
          .update(configData)
          .eq('id', config.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('avatar_configurations')
          .insert(configData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      // Update local state
      const transformedResult = {
        ...result,
        accessories: Array.isArray(result.accessories) ? result.accessories.map(String) : [],
        gender: result.gender as 'male' | 'female' | 'non-binary',
        age_category: result.age_category as 'child' | 'teen' | 'adult' | 'senior',
      };
      setCurrentConfig(transformedResult);
      await fetchConfigurations();

      toast({
        title: "Success",
        description: "Avatar configuration saved successfully",
      });

      return result;
    } catch (error) {
      console.error('Error saving avatar configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save avatar configuration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('avatar_configurations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchConfigurations();
      
      // Reset to default if deleted config was current
      if (currentConfig.id === id) {
        setCurrentConfig(defaultAvatarConfig);
      }

      toast({
        title: "Success",
        description: "Avatar configuration deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting avatar configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete avatar configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setActiveConfiguration = async (id: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // First, set all configurations to inactive
      await supabase
        .from('avatar_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Then set the selected one as active
      const { data, error } = await supabase
        .from('avatar_configurations')
        .update({ is_active: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        accessories: Array.isArray(data.accessories) ? data.accessories.map(String) : [],
        gender: data.gender as 'male' | 'female' | 'non-binary',
        age_category: data.age_category as 'child' | 'teen' | 'adult' | 'senior',
      };
      setCurrentConfig(transformedData);
      await fetchConfigurations();

      toast({
        title: "Success",
        description: "Avatar configuration activated",
      });
    } catch (error) {
      console.error('Error setting active configuration:', error);
      toast({
        title: "Error",
        description: "Failed to activate avatar configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentConfig = (updates: Partial<AvatarConfiguration>) => {
    setCurrentConfig(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    currentConfig,
    loading,
    fetchConfigurations,
    saveConfiguration,
    deleteConfiguration,
    setActiveConfiguration,
    updateCurrentConfig,
    defaultAvatarConfig,
  };
};