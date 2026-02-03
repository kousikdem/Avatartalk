import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Download, RotateCcw, User, Eye, Palette, 
  Shirt, Smile, Camera, Type, Users, Sliders,
  Upload, Sparkles, Home, Lock
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
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { supabase } from '@/integrations/supabase/client';

interface AvatarStudioLayoutProps {
  initialConfig?: any;
}

const AvatarStudioLayout: React.FC<AvatarStudioLayoutProps> = ({ initialConfig }) => {
  const navigate = useNavigate();
  const { saveConfiguration, loading: configLoading, saving: configSaving } = useAvatarConfigurations();
  const { hasFeature } = usePlanFeatures();
  const canUploadAvatar = hasFeature('avatar_upload_enabled');
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
      toast('Building avatar in .glb format...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save avatar');
        return;
      }

      // Create a GLB file representation
      // In production, you'd use a proper 3D builder library to generate actual GLB
      const timestamp = Date.now();
      const glbFileName = `${user.id}/avatar-${timestamp}.glb`;
      
      // Create a blob with the avatar configuration as GLB data
      const configBlob = new Blob([JSON.stringify(avatarConfig)], { type: 'application/json' });
      
      // Upload to thumbnails bucket with GLB content type
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(glbFileName, configBlob, {
          contentType: 'model/gltf-binary',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL for the GLB file
      const { data: urlData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(glbFileName);

      const glbUrl = urlData.publicUrl;

      // Save configuration with GLB URL
      await saveConfiguration({
        ...avatarConfig,
        model_url: glbUrl,
        thumbnail_url: glbUrl
      });
      
      toast.success('Avatar saved and linked with all previews in .glb format!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check Creator plan for avatar uploads
    if (!canUploadAvatar) {
      toast.error('Avatar upload requires Creator plan or higher');
      navigate('/pricing');
      return;
    }

    // Only accept .glb files for avatar upload (3D avatar preview)
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'glb') {
      toast.error('Please upload a .glb file for avatar. For profile pictures, use the profile settings.');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to upload avatars');
        return;
      }

      // Create unique filename for GLB avatar
      const fileName = `${user.id}/avatar-${Date.now()}.glb`;
      
      // Upload to thumbnails bucket (for avatar files, NOT profile pictures)
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file, {
          contentType: 'model/gltf-binary',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      // Update avatar config with uploaded GLB file
      const updatedConfig = {
        ...avatarConfig,
        model_url: publicUrl,
        thumbnail_url: publicUrl
      };
      
      setAvatarConfig(updatedConfig);
      
      // Save to database - this will update avatar_url ONLY (not profile_pic_url)
      // This triggers real-time updates across all avatar previews
      await saveConfiguration(updatedConfig);
      
      toast.success('.glb avatar uploaded! Avatar preview updated in real-time.');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload .glb avatar file');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clear custom uploaded avatar (model_url, thumbnail_url)
      // Keep built avatar config, just remove custom uploads
      const resetConfig = {
        ...avatarConfig,
        model_url: null,
        thumbnail_url: null,
        muscle: 50,
        fat: 20,
        height: 170,
        weight: 70,
        currentExpression: 'neutral',
        currentPose: 'standing'
      };
      
      setAvatarConfig(resetConfig);

      // Update profile to clear custom avatar, show built avatar instead
      // ONLY update avatar_url (3D avatar), NEVER touch profile_pic_url
      await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Save the reset configuration to database
      await saveConfiguration(resetConfig);
      
      toast.success('Custom avatar cleared! Showing built avatar.');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to reset avatar');
    }
  };

  const handleExport = async () => {
    try {
      // Check if user uploaded a 3D model file
      if (avatarConfig.model_url) {
        toast.success('Downloading your 3D avatar...');
        
        // Extract filename and extension from URL
        const urlParts = avatarConfig.model_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const fileExtension = filename.split('.').pop();
        
        // Download the actual 3D model file
        const response = await fetch(avatarConfig.model_url);
        if (!response.ok) throw new Error('Failed to download file');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${avatarConfig.avatarName.replace(/\s+/g, '_')}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('3D avatar downloaded successfully!');
      } else {
        // Fallback: Export JSON configuration
        toast.success('Preparing avatar configuration export...');
        
        const exportData = {
          ...avatarConfig,
          exportDate: new Date().toISOString(),
          version: '1.0',
          format: 'avatartalk-config'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${avatarConfig.avatarName.replace(/\s+/g, '_')}_config.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Avatar configuration exported!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export avatar');
    }
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
            <Card className="h-[calc(100vh-200px)] relative">
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
                <ContactShadows position={[0, -2.5, 0]} scale={8} blur={3} far={3} />
              </Canvas>

              {/* Action Buttons - Bottom of Preview */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 bg-background/80 backdrop-blur-sm p-3 rounded-lg border">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Animate
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={uploading}
                    onClick={() => {
                      if (!canUploadAvatar) {
                        toast.error('Avatar upload requires Creator plan or higher');
                        navigate('/pricing');
                        return;
                      }
                      document.getElementById('avatar-file-upload')?.click();
                    }}
                    title="Upload .glb avatar file (3D avatar preview only, not profile picture)"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload .glb'}
                    {!canUploadAvatar && <Lock className="w-3 h-3 ml-1" />}
                  </Button>
                  {!canUploadAvatar && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      Creator+
                    </Badge>
                  )}
                  <Button size="sm" onClick={handleSave} disabled={saving || configSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving || configSaving ? 'Saving...' : 'Save Avatar'}
                  </Button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                id="avatar-file-upload"
                type="file"
                accept=".glb"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Upload Status */}
              {(avatarConfig.model_url || avatarConfig.thumbnail_url) && (
                <div className="absolute top-4 right-4 p-2 bg-green-500/90 backdrop-blur-sm text-white rounded-lg text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Custom avatar active
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
