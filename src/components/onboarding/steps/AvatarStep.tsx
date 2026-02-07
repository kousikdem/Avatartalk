import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, ArrowRight, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarStepProps {
  onComplete: () => void;
}

const AvatarStep: React.FC<AvatarStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const { hasFeature } = usePlanFeatures();
  const canUse3D = hasFeature('avatar_upload_enabled');

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
      toast({ title: 'Avatar saved!' });
      onComplete();
    } catch {
      toast({ title: 'Error saving avatar', variant: 'destructive' });
    }
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-100">
            <TabsTrigger value="upload" className="text-xs sm:text-sm">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Photo
            </TabsTrigger>
            <TabsTrigger value="3d" className="text-xs sm:text-sm relative" disabled={!canUse3D}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              3D Avatar
              {!canUse3D && (
                <span className="absolute -top-1 -right-1">
                  <PlanBadge planKey="creator" size="sm" showIcon={false} />
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4 space-y-4">
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
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </TabsContent>

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
            >
              Save Avatar & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvatarStep;
