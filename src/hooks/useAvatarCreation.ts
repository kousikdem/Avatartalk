
import { useState, useCallback, useEffect } from 'react';
import { AvatarConfig, AvatarGenerationRequest } from '@/types/avatar';
import { useToast } from './use-toast';

const defaultAvatarConfig: AvatarConfig = {
  gender: 'male',
  ageRange: 'adult',
  bodyType: 'average',
  height: 175,
  weight: 70,
  skinTone: '#F5DEB3',
  hairStyle: 'short',
  hairColor: '#8B4513',
  eyeColor: 'brown',
  clothing: 'casual'
};

export const useAvatarCreation = () => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultAvatarConfig);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');
  const { toast } = useToast();

  const updateAvatarConfig = useCallback((updates: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const generateAvatar = useCallback(async (config: AvatarConfig) => {
    setIsGenerating(true);
    try {
      // Simulate avatar generation API call
      const request: AvatarGenerationRequest = {
        config,
        quality: 'medium',
        format: 'glb'
      };

      // TODO: Replace with actual API call to MakeHuman/Blender pipeline
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate generated avatar URL
      const simulatedUrl = `/generated-avatars/${Date.now()}.glb`;
      setAvatarUrl(simulatedUrl);
      setLastGenerated(JSON.stringify(config));
      
      toast({
        title: "Avatar Generated",
        description: "Your 3D avatar has been successfully created!",
      });
    } catch (error) {
      console.error('Avatar generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const saveAvatar = useCallback(async () => {
    try {
      // TODO: Implement avatar saving to user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Avatar Saved",
        description: "Your avatar has been saved to your profile.",
      });
    } catch (error) {
      console.error('Avatar save failed:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Auto-generate avatar when config changes significantly
  useEffect(() => {
    const currentConfig = JSON.stringify(avatarConfig);
    if (currentConfig !== lastGenerated && !isGenerating) {
      const debounceTimer = setTimeout(() => {
        generateAvatar(avatarConfig);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(debounceTimer);
    }
  }, [avatarConfig, generateAvatar, lastGenerated, isGenerating]);

  return {
    avatarConfig,
    updateAvatarConfig,
    generateAvatar,
    saveAvatar,
    isGenerating,
    avatarUrl
  };
};
