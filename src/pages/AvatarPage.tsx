
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Download, Rotate3D, Eye, Palette, User, Sparkles, Zap } from 'lucide-react';
import Avatar3DPreview from '@/components/avatar/Avatar3DPreview';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';
import AvatarSaveLoad from '@/components/avatar/AvatarSaveLoad';
import { useToast } from '@/hooks/use-toast';
import { useAvatarGeneration } from '@/hooks/useAvatarGeneration';

export interface AvatarConfig {
  bodyType: 'slim' | 'average' | 'muscular' | 'custom';
  gender: 'male' | 'female' | 'non-binary';
  ageRange: 'child' | 'teen' | 'adult' | 'senior';
  height: number;
  weight: number;
  ethnicity: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  clothing: string;
  facialHair?: string;
}

const defaultConfig: AvatarConfig = {
  bodyType: 'average',
  gender: 'male',
  ageRange: 'adult',
  height: 170,
  weight: 70,
  ethnicity: 'caucasian',
  skinTone: '#FDBCB4',
  hairStyle: 'short',
  hairColor: '#8B4513',
  eyeColor: '#654321',
  clothing: 'casual',
};

const AvatarPage = () => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultConfig);
  const [avatarModel, setAvatarModel] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    generateAvatar, 
    exportAvatar, 
    isGenerating, 
    progress, 
    currentStep 
  } = useAvatarGeneration();

  const handleConfigChange = (newConfig: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleGenerateAvatar = async () => {
    const result = await generateAvatar(avatarConfig);
    if (result) {
      setAvatarModel(result.modelUrl);
    }
  };

  const handleExportAvatar = (format: 'glb' | 'fbx' | 'obj') => {
    if (avatarModel) {
      exportAvatar(avatarModel, format);
    }
  };

  const saveAvatar = async () => {
    try {
      // Save avatar configuration to localStorage for demo
      const savedAvatars = JSON.parse(localStorage.getItem('savedAvatars') || '[]');
      const newAvatar = {
        id: Date.now().toString(),
        name: `Avatar ${savedAvatars.length + 1}`,
        config: avatarConfig,
        modelUrl: avatarModel,
        createdAt: new Date()
      };
      
      savedAvatars.push(newAvatar);
      localStorage.setItem('savedAvatars', JSON.stringify(savedAvatars));
      
      toast({
        title: "Avatar Saved",
        description: "Your avatar configuration has been saved.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save avatar configuration.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Rotate3D className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Realistic 3D Avatar Creator
              </h1>
              <p className="text-gray-600 text-lg">
                Create your photorealistic 3D avatar with advanced AI-powered customization
              </p>
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI-Powered Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Real-time Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-500" />
              <span>Multiple Export Formats</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Avatar Preview */}
          <div className="xl:col-span-2">
            <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Rotate3D className="w-6 h-6 text-blue-600" />
                  Avatar Preview
                  {isGenerating && (
                    <div className="ml-auto flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Generating...
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Avatar3DPreview 
                  config={avatarConfig}
                  modelUrl={avatarModel}
                  isGenerating={isGenerating}
                  generationProgress={progress}
                  generationStep={currentStep}
                  onExport={handleExportAvatar}
                />
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button 
                    onClick={handleGenerateAvatar} 
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Avatar'}
                  </Button>
                  
                  <Button 
                    onClick={saveAvatar} 
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50 shadow-md"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  
                  {avatarModel && (
                    <Button 
                      onClick={() => handleExportAvatar('glb')} 
                      variant="outline"
                      className="border-green-200 hover:bg-green-50 shadow-md"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Quick Export GLB
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Panel */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Palette className="w-6 h-6 text-purple-600" />
                  Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full mb-6 bg-white/60 backdrop-blur-sm">
                    <TabsTrigger value="basic" className="text-sm">
                      <User className="w-4 h-4 mr-1" />
                      Basic
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="text-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Look
                    </TabsTrigger>
                    <TabsTrigger value="clothing" className="text-sm">
                      <Palette className="w-4 h-4 mr-1" />
                      Style
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic">
                    <AvatarCustomizer 
                      config={avatarConfig}
                      onChange={handleConfigChange}
                      category="basic"
                    />
                  </TabsContent>
                  
                  <TabsContent value="appearance">
                    <AvatarCustomizer 
                      config={avatarConfig}
                      onChange={handleConfigChange}
                      category="appearance"
                    />
                  </TabsContent>
                  
                  <TabsContent value="clothing">
                    <AvatarCustomizer 
                      config={avatarConfig}
                      onChange={handleConfigChange}
                      category="clothing"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Save/Load Panel */}
            <AvatarSaveLoad 
              currentConfig={avatarConfig}
              onLoadConfig={setAvatarConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;
