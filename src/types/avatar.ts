
export interface AvatarConfig {
  // Basic Info
  gender: 'male' | 'female' | 'non-binary';
  ageRange: 'child' | 'teen' | 'adult' | 'senior';
  
  // Physical Features
  bodyType: 'slim' | 'average' | 'muscular' | 'custom';
  height: number; // cm
  weight: number; // kg
  
  // Appearance
  skinTone: string;
  hairStyle: 'bald' | 'short' | 'medium' | 'long' | 'curly' | 'wavy';
  hairColor: string;
  eyeColor: 'brown' | 'blue' | 'green' | 'hazel' | 'gray';
  
  // Clothing
  clothing: 'casual' | 'business' | 'formal' | 'creative' | 'sporty';
  
  // Advanced (optional)
  facialHair?: 'none' | 'mustache' | 'beard' | 'goatee';
  accessories?: string[];
}

export interface AvatarGenerationRequest {
  config: AvatarConfig;
  quality: 'low' | 'medium' | 'high';
  format: 'glb' | 'fbx' | 'obj';
}

export interface AvatarGenerationResponse {
  success: boolean;
  avatarUrl?: string;
  previewUrl?: string;
  error?: string;
  processingTime?: number;
}
