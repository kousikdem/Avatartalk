import { useState, useEffect } from 'react';
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
      
      // For now, save to localStorage until database is ready
      const savedConfig: AvatarConfiguration = {
        id: config.id || generateId(),
        avatarName: config.avatarName || 'My Avatar',
        gender: config.gender || 'male',
        age: config.age || 25,
        height: config.height || 170,
        weight: config.weight || 70,
        muscle: config.muscle || 50,
        fat: config.fat || 20,
        headSize: config.headSize || 50,
        headShape: config.headShape || 'oval',
        faceWidth: config.faceWidth || 50,
        jawline: config.jawline || 50,
        cheekbones: config.cheekbones || 50,
        eyeSize: config.eyeSize || 50,
        eyeDistance: config.eyeDistance || 50,
        eyeShape: config.eyeShape || 'almond',
        eyeColor: config.eyeColor || '#8B4513',
        noseSize: config.noseSize || 50,
        noseWidth: config.noseWidth || 50,
        noseShape: config.noseShape || 'straight',
        mouthWidth: config.mouthWidth || 50,
        lipThickness: config.lipThickness || 50,
        lipShape: config.lipShape || 'normal',
        earSize: config.earSize || 50,
        earPosition: config.earPosition || 50,
        earShape: config.earShape || 'normal',
        skinTone: config.skinTone || '#F1C27D',
        skinTexture: config.skinTexture || 'smooth',
        hairStyle: config.hairStyle || 'medium',
        hairColor: config.hairColor || '#8B4513',
        hairLength: config.hairLength || 50,
        clothingTop: config.clothingTop || 'tshirt',
        clothingBottom: config.clothingBottom || 'jeans',
        shoes: config.shoes || 'sneakers',
        accessories: config.accessories || [],
        currentPose: config.currentPose || 'standing',
        currentExpression: config.currentExpression || 'neutral',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingConfigs = JSON.parse(localStorage.getItem('avatarConfigurations') || '[]');
      const updatedConfigs = config.id 
        ? existingConfigs.map((c: AvatarConfiguration) => c.id === config.id ? savedConfig : c)
        : [...existingConfigs, savedConfig];
      
      localStorage.setItem('avatarConfigurations', JSON.stringify(updatedConfigs));
      
      setCurrentConfig(savedConfig);
      setConfigurations(updatedConfigs);
      
      toast.success('Avatar configuration saved successfully!');

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
      const existingConfigs = JSON.parse(localStorage.getItem('avatarConfigurations') || '[]');
      const updatedConfigs = existingConfigs.filter((c: AvatarConfiguration) => c.id !== configId);
      
      localStorage.setItem('avatarConfigurations', JSON.stringify(updatedConfigs));
      setConfigurations(updatedConfigs);
      
      // If we deleted the current config, set the first one as current
      if (currentConfig?.id === configId) {
        setCurrentConfig(updatedConfigs[0] || null);
      }
      
      toast.success('Avatar configuration deleted successfully');
      
    } catch (error) {
      console.error('Error in deleteConfiguration:', error);
      toast.error('Failed to delete avatar configuration');
    }
  };

  // Set a configuration as active
  const setActiveConfiguration = async (configId: string) => {
    try {
      const existingConfigs = JSON.parse(localStorage.getItem('avatarConfigurations') || '[]');
      const config = existingConfigs.find((c: AvatarConfiguration) => c.id === configId);
      
      if (config) {
        setCurrentConfig(config);
        toast.success('Avatar configuration activated');
      }
      
    } catch (error) {
      console.error('Error in setActiveConfiguration:', error);
      toast.error('Failed to set active configuration');
    }
  };

  // Helper function to generate ID
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Load configurations from localStorage on mount
  useEffect(() => {
    try {
      const savedConfigs = JSON.parse(localStorage.getItem('avatarConfigurations') || '[]');
      setConfigurations(savedConfigs);
      
      // Set the first config as current if available
      if (savedConfigs.length > 0) {
        setCurrentConfig(savedConfigs[0]);
      }
    } catch (error) {
      console.error('Error loading configurations from localStorage:', error);
    } finally {
      setLoading(false);
    }
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