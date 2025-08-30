
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Palette, Save, Download, RotateCcw } from 'lucide-react';
import AvatarPreviewPanel from '@/components/avatar/AvatarPreviewPanel';
import BasicInfoPanel from '@/components/avatar/BasicInfoPanel';
import PhysicalFeaturesPanel from '@/components/avatar/PhysicalFeaturesPanel';
import AppearancePanel from '@/components/avatar/AppearancePanel';
import ClothingPanel from '@/components/avatar/ClothingPanel';
import { useAvatarCreation } from '@/hooks/useAvatarCreation';
import { AvatarConfig } from '@/types/avatar';

const AvatarCreationPage = () => {
  const {
    avatarConfig,
    updateAvatarConfig,
    generateAvatar,
    saveAvatar,
    isGenerating,
    avatarUrl
  } = useAvatarCreation();

  const handleConfigUpdate = useCallback((updates: Partial<AvatarConfig>) => {
    updateAvatarConfig(updates);
  }, [updateAvatarConfig]);

  const handleSaveAvatar = async () => {
    try {
      await saveAvatar();
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const handleExportAvatar = () => {
    if (avatarUrl) {
      const link = document.createElement('a');
      link.href = avatarUrl;
      link.download = 'avatar.glb';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleResetAvatar = () => {
    updateAvatarConfig({
      gender: 'male',
      ageRange: 'adult',
      bodyType: 'average',
      height: 175,
      weight: 70,
      skinTone: '#F5DEB3',
      hairStyle: 'short',
      hairColor: '#8B4513',
      eyeColor: 'brown',
      clothing: 'casual'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            3D Avatar Creator
          </h1>
          <p className="text-gray-600 text-lg">Create your personalized 3D avatar for AvatarTalk.bio</p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Avatar Preview Panel */}
          <div className="xl:col-span-1">
            <Card className="sticky top-6 backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <User className="w-6 h-6" />
                  Avatar Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AvatarPreviewPanel 
                  avatarConfig={avatarConfig}
                  avatarUrl={avatarUrl}
                  isGenerating={isGenerating}
                />
                
                {/* Action Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleSaveAvatar} 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    onClick={handleExportAvatar} 
                    variant="outline"
                    disabled={!avatarUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                <Button 
                  onClick={handleResetAvatar} 
                  variant="ghost" 
                  className="w-full mt-2"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Customization Panels */}
          <div className="xl:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Palette className="w-6 h-6" />
                  Avatar Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1">
                    <TabsTrigger value="basic" className="rounded-md">Basic Info</TabsTrigger>
                    <TabsTrigger value="physical" className="rounded-md">Physical</TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-md">Appearance</TabsTrigger>
                    <TabsTrigger value="clothing" className="rounded-md">Clothing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <BasicInfoPanel 
                      config={avatarConfig} 
                      onUpdate={handleConfigUpdate} 
                    />
                  </TabsContent>

                  <TabsContent value="physical" className="space-y-6">
                    <PhysicalFeaturesPanel 
                      config={avatarConfig} 
                      onUpdate={handleConfigUpdate} 
                    />
                  </TabsContent>

                  <TabsContent value="appearance" className="space-y-6">
                    <AppearancePanel 
                      config={avatarConfig} 
                      onUpdate={handleConfigUpdate} 
                    />
                  </TabsContent>

                  <TabsContent value="clothing" className="space-y-6">
                    <ClothingPanel 
                      config={avatarConfig} 
                      onUpdate={handleConfigUpdate} 
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCreationPage;
