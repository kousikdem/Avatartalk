import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Download,
  RotateCcw,
  User,
  Eye,
  Palette,
  Shirt,
  Smile,
  Camera,
  Type,
  Users,
  Sliders,
  Upload,
  Sparkles,
  Home,
  Zap,
  Activity,
  Brain,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AdvancedAvatarPreview from '@/components/AdvancedAvatarPreview';
import BodyAnatomyPanel from '@/components/avatar-studio/BodyAnatomyPanel';
import FacialFeaturesPanel from '@/components/avatar-studio/FacialFeaturesPanel';
import SkinEthnicityControls from '@/components/avatar-studio/SkinEthnicityControls';
import HairCustomizationPanel from '@/components/avatar-studio/HairCustomizationPanel';
import ClothingStylePanel from '@/components/avatar-studio/ClothingStylePanel';
import PoseExpressionPanel from '@/components/avatar-studio/PoseExpressionPanel';
import ReadyMadeAvatarGallery from '@/components/ReadyMadeAvatarGallery';
import ImageToAvatarConverter from '@/components/ImageToAvatarConverter';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { supabase } from '@/integrations/supabase/client';

const AvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveConfiguration } = useAvatarConfigurations();
  const { hasFeature } = usePlanFeatures();
  const canUploadAvatar = hasFeature('avatar_upload_enabled');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'image' | 'text' | 'preset'>('manual');
  const [textPrompt, setTextPrompt] = useState('');
  const [generatingFromText, setGeneratingFromText] = useState(false);
  const [exportFormat, setExportFormat] = useState<'glb' | 'fbx' | 'gltf' | 'gif' | 'json'>('json');
  
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
    accessories: [] as string[],
    currentExpression: 'neutral',
    currentPose: 'standing',
    avatarName: 'My Avatar',
    model_url: null as string | null,
    thumbnail_url: null as string | null
  });

  const handleConfigChange = (category: string, key: string, value: any) => {
    setAvatarConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // saveConfiguration handles profile sync via DB trigger
      await saveConfiguration(avatarConfig);

      toast.success('Avatar saved and linked across all previews!');
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

    // Check plan for non-JSON uploads (actual avatar file uploads)
    const isJsonImport = file.name.endsWith('.json');
    if (!isJsonImport && !canUploadAvatar) {
      toast.error('Avatar upload requires Creator plan or higher');
      navigate('/pricing');
      return;
    }

    if (!file.name.match(/\.(glb|fbx|gltf|gif|png|jpg|jpeg|json)$/i)) {
      toast.error('Please upload .glb, .fbx, .gltf, .gif, .png, .jpg, or .json file');
      return;
    }

    // Handle JSON configuration import (allowed for all plans)
    if (isJsonImport) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonConfig = JSON.parse(e.target?.result as string);
          setAvatarConfig(prev => ({ ...prev, ...jsonConfig }));
          await saveConfiguration({ ...avatarConfig, ...jsonConfig });
          toast.success('Configuration imported from JSON!');
        } catch (error) {
          console.error('JSON parse error:', error);
          toast.error('Invalid JSON configuration file');
        }
      };
      reader.readAsText(file);
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to upload avatars');
        return;
      }

      const isImage = file.name.match(/\.(png|jpg|jpeg|gif)$/i);
      const bucket = isImage ? 'thumbnails' : 'profile-pictures';
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      const fileName = `${user.id}/avatar_${Date.now()}${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Compress file in background
      const compressFile = async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (!token) return;

          await fetch('https://hnxnvdzrwbtmcohdptfq.supabase.co/functions/v1/avatar-file-compress', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filePath: fileName,
              bucket,
              format: fileExt.replace('.', ''),
            }),
          });
        } catch (error) {
          console.error('Compression error:', error);
        }
      };
      compressFile();

      const isModel = file.name.match(/\.(glb|fbx|gltf)$/i);
      const updatedConfig = {
        ...avatarConfig,
        model_url: isModel ? publicUrl : avatarConfig.model_url,
        thumbnail_url: isModel ? avatarConfig.thumbnail_url : publicUrl,
      };
      
      setAvatarConfig(updatedConfig);
      // saveConfiguration handles DB trigger sync to profiles
      await saveConfiguration(updatedConfig);
      
      toast.success('Avatar uploaded and linked to all previews!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleTextGeneration = async () => {
    if (!textPrompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setGeneratingFromText(true);
    try {
      const lower = textPrompt.toLowerCase();
      const newConfig = { ...avatarConfig };
      
      // Gender
      if (lower.includes('male') && !lower.includes('female')) newConfig.gender = 'male';
      if (lower.includes('female')) newConfig.gender = 'female';
      
      // Build
      if (lower.includes('athletic') || lower.includes('fit')) {
        newConfig.muscle = 75;
        newConfig.fat = 12;
      }
      if (lower.includes('slim') || lower.includes('thin')) {
        newConfig.muscle = 40;
        newConfig.fat = 15;
      }
      if (lower.includes('muscular') || lower.includes('strong')) {
        newConfig.muscle = 85;
        newConfig.fat = 10;
      }
      
      // Ethnicity
      if (lower.includes('asian')) newConfig.ethnicity = 'asian';
      if (lower.includes('african') || lower.includes('black')) newConfig.ethnicity = 'african';
      if (lower.includes('caucasian') || lower.includes('white')) newConfig.ethnicity = 'caucasian';
      if (lower.includes('hispanic') || lower.includes('latino')) newConfig.ethnicity = 'hispanic';
      
      // Hair
      if (lower.includes('short hair')) newConfig.hairStyle = 'short';
      if (lower.includes('long hair')) newConfig.hairStyle = 'long';
      if (lower.includes('curly')) newConfig.hairStyle = 'curly';
      if (lower.includes('bald')) newConfig.hairStyle = 'bald';
      
      // Clothing
      if (lower.includes('suit') || lower.includes('formal')) {
        newConfig.clothingTop = 'suit';
        newConfig.clothingBottom = 'dress pants';
      }
      if (lower.includes('casual')) {
        newConfig.clothingTop = 'tshirt';
        newConfig.clothingBottom = 'jeans';
      }
      if (lower.includes('athletic') || lower.includes('sporty')) {
        newConfig.clothingTop = 'sportwear';
        newConfig.clothingBottom = 'athletic';
      }
      
      setAvatarConfig(newConfig);
      setCreationMode('manual');
      toast.success('Avatar generated from description! Customize further.');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate avatar');
    } finally {
      setGeneratingFromText(false);
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
    toast.success('Avatar reset');
  };

  const handleExport = async (format?: string) => {
    const exportFmt = format || exportFormat;
    try {
      // If model URL exists and requesting model format
      if (avatarConfig.model_url && ['glb', 'fbx', 'gltf'].includes(exportFmt)) {
        const response = await fetch(avatarConfig.model_url);
        if (!response.ok) throw new Error('Failed to download');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = avatarConfig.avatarName.replace(/\s+/g, '_') + '.' + exportFmt;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Avatar exported as ${exportFmt.toUpperCase()}!`);
      } else if (avatarConfig.thumbnail_url && exportFmt === 'gif') {
        // Export thumbnail as GIF
        const response = await fetch(avatarConfig.thumbnail_url);
        if (!response.ok) throw new Error('Failed to download');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${avatarConfig.avatarName.replace(/\s+/g, '_')}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Avatar exported as GIF!');
      } else {
        // Export as JSON configuration with all morph and material properties
        const exportData = {
          version: '2.0',
          exportDate: new Date().toISOString(),
          avatarName: avatarConfig.avatarName,
          format: 'json',
          // Morph properties
          morphology: {
            gender: avatarConfig.gender,
            age: avatarConfig.age,
            ethnicity: avatarConfig.ethnicity,
            height: avatarConfig.height,
            weight: avatarConfig.weight,
            muscle: avatarConfig.muscle,
            fat: avatarConfig.fat,
            bodyProportions: {
              torsoLength: avatarConfig.torsoLength,
              legLength: avatarConfig.legLength,
              shoulderWidth: avatarConfig.shoulderWidth,
              handSize: avatarConfig.handSize,
              headSize: avatarConfig.headSize
            }
          },
          // Facial morph properties
          facialStructure: {
            headShape: avatarConfig.headShape,
            faceWidth: avatarConfig.faceWidth,
            jawline: avatarConfig.jawline,
            cheekbones: avatarConfig.cheekbones,
            chinSize: avatarConfig.chinSize,
            eyes: {
              size: avatarConfig.eyeSize,
              distance: avatarConfig.eyeDistance,
              shape: avatarConfig.eyeShape,
              color: avatarConfig.eyeColor
            },
            nose: {
              size: avatarConfig.noseSize,
              width: avatarConfig.noseWidth,
              shape: avatarConfig.noseShape
            },
            mouth: {
              width: avatarConfig.mouthWidth,
              lipThickness: avatarConfig.lipThickness,
              lipShape: avatarConfig.lipShape,
              smileCurvature: avatarConfig.smileCurvature
            },
            ears: {
              size: avatarConfig.earSize,
              position: avatarConfig.earPosition,
              shape: avatarConfig.earShape
            }
          },
          // Material properties
          materials: {
            skin: {
              tone: avatarConfig.skinTone,
              texture: avatarConfig.skinTexture
            },
            hair: {
              style: avatarConfig.hairStyle,
              color: avatarConfig.hairColor,
              length: avatarConfig.hairLength
            },
            facialHair: {
              style: avatarConfig.facialHair,
              color: avatarConfig.facialHairColor
            }
          },
          // Clothing and accessories
          clothing: {
            top: avatarConfig.clothingTop,
            bottom: avatarConfig.clothingBottom,
            shoes: avatarConfig.shoes,
            accessories: avatarConfig.accessories
          },
          // Animation properties
          animation: {
            expression: avatarConfig.currentExpression,
            pose: avatarConfig.currentPose
          },
          // Asset URLs
          assets: {
            modelUrl: avatarConfig.model_url,
            thumbnailUrl: avatarConfig.thumbnail_url
          }
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
        
        toast.success('Configuration with all properties exported!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    }
  };

  // Creation Mode View
  if (creationMode !== 'manual') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                🎨 Create Your Avatar
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={creationMode === 'image' ? 'default' : 'outline'}
              className="h-32 flex-col gap-3 p-6 hover:scale-105 transition-transform"
              onClick={() => setCreationMode('image')}
            >
              <Camera className="w-12 h-12" />
              <div className="text-center">
                <div className="font-bold text-lg">📸 From Image</div>
                <div className="text-xs opacity-70">AI face extraction</div>
              </div>
            </Button>

            <Button
              variant={creationMode === 'text' ? 'default' : 'outline'}
              className="h-32 flex-col gap-3 p-6 hover:scale-105 transition-transform"
              onClick={() => setCreationMode('text')}
            >
              <Brain className="w-12 h-12" />
              <div className="text-center">
                <div className="font-bold text-lg">🤖 From Text</div>
                <div className="text-xs opacity-70">AI description</div>
              </div>
            </Button>

            <Button
              variant={creationMode === 'preset' ? 'default' : 'outline'}
              className="h-32 flex-col gap-3 p-6 hover:scale-105 transition-transform"
              onClick={() => setCreationMode('preset')}
            >
              <Users className="w-12 h-12" />
              <div className="text-center">
                <div className="font-bold text-lg">👥 Ready-Made</div>
                <div className="text-xs opacity-70">Quick templates</div>
              </div>
            </Button>
          </div>

          <Card className="p-6 card-gradient">
            {creationMode === 'image' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Upload Your Photo</h2>
                  <p className="text-muted-foreground">AI will extract your facial features and create a 3D avatar</p>
                </div>
                <ImageToAvatarConverter onConfigGenerated={(config) => {
                  setAvatarConfig({ ...avatarConfig, ...config });
                  setCreationMode('manual');
                  toast.success('Avatar generated! Customize further.');
                }} />
              </div>
            )}
            
            {creationMode === 'text' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Describe Your Avatar
                  </h2>
                  <p className="text-muted-foreground">AI will generate your avatar based on your description</p>
                </div>
                
                <div className="space-y-4 max-w-2xl mx-auto">
                  <Textarea 
                    placeholder="Example: Athletic Indian male with short curly hair wearing a formal suit, confident expression..."
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    className="min-h-32 text-lg"
                  />
                  
                  <Button 
                    onClick={handleTextGeneration}
                    disabled={generatingFromText}
                    size="lg"
                    className="w-full"
                  >
                    {generatingFromText ? (
                      <>
                        <Zap className="w-5 h-5 mr-2 animate-pulse" />
                        Generating Avatar...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Avatar
                      </>
                    )}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      💡 <strong>Tip:</strong> Mention gender, ethnicity, build, hair, clothing
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      🎯 <strong>Example:</strong> "Female doctor with glasses and lab coat"
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {creationMode === 'preset' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
                  <p className="text-muted-foreground">Start with a ready-made avatar and customize it</p>
                </div>
                <ReadyMadeAvatarGallery onAvatarSelected={(config) => {
                  setAvatarConfig({ ...avatarConfig, ...config });
                  setCreationMode('manual');
                  toast.success('Preset loaded! Customize further.');
                }} />
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Manual Editor View
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                🎨 Avatar Studio
              </h1>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Realistic 3D Creation
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
              <div className="relative group">
                <Button variant="outline" size="sm" onClick={() => handleExport()}>
                  <Download className="w-4 h-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </Button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-popover border rounded-md shadow-lg p-2 z-50 min-w-[120px]">
                  <div className="text-xs font-medium mb-2 text-muted-foreground">Format:</div>
                  {['json', 'glb', 'fbx', 'gltf', 'gif'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExportFormat(fmt as any);
                      }}
                      className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-accent ${exportFormat === fmt ? 'bg-accent' : ''}`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
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
          <div className="col-span-3 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
            <Card className="card-gradient p-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Body & Anatomy</h3>
              </div>
              <BodyAnatomyPanel config={avatarConfig} onChange={handleConfigChange} />
            </Card>
          </div>

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
                <Environment preset="studio" />
                <ContactShadows position={[0, -2.5, 0]} scale={8} blur={3} far={3} />
              </Canvas>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 bg-background/90 backdrop-blur-sm p-3 rounded-lg border">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (!canUploadAvatar) {
                        toast.error('Avatar upload requires Creator plan or higher');
                        navigate('/pricing');
                        return;
                      }
                      document.getElementById('avatar-file-upload')?.click();
                    }}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                    {!canUploadAvatar && <Lock className="w-3 h-3 ml-1" />}
                  </Button>
                  {!canUploadAvatar && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      Creator+
                    </Badge>
                  )}
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif,.glb,.fbx,.gltf,.json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport()}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>

              {(avatarConfig.model_url || avatarConfig.thumbnail_url) && (
                <div className="absolute top-4 right-4 p-2 bg-green-500/90 backdrop-blur-sm text-white rounded-lg text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Custom avatar active
                </div>
              )}
            </Card>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreationMode('image')}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                From Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreationMode('text')}
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
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

          <div className="col-span-3 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pl-2">
            <Tabs defaultValue="face" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="face"><Eye className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="hair"><Palette className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="skin"><User className="w-4 h-4" /></TabsTrigger>
              </TabsList>
              
              <TabsContent value="face" className="space-y-4">
                <Card className="card-gradient p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Facial Features</h3>
                  </div>
                  <FacialFeaturesPanel config={avatarConfig} onChange={handleConfigChange} />
                </Card>
              </TabsContent>
              
              <TabsContent value="hair" className="space-y-4">
                <Card className="card-gradient p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Hair Customization</h3>
                  </div>
                  <HairCustomizationPanel config={avatarConfig} onChange={handleConfigChange} />
                </Card>
              </TabsContent>
              
              <TabsContent value="skin" className="space-y-4">
                <Card className="card-gradient p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Skin & Ethnicity</h3>
                  </div>
                  <SkinEthnicityControls config={avatarConfig} onChange={handleConfigChange} />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <Card className="card-gradient p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shirt className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Clothing & Accessories</h3>
            </div>
            <ClothingStylePanel config={avatarConfig} onChange={handleConfigChange} />
          </Card>

          <Card className="card-gradient p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Poses & Expressions</h3>
            </div>
            <PoseExpressionPanel config={avatarConfig} onChange={handleConfigChange} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;
