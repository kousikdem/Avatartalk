import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Sparkles, Upload, Check, Lock, User as UserIcon, Pencil, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAvatarStudio, type AvatarPreset } from '@/hooks/useAvatarStudio';
import { useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';
import CustomizeAvatarModal from '@/components/avatar-studio/CustomizeAvatarModal';

interface AvatarStepProps {
  onComplete: () => void;
}

type FilterKey = 'all' | 'male' | 'female' | 'professional' | 'casual';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240'>
      <rect width='200' height='240' fill='#f3f4f6'/>
      <circle cx='100' cy='90' r='34' fill='#cbd5e1'/>
      <ellipse cx='100' cy='180' rx='60' ry='44' fill='#cbd5e1'/>
    </svg>`
  );

const AvatarStep: React.FC<AvatarStepProps> = ({ onComplete }) => {
  const { presets, presetsLoading, quota, faceSwap, setProfileAvatar, uploadAvatar } = useAvatarStudio();
  const { effectivePlanKey } = useUserPlatformSubscription();
  const isFree = (effectivePlanKey || 'free').toLowerCase() === 'free';

  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return presets;
    if (filter === 'male' || filter === 'female') return presets.filter(p => p.gender === filter);
    return presets.filter(p => p.category === filter);
  }, [presets, filter]);

  // Auto-select first preset once loaded
  useEffect(() => {
    if (!currentUrl && presets.length > 0) {
      setSelectedId(presets[0].id);
      setCurrentUrl(presets[0].image_url);
    }
  }, [presets, currentUrl]);

  const handleSelect = (p: AvatarPreset) => {
    setSelectedId(p.id);
    setCurrentUrl(p.image_url);
  };

  const handleUpload = async (file: File) => {
    if (isFree) { toast.error('Upload requires Creator plan or higher'); return; }
    if (!/^image\//.test(file.type)) { toast.error('Please upload an image'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setUploading(true);
    const res = await uploadAvatar(file);
    setUploading(false);
    if (res.success && res.image_url) {
      setCurrentUrl(res.image_url);
      setSelectedId(null);
      toast.success('Image uploaded');
    } else {
      toast.error(res.error || 'Upload failed');
    }
  };

  const handleSave = async () => {
    if (!currentUrl) { toast.error('Pick an avatar first'); return; }
    setSaving(true);
    const res = await setProfileAvatar(currentUrl);
    setSaving(false);
    if (res.success) {
      toast.success('Avatar saved!');
      onComplete();
    } else {
      toast.error(res.error || 'Save failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Step · Choose your avatar
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Pick or build your 3D avatar</h2>
        <p className="text-sm text-gray-500 mt-1">Choose a realistic preset, upload your photo, or use AI to customize.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Preview */}
        <div className="md:col-span-2">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50 aspect-[3/4]">
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-white/90 backdrop-blur text-gray-700 border-gray-200 shadow-sm">
                <Sparkles className="w-3 h-3 mr-1 text-violet-600" /> Realistic 3D
              </Badge>
            </div>
            <img src={currentUrl || PLACEHOLDER} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => isFree ? toast.error('Customize requires Creator plan') : setShowModal(true)}
            >
              {isFree ? <Lock className="w-4 h-4 mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
              Customize
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving || !currentUrl}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserIcon className="w-4 h-4 mr-2" />}
              Save & Continue
            </Button>
          </div>
        </div>

        {/* Presets + Upload */}
        <div className="md:col-span-3 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {(['all','male','female','professional','casual'] as FilterKey[]).map(c => (
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

          {/* Preset grid */}
          {presetsLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center text-sm text-amber-800">
              No preset avatars yet — admin must seed them.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {filtered.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                    selectedId === p.id ? 'border-violet-600 ring-2 ring-violet-200' : 'border-transparent hover:border-violet-300'
                  }`}
                >
                  <img src={p.image_url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                  {selectedId === p.id && (
                    <div className="absolute top-1 right-1 bg-violet-600 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Upload card */}
          <div className="rounded-2xl border border-gray-100 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-gray-700">Upload your photo</span>
              {isFree && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] ml-auto">
                  <Lock className="w-3 h-3 mr-1" /> Creator+
                </Badge>
              )}
            </div>
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            <button
              type="button"
              onClick={() => isFree ? toast.error('Upload requires Creator plan') : uploadRef.current?.click()}
              disabled={uploading}
              className={`w-full rounded-xl border-2 border-dashed py-4 flex items-center justify-center gap-2 transition ${
                isFree
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-violet-300 bg-violet-50 hover:bg-violet-100 text-violet-700'
              }`}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFree ? <Lock className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
              <span className="text-sm font-medium">{uploading ? 'Uploading…' : (isFree ? 'Upgrade to unlock' : 'Upload Image')}</span>
            </button>
          </div>

          {quota && !isFree && (
            <p className="text-xs text-center text-gray-500">
              <span className="capitalize">{quota.plan}</span> plan — {quota.used_this_month}/{quota.monthly_limit} custom avatars this month
            </p>
          )}
        </div>
      </div>

      <CustomizeAvatarModal
        open={showModal}
        onOpenChange={setShowModal}
        presets={presets}
        quota={quota}
        onFaceSwap={faceSwap}
        onSetAsAvatar={(url) => { setCurrentUrl(url); setSelectedId(null); }}
      />
    </div>
  );
};

export default AvatarStep;
