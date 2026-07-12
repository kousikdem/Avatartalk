import React, { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { AvatarPreset } from '@/hooks/useAvatarStudio';

type ModalFilter = 'all' | 'male' | 'female' | 'professional' | 'casual';

interface CustomizeAvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: AvatarPreset[];
  quota: { remaining: number; monthly_limit: number; used_this_month: number; plan: string } | null;
  onFaceSwap: (file: File, presetId: string) => Promise<{ success: boolean; image_url?: string; error?: string }>;
  onSetAsAvatar: (imageUrl: string) => void;
}

const CustomizeAvatarModal: React.FC<CustomizeAvatarModalProps> = ({
  open,
  onOpenChange,
  presets,
  quota,
  onFaceSwap,
  onSetAsAvatar,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [face, setFace] = useState<File | null>(null);
  const [faceUrl, setFaceUrl] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ModalFilter>('all');
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');

  const filteredPresets = useMemo(() => {
    if (filter === 'all') return presets;
    if (filter === 'male' || filter === 'female') return presets.filter(p => p.gender === filter);
    return presets.filter(p => p.category === filter);
  }, [presets, filter]);

  const reset = () => {
    setFace(null);
    setFaceUrl('');
    setSelectedPresetId(null);
    setGenerating(false);
    setResultUrl('');
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      toast.error('Please upload an image file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setFace(f);
    setFaceUrl(URL.createObjectURL(f));
    setResultUrl('');
  };

  const handleGenerate = async () => {
    if (!face || !selectedPresetId) {
      toast.error('Upload your face and pick a style');
      return;
    }
    if (quota && quota.remaining <= 0) {
      toast.error(`Monthly quota reached (${quota.used_this_month}/${quota.monthly_limit}). Upgrade plan.`);
      return;
    }
    setGenerating(true);
    const res = await onFaceSwap(face, selectedPresetId);
    setGenerating(false);
    if (res.success && res.image_url) {
      setResultUrl(res.image_url);
      toast.success('Avatar generated!');
    } else {
      toast.error(res.error || 'Generation failed');
    }
  };

  const handleSet = () => {
    if (resultUrl) {
      onSetAsAvatar(resultUrl);
      toast.success('Avatar applied — click "Save in Profile" to publish');
      onOpenChange(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-violet-600" />
            Customize Your Avatar
          </DialogTitle>
          <DialogDescription>
            Upload a clear front-facing photo of your face, then choose a style. Our AI will create a 3D photorealistic avatar with your face on the selected style.
          </DialogDescription>
        </DialogHeader>

        {quota && (
          <div className="flex items-center justify-between rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-sm">
            <span className="text-violet-900">
              <span className="font-semibold capitalize">{quota.plan}</span> plan
            </span>
            <span className="text-violet-700">
              {quota.used_this_month} / {quota.monthly_limit} custom avatars used this month
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: face upload + result preview */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Step 1 — Upload Your Face</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
              {faceUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-violet-300 aspect-square bg-gray-50">
                  <img src={faceUrl} alt="Your face" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setFace(null); setFaceUrl(''); setResultUrl(''); }}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1.5 shadow hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-square rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 hover:bg-violet-100 transition flex flex-col items-center justify-center gap-2 text-violet-700"
                >
                  <Upload className="w-10 h-10" />
                  <span className="font-semibold">Click to upload</span>
                  <span className="text-xs text-violet-500">JPG / PNG · max 10MB</span>
                </button>
              )}
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>For best results: use a clear, well-lit, front-facing photo with no sunglasses or face covering.</span>
            </div>
          </div>

          {/* RIGHT: preset picker + generate */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">Step 2 — Pick a Style ({presets.length} available)</label>
            {/* Filters */}
            <div className="flex flex-wrap gap-1.5">
              {(['all','male','female','professional','casual'] as ModalFilter[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition ${
                    filter === c ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredPresets.length === 0 && (
                <div className="col-span-3 text-center text-gray-400 text-sm py-8">No styles in this filter</div>
              )}
              {filteredPresets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPresetId(p.id)}
                  title={p.label}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                    selectedPresetId === p.id ? 'border-violet-600 ring-2 ring-violet-200' : 'border-transparent hover:border-violet-300'
                  }`}
                >
                  <img src={p.image_url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                  {selectedPresetId === p.id && (
                    <div className="absolute top-1 right-1 bg-violet-600 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!face || !selectedPresetId || generating || (quota?.remaining ?? 1) <= 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating (~20s)…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Avatar</>
              )}
            </Button>

            {resultUrl && (
              <div className="space-y-3 pt-2 border-t">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Result</Badge>
                <div className="rounded-2xl overflow-hidden border-2 border-emerald-300 bg-gray-50">
                  <img src={resultUrl} alt="Your AI avatar" className="w-full" />
                </div>
                <Button onClick={handleSet} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Check className="w-4 h-4 mr-2" /> Use This Avatar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeAvatarModal;
