
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Download, Rotate3D, Eye, Palette, User } from 'lucide-react';
import Avatar3DPreview from '@/components/avatar/Avatar3DPreview';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';
import AvatarSaveLoad from '@/components/avatar/AvatarSaveLoad';
import { useToast } from '@/hooks/use-toast';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarModel, setAvatarModel] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfigChange = (newConfig: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => ({ ...prev, ...newConfig }));
  };

  const generateAvatar = async () => {
    setIsGenerating(true);
    try {
      console.log('Generating avatar with config:', avatarConfig);
      
      // Simulate avatar generation (replace with actual backend call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would be the GLB/GLTF model URL
      setAvatarModel(`/api/avatar/generate?config=${encodeURIComponent(JSON.stringify(avatarConfig))}`);
      
      toast({
        title: "Avatar Generated",
        description: "Your 3D avatar has been created successfully!",
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
  };

  const saveAvatar = async () => {
    try {
      // Save avatar configuration to database
      console.log('Saving avatar config:', avatarConfig);
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

  const downloadAvatar = async () => {
    if (!avatarModel) {
      toast({
        title: "No Avatar",
        description: "Please generate an avatar first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Download avatar model
      const link = document.createElement('a');
      link.href = avatarModel;
      link.download = 'avatar.glb';
      link.click();
      
      toast({
        title: "Download Started",
        description: "Your avatar model is being downloaded.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download avatar model.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            3D Avatar Creator
          </h1>
          <p className="text-gray-600 text-lg">
            Create your realistic 3D avatar with advanced customization options
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Avatar Preview */}
          <div className="xl:col-span-2">
            <Card className="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Rotate3D className="w-6 h-6 text-blue-600" />
                  Avatar Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Avatar3DPreview 
                  config={avatarConfig}
                  modelUrl={avatarModel}
                  isGenerating={isGenerating}
                />
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button 
                    onClick={generateAvatar} 
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Avatar'}
                  </Button>
                  <Button 
                    onClick={saveAvatar} 
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    onClick={downloadAvatar} 
                    variant="outline"
                    disabled={!avatarModel}
                    className="border-green-200 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download GLB
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Panel */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Palette className="w-6 h-6 text-purple-600" />
                  Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full mb-6 bg-white/50">
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
