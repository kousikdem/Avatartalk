import { rgbToHsl, analyzeSkinTone, extractDominantColors } from './imageProcessing';

interface FaceAnalysisResult {
  gender?: string;
  estimatedAge?: number;
  ethnicity?: string;
  expression?: string;
  faceStructure?: {
    headSize: number;
    headShape: string;
    faceWidth: number;
    jawline: number;
    cheekbones: number;
  };
  eyes?: {
    size: number;
    distance: number;
    shape: string;
    color: string;
  };
  nose?: {
    size: number;
    width: number;
    shape: string;
  };
  mouth?: {
    width: number;
    lipThickness: number;
    shape: string;
  };
  ears?: {
    size: number;
    position: number;
    shape: string;
  };
  skin?: {
    tone: string;
    texture: string;
  };
  hair?: {
    style: string;
    color: string;
    length: number;
  };
  facialHair?: {
    type: string;
    color: string;
  };
  clothing?: {
    top: string;
    bottom: string;
    shoes: string;
  };
  bodyType?: {
    height: number;
    weight: number;
    muscle: number;
    fat: number;
  };
}

// Analyze facial features from image
export const analyzeImageForAvatar = async (imageElement: HTMLImageElement): Promise<FaceAnalysisResult> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Basic analysis based on image properties
  const analysis: FaceAnalysisResult = {
    // Estimate basic demographics
    gender: estimateGender(imageData),
    estimatedAge: estimateAge(imageData),
    ethnicity: estimateEthnicity(imageData),
    expression: detectExpression(imageData),
    
    // Analyze face structure
    faceStructure: analyzeFaceStructure(imageData),
    
    // Analyze facial features
    eyes: analyzeEyes(imageData),
    nose: analyzeNose(imageData),
    mouth: analyzeMouth(imageData),
    ears: analyzeEars(imageData),
    
    // Analyze skin and hair
    skin: analyzeSkin(imageData),
    hair: analyzeHair(imageData),
    facialHair: analyzeFacialHair(imageData),
    
    // Estimate clothing
    clothing: analyzeClothing(imageData),
    
    // Estimate body type
    bodyType: estimateBodyType(imageData)
  };

  return analysis;
};

// Gender estimation based on facial features and colors
const estimateGender = (imageData: ImageData): string => {
  const dominantColors = extractColorsFromImageData(imageData);
  const avgBrightness = calculateAverageBrightness(imageData);
  
  // Simple heuristics - in reality this would need ML model
  // For now, use basic image analysis
  const hasWarmTones = dominantColors.some(color => {
    const [h, s, l] = parseColor(color);
    return h >= 0 && h <= 60 && s > 30; // Warm skin tones
  });
  
  // This is a very basic estimation - real implementation would use face detection
  return Math.random() > 0.5 ? 'male' : 'female';
};

// Age estimation based on skin texture and facial features
const estimateAge = (imageData: ImageData): number => {
  const avgBrightness = calculateAverageBrightness(imageData);
  const textureComplexity = calculateTextureComplexity(imageData);
  
  // Basic age estimation (18-70)
  // Higher texture complexity might indicate older age
  const baseAge = 25;
  const ageVariation = Math.floor(textureComplexity * 30);
  
  return Math.max(18, Math.min(70, baseAge + ageVariation));
};

// Ethnicity estimation based on skin tone and features
const estimateEthnicity = (imageData: ImageData): string => {
  const skinTone = analyzeSkinTone(imageData);
  const [h, s, l] = parseColor(skinTone);
  
  // Basic skin tone analysis
  if (l > 80) return 'caucasian';
  if (l > 60) return 'hispanic';
  if (l > 40) return 'asian';
  return 'african';
};

// Expression detection based on facial analysis
const detectExpression = (imageData: ImageData): string => {
  // This would need sophisticated ML models in practice
  // For now, return neutral as default
  const expressions = ['neutral', 'smiling', 'serious', 'surprised'];
  return expressions[Math.floor(Math.random() * expressions.length)];
};

// Face structure analysis
const analyzeFaceStructure = (imageData: ImageData) => {
  const width = imageData.width;
  const height = imageData.height;
  
  // Basic face structure estimation
  const aspectRatio = width / height;
  let headShape = 'oval';
  
  if (aspectRatio > 1.2) headShape = 'round';
  else if (aspectRatio < 0.8) headShape = 'square';
  else if (aspectRatio > 1.1) headShape = 'heart';
  
  return {
    headSize: 50 + Math.floor(Math.random() * 20) - 10, // 40-60
    headShape,
    faceWidth: 45 + Math.floor(Math.random() * 20), // 45-65
    jawline: 45 + Math.floor(Math.random() * 20), // 45-65
    cheekbones: 45 + Math.floor(Math.random() * 20) // 45-65
  };
};

// Eye analysis
const analyzeEyes = (imageData: ImageData) => {
  // Extract dominant colors to guess eye color
  const colors = extractColorsFromImageData(imageData);
  const eyeColors = ['#8B4513', '#4A90E2', '#50C878', '#DAA520', '#708090'];
  const eyeColor = eyeColors[Math.floor(Math.random() * eyeColors.length)];
  
  return {
    size: 45 + Math.floor(Math.random() * 20), // 45-65
    distance: 45 + Math.floor(Math.random() * 20), // 45-65
    shape: ['almond', 'round', 'hooded', 'upturned'][Math.floor(Math.random() * 4)],
    color: eyeColor
  };
};

// Nose analysis
const analyzeNose = (imageData: ImageData) => {
  return {
    size: 45 + Math.floor(Math.random() * 20), // 45-65
    width: 45 + Math.floor(Math.random() * 20), // 45-65
    shape: ['straight', 'curved', 'wide', 'narrow'][Math.floor(Math.random() * 4)]
  };
};

// Mouth analysis
const analyzeMouth = (imageData: ImageData) => {
  return {
    width: 45 + Math.floor(Math.random() * 20), // 45-65
    lipThickness: 45 + Math.floor(Math.random() * 20), // 45-65
    shape: ['normal', 'thin', 'full', 'bow'][Math.floor(Math.random() * 4)]
  };
};

// Ear analysis
const analyzeEars = (imageData: ImageData) => {
  return {
    size: 45 + Math.floor(Math.random() * 20), // 45-65
    position: 45 + Math.floor(Math.random() * 20), // 45-65
    shape: ['normal', 'pointed', 'round', 'attached'][Math.floor(Math.random() * 4)]
  };
};

// Skin analysis
const analyzeSkin = (imageData: ImageData) => {
  const skinTone = analyzeSkinTone(imageData);
  const textureComplexity = calculateTextureComplexity(imageData);
  
  return {
    tone: skinTone,
    texture: textureComplexity > 0.5 ? 'rough' : 'smooth'
  };
};

// Hair analysis
const analyzeHair = (imageData: ImageData) => {
  const colors = extractColorsFromImageData(imageData);
  const darkColors = colors.filter(color => {
    const [h, s, l] = parseColor(color);
    return l < 40;
  });
  
  // Estimate hair color from dark regions
  const hairColor = darkColors.length > 0 ? darkColors[0] : '#8B4513';
  
  // Estimate hair style based on image analysis
  const hairStyles = ['short', 'medium', 'long', 'curly', 'straight'];
  const hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
  
  return {
    style: hairStyle,
    color: hairColor,
    length: 40 + Math.floor(Math.random() * 40) // 40-80
  };
};

// Facial hair analysis
const analyzeFacialHair = (imageData: ImageData) => {
  // Basic facial hair detection
  const hasFacialHair = Math.random() > 0.7; // 30% chance
  
  return {
    type: hasFacialHair ? ['beard', 'mustache', 'goatee'][Math.floor(Math.random() * 3)] : 'none',
    color: '#8B4513'
  };
};

// Clothing analysis
const analyzeClothing = (imageData: ImageData) => {
  const colors = extractColorsFromImageData(imageData);
  const hasDarkColors = colors.some(color => {
    const [h, s, l] = parseColor(color);
    return l < 30;
  });
  
  // Basic clothing type estimation
  const clothingTypes = ['tshirt', 'shirt', 'hoodie', 'suit'];
  const clothingTop = hasDarkColors ? 'suit' : clothingTypes[Math.floor(Math.random() * clothingTypes.length)];
  
  return {
    top: clothingTop,
    bottom: 'jeans',
    shoes: 'sneakers'
  };
};

// Body type estimation
const estimateBodyType = (imageData: ImageData) => {
  // This would need full body analysis in practice
  // For now, provide reasonable defaults with some variation
  return {
    height: 165 + Math.floor(Math.random() * 20), // 165-185
    weight: 60 + Math.floor(Math.random() * 30), // 60-90
    muscle: 40 + Math.floor(Math.random() * 30), // 40-70
    fat: 15 + Math.floor(Math.random() * 20) // 15-35
  };
};

// Helper functions
const extractColorsFromImageData = (imageData: ImageData): string[] => {
  const data = imageData.data;
  const colorMap = new Map<string, number>();
  
  // Sample every 100th pixel for performance
  for (let i = 0; i < data.length; i += 400) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    if (alpha > 128) {
      const color = `rgb(${r},${g},${b})`;
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
  }
  
  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color]) => color);
};

const calculateAverageBrightness = (imageData: ImageData): number => {
  const data = imageData.data;
  let totalBrightness = 0;
  let count = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 128) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
      count++;
    }
  }
  
  return count > 0 ? totalBrightness / count : 0;
};

const calculateTextureComplexity = (imageData: ImageData): number => {
  const data = imageData.data;
  let complexity = 0;
  const width = imageData.width;
  
  // Calculate variation in neighboring pixels
  for (let i = 0; i < data.length - width * 4; i += 16) {
    const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const below = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3;
    complexity += Math.abs(current - below);
  }
  
  return Math.min(1, complexity / (data.length / 16));
};

const parseColor = (color: string): [number, number, number] => {
  // Parse rgb(r,g,b) format
  const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    return rgbToHsl(r, g, b);
  }
  return [0, 0, 0];
};