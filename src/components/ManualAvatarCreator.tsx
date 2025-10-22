import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, Download, RotateCcw, User, Eye, Shirt, Smile } from 'lucide-react';
import { toast } from 'sonner';
import AdvancedAvatarPreview from './AdvancedAvatarPreview';
import DetailedBodyControls from './DetailedBodyControls';
import DetailedFaceControls from './DetailedFaceControls';
import ComprehensiveClothingControls from './ComprehensiveClothingControls';
import PoseAndExpressionLibrary from './PoseAndExpressionLibrary';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';

interface ManualAvatarCreatorProps {
  initialConfig?: any;
  onConfigChange?: (config: any) => void;
}

const ManualAvatarCreator: React.FC<ManualAvatarCreatorProps> = ({ 
  initialConfig, 
  onConfigChange 
}) => {
  const { saveConfiguration } = useAvatarConfigurations();
  const [avatarConfig, setAvatarConfig] = useState({
    gender: 'male',
    age: 25,
    ethnicity: 'caucasian',
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
    earSize: 50,
    earPosition: 50,
    earShape: 'normal',
    skinTone: '#F1C27D',
    skinTexture: 'smooth',
    hairStyle: 'medium',
    hairColor: '#8B4513',
    hairLength: 50,
    facialHair: 'none',
    clothingTop: 'tshirt',
    clothingBottom: 'jeans',
    shoes: 'sneakers',
    accessories: [],
    currentExpression: 'neutral',
    currentPose: 'standing',
    avatarName: 'My Avatar',
    ...initialConfig
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setAvatarConfig(prev => ({ ...prev, ...initialConfig }));
    }
  }, [initialConfig]);

  useEffect(() => {
    onConfigChange?.(avatarConfig);
  }, [avatarConfig, onConfigChange]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 3D Preview */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] overflow-hidden">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <spotLight position={[-10, -10, -5]} intensity={0.3} />
            <pointLight position={[0, 5, 0]} intensity={0.4} />
            
            <AdvancedAvatarPreview config={avatarConfig} />
            
            <OrbitControls 
              enablePan={false} 
              minDistance={2} 
              maxDistance={10}
              maxPolarAngle={Math.PI / 1.6}
            />
            <Environment preset="studio" />
            <ContactShadows position={[0, -2.5, 0]} scale={8} blur={3} far={3} />
          </Canvas>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Avatar'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div>
        <Tabs defaultValue="body" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="body" className="text-xs">
              <User className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="face" className="text-xs">
              <Eye className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="clothing" className="text-xs">
              <Shirt className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="pose" className="text-xs">
              <Smile className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="body" className="max-h-[500px] overflow-y-auto mt-4">
            <DetailedBodyControls config={avatarConfig} onChange={handleConfigChange} />
          </TabsContent>

          <TabsContent value="face" className="max-h-[500px] overflow-y-auto mt-4">
            <DetailedFaceControls config={avatarConfig} onChange={handleConfigChange} />
          </TabsContent>

          <TabsContent value="clothing" className="max-h-[500px] overflow-y-auto mt-4">
            <ComprehensiveClothingControls config={avatarConfig} onChange={handleConfigChange} />
          </TabsContent>

          <TabsContent value="pose" className="max-h-[500px] overflow-y-auto mt-4">
            <PoseAndExpressionLibrary config={avatarConfig} onChange={handleConfigChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManualAvatarCreator;
