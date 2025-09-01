
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { User, Upload, Save, Download, RotateCcw, Palette, Shirt, Camera, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import AvatarCustomizer from '@/components/AvatarCustomizer';
import Avatar3DPreview from '@/components/Avatar3DPreview';
import AssetLibrary from '@/components/AssetLibrary';
import PoseSelector from '@/components/PoseSelector';
import ExpressionPanel from '@/components/ExpressionPanel';
import ImageToAvatar from '@/components/ImageToAvatar';

const AvatarPage = () => {
  const [activeTab, setActiveTab] = useState('body');
  const [avatarConfig, setAvatarConfig] = useState({
    body: {
      gender: 'female',
      age: 25,
      ethnicity: 'caucasian',
      height: 170,
      weight: 65,
      muscle: 50,
      fat: 30
    },
    face: {
      eyeColor: 'brown',
      skinTone: '#DEB887',
      hairStyle: 'long',
      hairColor: '#8B4513'
    },
    clothing: {
      outfit: 'business',
      accessories: []
    },
    pose: 'standing',
    expression: 'neutral'
  });

  const handleConfigChange = (category, key, value) => {
    setAvatarConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">3D Avatar Creator</h1>
          <p className="text-gray-600">Create and customize your AI-powered 3D avatar with advanced features</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 3D Preview Section */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                3D Avatar Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                  <Environment preset="studio" />
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <Avatar3DPreview config={avatarConfig} />
                </Canvas>
              </div>
              
              {/* Preview Controls */}
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Animate
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Avatar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customization Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="body" className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Body
                  </TabsTrigger>
                  <TabsTrigger value="clothes" className="flex items-center gap-1">
                    <Shirt className="w-4 h-4" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="body" className="space-y-4">
                  <AvatarCustomizer 
                    config={avatarConfig} 
                    onConfigChange={handleConfigChange}
                  />
                </TabsContent>

                <TabsContent value="clothes" className="space-y-4">
                  <div className="space-y-4">
                    <AssetLibrary 
                      category="clothing"
                      onAssetSelect={(asset) => handleConfigChange('clothing', 'outfit', asset)}
                    />
                    <PoseSelector 
                      currentPose={avatarConfig.pose}
                      onPoseSelect={(pose) => handleConfigChange('', 'pose', pose)}
                    />
                    <ExpressionPanel 
                      currentExpression={avatarConfig.expression}
                      onExpressionSelect={(expression) => handleConfigChange('', 'expression', expression)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <ImageToAvatar 
                    onImageProcessed={(faceData) => {
                      handleConfigChange('face', 'skinTone', faceData.skinTone);
                      handleConfigChange('face', 'eyeColor', faceData.eyeColor);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export & Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export GLTF
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export FBX
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export OBJ
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvatarPage;
