import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, User, Camera, Palette, Download } from 'lucide-react';
import RealisticAvatarGenerator from './RealisticAvatarGenerator';
import Realistic3DHead from './Realistic3DHead';
import AvatarCustomizer from './AvatarCustomizer';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';
import { useToast } from '@/hooks/use-toast';

interface AvatarData {
  facialMesh: Float32Array;
  textureData: string;
  landmarks: number[][];
  measurements: {
    faceWidth: number;
    faceHeight: number;
    eyeDistance: number;
    noseLength: number;
    mouthWidth: number;
    jawWidth: number;
  };
  features: {
    skinTone: string;
    eyeColor: string;
    hairColor: string;
    faceShape: string;
    age: number;
    gender: string;
    ethnicity: string;
  };
}

const AvatarStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [generatedAvatar, setGeneratedAvatar] = useState<AvatarData | null>(null);
  const [avatarName, setAvatarName] = useState('');
  const { saveConfiguration } = useAvatarConfigurations();
  const { toast } = useToast();

  const handleAvatarGenerated = (avatarData: AvatarData) => {
    setGeneratedAvatar(avatarData);
    setActiveTab('preview');
    toast({
      title: "🎉 Realistic Avatar Created!",
      description: "Your 3D avatar has been generated successfully.",
    });
  };

  const handleSaveAvatar = async () => {
    if (!generatedAvatar || !avatarName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your avatar.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert avatar data to configuration format
      const configuration = {
        avatar_name: avatarName,
        gender: generatedAvatar.features.gender as 'male' | 'female',
        age_category: generatedAvatar.features.age < 18 ? 'teen' : generatedAvatar.features.age < 60 ? 'adult' : 'senior' as 'child' | 'teen' | 'adult' | 'senior',
        height: 170,
        weight: 65,
        muscle_definition: 50,
        body_fat: 30,
        head_size: 50,
        head_shape: generatedAvatar.features.faceShape,
        face_width: generatedAvatar.measurements.faceWidth,
        jawline: 50,
        cheekbones: 50,
        eye_shape: 'almond',
        eye_size: 50,
        eye_distance: generatedAvatar.measurements.eyeDistance,
        eye_color: generatedAvatar.features.eyeColor,
        nose_size: 50,
        nose_width: 50,
        nose_shape: 'straight',
        mouth_width: generatedAvatar.measurements.mouthWidth,
        lip_thickness: 50,
        lip_shape: 'medium',
        ear_size: 50,
        ear_position: 50,
        ear_shape: 'normal',
        hair_style: 'medium',
        hair_color: generatedAvatar.features.hairColor,
        skin_color: generatedAvatar.features.skinTone,
        pose_style: 'standing',
        expression_type: 'neutral',
        clothing_style: 'casual',
        model_quality: 'high'
      };

      await saveConfiguration(configuration);
      
      toast({
        title: "✅ Avatar Saved!",
        description: `"${avatarName}" has been saved to your collection.`,
      });
      
      setAvatarName('');
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen page-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            3D Avatar Studio
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create photorealistic 3D avatars from your photos using advanced AI and facial analysis technology
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Generate Avatar
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              3D Preview
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Customize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <RealisticAvatarGenerator onAvatarGenerated={handleAvatarGenerated} />
              </div>
              <div className="space-y-6">
                {generatedAvatar ? (
                  <Card className="gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Generated Avatar Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Realistic3DHead avatarData={generatedAvatar} />
                      
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <span className="font-medium">Gender:</span> {generatedAvatar.features.gender}
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <span className="font-medium">Age:</span> {generatedAvatar.features.age}
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <span className="font-medium">Eye Color:</span> {generatedAvatar.features.eyeColor}
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <span className="font-medium">Face Shape:</span> {generatedAvatar.features.faceShape}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter avatar name..."
                            value={avatarName}
                            onChange={(e) => setAvatarName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                          />
                          <Button onClick={handleSaveAvatar} className="gradient-button">
                            <Download className="w-4 h-4 mr-2" />
                            Save Avatar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="gradient-card">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">No Avatar Generated</h3>
                      <p className="text-muted-foreground">Upload a photo to generate your realistic 3D avatar</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {generatedAvatar ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Realistic 3D Avatar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Realistic3DHead avatarData={generatedAvatar} />
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4">
                  <Card className="gradient-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Facial Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Face Width:</span>
                          <span className="text-sm font-medium">{generatedAvatar.measurements.faceWidth.toFixed(1)}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Face Height:</span>
                          <span className="text-sm font-medium">{generatedAvatar.measurements.faceHeight.toFixed(1)}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Eye Distance:</span>
                          <span className="text-sm font-medium">{generatedAvatar.measurements.eyeDistance.toFixed(1)}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Nose Length:</span>
                          <span className="text-sm font-medium">{generatedAvatar.measurements.noseLength.toFixed(1)}px</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="gradient-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Landmarks:</span>
                          <span className="text-sm font-medium">{generatedAvatar.landmarks.length} points</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ethnicity:</span>
                          <span className="text-sm font-medium capitalize">{generatedAvatar.features.ethnicity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Skin Tone:</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: generatedAvatar.features.skinTone }}
                            ></div>
                            <span className="text-xs font-mono">{generatedAvatar.features.skinTone}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="gradient-card">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Avatar to Preview</h3>
                  <p className="text-muted-foreground mb-4">Generate an avatar first to see the 3D preview</p>
                  <Button onClick={() => setActiveTab('generator')} className="gradient-button">
                    <Camera className="w-4 h-4 mr-2" />
                    Generate Avatar
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <AvatarCustomizer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AvatarStudio;