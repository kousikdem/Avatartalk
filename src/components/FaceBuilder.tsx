import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import RealisticFaceGenerator from '@/components/RealisticFaceGenerator';
import FaceTransfer from '@/components/FaceTransfer';
import MakeHumanFaceTools from '@/components/MakeHumanFaceTools';
import Realistic3DHead from '@/components/Realistic3DHead';
import { Camera, Upload, Wand2, Settings, Save, Download } from 'lucide-react';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';

interface FaceConfig {
  // Basic structure
  faceWidth: number;
  faceHeight: number;
  jawWidth: number;
  jawHeight: number;
  chinHeight: number;
  chinWidth: number;
  cheekboneHeight: number;
  cheekboneWidth: number;
  
  // Eyes
  eyeSize: number;
  eyeDistance: number;
  eyeHeight: number;
  eyeAngle: number;
  eyebrowHeight: number;
  eyebrowThickness: number;
  eyebrowAngle: number;
  
  // Nose
  noseWidth: number;
  noseHeight: number;
  noseBridge: number;
  nostrilWidth: number;
  nostrilHeight: number;
  
  // Mouth
  mouthWidth: number;
  mouthHeight: number;
  lipThickness: number;
  upperLipHeight: number;
  lowerLipHeight: number;
  
  // Ears
  earSize: number;
  earPosition: number;
  earAngle: number;
  
  // Colors
  skinTone: string;
  eyeColor: string;
  hairColor: string;
  eyebrowColor: string;
  
  // Hair
  hairStyle: string;
  hairLength: number;
  hairVolume: number;
  
  // Advanced
  ageSlider: number;
  genderSlider: number;
  ethnicityBlend: {
    european: number;
    african: number;
    asian: number;
    hispanic: number;
  };
}

const defaultFaceConfig: FaceConfig = {
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
  skinTone: '#F1C27D',
  eyeColor: '#8B4513',
  hairColor: '#8B4513',
  eyebrowColor: '#8B4513',
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
};

const FaceBuilder: React.FC = () => {
  const [faceConfig, setFaceConfig] = useState<FaceConfig>(defaultFaceConfig);
  const [activeTab, setActiveTab] = useState('generator');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { saveConfiguration } = useAvatarConfigurations();

  const updateFaceConfig = (key: keyof FaceConfig, value: any) => {
    setFaceConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateEthnicityBlend = (ethnicity: keyof FaceConfig['ethnicityBlend'], value: number) => {
    setFaceConfig(prev => ({
      ...prev,
      ethnicityBlend: {
        ...prev.ethnicityBlend,
        [ethnicity]: value
      }
    }));
  };

  const handleFaceTransfer = (extractedFeatures: Partial<FaceConfig>) => {
    setFaceConfig(prev => ({
      ...prev,
      ...extractedFeatures
    }));
  };

  const saveFaceConfiguration = async () => {
    try {
      await saveConfiguration({
        avatar_name: 'Face Builder Avatar',
        // Convert face config to avatar configuration format
        face_width: faceConfig.faceWidth,
        jawline: faceConfig.jawWidth,
        cheekbones: faceConfig.cheekboneWidth,
        eye_size: faceConfig.eyeSize,
        eye_distance: faceConfig.eyeDistance,
        nose_size: faceConfig.noseWidth,
        nose_width: faceConfig.noseWidth,
        mouth_width: faceConfig.mouthWidth,
        lip_thickness: faceConfig.lipThickness,
        ear_size: faceConfig.earSize,
        ear_position: faceConfig.earPosition,
        skin_tone: faceConfig.skinTone,
        eye_color: faceConfig.eyeColor,
        hair_color: faceConfig.hairColor,
        hair_style: faceConfig.hairStyle,
      });
    } catch (error) {
      console.error('Failed to save face configuration:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-muted">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Face Builder Studio
            </h1>
            <p className="text-muted-foreground mt-2">
              Create realistic 3D faces with advanced MakeHuman-style tools
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={showAdvanced ? "default" : "outline"}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Advanced Mode
            </Button>
            <Button onClick={saveFaceConfiguration} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Face
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - 3D Preview */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  Realistic 3D Face Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96">
                  <Realistic3DHead config={faceConfig} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Age:</span>
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(faceConfig.ageSlider)} years
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <Badge variant="secondary" className="ml-2">
                      {faceConfig.genderSlider < 30 ? 'Feminine' : 
                       faceConfig.genderSlider > 70 ? 'Masculine' : 'Neutral'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hair:</span>
                    <Badge variant="secondary" className="ml-2">
                      {faceConfig.hairStyle}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Skin:</span>
                    <div 
                      className="inline-block w-4 h-4 rounded ml-2 border"
                      style={{ backgroundColor: faceConfig.skinTone }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Controls */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="generator" className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Generate</span>
                </TabsTrigger>
                <TabsTrigger value="transfer" className="flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Face Transfer</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Manual Edit</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-1">
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-4">
                <TabsContent value="generator" className="space-y-4">
                  <RealisticFaceGenerator 
                    onFaceGenerated={handleFaceTransfer}
                    currentConfig={faceConfig}
                  />
                </TabsContent>

                <TabsContent value="transfer" className="space-y-4">
                  <FaceTransfer 
                    onFaceExtracted={handleFaceTransfer}
                    currentConfig={faceConfig}
                  />
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <MakeHumanFaceTools 
                    config={faceConfig}
                    onConfigChange={updateFaceConfig}
                    showAdvanced={showAdvanced}
                  />
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  {/* Age and Gender Sliders */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Demographic Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Age: {Math.round(faceConfig.ageSlider)} years
                        </label>
                        <Slider
                          value={[faceConfig.ageSlider]}
                          onValueChange={([value]) => updateFaceConfig('ageSlider', value)}
                          max={80}
                          min={16}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Gender Balance: {faceConfig.genderSlider < 30 ? 'Feminine' : 
                                          faceConfig.genderSlider > 70 ? 'Masculine' : 'Neutral'}
                        </label>
                        <Slider
                          value={[faceConfig.genderSlider]}
                          onValueChange={([value]) => updateFaceConfig('genderSlider', value)}
                          max={100}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ethnicity Blending */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ethnicity Blending</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(faceConfig.ethnicityBlend).map(([ethnicity, value]) => (
                        <div key={ethnicity}>
                          <label className="text-sm font-medium mb-2 block capitalize">
                            {ethnicity}: {value}%
                          </label>
                          <Slider
                            value={[value]}
                            onValueChange={([newValue]) => updateEthnicityBlend(ethnicity as keyof FaceConfig['ethnicityBlend'], newValue)}
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const equal = 25;
                          Object.keys(faceConfig.ethnicityBlend).forEach(ethnicity => {
                            updateEthnicityBlend(ethnicity as keyof FaceConfig['ethnicityBlend'], equal);
                          });
                        }}
                        className="w-full"
                      >
                        Reset to Equal Blend
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceBuilder;