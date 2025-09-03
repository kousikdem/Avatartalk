import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Palette, 
  Shirt, 
  Camera, 
  Download, 
  Save,
  RotateCcw,
  Zap,
  Smile,
  Eye,
  Circle
} from 'lucide-react';
import AdvancedAvatarPreview from './AdvancedAvatarPreview';
import ImageToAvatarConverter from './ImageToAvatarConverter';
import AvatarAssetLibrary from './AvatarAssetLibrary';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';
import { toast } from 'sonner';

interface RealisticAvatarBuilderProps {
  onConfigChange?: (config: any) => void;
  initialConfig?: any;
  showInDashboard?: boolean;
}

const RealisticAvatarBuilder: React.FC<RealisticAvatarBuilderProps> = ({ 
  onConfigChange, 
  initialConfig,
  showInDashboard = false 
}) => {
  const { saveConfiguration, loadConfigurations, currentConfig, setCurrentConfig } = useAvatarConfigurations();
  
  const [avatarConfig, setAvatarConfig] = useState({
    // Basic Info
    gender: 'male',
    age: 25,
    ethnicity: 'caucasian',
    
    // Body Measurements
    height: 170,
    weight: 70,
    muscle: 50,
    fat: 20,
    
    // Body Proportions
    torsoLength: 50,
    legLength: 50,
    shoulderWidth: 50,
    handSize: 50,
    
    // Head & Face Structure
    headSize: 50,
    headShape: 'oval',
    faceWidth: 50,
    jawline: 50,
    cheekbones: 50,
    
    // Eyes
    eyeSize: 50,
    eyeDistance: 50,
    eyeShape: 'almond',
    eyeColor: '#8B4513',
    
    // Nose & Mouth
    noseSize: 50,
    noseWidth: 50,
    noseShape: 'straight',
    mouthWidth: 50,
    lipThickness: 50,
    lipShape: 'normal',
    
    // Ears
    earSize: 50,
    earPosition: 50,
    earShape: 'normal',
    
    // Skin & Hair
    skinTone: '#F1C27D',
    skinTexture: 'smooth',
    hairStyle: 'medium',
    hairColor: '#8B4513',
    hairLength: 50,
    
    // Facial Hair
    facialHair: 'none',
    facialHairColor: '#8B4513',
    
    // Clothing & Accessories
    clothingTop: 'tshirt',
    clothingBottom: 'jeans',
    shoes: 'sneakers',
    accessories: [],
    
    // Expressions & Poses
    currentExpression: 'neutral',
    currentPose: 'standing',
    
    // Meta
    avatarName: 'My Avatar',
    thumbnail: null,
    ...initialConfig
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (currentConfig) {
      setAvatarConfig(prev => ({ ...prev, ...currentConfig }));
    }
  }, [currentConfig]);

  const handleConfigChange = (category: string, key: string, value: any) => {
    const newConfig = {
      ...avatarConfig,
      [key]: value
    };
    setAvatarConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleSaveAvatar = async () => {
    try {
      setIsGenerating(true);
      await saveConfiguration(avatarConfig);
      toast.success('Avatar saved successfully!');
    } catch (error) {
      toast.error('Failed to save avatar');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportAvatar = () => {
    // Export avatar as GLTF/GLB
    toast.info('Exporting avatar... (Feature coming soon)');
  };

  const resetAvatar = () => {
    setAvatarConfig({
      ...avatarConfig,
      gender: 'male',
      age: 25,
      height: 170,
      weight: 70,
      muscle: 50,
      fat: 20,
      currentExpression: 'neutral',
      currentPose: 'standing'
    });
  };

  if (showInDashboard) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Your 3D Avatar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg overflow-hidden realistic-avatar-lighting">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <spotLight position={[-10, -10, -5]} intensity={0.3} />
              
              <AdvancedAvatarPreview config={avatarConfig} />
              
              <OrbitControls 
                enablePan={false} 
                minDistance={3} 
                maxDistance={8}
                maxPolarAngle={Math.PI / 1.8}
              />
              <Environment preset="studio" />
              <ContactShadows position={[0, -2.5, 0]} scale={5} blur={2} far={2.8} />
            </Canvas>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/avatar'}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Customize
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportAvatar}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Realistic Avatar Builder</h1>
          <p className="text-muted-foreground">Create your hyper-realistic 3D avatar with advanced customization</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetAvatar}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveAvatar} disabled={isGenerating}>
            <Save className="w-4 h-4 mr-2" />
            {isGenerating ? 'Saving...' : 'Save Avatar'}
          </Button>
          <Button variant="outline" onClick={handleExportAvatar}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Preview */}
        <div className="lg:col-span-2">
          <Card className="avatar-preview-container h-[600px]">
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
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="text-xs">
                <User className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="face" className="text-xs">
                <Eye className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="style" className="text-xs">
                <Palette className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="clothing" className="text-xs">
                <Shirt className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="photo" className="text-xs">
                <Camera className="w-3 h-3" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 max-h-[500px] overflow-y-auto">
              <BasicControls config={avatarConfig} onChange={handleConfigChange} />
            </TabsContent>

            <TabsContent value="face" className="space-y-4 max-h-[500px] overflow-y-auto">
              <FaceControls config={avatarConfig} onChange={handleConfigChange} />
            </TabsContent>

            <TabsContent value="style" className="space-y-4 max-h-[500px] overflow-y-auto">
              <StyleControls config={avatarConfig} onChange={handleConfigChange} />
            </TabsContent>

            <TabsContent value="clothing" className="space-y-4 max-h-[500px] overflow-y-auto">
              <ClothingControls config={avatarConfig} onChange={handleConfigChange} />
            </TabsContent>

            <TabsContent value="photo" className="space-y-4 max-h-[500px] overflow-y-auto">
              <ImageToAvatarConverter onConfigGenerated={setAvatarConfig} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Asset Library */}
      <AvatarAssetLibrary onAssetSelect={(type, asset) => {
        handleConfigChange('asset', type, asset);
      }} />
    </div>
  );
};

// Basic Controls Component
const BasicControls: React.FC<{ config: any; onChange: (cat: string, key: string, val: any) => void }> = ({ config, onChange }) => (
  <div className="space-y-4">
    <Card className="avatar-control-panel">
      <CardHeader className="avatar-section-header">
        <CardTitle className="text-sm">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Gender</Label>
          <Select value={config.gender} onValueChange={(value) => onChange('basic', 'gender', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">
            Age: <Badge variant="secondary">{config.age}</Badge>
          </Label>
          <Slider
            value={[config.age]}
            onValueChange={([value]) => onChange('basic', 'age', value)}
            min={16}
            max={80}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">
            Height: <Badge variant="secondary">{config.height}cm</Badge>
          </Label>
          <Slider
            value={[config.height]}
            onValueChange={([value]) => onChange('basic', 'height', value)}
            min={150}
            max={200}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">
            Weight: <Badge variant="secondary">{config.weight}kg</Badge>
          </Label>
          <Slider
            value={[config.weight]}
            onValueChange={([value]) => onChange('basic', 'weight', value)}
            min={40}
            max={120}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">
            Muscle: <Badge variant="secondary">{config.muscle}%</Badge>
          </Label>
          <Slider
            value={[config.muscle]}
            onValueChange={([value]) => onChange('basic', 'muscle', value)}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Face Controls Component
const FaceControls: React.FC<{ config: any; onChange: (cat: string, key: string, val: any) => void }> = ({ config, onChange }) => (
  <div className="space-y-4">
    <Card className="avatar-control-panel">
      <CardHeader className="avatar-section-header">
        <CardTitle className="text-sm">Face Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">
            Head Size: <Badge variant="secondary">{config.headSize}%</Badge>
          </Label>
          <Slider
            value={[config.headSize]}
            onValueChange={([value]) => onChange('face', 'headSize', value)}
            min={80}
            max={120}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Head Shape</Label>
          <Select value={config.headShape} onValueChange={(value) => onChange('face', 'headShape', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oval">Oval</SelectItem>
              <SelectItem value="round">Round</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="heart">Heart</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">
            Eye Size: <Badge variant="secondary">{config.eyeSize}%</Badge>
          </Label>
          <Slider
            value={[config.eyeSize]}
            onValueChange={([value]) => onChange('face', 'eyeSize', value)}
            min={70}
            max={130}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Eye Color</Label>
          <div className="flex gap-2 mt-2">
            {['#8B4513', '#4A90E2', '#50C878', '#DAA520', '#708090', '#2F4F4F'].map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  config.eyeColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onChange('face', 'eyeColor', color)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Style Controls Component  
const StyleControls: React.FC<{ config: any; onChange: (cat: string, key: string, val: any) => void }> = ({ config, onChange }) => (
  <div className="space-y-4">
    <Card className="avatar-control-panel">
      <CardHeader className="avatar-section-header">
        <CardTitle className="text-sm">Hair & Skin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Hair Style</Label>
          <Select value={config.hairStyle} onValueChange={(value) => onChange('style', 'hairStyle', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bald">Bald</SelectItem>
              <SelectItem value="buzz">Buzz Cut</SelectItem>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="curly">Curly</SelectItem>
              <SelectItem value="afro">Afro</SelectItem>
              <SelectItem value="ponytail">Ponytail</SelectItem>
              <SelectItem value="braids">Braids</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Skin Tone</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[
              '#F5DEB3', '#DEB887', '#D2B48C', '#BC9A6A', 
              '#8B7355', '#654321', '#4A2C2A', '#2F1B14'
            ].map((color) => (
              <button
                key={color}
                className={`w-full h-8 rounded border-2 transition-all hover:scale-105 ${
                  config.skinTone === color ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onChange('style', 'skinTone', color)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Expression</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { id: 'neutral', icon: '😐', label: 'Neutral' },
              { id: 'smiling', icon: '😊', label: 'Smile' },
              { id: 'laughing', icon: '😄', label: 'Laugh' },
              { id: 'surprised', icon: '😲', label: 'Surprised' },
              { id: 'angry', icon: '😠', label: 'Angry' },
              { id: 'sad', icon: '😢', label: 'Sad' }
            ].map((expr) => (
              <Button
                key={expr.id}
                variant={config.currentExpression === expr.id ? 'default' : 'outline'}
                size="sm"
                className="avatar-pose-button"
                onClick={() => onChange('style', 'currentExpression', expr.id)}
              >
                <span className="mr-2">{expr.icon}</span>
                {expr.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Clothing Controls Component
const ClothingControls: React.FC<{ config: any; onChange: (cat: string, key: string, val: any) => void }> = ({ config, onChange }) => (
  <div className="space-y-4">
    <Card className="avatar-control-panel">
      <CardHeader className="avatar-section-header">
        <CardTitle className="text-sm">Clothing & Pose</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Top</Label>
          <Select value={config.clothingTop} onValueChange={(value) => onChange('clothing', 'clothingTop', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tshirt">T-Shirt</SelectItem>
              <SelectItem value="shirt">Dress Shirt</SelectItem>
              <SelectItem value="hoodie">Hoodie</SelectItem>
              <SelectItem value="suit">Suit Jacket</SelectItem>
              <SelectItem value="dress">Dress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Pose</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { id: 'standing', label: 'Standing' },
              { id: 'sitting', label: 'Sitting' },
              { id: 'running', label: 'Running' },
              { id: 'dancing', label: 'Dancing' },
              { id: 'relaxed', label: 'Relaxed' },
              { id: 'confident', label: 'Confident' }
            ].map((pose) => (
              <Button
                key={pose.id}
                variant={config.currentPose === pose.id ? 'default' : 'outline'}
                size="sm"
                className="avatar-pose-button"
                onClick={() => onChange('clothing', 'currentPose', pose.id)}
              >
                {pose.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default RealisticAvatarBuilder;