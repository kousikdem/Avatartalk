import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles, Home, RotateCcw, Download, Save, Upload, Lock,
  Maximize, ZoomIn, ZoomOut, Undo2, Redo2,
  User as UserIcon, Smile, Shirt, Watch, Image as ImageIcon, Settings2,
  ChevronRight, Check, Pencil, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/context/auth';
import { useAvatarStudio, type AvatarPreset } from '@/hooks/useAvatarStudio';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';
import { supabase } from '@/integrations/supabase/client';
import CustomizeAvatarModal from '@/components/avatar-studio/CustomizeAvatarModal';

type CategoryFilter = 'all' | 'male' | 'female' | 'professional' | 'casual';

const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#f3f4f6"/><stop offset="100%" stop-color="#e5e7eb"/>
      </linearGradient></defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <circle cx="200" cy="160" r="60" fill="#cbd5e1"/>
      <ellipse cx="200" cy="320" rx="110" ry="80" fill="#cbd5e1"/>
    </svg>`
  );

const NewAvatarStudio: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { presets, presetsLoading, quota, faceSwap, setProfileAvatar, uploadAvatar } = useAvatarStudio();
  const { effectivePlanKey } = useUserPlatformSubscription();
  const { hasFeature } = usePlanFeatures();
  const planKey = (effectivePlanKey || 'free').toLowerCase();
  const isFree = planKey === 'free';

  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Username for share link
  const [username, setUsername] = useState('');
  React.useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('username,avatar_url,profile_pic_url').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data?.username) setUsername(data.username);
      if (!currentAvatarUrl && (data?.avatar_url || data?.profile_pic_url)) {
        setCurrentAvatarUrl(data.avatar_url || data.profile_pic_url || '');
      }
    });
  }, [user?.id]);

  const filteredPresets = useMemo(() => {
    if (filter === 'all') return presets;
    if (filter === 'male' || filter === 'female') return presets.filter(p => p.gender === filter);
    return presets.filter(p => p.category === filter);
  }, [presets, filter]);

  const handleSelectPreset = (p: AvatarPreset) => {
    setSelectedPresetId(p.id);
    setCurrentAvatarUrl(p.image_url);
  };

  const handleUpload = async (file: File) => {
    if (isFree) {
      toast.error('Upload requires Creator plan or higher');
      return;
    }
    if (!/^image\//.test(file.type)) { toast.error('Please upload an image'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setUploading(true);
    const res = await uploadAvatar(file);
    setUploading(false);
    if (res.success && res.image_url) {
      setCurrentAvatarUrl(res.image_url);
      setSelectedPresetId(null);
      toast.success('Image uploaded — click "Save in Profile" to publish');
    } else {
      toast.error(res.error || 'Upload failed');
    }
  };

  const handleSaveProfile = async () => {
    if (!currentAvatarUrl) { toast.error('Pick or generate an avatar first'); return; }
    if (!user) { toast.error('Sign in to save'); return; }
    setSavingProfile(true);
    const res = await setProfileAvatar(currentAvatarUrl);
    setSavingProfile(false);
    if (res.success) {
      toast.success('Avatar saved to your profile! It will appear publicly now.');
    } else {
      toast.error(res.error || 'Save failed');
    }
  };

  const handleReset = () => {
    setSelectedPresetId(null);
    setCurrentAvatarUrl('');
    toast.info('Reset');
  };

  const handleExportJSON = () => {
    const data = {
      selected_preset_id: selectedPresetId,
      avatar_url: currentAvatarUrl,
      plan: planKey,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'avatar-config.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top share/save bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Link2 className="w-4 h-4" />
            <span>Share Smart Link-In-Bio</span>
            {username && (
              <a
                href={`/${username}`}
                className="text-violet-600 font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                avatartalk.co/{username}
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={savingProfile || !currentAvatarUrl}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Avatar Studio
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create your realistic avatar with AI. Choose a preset or upload your own.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings/dashboard')}>
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={savingProfile || !currentAvatarUrl}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" /> {savingProfile ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT — Customize accordion + upload */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Customize Avatar</h3>
              <Accordion type="single" collapsible className="w-full">
                {[
                  { id: 'body', label: 'Body & Anatomy', icon: UserIcon },
                  { id: 'face', label: 'Facial Features', icon: Smile },
                  { id: 'cloth', label: 'Clothing & Style', icon: Shirt },
                  { id: 'acc', label: 'Accessories', icon: Watch },
                  { id: 'bg', label: 'Background', icon: ImageIcon },
                  { id: 'adv', label: 'Advanced Options', icon: Settings2 },
                ].map(({ id, label, icon: Icon }) => (
                  <AccordionItem key={id} value={id} className="border-b border-gray-100 last:border-0">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                      <span className="flex items-center gap-2.5 text-gray-700">
                        <Icon className="w-4 h-4 text-violet-600" /> {label}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-500 pl-7">
                      To fine-tune these traits, click <span className="font-semibold text-violet-600">Customize Avatar</span> — our AI applies your face to any selected style.
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Upload Your Avatar */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-violet-700">Upload Your Avatar</h3>
                {isFree && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] ml-auto">
                    <Lock className="w-3 h-3 mr-1" /> Creator+
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">Upload a front-facing photo. JPG, PNG up to 10MB.</p>
              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
              <button
                type="button"
                onClick={() => isFree ? toast.error('Upgrade to Creator plan to upload your photo') : uploadRef.current?.click()}
                disabled={uploading}
                className={`w-full aspect-[3/2] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition ${
                  isFree
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-violet-300 bg-violet-50 hover:bg-violet-100 text-violet-700 cursor-pointer'
                }`}
              >
                {uploading ? (
                  <span className="text-sm">Uploading…</span>
                ) : isFree ? (
                  <>
                    <Lock className="w-7 h-7" />
                    <span className="text-sm font-semibold">Upgrade to unlock</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-7 h-7" />
                    <span className="text-sm font-semibold">Upload Image</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* CENTER — Main avatar preview */}
          <section className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sticky top-4">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50 aspect-[3/4] flex items-center justify-center">
                {/* Realistic 3D badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-white/90 backdrop-blur text-gray-700 border-gray-200 shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1 text-violet-600" /> Realistic 3D
                  </Badge>
                </div>

                <img
                  src={currentAvatarUrl || PLACEHOLDER_AVATAR}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />

                {/* Toolbar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full shadow-lg px-2 py-1 text-xs">
                  <ToolbarBtn icon={Undo2} label="Undo" onClick={() => toast.info('Undo')} />
                  <ToolbarBtn icon={Redo2} label="Redo" onClick={() => toast.info('Redo')} disabled />
                  <span className="w-px h-4 bg-gray-200" />
                  <ToolbarBtn icon={ZoomIn} label="Zoom In" onClick={() => toast.info('Zoom in')} />
                  <ToolbarBtn icon={ZoomOut} label="Zoom Out" onClick={() => toast.info('Zoom out')} />
                  <ToolbarBtn icon={Maximize} label="" onClick={() => toast.info('Fullscreen')} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => isFree ? toast.error('Customize Avatar requires Creator plan') : setShowCustomizeModal(true)}
                  className="border-gray-200"
                >
                  {isFree ? <Lock className="w-4 h-4 mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
                  Customize Avatar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !currentAvatarUrl}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  {savingProfile ? 'Saving…' : 'Save in Profile'}
                </Button>
              </div>

              {/* Quota / plan info */}
              {quota && !isFree && (
                <div className="mt-3 text-xs text-center text-gray-500">
                  <span className="capitalize font-medium text-gray-700">{quota.plan}</span> plan ·
                  {' '}{quota.used_this_month}/{quota.monthly_limit} custom avatars used this month
                </div>
              )}
              {isFree && (
                <div className="mt-3 text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Upload & Customize unlock on <button onClick={() => navigate('/pricing')} className="font-semibold underline">Creator plan</button> (2/mo), Pro (5/mo), Business (20/mo).
                </div>
              )}
            </div>
          </section>

          {/* RIGHT — Choose a realistic avatar */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Choose a Realistic Avatar</h3>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(['all', 'male', 'female', 'professional', 'casual'] as CategoryFilter[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      filter === c ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
              {/* Grid */}
              {presetsLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : filteredPresets.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10">
                  No avatars yet. Apply the SQL migration & run preset seeding.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1">
                  {filteredPresets.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      title={p.label}
                      className={`relative aspect-square rounded-xl overflow-hidden transition border-2 ${
                        selectedPresetId === p.id
                          ? 'border-violet-600 ring-2 ring-violet-200'
                          : 'border-transparent hover:border-violet-300'
                      }`}
                    >
                      <img src={p.image_url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                      {selectedPresetId === p.id && (
                        <div className="absolute top-1.5 right-1.5 bg-violet-600 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <CustomizeAvatarModal
        open={showCustomizeModal}
        onOpenChange={setShowCustomizeModal}
        presets={presets}
        quota={quota}
        onFaceSwap={faceSwap}
        onSetAsAvatar={(url) => { setCurrentAvatarUrl(url); setSelectedPresetId(null); }}
      />
    </div>
  );
};

const ToolbarBtn: React.FC<{ icon: any; label: string; onClick: () => void; disabled?: boolean }> = ({
  icon: Icon, label, onClick, disabled
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40 text-gray-700`}
  >
    <Icon className="w-3.5 h-3.5" /> {label && <span>{label}</span>}
  </button>
);

export default NewAvatarStudio;
