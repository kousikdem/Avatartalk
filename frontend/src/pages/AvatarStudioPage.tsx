import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus, Home, User, ScanFace, Scissors, Shirt, Gem, Image as ImageIcon, SunMedium, SlidersHorizontal,
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Minimize2, Expand, Pencil, UserCheck, Upload, Lock, Loader2, RotateCw, Sparkles,
} from 'lucide-react';
import AvatarStage, { AvatarStageHandle } from '@/components/avatar3d/AvatarStage';
import AvatarEditorPanel, { EditorSection } from '@/components/avatar3d/AvatarEditorPanel';
import AvatarPresetGrid from '@/components/avatar3d/AvatarPresetGrid';
import { useAvatarEditor } from '@/hooks/useAvatarEditor';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { DEFAULT_CHARACTER, DEFAULT_PHOTO } from '@/lib/avatar/avatarConfig';

const SECTIONS: { key: EditorSection | 'overview'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: Home },
  { key: 'body', label: 'Body & Anatomy', icon: User },
  { key: 'face', label: 'Facial Features', icon: ScanFace },
  { key: 'hair', label: 'Hair', icon: Scissors },
  { key: 'clothing', label: 'Clothing & Style', icon: Shirt },
  { key: 'accessories', label: 'Accessories', icon: Gem },
  { key: 'background', label: 'Background', icon: ImageIcon },
  { key: 'photo', label: 'Colour & Light', icon: SunMedium },
  { key: 'advanced', label: 'Advanced Options', icon: SlidersHorizontal },
];

const ANGLES = [0, -35, -70, 35, 180];

const AvatarStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const editor = useAvatarEditor();
  const { config, update } = editor;
  const { hasFeature, loading: planLoading } = usePlanFeatures();
  const canPro = !planLoading && hasFeature('avatar_upload_enabled');
  const stage = useRef<AvatarStageHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<EditorSection | 'overview'>('overview');
  const [zoom, setZoom] = useState(1);
  const [angle, setAngle] = useState(0);
  const [full, setFull] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upgrade = () => {
    toast('This needs the Creator plan', { action: { label: 'Upgrade', onClick: () => navigate('/pricing') } });
  };

  const onSave = async () => {
    try {
      await editor.save(() => stage.current?.snapshot() ?? Promise.resolve(null));
      toast.success('Avatar saved — it now shows on your profile, dashboard and chat.');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
  };

  const onUpload = async (f?: File) => {
    if (!f) return;
    if (!canPro) { upgrade(); return; }
    setUploading(true);
    try { await editor.upload(f); toast.success('Photo uploaded — customise it, then Save in Profile'); }
    catch (e: any) { toast.error(e?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const toggleFull = async () => {
    try {
      if (!document.fullscreenElement) { await wrapRef.current?.requestFullscreen(); setFull(true); }
      else { await document.exitFullscreen(); setFull(false); }
    } catch { setFull((f) => !f); }
  };

  const isPhoto = config.mode === 'photo';

  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto" data-testid="avatar-studio-page">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-1">Avatar Studio <Sparkles className="w-5 h-5 text-violet-500" /></h1>
          <p className="text-sm text-slate-500 mt-1">Create your realistic avatar with AI. Choose a preset or customise every detail.</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-slate-200 shadow-sm" data-testid="mode-toggle">
          {([['photo', 'Realistic 3D'], ['character', '3D Character']] as const).map(([m, l]) => (
            <button key={m} type="button" onClick={() => update({ mode: m })} data-testid={`mode-${m}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${config.mode === m ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'text-slate-600'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[220px_minmax(0,1fr)_380px] gap-4 lg:gap-5">
        {/* Left: sections */}
        <aside className="space-y-4 order-2 lg:order-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
            <button type="button" data-testid="new-avatar-btn"
              onClick={() => { update({ mode: 'character', character: DEFAULT_CHARACTER, photo: DEFAULT_PHOTO, presetId: null }); setSection('body'); toast.info('New 3D character — start customising'); }}
              className="w-full mb-2 inline-flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-200">
              <Plus className="w-4 h-4" /> New Avatar
            </button>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
              {SECTIONS.map((s) => (
                <button key={s.key} type="button" onClick={() => setSection(s.key)} data-testid={`section-${s.key}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition ${section === s.key ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <s.icon className="w-4 h-4 shrink-0" /> {s.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="font-bold text-violet-700 flex items-center gap-2">Upload Your Avatar {!canPro && <Lock className="w-3.5 h-3.5 text-amber-500" />}</p>
            <p className="text-xs text-slate-500 mt-1">Upload a front-facing photo. JPG, PNG up to 10MB.</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} data-testid="upload-input" />
            <button type="button" onClick={() => (canPro ? fileRef.current?.click() : upgrade())} data-testid="upload-avatar-btn"
              className="mt-3 w-full border-2 border-dashed border-violet-200 rounded-xl py-6 flex flex-col items-center gap-1 text-violet-700 hover:bg-violet-50">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span className="text-sm font-semibold">{canPro ? 'Upload Image' : 'Upgrade to upload'}</span>
            </button>
          </div>
        </aside>

        {/* Center: 3D stage */}
        <section className="order-1 lg:order-2 min-w-0">
          <div ref={wrapRef} className={`relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm ${full ? 'h-screen' : 'h-[420px] sm:h-[520px] lg:h-[600px]'}`}>
            <AvatarStage ref={stage} config={config} zoom={zoom} angle={angle} />
            <div className="absolute left-3 top-3 flex flex-col gap-1 bg-white/95 backdrop-blur rounded-2xl p-1.5 shadow-md">
              {[
                { icon: Undo2, label: 'Undo', fn: editor.undo, dis: !editor.canUndo },
                { icon: Redo2, label: 'Redo', fn: editor.redo, dis: !editor.canRedo },
                { icon: ZoomIn, label: 'Zoom In', fn: () => setZoom((z) => Math.min(1.8, z + 0.15)) },
                { icon: ZoomOut, label: 'Zoom Out', fn: () => setZoom((z) => Math.max(0.6, z - 0.15)) },
                { icon: Expand, label: 'Fit View', fn: () => { setZoom(1); setAngle(0); } },
              ].map((t) => (
                <button key={t.label} type="button" onClick={t.fn} disabled={t.dis} data-testid={`tool-${t.label.toLowerCase().replace(' ', '-')}`}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-40">
                  <t.icon className="w-4 h-4" /><span className="text-[10px] hidden sm:block">{t.label}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={toggleFull} className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center" data-testid="fullscreen-btn">
              {full ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {editor.aiBusy && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center"><div className="bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2 text-sm font-medium text-violet-700"><Loader2 className="w-4 h-4 animate-spin" /> AI is restyling your avatar…</div></div>
            )}
            <div className="absolute left-3 right-3 bottom-3 grid grid-cols-2 gap-2 bg-white/95 backdrop-blur rounded-2xl p-2 shadow-md">
              <button type="button" onClick={() => setSection(section === 'overview' ? 'clothing' : section)} data-testid="customize-avatar-btn"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left">
                <Pencil className="w-5 h-5 text-slate-700 shrink-0" /><span><span className="block text-sm font-semibold text-slate-900">Customize Avatar</span><span className="hidden sm:block text-xs text-slate-500">Fine-tune every detail</span></span>
              </button>
              <button type="button" onClick={onSave} disabled={editor.saving} data-testid="save-in-profile-btn"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-white bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-70">
                {editor.saving ? <Loader2 className="w-5 h-5 animate-spin shrink-0" /> : <UserCheck className="w-5 h-5 shrink-0" />}
                <span><span className="block text-sm font-semibold">Save in Profile</span><span className="hidden sm:block text-xs text-white/80">Save avatar to your profile</span></span>
              </button>
            </div>
          </div>
          {/* Angle thumbnails */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {ANGLES.map((a) => (
              <button key={a} type="button" onClick={() => setAngle(a)} data-testid={`angle-${a}`}
                className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-slate-100 ${angle === a ? 'border-violet-600' : 'border-slate-200'}`} style={{ perspective: 200 }}>
                {isPhoto && config.imageUrl ? (
                  <img src={config.imageUrl} alt="" className="w-full h-full object-cover object-top" style={{ transform: `rotateY(${a === 180 ? 0 : a}deg)`, filter: a === 180 ? 'brightness(0.3)' : undefined }} />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-slate-500"><RotateCw className="w-5 h-5" style={{ transform: `rotate(${a}deg)` }} /></span>
                )}
              </button>
            ))}
            <button type="button" onClick={() => setAngle((x) => x + 90)} className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-800 text-white text-lg font-semibold" data-testid="angle-more">+3</button>
          </div>
        </section>

        {/* Right: presets or editor */}
        <aside className="order-3 lg:col-span-2 2xl:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 h-fit">
          {section === 'overview' ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-3">Choose a Realistic Avatar</h2>
              <AvatarPresetGrid
                style={config.style}
                selectedId={config.presetId}
                onStyleChange={(s) => update({ style: s })}
                onSelect={(p) => { update({ mode: 'photo', imageUrl: p.image_url, presetId: p.id, label: p.label, photo: DEFAULT_PHOTO }); setAngle(0); }}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">{SECTIONS.find((s) => s.key === section)?.label}</h2>
                <button type="button" onClick={() => setSection('overview')} className="text-xs font-semibold text-violet-700" data-testid="back-to-presets">All presets</button>
              </div>
              <p className="text-xs text-slate-500 mb-4">{isPhoto ? 'Editing your photo avatar. Colour & light and background are free; AI restyles need Creator.' : 'Editing your 3D character — every change updates live.'}</p>
              <AvatarEditorPanel editor={editor} section={section as EditorSection} canAI={canPro} onUpgrade={upgrade} />
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AvatarStudioPage;
