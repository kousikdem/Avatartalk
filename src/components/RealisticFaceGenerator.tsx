import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Shuffle, User, Crown, Heart, Zap } from 'lucide-react';

interface RealisticFaceGeneratorProps {
  onFaceGenerated: (faceData: any) => void;
  currentConfig: any;
}

const RealisticFaceGenerator: React.FC<RealisticFaceGeneratorProps> = ({
  onFaceGenerated,
  currentConfig
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedGender, setSelectedGender] = useState('mixed');
  const [selectedAge, setSelectedAge] = useState('adult');
  const [selectedEthnicity, setSelectedEthnicity] = useState('mixed');

  const faceStyles = [
    { id: 'realistic', name: 'Photorealistic', icon: User, description: 'Highly detailed, lifelike appearance' },
    { id: 'beautiful', name: 'Enhanced Beauty', icon: Crown, description: 'Idealized features with perfect symmetry' },
    { id: 'character', name: 'Character', icon: Heart, description: 'Distinctive, memorable features' },
    { id: 'artistic', name: 'Artistic', icon: Sparkles, description: 'Stylized with artistic flair' },
  ];

  const genderOptions = [
    { id: 'masculine', name: 'Masculine', weight: 80 },
    { id: 'feminine', name: 'Feminine', weight: 20 },
    { id: 'neutral', name: 'Neutral', weight: 50 },
    { id: 'mixed', name: 'Mixed', weight: Math.random() * 100 },
  ];

  const ageRanges = [
    { id: 'young', name: 'Young (18-25)', value: 22 },
    { id: 'adult', name: 'Adult (25-40)', value: 32 },
    { id: 'mature', name: 'Mature (40-60)', value: 50 },
    { id: 'senior', name: 'Senior (60+)', value: 65 },
  ];

  const ethnicities = [
    { id: 'mixed', name: 'Mixed Heritage' },
    { id: 'european', name: 'European' },
    { id: 'african', name: 'African' },
    { id: 'asian', name: 'East Asian' },
    { id: 'hispanic', name: 'Hispanic/Latino' },
    { id: 'middle_eastern', name: 'Middle Eastern' },
    { id: 'south_asian', name: 'South Asian' },
    { id: 'native', name: 'Indigenous' },
  ];

  const generateRandomFace = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate AI face generation process
    const steps = [
      'Analyzing style preferences...',
      'Generating base facial structure...',
      'Computing ethnic characteristics...',
      'Refining facial features...',
      'Applying age modifications...',
      'Optimizing gender balance...',
      'Finalizing skin tone...',
      'Rendering hair properties...',
      'Completing face generation...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }

    // Generate realistic face parameters based on selections
    const selectedGenderData = genderOptions.find(g => g.id === selectedGender);
    const selectedAgeData = ageRanges.find(a => a.id === selectedAge);
    const genderInfluence = selectedGenderData?.weight || 50;

    // Generate base structure with realistic variation
    const faceData = {
      // Basic structure - influenced by gender and ethnicity
      faceWidth: 45 + Math.random() * 20 + (genderInfluence < 40 ? -5 : genderInfluence > 60 ? 5 : 0),
      faceHeight: 45 + Math.random() * 20,
      jawWidth: 40 + Math.random() * 30 + (genderInfluence > 60 ? 8 : -3),
      jawHeight: 45 + Math.random() * 20,
      chinHeight: 45 + Math.random() * 20,
      chinWidth: 40 + Math.random() * 25,
      cheekboneHeight: 45 + Math.random() * 20 + (genderInfluence < 40 ? 5 : 0),
      cheekboneWidth: 45 + Math.random() * 20 + (genderInfluence < 40 ? 3 : -2),

      // Eyes - gender and ethnicity influenced
      eyeSize: 40 + Math.random() * 25 + (genderInfluence < 40 ? 8 : -3),
      eyeDistance: 45 + Math.random() * 15 + (selectedEthnicity === 'asian' ? -5 : 0),
      eyeHeight: 45 + Math.random() * 20,
      eyeAngle: 40 + Math.random() * 25 + (selectedEthnicity === 'asian' ? 10 : 0),
      eyebrowHeight: 45 + Math.random() * 20,
      eyebrowThickness: 35 + Math.random() * 35 + (genderInfluence > 60 ? 10 : -10),
      eyebrowAngle: 45 + Math.random() * 20,

      // Nose - ethnicity influenced
      noseWidth: 40 + Math.random() * 25 + (selectedEthnicity === 'african' ? 10 : selectedEthnicity === 'asian' ? -5 : 0),
      noseHeight: 45 + Math.random() * 20,
      noseBridge: 40 + Math.random() * 25 + (selectedEthnicity === 'european' ? 8 : selectedEthnicity === 'african' ? -5 : 0),
      nostrilWidth: 40 + Math.random() * 25,
      nostrilHeight: 45 + Math.random() * 20,

      // Mouth - gender influenced
      mouthWidth: 40 + Math.random() * 25 + (genderInfluence < 40 ? 5 : 0),
      mouthHeight: 45 + Math.random() * 20,
      lipThickness: 40 + Math.random() * 25 + (genderInfluence < 40 ? 8 : selectedEthnicity === 'african' ? 10 : 0),
      upperLipHeight: 45 + Math.random() * 20,
      lowerLipHeight: 45 + Math.random() * 20,

      // Ears
      earSize: 45 + Math.random() * 20,
      earPosition: 45 + Math.random() * 20,
      earAngle: 45 + Math.random() * 20,

      // Colors based on ethnicity
      skinTone: getSkinToneForEthnicity(selectedEthnicity),
      eyeColor: getEyeColorForEthnicity(selectedEthnicity),
      hairColor: getHairColorForEthnicity(selectedEthnicity),
      eyebrowColor: getHairColorForEthnicity(selectedEthnicity),

      // Hair
      hairStyle: getHairStyleForGender(genderInfluence),
      hairLength: 30 + Math.random() * 50 + (genderInfluence < 40 ? 20 : 0),
      hairVolume: 40 + Math.random() * 30,

      // Demographics
      ageSlider: selectedAgeData?.value || 30,
      genderSlider: genderInfluence,

      // Ethnicity blend
      ethnicityBlend: getEthnicityBlend(selectedEthnicity),
    };

    onFaceGenerated(faceData);
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const getSkinToneForEthnicity = (ethnicity: string): string => {
    const tones = {
      european: ['#F5DEB3', '#F1C27D', '#E8B887', '#D4A574'],
      african: ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
      asian: ['#F1C27D', '#E8B887', '#D4A574', '#C8A882'],
      hispanic: ['#D4A574', '#C8A882', '#BC9A6A', '#B08D5C'],
      middle_eastern: ['#C8A882', '#BC9A6A', '#B08D5C', '#A0855B'],
      south_asian: ['#B08D5C', '#A0855B', '#8B7355', '#7D6A4F'],
      native: ['#C8A882', '#B08D5C', '#A0855B', '#8B7355'],
      mixed: ['#F1C27D', '#E8B887', '#D4A574', '#C8A882', '#BC9A6A', '#B08D5C']
    };
    
    const colors = tones[ethnicity as keyof typeof tones] || tones.mixed;
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getEyeColorForEthnicity = (ethnicity: string): string => {
    const colors = {
      european: ['#8B4513', '#6B4423', '#4A90E2', '#50C878', '#A0A0A0'],
      african: ['#2F1B14', '#4A2C2A', '#5D4037'],
      asian: ['#2F1B14', '#4A2C2A', '#3E2723'],
      hispanic: ['#2F1B14', '#4A2C2A', '#5D4037', '#6B4423'],
      middle_eastern: ['#2F1B14', '#4A2C2A', '#5D4037', '#6B4423'],
      south_asian: ['#2F1B14', '#4A2C2A', '#3E2723'],
      native: ['#2F1B14', '#4A2C2A', '#5D4037'],
      mixed: ['#2F1B14', '#4A2C2A', '#5D4037', '#6B4423', '#8B4513']
    };
    
    const eyeColors = colors[ethnicity as keyof typeof colors] || colors.mixed;
    return eyeColors[Math.floor(Math.random() * eyeColors.length)];
  };

  const getHairColorForEthnicity = (ethnicity: string): string => {
    const colors = {
      european: ['#FFD700', '#F4A460', '#8B4513', '#654321', '#2F1B14', '#A0522D'],
      african: ['#2F1B14', '#1C1C1C', '#3E2723'],
      asian: ['#2F1B14', '#1C1C1C', '#3E2723', '#4A2C2A'],
      hispanic: ['#2F1B14', '#4A2C2A', '#5D4037', '#654321'],
      middle_eastern: ['#2F1B14', '#4A2C2A', '#5D4037', '#654321'],
      south_asian: ['#2F1B14', '#1C1C1C', '#3E2723'],
      native: ['#2F1B14', '#1C1C1C', '#4A2C2A'],
      mixed: ['#2F1B14', '#4A2C2A', '#5D4037', '#654321', '#8B4513']
    };
    
    const hairColors = colors[ethnicity as keyof typeof colors] || colors.mixed;
    return hairColors[Math.floor(Math.random() * hairColors.length)];
  };

  const getHairStyleForGender = (genderInfluence: number): string => {
    const styles = {
      feminine: ['long', 'medium', 'curly', 'braids', 'ponytail'],
      neutral: ['medium', 'short', 'curly'],
      masculine: ['short', 'buzz', 'medium']
    };
    
    const styleSet = genderInfluence < 35 ? styles.feminine : 
                    genderInfluence > 65 ? styles.masculine : styles.neutral;
    return styleSet[Math.floor(Math.random() * styleSet.length)];
  };

  const getEthnicityBlend = (ethnicity: string) => {
    if (ethnicity === 'mixed') {
      return {
        european: 20 + Math.random() * 30,
        african: 20 + Math.random() * 30,
        asian: 20 + Math.random() * 30,
        hispanic: 20 + Math.random() * 30,
      };
    }
    
    const blend = { european: 10, african: 10, asian: 10, hispanic: 10 };
    blend[ethnicity as keyof typeof blend] = 60 + Math.random() * 30;
    return blend;
  };

  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Face Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Generation Style</label>
            <div className="grid grid-cols-2 gap-2">
              {faceStyles.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStyle(style.id)}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <style.icon className="w-4 h-4 mb-1" />
                  <span className="text-xs font-medium">{style.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Age Range</label>
              <Select value={selectedAge} onValueChange={setSelectedAge}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ageRanges.map((range) => (
                    <SelectItem key={range.id} value={range.id}>
                      {range.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Ethnicity</label>
            <Select value={selectedEthnicity} onValueChange={setSelectedEthnicity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ethnicities.map((ethnicity) => (
                  <SelectItem key={ethnicity.id} value={ethnicity.id}>
                    {ethnicity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                Generating realistic face... {Math.round(generationProgress)}%
              </p>
            </div>
          )}

          <Button 
            onClick={generateRandomFace}
            disabled={isGenerating}
            className="w-full flex items-center gap-2"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate New Face'}
          </Button>

          <Button 
            variant="outline"
            onClick={generateRandomFace}
            disabled={isGenerating}
            className="w-full flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Random Variation
          </Button>
        </CardContent>
      </Card>

      {/* Current Style Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              {faceStyles.find(s => s.id === selectedStyle)?.name}
            </Badge>
            <Badge variant="outline">
              {genderOptions.find(g => g.id === selectedGender)?.name}
            </Badge>
            <Badge variant="outline">
              {ageRanges.find(a => a.id === selectedAge)?.name}
            </Badge>
            <Badge variant="outline">
              {ethnicities.find(e => e.id === selectedEthnicity)?.name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {faceStyles.find(s => s.id === selectedStyle)?.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealisticFaceGenerator;