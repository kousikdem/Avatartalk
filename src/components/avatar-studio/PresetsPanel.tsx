import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, Briefcase, Dumbbell, Stethoscope, GraduationCap, 
  Palette, Music, Code, Plane, ChefHat, Upload, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PresetsPanelProps {
  config: any;
  onChange: (category: string, key: string, value: any) => void;
}

const avatarPresets = [
  {
    id: 'business-man',
    name: 'Business Man',
    icon: Briefcase,
    category: 'Professional',
    config: {
      gender: 'male',
      ageCategory: 'adult',
      ethnicity: 'caucasian',
      hairStyle: 'short',
      clothingTop: 'suit-jacket',
      clothingBottom: 'dress-pants',
      shoes: 'dress-shoes',
      currentExpression: 'confident',
      currentPose: 'crossed-arms'
    }
  },
  {
    id: 'business-woman',
    name: 'Business Woman',
    icon: Briefcase,
    category: 'Professional',
    config: {
      gender: 'female',
      ageCategory: 'adult',
      ethnicity: 'caucasian',
      hairStyle: 'long',
      clothingTop: 'blazer',
      clothingBottom: 'skirt',
      shoes: 'heels',
      currentExpression: 'confident',
      currentPose: 'hands-on-hips'
    }
  },
  {
    id: 'athlete',
    name: 'Athlete',
    icon: Dumbbell,
    category: 'Sports',
    config: {
      gender: 'male',
      ageCategory: 'adult',
      bodyType: 'athletic',
      muscle: 80,
      fat: 10,
      clothingTop: 'tank-top',
      clothingBottom: 'joggers',
      shoes: 'running-shoes',
      currentPose: 'standing'
    }
  },
  {
    id: 'doctor',
    name: 'Doctor',
    icon: Stethoscope,
    category: 'Professional',
    config: {
      gender: 'female',
      ageCategory: 'adult',
      clothingTop: 'shirt',
      clothingBottom: 'dress-pants',
      shoes: 'dress-shoes',
      accessories: ['glasses-round'],
      currentExpression: 'serious'
    }
  },
  {
    id: 'student',
    name: 'Student',
    icon: GraduationCap,
    category: 'Casual',
    config: {
      gender: 'male',
      ageCategory: 'teen',
      clothingTop: 'hoodie',
      clothingBottom: 'jeans',
      shoes: 'sneakers',
      accessories: ['backpack'],
      currentExpression: 'happy'
    }
  },
  {
    id: 'artist',
    name: 'Artist',
    icon: Palette,
    category: 'Creative',
    config: {
      gender: 'female',
      ageCategory: 'adult',
      hairStyle: 'curly',
      clothingTop: 'blouse',
      clothingBottom: 'jeans',
      shoes: 'boots',
      currentExpression: 'thinking'
    }
  },
  {
    id: 'musician',
    name: 'Musician',
    icon: Music,
    category: 'Creative',
    config: {
      gender: 'male',
      ageCategory: 'adult',
      hairStyle: 'long',
      clothingTop: 'tshirt',
      clothingBottom: 'jeans',
      shoes: 'boots',
      accessories: ['headphones'],
      currentPose: 'standing'
    }
  },
  {
    id: 'engineer',
    name: 'Engineer',
    icon: Code,
    category: 'Professional',
    config: {
      gender: 'male',
      ageCategory: 'adult',
      clothingTop: 'polo',
      clothingBottom: 'chinos',
      shoes: 'loafers',
      accessories: ['glasses-square'],
      currentExpression: 'thinking'
    }
  },
  {
    id: 'pilot',
    name: 'Pilot',
    icon: Plane,
    category: 'Professional',
    config: {
      gender: 'male',
      ageCategory: 'adult',
      hairStyle: 'short',
      clothingTop: 'dress-shirt',
      clothingBottom: 'dress-pants',
      shoes: 'dress-shoes',
      accessories: ['sunglasses'],
      currentPose: 'crossed-arms'
    }
  },
  {
    id: 'chef',
    name: 'Chef',
    icon: ChefHat,
    category: 'Professional',
    config: {
      gender: 'female',
      ageCategory: 'adult',
      clothingTop: 'shirt',
      clothingBottom: 'dress-pants',
      shoes: 'dress-shoes',
      currentExpression: 'happy'
    }
  }
];

const PresetsPanel: React.FC<PresetsPanelProps> = ({ config, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Professional', 'Casual', 'Sports', 'Creative'];

  const filteredPresets = selectedCategory === 'All' 
    ? avatarPresets 
    : avatarPresets.filter(p => p.category === selectedCategory);

  const handlePresetSelect = (preset: typeof avatarPresets[0]) => {
    Object.entries(preset.config).forEach(([key, value]) => {
      onChange('', key, value);
    });
    toast.success(`${preset.name} preset applied!`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const supportedFormats = [
      '.glb', '.gltf', '.fbx', '.obj', '.blend', '.dae', '.stl', '.ply', '.3ds',
      'image/jpeg', 'image/png', 'image/jpg', 'image/webp'
    ];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isSupported = supportedFormats.includes(fileExtension) || supportedFormats.includes(file.type);
    
    if (!isSupported) {
      toast.error('Unsupported file format. Please upload a 3D model or image file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      onChange('', 'model_url', publicUrl);
      onChange('', 'thumbnail_url', publicUrl);
      
      toast.success('Avatar uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Avatar */}
      <Card className="p-4 border-2 border-dashed hover:border-primary/50 transition-colors">
        <Label htmlFor="avatar-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Upload Avatar</p>
              <p className="text-xs text-muted-foreground mt-1">
                Support: GLB, GLTF, FBX, OBJ, Blend, DAE, STL, PLY, 3DS, Images
              </p>
            </div>
            {uploading && <p className="text-xs text-primary">Uploading...</p>}
          </div>
        </Label>
        <Input
          id="avatar-upload"
          type="file"
          className="hidden"
          accept=".glb,.gltf,.fbx,.obj,.blend,.dae,.stl,.ply,.3ds,image/*"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </Card>

      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Ready-Made Avatars
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredPresets.map(preset => {
            const Icon = preset.icon;
            return (
              <Card
                key={preset.id}
                className="p-4 cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
                onClick={() => handlePresetSelect(preset)}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">{preset.category}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PresetsPanel;
