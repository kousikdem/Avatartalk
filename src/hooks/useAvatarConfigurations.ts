import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvatarConfiguration {
  id?: string;
  user_id?: string;
  avatarName: string;
  gender: string;
  age: number;
  ethnicity?: string;
  height: number;
  weight: number;
  muscle: number;
  fat: number;
  headSize: number;
  headShape: string;
  faceWidth: number;
  jawline: number;
  cheekbones: number;
  eyeSize: number;
  eyeDistance: number;
  eyeShape: string;
  eyeColor: string;
  noseSize: number;
  noseWidth: number;
  noseShape: string;
  mouthWidth: number;
  lipThickness: number;
  lipShape: string;
  earSize: number;
  earPosition: number;
  earShape: string;
  skinTone: string;
  skinTexture: string;
  hairStyle: string;
  hairColor: string;
  hairLength: number;
  facialHair?: string;
  facialHairColor?: string;
  clothingTop?: string;
  clothingBottom?: string;
  shoes?: string;
  accessories: any[];
  currentPose: string;
  currentExpression: string;
  torsoLength?: number;
  legLength?: number;
  shoulderWidth?: number;
  handSize?: number;
  isActive?: boolean;
  thumbnailUrl?: string;
  modelUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useAvatarConfigurations = () => {
  const [configurations, setConfigurations] = useState<AvatarConfiguration[]>([]);
  const [currentConfig, setCurrentConfig] = useState<AvatarConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load all avatar configurations for the current user
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('avatar_configurations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const configs = data?.map(d => ({
          id: d.id,
          user_id: d.user_id,
          avatarName: d.avatar_name,
          gender: d.gender,
          age: d.age_category === 'child' ? 12 : d.age_category === 'teen' ? 16 : 25,
          height: Number(d.height),
          weight: Number(d.weight),
          muscle: Number(d.muscle_definition),
          fat: Number(d.body_fat),
          headSize: Number(d.head_size),
          headShape: d.head_shape,
          faceWidth: Number(d.face_width || 50),
          jawline: Number(d.jawline),
          cheekbones: Number(d.cheekbones),
          eyeSize: Number(d.eye_size),
          eyeDistance: Number(d.eye_distance),
          eyeShape: d.eye_shape,
          eyeColor: d.eye_color,
          noseSize: Number(d.nose_size),
          noseWidth: Number(d.nose_width),
          noseShape: d.nose_shape,
          mouthWidth: Number(d.mouth_width),
          lipThickness: Number(d.lip_thickness),
          lipShape: d.lip_shape,
          earSize: Number(d.ear_size),
          earPosition: Number(d.ear_position),
          earShape: d.ear_shape,
          skinTone: d.skin_tone,
          skinTexture: d.skin_texture,
          hairStyle: d.hair_style,
          hairColor: d.hair_color,
          hairLength: Number(d.hair_length),
          clothingTop: d.clothing_top || 'tshirt',
          clothingBottom: d.clothing_bottom || 'jeans',
          shoes: d.shoes || 'sneakers',
          accessories: Array.isArray(d.accessories) ? d.accessories : [],
          // Commented out until database migration is approved
          // torsoLength: Number(d.torso_length || 50),
          // legLength: Number(d.leg_length || 50),
          // shoulderWidth: Number(d.shoulder_width || 50),
          // handSize: Number(d.hand_size || 50),
          currentPose: d.current_pose,
          currentExpression: d.current_expression,
          isActive: d.is_active,
          thumbnailUrl: d.thumbnail_url,
          modelUrl: d.model_url,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        })) || [];
        
        setConfigurations(configs);
        if (configs.length > 0) {
          setCurrentConfig(configs.find(c => c.isActive) || configs[0]);
        }
      }
    } catch (error) {
      console.error('Error in loadConfigurations:', error);
      toast.error('Failed to load avatar configurations');
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
        toast.error('Please log in to save avatars');
        return;
      }

      const dbConfig = {
        user_id: user.id,
        avatar_name: config.avatarName || 'My Avatar',
        gender: config.gender || 'male',
        age_category: config.age && config.age < 13 ? 'child' : config.age && config.age < 18 ? 'teen' : 'adult',
        height: config.height || 170,
        weight: config.weight || 70,
        muscle_definition: config.muscle || 50,
        body_fat: config.fat || 20,
        head_size: config.headSize || 50,
        head_shape: config.headShape || 'oval',
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
        clothing_top: config.clothingTop || 'tshirt',
        clothing_bottom: config.clothingBottom || 'jeans',
        shoes: config.shoes || 'sneakers',
        accessories: config.accessories || [],
        current_pose: config.currentPose || 'standing',
        current_expression: config.currentExpression || 'neutral',
        model_url: config.modelUrl || null,
        thumbnail_url: config.thumbnailUrl || null,
        is_active: true
      };

      let result;
      if (config.id) {
        result = await supabase
          .from('avatar_configurations')
          .update(dbConfig)
          .eq('id', config.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('avatar_configurations')
          .insert(dbConfig)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Link avatar with profile and all previews
      const avatarId = result.data.id;
      const thumbnailUrl = config.thumbnailUrl || result.data.thumbnail_url || '/lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png';
      const modelUrl = config.modelUrl || result.data.model_url;
      
      // Update profile with avatar link - this will trigger real-time updates
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          avatar_id: avatarId,
          avatar_url: thumbnailUrl,
          profile_pic_url: thumbnailUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile with avatar:', profileError);
      }

      // Reload configurations to reflect changes
      await loadConfigurations();
      
      toast.success('Avatar saved and linked with all previews!');

    } catch (error) {
      console.error('Error in saveConfiguration:', error);
      toast.error('Failed to save avatar configuration');
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
      
      if (error) throw error;
      
      await loadConfigurations();
      toast.success('Avatar configuration deleted successfully');
      
    } catch (error) {
      console.error('Error in deleteConfiguration:', error);
      toast.error('Failed to delete avatar configuration');
    }
  };

  // Set a configuration as active
  const setActiveConfiguration = async (configId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Deactivate all other configs
      await supabase
        .from('avatar_configurations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate the selected config
      const { error } = await supabase
        .from('avatar_configurations')
        .update({ is_active: true })
        .eq('id', configId);

      if (error) throw error;

      await loadConfigurations();
      toast.success('Avatar configuration activated');
      
    } catch (error) {
      console.error('Error in setActiveConfiguration:', error);
      toast.error('Failed to set active configuration');
    }
  };

  // Helper function to generate ID
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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