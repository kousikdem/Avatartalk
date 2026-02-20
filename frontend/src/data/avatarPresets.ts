// Preset avatar configurations for quick selection

export interface AvatarPreset {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  gender: string;
  config: {
    gender: string;
    age: number;
    ethnicity: string;
    height: number;
    weight: number;
    muscle: number;
    fat: number;
    torsoLength: number;
    legLength: number;
    shoulderWidth: number;
    handSize: number;
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
    clothingTop: string;
    clothingBottom: string;
    shoes: string;
    accessories: string[];
    currentExpression: string;
    currentPose: string;
  };
}

export const avatarPresets: AvatarPreset[] = [
  // Male Presets
  {
    id: 'male-athletic',
    name: 'Athletic Male',
    thumbnail: '💪',
    description: 'Fit and athletic build',
    gender: 'male',
    config: {
      gender: 'male',
      age: 28,
      ethnicity: 'caucasian',
      height: 182,
      weight: 82,
      muscle: 75,
      fat: 12,
      torsoLength: 55,
      legLength: 55,
      shoulderWidth: 65,
      handSize: 52,
      headSize: 50,
      headShape: 'square',
      faceWidth: 55,
      jawline: 70,
      cheekbones: 60,
      eyeSize: 48,
      eyeDistance: 50,
      eyeShape: 'almond',
      eyeColor: '#4A90E2',
      noseSize: 52,
      noseWidth: 50,
      noseShape: 'straight',
      mouthWidth: 50,
      lipThickness: 45,
      lipShape: 'normal',
      earSize: 50,
      earPosition: 50,
      earShape: 'normal',
      skinTone: '#F5D0A9',
      skinTexture: 'smooth',
      hairStyle: 'short',
      hairColor: '#2F2F2F',
      hairLength: 30,
      facialHair: 'stubble',
      facialHairColor: '#2F2F2F',
      clothingTop: 'tshirt',
      clothingBottom: 'athletic',
      shoes: 'sneakers',
      accessories: [],
      currentExpression: 'confident',
      currentPose: 'standing'
    }
  },
  {
    id: 'male-professional',
    name: 'Professional Male',
    thumbnail: '👔',
    description: 'Business professional',
    gender: 'male',
    config: {
      gender: 'male',
      age: 35,
      ethnicity: 'caucasian',
      height: 178,
      weight: 75,
      muscle: 55,
      fat: 18,
      torsoLength: 50,
      legLength: 50,
      shoulderWidth: 58,
      handSize: 50,
      headSize: 50,
      headShape: 'oval',
      faceWidth: 50,
      jawline: 60,
      cheekbones: 55,
      eyeSize: 50,
      eyeDistance: 50,
      eyeShape: 'almond',
      eyeColor: '#8B4513',
      noseSize: 50,
      noseWidth: 50,
      noseShape: 'straight',
      mouthWidth: 50,
      lipThickness: 48,
      lipShape: 'normal',
      earSize: 50,
      earPosition: 50,
      earShape: 'normal',
      skinTone: '#F1C27D',
      skinTexture: 'smooth',
      hairStyle: 'short',
      hairColor: '#4A4A4A',
      hairLength: 35,
      facialHair: 'clean',
      clothingTop: 'suit',
      clothingBottom: 'dress pants',
      shoes: 'formal',
      accessories: ['glasses'],
      currentExpression: 'professional',
      currentPose: 'confident'
    }
  },
  {
    id: 'male-casual',
    name: 'Casual Male',
    thumbnail: '👕',
    description: 'Relaxed casual style',
    gender: 'male',
    config: {
      gender: 'male',
      age: 24,
      ethnicity: 'asian',
      height: 175,
      weight: 70,
      muscle: 50,
      fat: 20,
      torsoLength: 50,
      legLength: 50,
      shoulderWidth: 52,
      handSize: 50,
      headSize: 48,
      headShape: 'round',
      faceWidth: 48,
      jawline: 50,
      cheekbones: 50,
      eyeSize: 52,
      eyeDistance: 52,
      eyeShape: 'almond',
      eyeColor: '#2F4F4F',
      noseSize: 48,
      noseWidth: 48,
      noseShape: 'straight',
      mouthWidth: 50,
      lipThickness: 50,
      lipShape: 'normal',
      earSize: 50,
      earPosition: 50,
      earShape: 'normal',
      skinTone: '#F4E4C1',
      skinTexture: 'smooth',
      hairStyle: 'medium',
      hairColor: '#000000',
      hairLength: 45,
      clothingTop: 'hoodie',
      clothingBottom: 'jeans',
      shoes: 'sneakers',
      accessories: [],
      currentExpression: 'friendly',
      currentPose: 'relaxed'
    }
  },
  {
    id: 'male-creative',
    name: 'Creative Male',
    thumbnail: '🎨',
    description: 'Artistic and expressive',
    gender: 'male',
    config: {
      gender: 'male',
      age: 26,
      ethnicity: 'hispanic',
      height: 176,
      weight: 68,
      muscle: 45,
      fat: 16,
      torsoLength: 50,
      legLength: 52,
      shoulderWidth: 50,
      handSize: 50,
      headSize: 50,
      headShape: 'diamond',
      faceWidth: 50,
      jawline: 52,
      cheekbones: 58,
      eyeSize: 54,
      eyeDistance: 50,
      eyeShape: 'round',
      eyeColor: '#50C878',
      noseSize: 52,
      noseWidth: 50,
      noseShape: 'curved',
      mouthWidth: 52,
      lipThickness: 52,
      lipShape: 'full',
      earSize: 50,
      earPosition: 50,
      earShape: 'normal',
      skinTone: '#D2936D',
      skinTexture: 'smooth',
      hairStyle: 'long',
      hairColor: '#3E2723',
      hairLength: 70,
      facialHair: 'goatee',
      facialHairColor: '#3E2723',
      clothingTop: 'casual',
      clothingBottom: 'jeans',
      shoes: 'boots',
      accessories: ['earring'],
      currentExpression: 'expressive',
      currentPose: 'creative'
    }
  },
  // Female Presets
  {
    id: 'female-athletic',
    name: 'Athletic Female',
    thumbnail: '🏃‍♀️',
    description: 'Fit and sporty',
    gender: 'female',
    config: {
      gender: 'female',
      age: 26,
      ethnicity: 'caucasian',
      height: 168,
      weight: 58,
      muscle: 65,
      fat: 18,
      torsoLength: 48,
      legLength: 58,
      shoulderWidth: 45,
      handSize: 48,
      headSize: 48,
      headShape: 'oval',
      faceWidth: 45,
      jawline: 48,
      cheekbones: 62,
      eyeSize: 54,
      eyeDistance: 52,
      eyeShape: 'almond',
      eyeColor: '#50C878',
      noseSize: 45,
      noseWidth: 45,
      noseShape: 'straight',
      mouthWidth: 48,
      lipThickness: 52,
      lipShape: 'full',
      earSize: 48,
      earPosition: 50,
      earShape: 'delicate',
      skinTone: '#FAD6A5',
      skinTexture: 'smooth',
      hairStyle: 'ponytail',
      hairColor: '#8B4513',
      hairLength: 60,
      clothingTop: 'sportwear',
      clothingBottom: 'leggings',
      shoes: 'athletic',
      accessories: [],
      currentExpression: 'determined',
      currentPose: 'running'
    }
  },
  {
    id: 'female-professional',
    name: 'Professional Female',
    thumbnail: '💼',
    description: 'Business executive',
    gender: 'female',
    config: {
      gender: 'female',
      age: 32,
      ethnicity: 'caucasian',
      height: 172,
      weight: 62,
      muscle: 50,
      fat: 22,
      torsoLength: 50,
      legLength: 52,
      shoulderWidth: 44,
      handSize: 48,
      headSize: 48,
      headShape: 'heart',
      faceWidth: 46,
      jawline: 45,
      cheekbones: 60,
      eyeSize: 52,
      eyeDistance: 50,
      eyeShape: 'almond',
      eyeColor: '#4A90E2',
      noseSize: 46,
      noseWidth: 44,
      noseShape: 'straight',
      mouthWidth: 50,
      lipThickness: 54,
      lipShape: 'full',
      earSize: 48,
      earPosition: 50,
      earShape: 'delicate',
      skinTone: '#F5D0A9',
      skinTexture: 'smooth',
      hairStyle: 'short',
      hairColor: '#654321',
      hairLength: 40,
      clothingTop: 'blazer',
      clothingBottom: 'skirt',
      shoes: 'heels',
      accessories: ['necklace', 'earrings'],
      currentExpression: 'confident',
      currentPose: 'confident'
    }
  },
  {
    id: 'female-casual',
    name: 'Casual Female',
    thumbnail: '👗',
    description: 'Everyday casual',
    gender: 'female',
    config: {
      gender: 'female',
      age: 23,
      ethnicity: 'asian',
      height: 165,
      weight: 55,
      muscle: 45,
      fat: 24,
      torsoLength: 48,
      legLength: 50,
      shoulderWidth: 42,
      handSize: 46,
      headSize: 48,
      headShape: 'round',
      faceWidth: 46,
      jawline: 42,
      cheekbones: 58,
      eyeSize: 56,
      eyeDistance: 52,
      eyeShape: 'round',
      eyeColor: '#2F4F4F',
      noseSize: 44,
      noseWidth: 42,
      noseShape: 'small',
      mouthWidth: 48,
      lipThickness: 50,
      lipShape: 'normal',
      earSize: 46,
      earPosition: 50,
      earShape: 'delicate',
      skinTone: '#FFE4C4',
      skinTexture: 'smooth',
      hairStyle: 'long',
      hairColor: '#000000',
      hairLength: 75,
      clothingTop: 'dress',
      clothingBottom: 'dress',
      shoes: 'flats',
      accessories: [],
      currentExpression: 'friendly',
      currentPose: 'standing'
    }
  },
  {
    id: 'female-elegant',
    name: 'Elegant Female',
    thumbnail: '👸',
    description: 'Sophisticated style',
    gender: 'female',
    config: {
      gender: 'female',
      age: 29,
      ethnicity: 'african',
      height: 175,
      weight: 65,
      muscle: 52,
      fat: 20,
      torsoLength: 52,
      legLength: 56,
      shoulderWidth: 46,
      handSize: 48,
      headSize: 50,
      headShape: 'oval',
      faceWidth: 48,
      jawline: 50,
      cheekbones: 68,
      eyeSize: 54,
      eyeDistance: 54,
      eyeShape: 'almond',
      eyeColor: '#654321',
      noseSize: 50,
      noseWidth: 48,
      noseShape: 'wide',
      mouthWidth: 52,
      lipThickness: 60,
      lipShape: 'full',
      earSize: 48,
      earPosition: 50,
      earShape: 'delicate',
      skinTone: '#8D5524',
      skinTexture: 'smooth',
      hairStyle: 'braids',
      hairColor: '#1C1C1C',
      hairLength: 65,
      clothingTop: 'elegant',
      clothingBottom: 'dress pants',
      shoes: 'heels',
      accessories: ['necklace', 'earrings', 'bracelet'],
      currentExpression: 'elegant',
      currentPose: 'confident'
    }
  }
];

// Pose presets
export const posePresets = [
  { id: 'standing', name: 'Standing', icon: '🧍' },
  { id: 'sitting', name: 'Sitting', icon: '🪑' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'dancing', name: 'Dancing', icon: '💃' },
  { id: 'relaxed', name: 'Relaxed', icon: '😌' },
  { id: 'confident', name: 'Confident', icon: '💪' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'jumping', name: 'Jumping', icon: '🦘' }
];

// Expression presets
export const expressionPresets = [
  { id: 'neutral', name: 'Neutral', icon: '😐' },
  { id: 'smiling', name: 'Smiling', icon: '😊' },
  { id: 'laughing', name: 'Laughing', icon: '😄' },
  { id: 'surprised', name: 'Surprised', icon: '😲' },
  { id: 'angry', name: 'Angry', icon: '😠' },
  { id: 'sad', name: 'Sad', icon: '😢' },
  { id: 'confident', name: 'Confident', icon: '😎' },
  { id: 'thinking', name: 'Thinking', icon: '🤔' }
];
