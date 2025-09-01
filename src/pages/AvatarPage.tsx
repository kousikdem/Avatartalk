
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Lightformer } from '@react-three/drei';
import { User, Upload, Save, Download, RotateCcw, Palette, Shirt, Camera, Play, Image, Users, Zap, Smile, Eye, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AvatarCustomizer from '@/components/AvatarCustomizer';
import Avatar3DPreview from '@/components/Avatar3DPreview';
import AssetLibrary from '@/components/AssetLibrary';
import PoseSelector from '@/components/PoseSelector';
import ExpressionPanel from '@/components/ExpressionPanel';
import ImageToAvatar from '@/components/ImageToAvatar';
import PresetAvatars from '@/components/PresetAvatars';
import AdvancedCustomizer from '@/components/AdvancedCustomizer';

const AvatarPage = () => {
  const [activeTab, setActiveTab] = useState('presets');
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
      hairColor: '#8B4513',
      faceShape: 'oval',
      eyeShape: 'almond',
      noseShape: 'straight',
      lipShape: 'medium'
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

  const resetAvatar = () => {
    setAvatarConfig({
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
        hairColor: '#8B4513',
        faceShape: 'oval',
        eyeShape: 'almond',
        noseShape: 'straight',
        lipShape: 'medium'
      },
      clothing: {
        outfit: 'casual',
        accessories: []
      },
      pose: 'standing',
      expression: 'neutral'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                AI Avatar Creator
              </h1>
              <p className="text-gray-600 text-lg">Create your realistic 3D avatar with advanced AI-powered customization</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Eye className="w-3 h-3 mr-1" />
                Real-time 3D
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 3D Preview Section */}
          <Card className="xl:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    3D Avatar Preview
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden relative">
                <Canvas shadows>
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <OrbitControls 
                    enablePan={true} 
                    enableZoom={true} 
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={10}
                    target={[0, 0.5, 0]}
                  />
                  
                  {/* Enhanced Lighting Setup */}
                  <Environment preset="studio" />
                  <ambientLight intensity={0.3} />
                  <directionalLight 
                    position={[5, 5, 5]} 
                    intensity={1.5} 
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                  />
                  <pointLight position={[-5, 3, 2]} intensity={0.8} color="#ff9999" />
                  <pointLight position={[5, -3, -2]} intensity={0.6} color="#9999ff" />
                  
                  {/* Ground plane for shadows */}
                  <mesh receiveShadow position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[10, 10]} />
                    <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
                  </mesh>
                  
                  <Avatar3DPreview config={avatarConfig} />
                </Canvas>
                
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
                    <Layers className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Preview Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetAvatar}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Animate
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export GLB
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Avatar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Panel */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Customization
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="presets" className="flex items-center gap-1 text-xs">
                    <Users className="w-3 h-3" />
                    Presets
                  </TabsTrigger>
                  <TabsTrigger value="body" className="flex items-center gap-1 text-xs">
                    <User className="w-3 h-3" />
                    Body
                  </TabsTrigger>
                  <TabsTrigger value="face" className="flex items-center gap-1 text-xs">
                    <Smile className="w-3 h-3" />
                    Face
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex items-center gap-1 text-xs">
                    <Shirt className="w-3 h-3" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-1 text-xs">
                    <Image className="w-3 h-3" />
                    Photo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="space-y-4">
                  <PresetAvatars 
                    onPresetSelect={(preset) => setAvatarConfig(preset)}
                  />
                </TabsContent>

                <TabsContent value="body" className="space-y-4">
                  <AvatarCustomizer 
                    config={avatarConfig} 
                    onConfigChange={handleConfigChange}
                  />
                </TabsContent>

                <TabsContent value="face" className="space-y-4">
                  <AdvancedCustomizer 
                    config={avatarConfig}
                    onConfigChange={handleConfigChange}
                  />
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
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
                      if (faceData.hairColor) {
                        handleConfigChange('face', 'hairColor', faceData.hairColor);
                      }
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Export & Integration Options */}
        <Card className="mt-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Export & Integration
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                <Download className="w-5 h-5" />
                <span className="text-xs">Export GLTF</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                <Download className="w-5 h-5" />
                <span className="text-xs">Export FBX</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                <Download className="w-5 h-5" />
                <span className="text-xs">Export OBJ</span>
              </Button>
              <Button className="h-16 flex flex-col items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Save className="w-5 h-5" />
                <span className="text-xs">Save Profile</span>
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Integration Ready</h4>
              <p className="text-blue-700 text-sm">
                Your avatar is optimized for VR/AR, games, metaverse platforms, and web applications. 
                Export in your preferred format and integrate seamlessly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvatarPage;
