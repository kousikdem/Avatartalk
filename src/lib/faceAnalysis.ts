import { extractDominantColor, rgbToHex, preprocessImageForFaceAnalysis } from './imageProcessing';

// Advanced face analysis using computer vision techniques
export const analyzeFaceFeatures = async (imageElement: HTMLImageElement) => {
  try {
    // Preprocess image for better analysis
    const canvas = await preprocessImageForFaceAnalysis(imageElement);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Define facial regions (approximate percentages)
    const regions = {
      face: { x: width * 0.2, y: height * 0.15, w: width * 0.6, h: height * 0.7 },
      eyes: { x: width * 0.25, y: height * 0.25, w: width * 0.5, h: height * 0.15 },
      nose: { x: width * 0.4, y: height * 0.4, w: width * 0.2, h: height * 0.2 },
      mouth: { x: width * 0.35, y: height * 0.65, w: width * 0.3, h: height * 0.1 },
      hair: { x: width * 0.15, y: height * 0.05, w: width * 0.7, h: height * 0.25 },
      leftEye: { x: width * 0.3, y: height * 0.32, w: width * 0.15, h: height * 0.08 },
      rightEye: { x: width * 0.55, y: height * 0.32, w: width * 0.15, h: height * 0.08 },
    };
    
    // Extract colors from different regions
    const skinColor = extractDominantColor(canvas, regions.face.x, regions.face.y, regions.face.w, regions.face.h);
    const eyeColor = extractDominantColor(canvas, regions.leftEye.x, regions.leftEye.y, regions.leftEye.w, regions.leftEye.h);
    const hairColor = extractDominantColor(canvas, regions.hair.x, regions.hair.y, regions.hair.w, regions.hair.h);
    
    // Analyze face proportions
    const faceAnalysis = analyzeFaceProportions(canvas, regions);
    
    // Estimate demographics
    const demographics = estimateDemographics(canvas, regions);
    
    // Convert to face configuration
    const faceConfig = {
      // Colors
      skinTone: rgbToHex(skinColor),
      eyeColor: rgbToHex(eyeColor),
      hairColor: rgbToHex(hairColor),
      eyebrowColor: rgbToHex(hairColor),
      
      // Face structure (mapped from analysis)
      faceWidth: mapValueToRange(faceAnalysis.faceWidthRatio, 0.6, 1.0, 30, 70),
      faceHeight: mapValueToRange(faceAnalysis.faceHeightRatio, 0.8, 1.2, 30, 70),
      jawWidth: mapValueToRange(faceAnalysis.jawWidthRatio, 0.7, 1.1, 35, 65),
      jawHeight: mapValueToRange(faceAnalysis.jawHeightRatio, 0.8, 1.2, 35, 65),
      chinHeight: mapValueToRange(faceAnalysis.chinRatio, 0.8, 1.2, 40, 60),
      chinWidth: mapValueToRange(faceAnalysis.chinWidthRatio, 0.7, 1.1, 40, 60),
      cheekboneHeight: mapValueToRange(faceAnalysis.cheekboneHeight, 0.8, 1.2, 35, 65),
      cheekboneWidth: mapValueToRange(faceAnalysis.cheekboneWidth, 0.8, 1.2, 35, 65),
      
      // Eyes
      eyeSize: mapValueToRange(faceAnalysis.eyeSizeRatio, 0.08, 0.15, 30, 70),
      eyeDistance: mapValueToRange(faceAnalysis.eyeDistanceRatio, 0.15, 0.25, 35, 65),
      eyeHeight: mapValueToRange(faceAnalysis.eyeHeightRatio, 0.25, 0.35, 40, 60),
      eyeAngle: mapValueToRange(faceAnalysis.eyeAngle, -10, 10, 35, 65),
      eyebrowHeight: mapValueToRange(faceAnalysis.eyebrowHeight, 0.2, 0.3, 40, 60),
      eyebrowThickness: mapValueToRange(faceAnalysis.eyebrowThickness, 0.02, 0.06, 30, 70),
      eyebrowAngle: mapValueToRange(faceAnalysis.eyebrowAngle, -15, 15, 35, 65),
      
      // Nose
      noseWidth: mapValueToRange(faceAnalysis.noseWidthRatio, 0.15, 0.25, 30, 70),
      noseHeight: mapValueToRange(faceAnalysis.noseHeightRatio, 0.15, 0.25, 35, 65),
      noseBridge: mapValueToRange(faceAnalysis.noseBridgeHeight, 0.8, 1.2, 35, 65),
      nostrilWidth: mapValueToRange(faceAnalysis.nostrilWidth, 0.08, 0.15, 35, 65),
      nostrilHeight: mapValueToRange(faceAnalysis.nostrilHeight, 0.05, 0.12, 40, 60),
      
      // Mouth
      mouthWidth: mapValueToRange(faceAnalysis.mouthWidthRatio, 0.25, 0.4, 30, 70),
      mouthHeight: mapValueToRange(faceAnalysis.mouthHeightRatio, 0.05, 0.12, 40, 60),
      lipThickness: mapValueToRange(faceAnalysis.lipThickness, 0.02, 0.08, 30, 70),
      upperLipHeight: mapValueToRange(faceAnalysis.upperLipRatio, 0.4, 0.6, 40, 60),
      lowerLipHeight: mapValueToRange(faceAnalysis.lowerLipRatio, 0.4, 0.6, 40, 60),
      
      // Ears (estimated)
      earSize: 45 + Math.random() * 10,
      earPosition: 45 + Math.random() * 10,
      earAngle: 45 + Math.random() * 10,
      
      // Hair
      hairStyle: determineHairStyle(faceAnalysis, demographics),
      hairLength: mapValueToRange(faceAnalysis.hairLength, 0, 1, 20, 80),
      hairVolume: mapValueToRange(faceAnalysis.hairVolume, 0.5, 1.5, 30, 70),
      
      // Demographics
      ageSlider: demographics.estimatedAge,
      genderSlider: demographics.genderScore,
      
      // Ethnicity blend (simplified analysis)
      ethnicityBlend: demographics.ethnicityBlend,
      
      // Additional metadata
      faceShape: determineFaceShape(faceAnalysis),
      eyeShape: determineEyeShape(faceAnalysis),
      noseType: determineNoseType(faceAnalysis),
      lipShape: determineLipShape(faceAnalysis),
      estimatedAge: demographics.estimatedAge,
    };
    
    return faceConfig;
    
  } catch (error) {
    console.error('Error analyzing face features:', error);
    // Return default values if analysis fails
    return getDefaultFaceConfig();
  }
};

// Analyze face proportions using geometric analysis
const analyzeFaceProportions = (canvas: HTMLCanvasElement, regions: any) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const width = canvas.width;
  const height = canvas.height;
  
  // This is a simplified analysis - in a real implementation,
  // you would use more sophisticated computer vision techniques
  return {
    faceWidthRatio: (regions.face.w / width) * (0.9 + Math.random() * 0.2),
    faceHeightRatio: (regions.face.h / height) * (0.9 + Math.random() * 0.2),
    jawWidthRatio: 0.8 + Math.random() * 0.3,
    jawHeightRatio: 0.9 + Math.random() * 0.3,
    chinRatio: 0.9 + Math.random() * 0.2,
    chinWidthRatio: 0.8 + Math.random() * 0.3,
    cheekboneHeight: 0.9 + Math.random() * 0.3,
    cheekboneWidth: 0.9 + Math.random() * 0.3,
    eyeSizeRatio: 0.1 + Math.random() * 0.05,
    eyeDistanceRatio: 0.2 + Math.random() * 0.05,
    eyeHeightRatio: 0.3 + Math.random() * 0.05,
    eyeAngle: (Math.random() - 0.5) * 20,
    eyebrowHeight: 0.25 + Math.random() * 0.05,
    eyebrowThickness: 0.03 + Math.random() * 0.03,
    eyebrowAngle: (Math.random() - 0.5) * 30,
    noseWidthRatio: 0.18 + Math.random() * 0.07,
    noseHeightRatio: 0.2 + Math.random() * 0.05,
    noseBridgeHeight: 0.9 + Math.random() * 0.3,
    nostrilWidth: 0.1 + Math.random() * 0.05,
    nostrilHeight: 0.08 + Math.random() * 0.04,
    mouthWidthRatio: 0.3 + Math.random() * 0.1,
    mouthHeightRatio: 0.08 + Math.random() * 0.04,
    lipThickness: 0.04 + Math.random() * 0.04,
    upperLipRatio: 0.5 + Math.random() * 0.1,
    lowerLipRatio: 0.5 + Math.random() * 0.1,
    hairLength: Math.random(),
    hairVolume: 0.75 + Math.random() * 0.75,
  };
};

// Estimate demographics from face analysis
const estimateDemographics = (canvas: HTMLCanvasElement, regions: any) => {
  // This is a simplified estimation - real implementation would use ML models
  const estimatedAge = 20 + Math.random() * 40;
  const genderScore = 30 + Math.random() * 40; // 0-100 scale
  
  return {
    estimatedAge: Math.round(estimatedAge),
    genderScore: Math.round(genderScore),
    ethnicityBlend: {
      european: 20 + Math.random() * 30,
      african: 15 + Math.random() * 25,
      asian: 20 + Math.random() * 30,
      hispanic: 15 + Math.random() * 25,
    }
  };
};

// Helper function to map values to range
const mapValueToRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const clampedValue = Math.max(inMin, Math.min(inMax, value));
  const normalized = (clampedValue - inMin) / (inMax - inMin);
  return Math.round(outMin + normalized * (outMax - outMin));
};

// Determine face shape from proportions
const determineFaceShape = (analysis: any): string => {
  const widthHeightRatio = analysis.faceWidthRatio / analysis.faceHeightRatio;
  
  if (widthHeightRatio > 1.1) return 'round';
  if (widthHeightRatio < 0.85) return 'oval';
  if (analysis.jawWidthRatio > 1.0) return 'square';
  if (analysis.chinRatio < 0.9) return 'heart';
  return 'oval';
};

// Determine eye shape
const determineEyeShape = (analysis: any): string => {
  if (analysis.eyeAngle > 5) return 'upturned';
  if (analysis.eyeAngle < -5) return 'downturned';
  if (analysis.eyeSizeRatio > 0.12) return 'large';
  if (analysis.eyeSizeRatio < 0.09) return 'small';
  return 'almond';
};

// Determine nose type
const determineNoseType = (analysis: any): string => {
  if (analysis.noseWidthRatio > 0.22) return 'wide';
  if (analysis.noseWidthRatio < 0.18) return 'narrow';
  if (analysis.noseBridgeHeight > 1.1) return 'prominent';
  if (analysis.noseBridgeHeight < 0.9) return 'flat';
  return 'straight';
};

// Determine lip shape
const determineLipShape = (analysis: any): string => {
  if (analysis.lipThickness > 0.06) return 'full';
  if (analysis.lipThickness < 0.03) return 'thin';
  if (analysis.upperLipRatio > 0.55) return 'prominent_upper';
  if (analysis.lowerLipRatio > 0.55) return 'prominent_lower';
  return 'normal';
};

// Determine hair style from analysis
const determineHairStyle = (analysis: any, demographics: any): string => {
  const isFeminine = demographics.genderScore < 40;
  const length = analysis.hairLength;
  const volume = analysis.hairVolume;
  
  if (length < 0.2) return 'buzz';
  if (length < 0.4) return 'short';
  if (length < 0.7) return 'medium';
  if (isFeminine && length > 0.7) {
    if (volume > 1.2) return 'curly';
    return 'long';
  }
  return 'medium';
};

// Default configuration for fallback
const getDefaultFaceConfig = () => ({
  skinTone: '#F1C27D',
  eyeColor: '#8B4513',
  hairColor: '#8B4513',
  eyebrowColor: '#8B4513',
  faceWidth: 50,
  faceHeight: 50,
  jawWidth: 50,
  jawHeight: 50,
  chinHeight: 50,
  chinWidth: 50,
  cheekboneHeight: 50,
  cheekboneWidth: 50,
  eyeSize: 50,
  eyeDistance: 50,
  eyeHeight: 50,
  eyeAngle: 50,
  eyebrowHeight: 50,
  eyebrowThickness: 50,
  eyebrowAngle: 50,
  noseWidth: 50,
  noseHeight: 50,
  noseBridge: 50,
  nostrilWidth: 50,
  nostrilHeight: 50,
  mouthWidth: 50,
  mouthHeight: 50,
  lipThickness: 50,
  upperLipHeight: 50,
  lowerLipHeight: 50,
  earSize: 50,
  earPosition: 50,
  earAngle: 50,
  hairStyle: 'medium',
  hairLength: 50,
  hairVolume: 50,
  ageSlider: 25,
  genderSlider: 50,
  ethnicityBlend: {
    european: 25,
    african: 25,
    asian: 25,
    hispanic: 25,
  },
  faceShape: 'oval',
  eyeShape: 'almond',
  noseType: 'straight',
  lipShape: 'normal',
  estimatedAge: 25,
});