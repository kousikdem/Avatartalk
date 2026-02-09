import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Save, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
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
  const [faceWidth, setFaceWidth] = useState(50);

  const skinTones = ['#F5D0A9', '#D2A679', '#C68642', '#8D5524', '#5C3317', '#FFF5E1'];
  const hairColors = ['#4A3728', '#2C1B0E', '#D4A76A', '#B22222', '#F0E68C', '#808080', '#1A1A1A', '#FFFFFF'];
  const eyeColors = ['#6B8E23', '#4169E1', '#8B4513', '#2F4F4F', '#800080', '#228B22'];

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
        face_width: faceWidth,
        is_active: true,
        avatar_name: 'Quick Setup Avatar',
      }, { onConflict: 'user_id' });
      setSaved(true);
      toast({ title: 'Avatar saved!' });
    } catch {
      toast({ title: 'Error saving avatar', variant: 'destructive' });
    }
  };

  // Preview avatar visual
  const avatarPreviewStyle = {
    background: `radial-gradient(circle at 50% 40%, ${skinTone} 60%, ${skinTone}99 100%)`,
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-100">
            <TabsTrigger value="3d" className="text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Build 3D Avatar
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm relative" disabled={!canUploadAvatar}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Avatar
              {!canUploadAvatar && (
                <span className="absolute -top-1 -right-1">
                  <PlanBadge planKey="creator" size="sm" showIcon={false} />
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 3D Avatar Builder - Main Tab */}
          <TabsContent value="3d" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Controls */}
              <div className="space-y-3">
                {/* Gender */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gender</label>
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
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Skin Tone</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {skinTones.map(tone => (
                      <button
                        key={tone}
                        onClick={() => setSkinTone(tone)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          skinTone === tone ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Style */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hair Style</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {['short', 'medium', 'long', 'curly', 'buzz', 'bald'].map(style => (
                      <button
                        key={style}
                        onClick={() => setHairStyle(style)}
                        className={`py-1 px-2.5 rounded-lg border text-xs font-medium transition-all ${
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
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hair Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {hairColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setHairColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          hairColor === color ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Eye Color */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Eye Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {eyeColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setEyeColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          eyeColor === color ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  className="w-40 h-48 rounded-2xl shadow-xl border-2 border-slate-200 relative overflow-hidden"
                  style={avatarPreviewStyle}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {/* Simple avatar face preview */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Hair */}
                    {hairStyle !== 'bald' && (
                      <div
                        className="absolute top-2 left-1/2 -translate-x-1/2 rounded-t-full"
                        style={{
                          backgroundColor: hairColor,
                          width: hairStyle === 'long' ? '85%' : '75%',
                          height: hairStyle === 'long' ? '50%' : hairStyle === 'short' || hairStyle === 'buzz' ? '25%' : '35%',
                        }}
                      />
                    )}
                    {/* Eyes */}
                    <div className="flex gap-4 mt-8">
                      <div className="w-4 h-4 rounded-full bg-white shadow-inner flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: eyeColor }} />
                      </div>
                      <div className="w-4 h-4 rounded-full bg-white shadow-inner flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: eyeColor }} />
                      </div>
                    </div>
                    {/* Nose */}
                    <div className="w-1.5 h-2 bg-black/10 rounded-full mt-2" />
                    {/* Mouth */}
                    <div className="w-6 h-2 bg-pink-400/60 rounded-full mt-2" />
                  </div>
                  {/* Gender indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium bg-white/80 px-2 py-0.5 rounded-full">
                    {gender === 'male' ? '👨' : '👩'} {gender}
                  </div>
                </motion.div>
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Live Preview
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Full 3D Studio available in Dashboard
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
              onClick={async () => {
                await handleSave3DAvatar();
                onComplete();
              }}
            >
              {saved ? (
                <><Check className="w-4 h-4 mr-2" /> Avatar Saved — Continue</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Avatar & Continue</>
              )}
            </Button>
          </TabsContent>

          {/* Upload Avatar Tab */}
          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Upload 3D Avatar Model</p>
              <p className="text-xs text-muted-foreground mt-1">GLB, GLTF, FBX, OBJ files supported</p>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="mt-3" disabled={uploading} asChild>
                  <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
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
              Save & Continue →
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvatarStep;