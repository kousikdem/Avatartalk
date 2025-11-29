import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, RotateCcw, User, Eye, Shirt, Smile, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import AdvancedAvatarPreview from './AdvancedAvatarPreview';
import DetailedBodyControls from './DetailedBodyControls';
import DetailedFaceControls from './DetailedFaceControls';
import ComprehensiveClothingControls from './ComprehensiveClothingControls';
import PoseAndExpressionLibrary from './PoseAndExpressionLibrary';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';
import { useCustomAvatarUpload } from '@/hooks/useCustomAvatarUpload';
import { supabase } from '@/integrations/supabase/client';

interface ManualAvatarCreatorProps {
  initialConfig?: any;
  onConfigChange?: (config: any) => void;
}

const ManualAvatarCreator: React.FC<ManualAvatarCreatorProps> = ({ 
  initialConfig, 
  onConfigChange 
}) => {
  const { saveConfiguration } = useAvatarConfigurations();
  const { uploading, progress, uploadCustomAvatar } = useCustomAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatarUploaded, setCustomAvatarUploaded] = useState(false);
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
      // Capture thumbnail from canvas if no custom avatar uploaded
      let thumbnailUrl = avatarConfig.thumbnail_url;
      
      if (!customAvatarUploaded) {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          // Capture canvas as blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95);
          });
          
          // Upload thumbnail to storage
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const fileName = `avatar_${Date.now()}.png`;
            const { data, error } = await supabase.storage
              .from('thumbnails')
              .upload(`${user.id}/${fileName}`, blob, {
                contentType: 'image/png',
                upsert: true
              });
            
            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage
                .from('thumbnails')
                .getPublicUrl(data.path);
              thumbnailUrl = publicUrl;
            }
          }
        }
      }
      
      // Save configuration with thumbnail
      await saveConfiguration({
        ...avatarConfig,
        thumbnail_url: thumbnailUrl
      });
      
      toast.success('Avatar saved and synced to profile!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAvatarConfig({
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
      model_url: undefined,
      thumbnail_url: undefined
    });
    setCustomAvatarUploaded(false);
    toast.success('Avatar reset to defaults');
  };

  const handleCustomAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadCustomAvatar(file);
    if (result) {
      setAvatarConfig(prev => ({
        ...prev,
        model_url: result.model_url,
        thumbnail_url: result.thumbnail_url,
        avatarName: file.name.replace(/\.[^/.]+$/, "")
      }));
      setCustomAvatarUploaded(true);
    }
  };

  const handleRemoveCustomAvatar = () => {
    setAvatarConfig(prev => ({
      ...prev,
      model_url: undefined,
      thumbnail_url: undefined
    }));
    setCustomAvatarUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Custom avatar removed');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 3D Preview */}
      <div className="lg:col-span-2 space-y-4">
        {/* Custom Avatar Upload Card */}
        {customAvatarUploaded && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Custom Avatar Uploaded</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCustomAvatar}
                className="h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Using uploaded 3D model. Save to apply to all avatar previews.
            </p>
          </Card>
        )}

        <Card className="h-[600px] overflow-hidden">
          <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <spotLight position={[-10, -10, -5]} intensity={0.3} />
            <pointLight position={[0, 5, 0]} intensity={0.4} />
            
            <AdvancedAvatarPreview config={avatarConfig} />
            
            <OrbitControls 
              enablePan={false} 
              minDistance={4} 
              maxDistance={15}
              maxPolarAngle={Math.PI / 1.6}
            />
            <Environment preset="studio" />
            <ContactShadows position={[0, -2.5, 0]} scale={8} blur={3} far={3} />
          </Canvas>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Upload Custom Avatar */}
          <div className="space-y-2">
            <Label htmlFor="custom-avatar-upload" className="text-sm font-medium">
              Upload Custom Avatar (GLB, GLTF, FBX, OBJ)
            </Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id="custom-avatar-upload"
                type="file"
                accept=".glb,.gltf,.fbx,.obj"
                onChange={handleCustomAvatarUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse
              </Button>
            </div>
            {uploading && (
              <div className="space-y-1">
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">Uploading... {progress}%</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Avatar'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
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
