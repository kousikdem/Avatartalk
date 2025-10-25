import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Download, RotateCcw, User, Camera, Palette, 
  Shirt, Activity, Sparkles, Play, Layers, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import AdvancedAvatarPreview from '../AdvancedAvatarPreview';
import PresetsPanel from './PresetsPanel';
import BodyPanel from './BodyPanel';
import FacePanel from './FacePanel';
import StylePanel from './StylePanel';
import PhotoPanel from './PhotoPanel';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';

interface AvatarStudioLayoutProps {
  initialConfig?: any;
}

const AvatarStudioLayout: React.FC<AvatarStudioLayoutProps> = ({ initialConfig }) => {
  const { saveConfiguration } = useAvatarConfigurations();
  const [saving, setSaving] = useState(false);
  const [isLive, setIsLive] = useState(true);
  
  const [avatarConfig, setAvatarConfig] = useState({
    gender: 'male',
    age: 25,
    ethnicity: 'caucasian',
    ageCategory: 'adult',
    height: 170,
    weight: 70,
    muscle: 50,
    fat: 20,
    torsoLength: 50,
    legLength: 50,
    shoulderWidth: 50,
    handSize: 50,
    headSize: 50,
    headShape: 'oval',
    faceWidth: 50,
    jawline: 50,
    cheekbones: 50,
    chinSize: 50,
    eyeSize: 50,
    eyeDistance: 50,
    eyeShape: 'almond',
    eyeColor: '#8B4513',
    noseSize: 50,
    noseWidth: 50,
    noseShape: 'straight',
    mouthWidth: 50,
    lipThickness: 50,
    lipShape: 'normal',
    smileCurvature: 50,
    earSize: 50,
    earPosition: 50,
    earShape: 'normal',
    skinTone: '#F1C27D',
    skinTexture: 'smooth',
    hairStyle: 'medium',
    hairColor: '#8B4513',
    hairLength: 50,
    facialHair: 'none',
    facialHairColor: '#8B4513',
    clothingTop: 'tshirt',
    clothingBottom: 'jeans',
    shoes: 'sneakers',
    accessories: [],
    currentExpression: 'neutral',
    currentPose: 'standing',
    bodyType: 'average',
    avatarName: 'My Avatar',
    ...initialConfig
  });

  const handleConfigChange = (category: string, key: string, value: any) => {
    setAvatarConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfiguration(avatarConfig);
      toast.success('Avatar saved successfully!');
    } catch (error) {
      toast.error('Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAvatarConfig({
      ...avatarConfig,
      muscle: 50,
      fat: 20,
      height: 170,
      weight: 70,
      currentExpression: 'neutral',
      currentPose: 'standing'
    });
    toast.success('Avatar reset to defaults');
  };

  const handleExport = () => {
    toast.success('Avatar export started (GLB format)');
  };

  const handleAnimate = () => {
    toast.info('Animation preview started');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                  AI Avatar Creator
                </h1>
                <p className="text-xs text-muted-foreground">Create your realistic 3D avatar with advanced AI-powered customization</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? "default" : "secondary"} className="gap-1 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {isLive ? 'Live' : 'Offline'}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Layers className="w-3 h-3" />
                Real-time 3D
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left - 3D Preview */}
          <div className="col-span-7">
            <Card className="overflow-hidden border-2">
              <div className="bg-gradient-to-br from-card to-card/50 p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">3D Avatar Preview</h2>
                </div>
                <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </Badge>
              </div>
              
              <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" style={{ height: 'calc(100vh - 280px)' }}>
                <Canvas shadows>
                  <PerspectiveCamera makeDefault position={[0, 0.2, 3]} fov={50} />
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
                  <directionalLight position={[-5, 3, -5]} intensity={0.6} />
                  <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffffff" />
                  <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.8} castShadow />
                  
                  <AdvancedAvatarPreview config={avatarConfig} />
                  
                  <OrbitControls 
                    enablePan={false} 
                    minDistance={1.5} 
                    maxDistance={5}
                    maxPolarAngle={Math.PI / 1.8}
                    target={[0, 0.5, 0]}
                  />
                  <Environment preset="sunset" />
                  <ContactShadows position={[0, -1, 0]} scale={5} blur={2.5} far={4} opacity={0.5} />
                </Canvas>
                
                {/* Overlay button */}
                <div className="absolute top-4 right-4">
                  <Button size="sm" variant="secondary" className="backdrop-blur-md bg-card/80">
                    <Layers className="w-4 h-4 mr-2" />
                    Layers
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 bg-gradient-to-r from-card to-card/50 border-t flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAnimate}>
                    <Play className="w-4 h-4 mr-2" />
                    Animate
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export GLB
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-primary/80">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Avatar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right - Customization Panel */}
          <div className="col-span-5">
            <Card className="overflow-hidden border-2">
              <div className="bg-gradient-to-br from-card to-card/50 p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">Customization</h2>
                </div>
              </div>

              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid w-full grid-cols-5 rounded-none border-b bg-muted/50">
                  <TabsTrigger value="presets" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Presets</span>
                  </TabsTrigger>
                  <TabsTrigger value="body" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs">Body</span>
                  </TabsTrigger>
                  <TabsTrigger value="face" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs">Face</span>
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Shirt className="w-4 h-4" />
                    <span className="text-xs">Style</span>
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs">Photo</span>
                  </TabsTrigger>
                </TabsList>

                <div className="overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
                  <TabsContent value="presets" className="m-0 p-4">
                    <PresetsPanel config={avatarConfig} onChange={handleConfigChange} />
                  </TabsContent>

                  <TabsContent value="body" className="m-0 p-4">
                    <BodyPanel config={avatarConfig} onChange={handleConfigChange} />
                  </TabsContent>

                  <TabsContent value="face" className="m-0 p-4">
                    <FacePanel config={avatarConfig} onChange={handleConfigChange} />
                  </TabsContent>

                  <TabsContent value="style" className="m-0 p-4">
                    <StylePanel config={avatarConfig} onChange={handleConfigChange} />
                  </TabsContent>

                  <TabsContent value="photo" className="m-0 p-4">
                    <PhotoPanel onAvatarGenerated={(config) => setAvatarConfig(prev => ({ ...prev, ...config }))} />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarStudioLayout;
