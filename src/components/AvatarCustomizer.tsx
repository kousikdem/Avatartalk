import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Avatar3DPreview from '@/components/Avatar3DPreview';
import AvatarBodyCustomizer from '@/components/AvatarBodyCustomizer';
import AvatarFaceCustomizer from '@/components/AvatarFaceCustomizer';
import AvatarClothingCustomizer from '@/components/AvatarClothingCustomizer';
import PoseSelector from '@/components/PoseSelector';
import ExpressionPanel from '@/components/ExpressionPanel';
import ImageToAvatar from '@/components/ImageToAvatar';
import PresetAvatars from '@/components/PresetAvatars';
import AvatarExporter from '@/components/AvatarExporter';
import { useAvatarConfigurations, AvatarConfiguration } from '@/hooks/useAvatarConfigurations';
import { Save, Trash2, Play, User, Shirt, Camera, Palette } from 'lucide-react';

const AvatarCustomizer: React.FC = () => {
  const {
    configurations,
    currentConfig,
    loading,
    saveConfiguration,
    deleteConfiguration,
    setActiveConfiguration,
    updateCurrentConfig,
  } = useAvatarConfigurations();

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleConfigChange = (category: string, key: string, value: any) => {
    if (category === 'basic') {
      updateCurrentConfig({ [key]: value });
    } else if (category === 'body') {
      updateCurrentConfig({ [key]: value });
    } else if (category === 'face') {
      updateCurrentConfig({ [key]: value });
    } else if (category === 'clothing') {
      updateCurrentConfig({ [key]: value });
    }
  };

  const handleSave = async () => {
    try {
      await saveConfiguration(currentConfig);
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this avatar configuration?')) {
      await deleteConfiguration(id);
    }
  };

  const handlePresetSelect = (preset: any) => {
    setSelectedPreset(preset.id);
    updateCurrentConfig({
      ...preset,
      avatar_name: `${preset.name} Avatar`,
    });
  };

  const handlePoseSelect = (pose: string) => {
    updateCurrentConfig({ current_pose: pose });
  };

  const handleExpressionSelect = (expression: string) => {
    updateCurrentConfig({ current_expression: expression });
  };

  // Convert AvatarConfiguration to the expected format for Avatar3DPreview
  const convertConfigForPreview = (config: AvatarConfiguration) => ({
    body: {
      gender: config.gender,
      age: config.age_category === 'child' ? 12 : config.age_category === 'teen' ? 16 : 
           config.age_category === 'adult' ? 30 : 50,
      ethnicity: 'mixed',
      height: config.height,
      weight: config.weight,
      muscle: config.muscle_definition,
      fat: config.body_fat,
    },
    face: {
      eyeColor: config.eye_color,
      skinTone: config.skin_tone,
      hairStyle: config.hair_style,
      hairColor: config.hair_color,
      faceShape: config.head_shape,
      eyeShape: config.eye_shape,
      noseShape: config.nose_shape,
      lipShape: config.lip_shape,
    },
    clothing: {
      outfit: `${config.clothing_top || 'casual_shirt'}_${config.clothing_bottom || 'jeans'}`,
      accessories: config.accessories || [],
    },
    pose: config.current_pose,
    expression: config.current_expression,
  });

  const handleImageProcessed = (faceData: { 
    skinTone: string; 
    eyeColor: string; 
    hairColor?: string;
    faceShape?: string;
    age?: number;
    gender?: string;
  }) => {
    updateCurrentConfig({
      skin_tone: faceData.skinTone,
      eye_color: faceData.eyeColor,
      hair_color: faceData.hairColor || currentConfig.hair_color,
      head_shape: faceData.faceShape || currentConfig.head_shape,
      gender: (faceData.gender as any) || currentConfig.gender,
    });
  };

  const previewConfig = convertConfigForPreview(currentConfig);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              3D Avatar Studio
            </h1>
            <p className="text-muted-foreground mt-2">
              Create your perfect 3D avatar with advanced customization
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              placeholder="Avatar name..."
              value={currentConfig.avatar_name}
              onChange={(e) => updateCurrentConfig({ avatar_name: e.target.value })}
              className="w-48"
            />
            <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Avatar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Avatar Configurations */}
          <div className="space-y-6">
            {/* Saved Avatars */}
            <Card className="avatar-control-panel">
              <CardHeader className="avatar-section-header">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-5 h-5 text-primary" />
                  Saved Avatars
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {configurations.map((config) => (
                  <div
                    key={config.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      config.is_active
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => config.id && setActiveConfiguration(config.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary-glow" />
                        <div>
                          <p className="font-medium text-sm">{config.avatar_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.gender} • {config.age_category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {config.is_active && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            config.id && handleDelete(config.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="avatar-control-panel">
              <CardHeader className="avatar-section-header">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Play className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <PoseSelector
                  currentPose={currentConfig.current_pose}
                  onPoseSelect={handlePoseSelect}
                />
                <ExpressionPanel
                  currentExpression={currentConfig.current_expression}
                  onExpressionSelect={handleExpressionSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Center - 3D Preview */}
          <div className="space-y-6">
            <Avatar3DPreview
              config={previewConfig}
            />
            
            {/* Export Options */}
            <AvatarExporter config={currentConfig} />
          </div>

          {/* Right Sidebar - Customization */}
          <div>
            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="presets" className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Presets</span>
                </TabsTrigger>
                <TabsTrigger value="body" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Body</span>
                </TabsTrigger>
                <TabsTrigger value="face" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Face</span>
                </TabsTrigger>
                <TabsTrigger value="clothing" className="flex items-center gap-1">
                  <Shirt className="w-4 h-4" />
                  <span className="hidden sm:inline">Style</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="space-y-4">
                <Card className="avatar-control-panel">
                  <CardHeader className="avatar-section-header">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Camera className="w-5 h-5 text-primary" />
                      AI Face Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageToAvatar onImageProcessed={handleImageProcessed} />
                  </CardContent>
                </Card>
                
                <PresetAvatars
                  onPresetSelect={handlePresetSelect}
                />
              </TabsContent>

              <TabsContent value="body" className="space-y-4">
                <AvatarBodyCustomizer
                  config={currentConfig}
                  onConfigChange={handleConfigChange}
                />
              </TabsContent>

              <TabsContent value="face" className="space-y-4">
                <AvatarFaceCustomizer
                  config={currentConfig}
                  onConfigChange={handleConfigChange}
                />
              </TabsContent>

              <TabsContent value="clothing" className="space-y-4">
                <AvatarClothingCustomizer
                  config={currentConfig}
                  onConfigChange={handleConfigChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;