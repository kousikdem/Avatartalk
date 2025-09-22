
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Ruler, Palette, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeAvatar } from '@/hooks/useRealtimeAvatar';
import { supabase } from '@/integrations/supabase/client';

interface AvatarCustomizerProps {
  config: any;
  onConfigChange: (category: string, key: string, value: any) => void;
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ config, onConfigChange }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const { updateAvatarConfig, saving } = useRealtimeAvatar();

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();
  }, []);

  const handleSaveAvatar = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please sign in to save avatar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Flatten the config structure for database storage
      const avatarData = {
        user_id: currentUser.id,
        avatar_name: config.name || 'My Avatar',
        gender: config.body?.gender || 'male',
        age_category: config.body?.age > 50 ? 'senior' : config.body?.age > 30 ? 'adult' : 'young',
        height: config.body?.height || 170,
        weight: config.body?.weight || 70,
        muscle_definition: config.body?.muscle || 50,
        body_fat: config.body?.fat || 20,
        skin_tone: config.face?.skinTone || '#F1C27D',
        hair_style: config.face?.hairStyle || 'short',
        hair_color: config.face?.hairColor || '#8B4513',
        eye_color: config.face?.eyeColor || 'brown',
        eye_shape: 'almond',
        nose_shape: 'straight',
        lip_shape: 'normal',
        ear_shape: 'normal',
        head_shape: 'oval',
        current_pose: 'standing',
        current_expression: 'neutral',
        is_active: true
      };

      await updateAvatarConfig(avatarData);

      // Link avatar to profile with generated thumbnail/preview
      const avatarPreviewUrl = generateAvatarPreview(avatarData);
      
      // Update profile with current avatar configuration
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarPreviewUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      toast({
        title: "Avatar Saved",
        description: "Your avatar has been saved and linked to all previews!",
      });
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Error",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Generate avatar preview URL from configuration
  const generateAvatarPreview = (avatarData: any) => {
    // Create a visual representation based on avatar configuration
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background (skin tone)
      ctx.fillStyle = avatarData.skin_tone;
      ctx.fillRect(0, 0, 100, 100);
      
      // Simple avatar representation
      ctx.beginPath();
      ctx.arc(50, 50, 40, 0, Math.PI * 2);
      ctx.fillStyle = avatarData.skin_tone;
      ctx.fill();
      
      // Hair color indication
      ctx.beginPath();
      ctx.arc(50, 30, 35, Math.PI, Math.PI * 2);
      ctx.fillStyle = avatarData.hair_color;
      ctx.fill();
      
      return canvas.toDataURL();
    }
    
    // Fallback to skin tone color
    return avatarData.skin_tone;
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Gender</Label>
            <Select 
              value={config.body.gender} 
              onValueChange={(value) => onConfigChange('body', 'gender', value)}
            >
              <SelectTrigger className="mt-1">
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
            <Label className="text-sm font-medium">Ethnicity</Label>
            <Select 
              value={config.body.ethnicity} 
              onValueChange={(value) => onConfigChange('body', 'ethnicity', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caucasian">Caucasian</SelectItem>
                <SelectItem value="african">African</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="hispanic">Hispanic</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Age: <span className="text-blue-600">{config.body.age}</span>
            </Label>
            <Slider
              value={[config.body.age]}
              onValueChange={([value]) => onConfigChange('body', 'age', value)}
              min={16}
              max={80}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Ruler className="w-4 h-4" />
            Physical Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Height: <span className="text-blue-600">{config.body.height}cm</span>
            </Label>
            <Slider
              value={[config.body.height]}
              onValueChange={([value]) => onConfigChange('body', 'height', value)}
              min={150}
              max={200}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Weight: <span className="text-blue-600">{config.body.weight}kg</span>
            </Label>
            <Slider
              value={[config.body.weight]}
              onValueChange={([value]) => onConfigChange('body', 'weight', value)}
              min={40}
              max={120}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Muscle: <span className="text-blue-600">{config.body.muscle}%</span>
            </Label>
            <Slider
              value={[config.body.muscle]}
              onValueChange={([value]) => onConfigChange('body', 'muscle', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Body Fat: <span className="text-blue-600">{config.body.fat}%</span>
            </Label>
            <Slider
              value={[config.body.fat]}
              onValueChange={([value]) => onConfigChange('body', 'fat', value)}
              min={5}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Skin Tone</Label>
            <div className="flex gap-2 mt-2">
              {[
                '#F5DEB3', '#DEB887', '#D2B48C', '#BC9A6A', 
                '#8B7355', '#654321', '#4A2C2A', '#2F1B14'
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    config.face.skinTone === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onConfigChange('face', 'skinTone', color)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Hair Style</Label>
            <Select 
              value={config.face.hairStyle} 
              onValueChange={(value) => onConfigChange('face', 'hairStyle', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="curly">Curly</SelectItem>
                <SelectItem value="bald">Bald</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Hair Color</Label>
            <div className="flex gap-2 mt-2">
              {[
                '#000000', '#8B4513', '#DAA520', '#FF4500', 
                '#DC143C', '#4B0082', '#008000', '#808080'
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    config.face.hairColor === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onConfigChange('face', 'hairColor', color)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Eye Color</Label>
            <Select 
              value={config.face.eyeColor} 
              onValueChange={(value) => onConfigChange('face', 'eyeColor', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="hazel">Hazel</SelectItem>
                <SelectItem value="gray">Gray</SelectItem>
                <SelectItem value="amber">Amber</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Avatar Button */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={handleSaveAvatar}
            disabled={saving || !currentUser}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Avatar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Avatar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarCustomizer;
