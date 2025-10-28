import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Download, RotateCcw, User, Eye, Palette, 
  Shirt, Smile, Camera, Type, Users, Sliders,
  Upload, Sparkles, Home
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AdvancedAvatarPreview from '../AdvancedAvatarPreview';
import BodyAnatomyPanel from './BodyAnatomyPanel';
import FacialFeaturesPanel from './FacialFeaturesPanel';
import SkinEthnicityControls from './SkinEthnicityControls';
import HairCustomizationPanel from './HairCustomizationPanel';
import ClothingStylePanel from './ClothingStylePanel';
import PoseExpressionPanel from './PoseExpressionPanel';
import ReadyMadeAvatarGallery from '../ReadyMadeAvatarGallery';
import M3CharacterStudioIntegration from './M3CharacterStudioIntegration';
import AvatarBoothIntegration from './AvatarBoothIntegration';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';
import { supabase } from '@/integrations/supabase/client';

interface AvatarStudioLayoutProps {
  initialConfig?: any;
}

const AvatarStudioLayout: React.FC<AvatarStudioLayoutProps> = ({ initialConfig }) => {
  const navigate = useNavigate();
  const { saveConfiguration, loading: configLoading, saving: configSaving } = useAvatarConfigurations();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'image' | 'text' | 'preset'>('manual');
  
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
    avatarName: 'My Avatar',
    model_url: null as string | null,
    thumbnail_url: null as string | null,
    ...initialConfig
  });

  // Show loading state while configurations are loading
  if (configLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading avatar studio...</p>
        </div>
      </div>
    );
  }

  const handleConfigChange = (category: string, key: string, value: any) => {
    setAvatarConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAvatarGenerated = (config: any) => {
    setAvatarConfig(prev => ({ ...prev, ...config }));
    setCreationMode('manual');
    toast.success('Avatar generated! Customize it further.');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfiguration(avatarConfig);
      toast.success('Avatar saved and linked with all previews!');
    } catch (error) {
      toast.error('Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - support GLB, FBX, GLTF, GIF, PNG, JPG
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'model/gltf-binary', 'application/octet-stream'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(glb|fbx|gltf|gif|png|jpg|jpeg)$/i)) {
      toast.error('Please upload a valid avatar file (GLB, FBX, GLTF, GIF, PNG, or JPG)');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to upload avatars');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to profile-pictures bucket
      const { error: uploadError, data } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update avatar config with uploaded file
      const isModelFile = file.name.match(/\.(glb|fbx|gltf)$/i);
      const updatedConfig = {
        ...avatarConfig,
        [isModelFile ? 'model_url' : 'thumbnail_url']: publicUrl
      };
      
      setAvatarConfig(updatedConfig);
      
      // Save to database - this will trigger real-time updates across all avatar previews
      await saveConfiguration(updatedConfig);
      
      toast.success('Custom avatar uploaded and linked with all previews!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar file');
    } finally {
      setUploading(false);
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
    toast.success('Avatar export started (GLB/FBX format)');
    // Integration point for M3.org/CharacterStudio export
  };

  if (creationMode !== 'manual') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create Your Avatar
              </h1>
              <p className="text-muted-foreground mt-2">
                Choose your preferred creation method
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button onClick={() => setCreationMode('manual')}>
                <Sliders className="w-4 h-4 mr-2" />
                Manual Editor
              </Button>
            </div>
          </div>

          {/* Creation Method Selector */}
          <Card className="card-gradient p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button
                variant={creationMode === 'image' ? 'default' : 'outline'}
                className="h-auto flex-col gap-3 p-6"
                onClick={() => setCreationMode('image')}
              >
                <Camera className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">Image Upload</div>
                  <div className="text-xs opacity-70">AI face extraction</div>
                </div>
              </Button>

              <Button
                variant={creationMode === 'text' ? 'default' : 'outline'}
                className="h-auto flex-col gap-3 p-6"
                onClick={() => setCreationMode('text')}
              >
                <Type className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">Text Prompt</div>
                  <div className="text-xs opacity-70">Describe your avatar</div>
                </div>
              </Button>

              <Button
                variant={creationMode === 'preset' ? 'default' : 'outline'}
                className="h-auto flex-col gap-3 p-6"
                onClick={() => setCreationMode('preset')}
              >
                <Users className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">Ready-Made</div>
                  <div className="text-xs opacity-70">Quick templates</div>
                </div>
              </Button>
            </div>

            {creationMode === 'image' && (
              <AvatarBoothIntegration onAvatarGenerated={handleAvatarGenerated} />
            )}
            
            {creationMode === 'text' && (
              <M3CharacterStudioIntegration onAvatarGenerated={handleAvatarGenerated} />
            )}
            
            {creationMode === 'preset' && (
              <ReadyMadeAvatarGallery onAvatarSelected={handleAvatarGenerated} />
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Avatar Studio
              </h1>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by M3.org & AvatarBooth
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Body & Anatomy */}
          <div className="col-span-3 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
            <Card className="card-gradient p-4">
              <BodyAnatomyPanel config={avatarConfig} onChange={handleConfigChange} />
            </Card>
          </div>

          {/* Center - 3D Preview */}
          <div className="col-span-6 space-y-4">
            <Card className="h-[calc(100vh-200px)]">
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
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

            {/* Avatar File Upload Section */}
            <Card className="card-gradient p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Custom Avatar
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Upload 3D model (GLB/FBX/GLTF) or image (PNG/JPG/GIF)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={uploading}
                  onClick={() => document.getElementById('avatar-file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                </Button>
                <input
                  id="avatar-file-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.glb,.fbx,.gltf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              {(avatarConfig.model_url || avatarConfig.thumbnail_url) && (
                <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-600 dark:text-green-400">
                  ✓ Custom avatar uploaded and linked with all previews
                </div>
              )}
            </Card>

            {/* Creation Methods */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreationMode('image')}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                From Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreationMode('text')}
                className="flex items-center gap-2"
              >
                <Type className="w-4 h-4" />
                From Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreationMode('preset')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Presets
              </Button>
            </div>
          </div>

          {/* Right Panel - Face & Appearance */}
          <div className="col-span-3 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
            <Tabs defaultValue="face" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="face" className="text-xs">
                  <Eye className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="skin" className="text-xs">
                  <Palette className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="hair" className="text-xs">
                  <Smile className="w-3 h-3" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="face" className="space-y-4">
                <Card className="card-gradient p-4">
                  <FacialFeaturesPanel config={avatarConfig} onChange={handleConfigChange} />
                </Card>
              </TabsContent>

              <TabsContent value="skin" className="space-y-4">
                <SkinEthnicityControls config={avatarConfig} onChange={handleConfigChange} />
              </TabsContent>

              <TabsContent value="hair" className="space-y-4">
                <HairCustomizationPanel config={avatarConfig} onChange={handleConfigChange} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Bottom Panel - Clothing & Pose/Expression */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <Card className="card-gradient p-4">
            <ClothingStylePanel config={avatarConfig} onChange={handleConfigChange} />
          </Card>
          
          <Card className="card-gradient p-4">
            <PoseExpressionPanel config={avatarConfig} onChange={handleConfigChange} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AvatarStudioLayout;
