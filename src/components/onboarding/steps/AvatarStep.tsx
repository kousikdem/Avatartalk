import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Camera, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCustomAvatarUpload } from '@/hooks/useCustomAvatarUpload';
import { Progress } from '@/components/ui/progress';

interface AvatarStepProps {
  onComplete: () => void;
}

const AvatarStep: React.FC<AvatarStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('3d');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const { hasFeature } = usePlanFeatures();
  const canUploadAvatar = hasFeature('avatar_upload_enabled');
  const { uploading, progress: uploadProgress, uploadCustomAvatar } = useCustomAvatarUpload();
  const [saved, setSaved] = useState(false);

  // 3D customizer state
  const [gender, setGender] = useState('male');
  const [skinTone, setSkinTone] = useState('#F5D0A9');
  const [hairStyle, setHairStyle] = useState('short');
  const [hairColor, setHairColor] = useState('#4A3728');
  const [eyeColor, setEyeColor] = useState('#6B8E23');

  const skinTones = ['#F5D0A9', '#D2A679', '#C68642', '#8D5524', '#5C3317', '#FFF5E1'];
  const hairColors = ['#4A3728', '#2C1B0E', '#D4A76A', '#B22222', '#F0E68C', '#808080'];
  const eyeColors = ['#6B8E23', '#4169E1', '#8B4513', '#2F4F4F', '#800080'];

  const handleImageUpdate = async (url: string) => {
    setProfilePicUrl(url);
    if (user) {
      await supabase.from('profiles').update({ profile_pic_url: url }).eq('id', user.id);
    }
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadCustomAvatar(file);
  };

  const handleSave3DAvatar = async () => {
    if (!user) return;
    try {
      await supabase.from('avatar_configurations').upsert({
        user_id: user.id,
        gender,
        skin_tone: skinTone,
        hair_style: hairStyle,
        hair_color: hairColor,
        eye_color: eyeColor,
        is_active: true,
        avatar_name: 'Quick Setup Avatar',
      }, { onConflict: 'user_id' });
      setSaved(true);
      toast({ title: 'Avatar saved!' });
    } catch {
      toast({ title: 'Error saving avatar', variant: 'destructive' });
    }
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="3d" className="text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              3D Avatar
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm relative" disabled={!canUploadAvatar}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload 3D
              {!canUploadAvatar && (
                <span className="absolute -top-1 -right-1">
                  <PlanBadge planKey="creator" size="sm" showIcon={false} />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="photo" className="text-xs sm:text-sm">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Photo
            </TabsTrigger>
          </TabsList>

          {/* 3D Avatar Builder - Main Tab */}
          <TabsContent value="3d" className="mt-4 space-y-4">
            {/* Gender Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Gender</label>
              <div className="flex gap-2">
                {['male', 'female'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      gender === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {g === 'male' ? '👨 Male' : '👩 Female'}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Skin Tone</label>
              <div className="flex gap-2">
                {skinTones.map(tone => (
                  <button
                    key={tone}
                    onClick={() => setSkinTone(tone)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      skinTone === tone ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: tone }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Hair Style</label>
              <div className="flex gap-2 flex-wrap">
                {['short', 'medium', 'long', 'curly', 'buzz', 'bald'].map(style => (
                  <button
                    key={style}
                    onClick={() => setHairStyle(style)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                      hairStyle === style ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Hair Color</label>
              <div className="flex gap-2">
                {hairColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setHairColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      hairColor === color ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Eye Color */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Eye Color</label>
              <div className="flex gap-2">
                {eyeColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setEyeColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      eyeColor === color ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 text-center">
              <p className="text-xs text-muted-foreground">
                Full 3D customization available in the Avatar Studio dashboard
              </p>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
              onClick={handleSave3DAvatar}
              disabled={saved}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Avatar Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Avatar
                </>
              )}
            </Button>

            {saved && (
              <Button
                size="lg"
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={onComplete}
              >
                Continue to Next Step →
              </Button>
            )}
          </TabsContent>

          {/* Upload 3D Model Tab */}
          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Upload 3D Avatar Model</p>
              <p className="text-xs text-muted-foreground mt-1">GLB, GLTF, FBX, OBJ files supported</p>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="mt-3" disabled={uploading} asChild>
                  <span>
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".glb,.gltf,.fbx,.obj"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{uploadProgress}% uploaded</p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
              onClick={onComplete}
            >
              Continue to Next Step →
            </Button>
          </TabsContent>

          {/* Photo Upload Tab */}
          <TabsContent value="photo" className="mt-4 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <ProfilePictureUpload
                currentImageUrl={profilePicUrl}
                onImageUpdate={handleImageUpdate}
                displayName="Avatar"
              />
              <p className="text-xs text-muted-foreground text-center">
                Upload a photo to use as your profile avatar
              </p>
            </div>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
              onClick={onComplete}
            >
              Continue to Next Step →
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvatarStep;
