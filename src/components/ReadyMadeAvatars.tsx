import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Briefcase, Stethoscope, GraduationCap, Palette, Shield, Flame, Upload, Camera } from 'lucide-react';
import { avatarPresets } from '@/data/avatarPresets';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';

interface ReadyMadeAvatarsProps {
  onAvatarSelected: (config: any) => void;
}

const professionPresets = [
  {
    id: 'doctor',
    name: 'Doctor',
    icon: <Stethoscope className="w-6 h-6" />,
    description: 'Medical professional',
    config: {
      clothingTop: 'lab coat',
      accessories: ['stethoscope', 'id badge'],
      currentExpression: 'professional',
      currentPose: 'confident'
    }
  },
  {
    id: 'businessman',
    name: 'Business Executive',
    icon: <Briefcase className="w-6 h-6" />,
    description: 'Corporate professional',
    config: {
      clothingTop: 'suit',
      clothingBottom: 'dress pants',
      shoes: 'formal',
      accessories: ['watch', 'tie'],
      currentExpression: 'confident',
      currentPose: 'professional'
    }
  },
  {
    id: 'teacher',
    name: 'Teacher',
    icon: <GraduationCap className="w-6 h-6" />,
    description: 'Educator',
    config: {
      clothingTop: 'casual shirt',
      accessories: ['glasses'],
      currentExpression: 'friendly',
      currentPose: 'teaching'
    }
  },
  {
    id: 'artist',
    name: 'Artist',
    icon: <Palette className="w-6 h-6" />,
    description: 'Creative professional',
    config: {
      clothingTop: 'casual',
      accessories: ['beret', 'paint'],
      currentExpression: 'creative',
      currentPose: 'expressive'
    }
  },
  {
    id: 'police',
    name: 'Police Officer',
    icon: <Shield className="w-6 h-6" />,
    description: 'Law enforcement',
    config: {
      clothingTop: 'uniform',
      accessories: ['badge', 'cap'],
      currentExpression: 'serious',
      currentPose: 'standing'
    }
  },
  {
    id: 'firefighter',
    name: 'Firefighter',
    icon: <Flame className="w-6 h-6" />,
    description: 'Emergency responder',
    config: {
      clothingTop: 'firefighter uniform',
      accessories: ['helmet'],
      currentExpression: 'determined',
      currentPose: 'ready'
    }
  }
];

const ReadyMadeAvatars: React.FC<ReadyMadeAvatarsProps> = ({ onAvatarSelected }) => {
  const [selectedCategory, setSelectedCategory] = useState<'male' | 'female' | 'profession' | 'upload'>('male');
  const [uploading, setUploading] = useState(false);
  const { saveConfiguration } = useAvatarConfigurations();

  const handlePresetSelect = (preset: any) => {
    onAvatarSelected(preset.config || preset);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to upload an avatar');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to profile-pictures bucket
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      // Create avatar configuration with uploaded image
      const avatarConfig = {
        avatarName: 'Uploaded Avatar',
        gender: 'male',
        age: 25,
        ethnicity: 'Custom',
        height: 170,
        weight: 70,
        muscle: 50,
        fat: 20,
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
        clothingTop: 'tshirt',
        clothingBottom: 'jeans',
        shoes: 'sneakers',
        accessories: [],
        currentPose: 'standing',
        currentExpression: 'neutral',
        thumbnailUrl: avatarUrl
      };

      // Save configuration to database
      await saveConfiguration(avatarConfig);

      // Update profile with new avatar
      await supabase
        .from('profiles')
        .update({ 
          profile_pic_url: avatarUrl,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      onAvatarSelected(avatarConfig);
      toast.success('Avatar uploaded and saved successfully!');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Ready-Made Avatar Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="male">Male Avatars</TabsTrigger>
            <TabsTrigger value="female">Female Avatars</TabsTrigger>
            <TabsTrigger value="profession">Professions</TabsTrigger>
            <TabsTrigger value="upload">Upload Avatar</TabsTrigger>
          </TabsList>

          <TabsContent value="male" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {avatarPresets
                .filter(p => p.gender === 'male')
                .map((preset) => (
                  <Card key={preset.id} className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="text-6xl">{preset.thumbnail}</div>
                        <div>
                          <h3 className="font-semibold">{preset.name}</h3>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="secondary" className="text-xs">
                            Age: {preset.config.age}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {preset.config.ethnicity}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full"
                          size="sm"
                        >
                          Use This Avatar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="female" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {avatarPresets
                .filter(p => p.gender === 'female')
                .map((preset) => (
                  <Card key={preset.id} className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="text-6xl">{preset.thumbnail}</div>
                        <div>
                          <h3 className="font-semibold">{preset.name}</h3>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="secondary" className="text-xs">
                            Age: {preset.config.age}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {preset.config.ethnicity}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full"
                          size="sm"
                        >
                          Use This Avatar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="profession" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Professional avatar templates with appropriate attire and accessories
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionPresets.map((prof) => (
                <Card key={prof.id} className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        {prof.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{prof.name}</h3>
                        <p className="text-sm text-muted-foreground">{prof.description}</p>
                      </div>
                      <Button
                        onClick={() => handlePresetSelect({
                          ...avatarPresets[0].config,
                          ...prof.config
                        })}
                        className="w-full"
                        size="sm"
                      >
                        Use This Style
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-6">
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary transition-colors">
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Upload Your Avatar</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Upload a custom 3D avatar or profile picture. Supported formats: Images (JPG, PNG, WebP) and 3D models (GLB, GLTF, FBX, OBJ, Blender, DAE, STL, PLY, 3DS)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*,.glb,.gltf,.fbx,.obj,.blend,.dae,.stl,.ply,.3ds"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button
                      asChild
                      size="lg"
                      disabled={uploading}
                      className="cursor-pointer"
                    >
                      <label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2">
                        {uploading ? (
                          <>
                            <Upload className="w-5 h-5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-5 h-5" />
                            Choose File to Upload
                          </>
                        )}
                      </label>
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Max file size: 10MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReadyMadeAvatars;
