import React, { useState, useEffect, Suspense } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar3DPreview from '@/components/Avatar3DPreview';

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
  const [headSize, setHeadSize] = useState(50);
  const [noseSize, setNoseSize] = useState(50);
  const [mouthWidth, setMouthWidth] = useState(50);

  const skinTones = ['#F5D0A9', '#D2A679', '#C68642', '#8D5524', '#5C3317', '#FFF5E1'];
  const hairColors = ['#4A3728', '#2C1B0E', '#D4A76A', '#B22222', '#F0E68C', '#808080', '#1A1A1A', '#FFFFFF'];
  const eyeColors = ['#6B8E23', '#4169E1', '#8B4513', '#2F4F4F', '#800080', '#228B22'];

  // Load existing avatar config
  useEffect(() => {
    if (!user) return;
    supabase.from('avatar_configurations').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle().then(({ data }) => {
      if (data) {
        setGender(data.gender || 'male');
        setSkinTone(data.skin_tone || '#F5D0A9');
        setHairStyle(data.hair_style || 'short');
        setHairColor(data.hair_color || '#4A3728');
        setEyeColor(data.eye_color || '#6B8E23');
        setFaceWidth(data.face_width || 50);
        setHeadSize(data.head_size || 50);
        setNoseSize(data.nose_size || 50);
        setMouthWidth(data.mouth_width || 50);
        setSaved(true);
      }
    });
  }, [user]);

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
        head_size: headSize,
        nose_size: noseSize,
        mouth_width: mouthWidth,
        is_active: true,
        avatar_name: 'Quick Setup Avatar',
      }, { onConflict: 'user_id' });
      setSaved(true);
      toast({ title: 'Avatar saved!' });
    } catch {
      toast({ title: 'Error saving avatar', variant: 'destructive' });
    }
  };

  // Build config for Avatar3DPreview
  const avatarConfig = {
    body: {
      gender,
      age: 25,
      ethnicity: 'default',
      height: 170,
      weight: 65 + (headSize - 50) * 0.3,
      muscle: 50 + (faceWidth - 50) * 0.2,
      fat: 30,
    },
    face: {
      eyeColor,
      skinTone,
      hairStyle,
      hairColor,
      faceShape: 'oval',
      eyeShape: 'almond',
      noseShape: 'straight',
      lipShape: 'full',
    },
    clothing: {
      outfit: 'casual',
      accessories: [],
    },
    pose: 'standing',
    expression: 'neutral',
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-100">
            <TabsTrigger value="3d" className="text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Build 3D Avatar
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm relative" disabled={!canUploadAvatar}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Avatar
              {!canUploadAvatar && <span className="absolute -top-1 -right-1"><PlanBadge planKey="creator" size="sm" showIcon={false} /></span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="3d" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Controls */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gender</label>
                  <div className="flex gap-2">
                    {['male', 'female'].map(g => (
                      <button key={g} onClick={() => setGender(g)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${gender === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}>
                        {g === 'male' ? '👨 Male' : '👩 Female'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Skin Tone</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {skinTones.map(tone => (
                      <button key={tone} onClick={() => setSkinTone(tone)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${skinTone === tone ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'}`}
                        style={{ backgroundColor: tone }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hair Style</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {['short', 'medium', 'long', 'curly', 'buzz', 'bald'].map(style => (
                      <button key={style} onClick={() => setHairStyle(style)}
                        className={`py-1 px-2.5 rounded-lg border text-xs font-medium transition-all ${hairStyle === style ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hair Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {hairColors.map(color => (
                      <button key={color} onClick={() => setHairColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${hairColor === color ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Eye Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {eyeColors.map(color => (
                      <button key={color} onClick={() => setEyeColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${eyeColor === color ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-200'}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Head Size</label>
                  <Slider value={[headSize]} onValueChange={([v]) => setHeadSize(v)} min={0} max={100} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Face Width</label>
                  <Slider value={[faceWidth]} onValueChange={([v]) => setFaceWidth(v)} min={0} max={100} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Nose Size</label>
                  <Slider value={[noseSize]} onValueChange={([v]) => setNoseSize(v)} min={0} max={100} step={1} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Mouth Width</label>
                  <Slider value={[mouthWidth]} onValueChange={([v]) => setMouthWidth(v)} min={0} max={100} step={1} className="w-full" />
                </div>
              </div>

              {/* Right: 3D Canvas Preview */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-full h-[320px] rounded-2xl overflow-hidden border-2 border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 shadow-inner">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 mx-auto text-blue-400 animate-pulse mb-2" />
                        <p className="text-xs text-muted-foreground">Loading 3D Preview...</p>
                      </div>
                    </div>
                  }>
                    <Canvas
                      camera={{ position: [0, 0.8, 4.5], fov: 45 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[5, 5, 5]} intensity={0.8} />
                      <directionalLight position={[-3, 3, -3]} intensity={0.3} />
                      <group position={[0, -0.8, 0]}>
                        <Avatar3DPreview config={avatarConfig} />
                      </group>
                      <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        minDistance={2.5}
                        maxDistance={7}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI / 1.3}
                        autoRotate
                        autoRotateSpeed={1.5}
                      />
                    </Canvas>
                  </Suspense>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Interactive 3D Preview — Drag to rotate</p>
                </div>
              </div>
            </div>

            <Button size="lg"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
              onClick={async () => { await handleSave3DAvatar(); onComplete(); }}>
              {saved ? <><Check className="w-4 h-4 mr-2" /> Avatar Saved — Continue</> : <><Save className="w-4 h-4 mr-2" /> Save Avatar & Continue</>}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Upload 3D Avatar Model</p>
              <p className="text-xs text-muted-foreground mt-1">GLB, GLTF, FBX, OBJ files supported</p>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="mt-3" disabled={uploading} asChild>
                  <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                </Button>
                <input type="file" accept=".glb,.gltf,.fbx,.obj" onChange={handleAvatarFileUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            {uploading && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{uploadProgress}% uploaded</p>
              </div>
            )}
            <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg" onClick={onComplete}>
              Save & Continue →
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvatarStep;
