import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowRight, Upload, Hammer, CheckCircle2, Loader2, Lock, ScanFace, Scissors, Shirt, Image as ImageIcon, Mic,
  Trash2, Plus, Lightbulb, FileText, Globe, Youtube, Instagram, Linkedin, Facebook, Github, Music, Monitor, Box, CalendarClock,
  Crown, Copy, LayoutGrid, Check, Sparkles, Bot,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AvatarStage, { AvatarStageHandle } from '@/components/avatar3d/AvatarStage';
import AvatarEditorPanel, { EditorSection, VOICES, EXPRESSIONS } from '@/components/avatar3d/AvatarEditorPanel';
import AvatarPresetGrid from '@/components/avatar3d/AvatarPresetGrid';
import type { AvatarEditor } from '@/hooks/useAvatarEditor';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useTrainingDocuments } from '@/hooks/useTrainingDocuments';
import { useWebTraining } from '@/hooks/useWebTraining';
import { useProducts } from '@/hooks/useProducts';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { DEFAULT_PHOTO } from '@/lib/avatar/avatarConfig';
import { AvatarStyle, CARTOON_PRESETS, ANIME_PRESETS } from '@/lib/avatar/presets';

export interface StepProps {
  editor: AvatarEditor;
  userId: string;
  next: () => void;
  canPro: boolean;
  goPaywall: () => void;
}

export const ContinueBtn: React.FC<{ onClick: () => void; loading?: boolean; label?: string; disabled?: boolean }> = ({ onClick, loading, label = 'Continue', disabled }) => (
  <button type="button" onClick={onClick} disabled={loading || disabled} data-testid="onb-continue"
    className="w-full h-12 mt-5 rounded-xl text-white font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 inline-flex items-center justify-center gap-2 disabled:opacity-60">
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}{label} <ArrowRight className="w-4 h-4" />
  </button>
);

export const StepTitle: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div className="text-center mb-5">
    <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
    <p className="text-sm text-slate-500 mt-1">{sub}</p>
  </div>
);

const inputCls = 'w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400';

/* 3 ─ Choose avatar style */
export const StyleStep: React.FC<StepProps> = ({ editor, next }) => {
  const { config, update } = editor;
  const cover: Record<AvatarStyle, string> = {
    realistic: config.style === 'realistic' && config.imageUrl ? config.imageUrl : '',
    cartoon: CARTOON_PRESETS[0].image_url,
    anime: ANIME_PRESETS[0].image_url,
  };
  return (
    <div>
      <StepTitle title="Choose Your Avatar Style" sub="Pick a style that fits your personality." />
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['realistic', 'cartoon', 'anime'] as AvatarStyle[]).map((s) => (
          <button key={s} type="button" onClick={() => update({ style: s, mode: 'photo' })} data-testid={`style-card-${s}`}
            className={`relative rounded-2xl overflow-hidden border-2 bg-slate-100 ${config.style === s ? 'border-violet-600 shadow-lg shadow-violet-100' : 'border-slate-200'}`}>
            <div className="aspect-[4/5] bg-slate-200">{cover[s] ? <img src={cover[s]} alt={s} className="w-full h-full object-cover object-top" /> : <Bot className="w-10 h-10 m-auto mt-10 text-slate-400" />}</div>
            <span className={`block py-2 text-sm font-semibold ${config.style === s ? 'text-violet-700' : 'text-slate-700'}`}>{s[0].toUpperCase() + s.slice(1)}</span>
            {config.style === s && <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center"><Check className="w-3.5 h-3.5" /></span>}
          </button>
        ))}
      </div>
      <AvatarPresetGrid style={config.style} showStyleTabs={false} compact columns="grid-cols-5" limit={10} selectedId={config.presetId}
        onSelect={(p) => update({ mode: 'photo', imageUrl: p.image_url, presetId: p.id, label: p.label, photo: DEFAULT_PHOTO })} />
      <ContinueBtn onClick={next} disabled={!config.imageUrl} />
    </div>
  );
};

/* 4 ─ Create avatar (upload or build manually) */
export const CreateStep: React.FC<StepProps> = ({ editor, next, canPro, goPaywall }) => {
  const [tab, setTab] = useState<'upload' | 'build'>(editor.config.mode === 'character' ? 'build' : 'upload');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try { await editor.upload(f); toast.success('Photo uploaded'); } catch (e: any) { toast.error(e?.message || 'Upload failed'); } finally { setBusy(false); }
  };
  return (
    <div>
      <StepTitle title="Create Your Avatar" sub="Start with a photo or build from scratch." />
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button type="button" onClick={() => { setTab('upload'); editor.update({ mode: 'photo' }); }} data-testid="create-tab-upload"
          className={`h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border ${tab === 'upload' ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-700'}`}><Upload className="w-4 h-4" />Upload Photo</button>
        <button type="button" onClick={() => { setTab('build'); editor.update({ mode: 'character' }); }} data-testid="create-tab-build"
          className={`h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border ${tab === 'build' ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-700'}`}><Hammer className="w-4 h-4" />Build Manually</button>
      </div>
      {tab === 'upload' ? (
        <>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} data-testid="onb-upload-input" />
          <button type="button" onClick={() => (canPro ? fileRef.current?.click() : goPaywall())} data-testid="onb-dropzone"
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (canPro) onFile(e.dataTransfer.files?.[0]); else goPaywall(); }}
            className="w-full rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 py-10 flex flex-col items-center gap-2 text-slate-600">
            {busy ? <Loader2 className="w-8 h-8 animate-spin text-violet-600" /> : canPro ? <Upload className="w-8 h-8 text-violet-600" /> : <Lock className="w-8 h-8 text-amber-500" />}
            <span className="text-sm">{canPro ? 'Drag & drop your photo here or click to upload' : 'Photo upload is part of the Creator plan — tap to unlock'}</span>
            <span className="text-xs text-slate-400">JPG, PNG, WebP (Max 10MB)</span>
          </button>
          {editor.config.imageUrl && (
            <div className="mt-3 flex items-center gap-3 p-2 rounded-xl bg-slate-50"><img src={editor.config.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover object-top" /><span className="text-sm text-slate-600">Using <b>{editor.config.label}</b> — you can keep this preset or upload your own.</span></div>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-slate-600">
            {['Clear Face', 'Good Lighting', 'Front View'].map((t) => <span key={t} className="inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" />{t}</span>)}
          </div>
        </>
      ) : (
        <div className="rounded-2xl overflow-hidden h-72 border border-slate-200"><AvatarStage config={editor.config} autoRotate /></div>
      )}
      <ContinueBtn onClick={next} disabled={tab === 'upload' && !editor.config.imageUrl} />
    </div>
  );
};

/* 5 ─ Customise (3D preview + live edits) then save everywhere */
export const CustomizeStep: React.FC<StepProps> = ({ editor, next, canPro, goPaywall }) => {
  const stage = useRef<AvatarStageHandle>(null);
  const [section, setSection] = useState<EditorSection>('clothing');
  const [tab, setTab] = useState<'presets' | 'voice' | 'expression'>('presets');
  const side: { k: EditorSection; l: string; i: React.ComponentType<{ className?: string }> }[] = [
    { k: 'face', l: 'Face', i: ScanFace }, { k: 'hair', l: 'Hair', i: Scissors }, { k: 'clothing', l: 'Clothing', i: Shirt },
    { k: 'background', l: 'Background', i: ImageIcon }, { k: 'body', l: 'Body', i: Sparkles }, { k: 'photo', l: 'Colour', i: Mic },
  ];
  const save = async () => {
    try {
      await editor.save(() => stage.current?.snapshot() ?? Promise.resolve(null));
      toast.success('Avatar saved to your profile');
      next();
    } catch (e: any) { toast.error(e?.message || 'Could not save avatar'); }
  };
  return (
    <div>
      <StepTitle title="Customize Your Avatar" sub="Make it look and sound like you." />
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 border border-slate-200">
          <AvatarStage ref={stage} config={editor.config} />
          {editor.aiBusy && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>}
          <span className="absolute bottom-2 left-2 text-[10px] bg-white/90 px-2 py-0.5 rounded-full text-slate-600">Drag to rotate</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {side.map((s) => (
            <button key={s.k} type="button" onClick={() => { setSection(s.k); setTab('presets'); }} data-testid={`onb-side-${s.k}`}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium ${section === s.k ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <s.i className="w-4 h-4" /><span className="hidden sm:inline">{s.l}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-3 p-1 bg-slate-100 rounded-xl">
        {(['presets', 'voice', 'expression'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} data-testid={`onb-tab-${t}`} className={`py-1.5 text-sm font-semibold rounded-lg ${tab === t ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' : 'text-slate-600'}`}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      <div className="mt-3 max-h-64 overflow-y-auto pr-1">
        {tab === 'presets' && editor.config.mode === 'photo' && (
          <div className="mb-3">
            <AvatarPresetGrid style={editor.config.style} showStyleTabs={false} compact columns="grid-cols-5" limit={5} selectedId={editor.config.presetId}
              onSelect={(p) => editor.update({ imageUrl: p.image_url, presetId: p.id, label: p.label, photo: DEFAULT_PHOTO })} />
          </div>
        )}
        {tab === 'presets' && <AvatarEditorPanel editor={editor} section={section} canAI={canPro} onUpgrade={goPaywall} />}
        {tab === 'voice' && <AvatarEditorPanel editor={editor} section="voice" canAI={canPro} onUpgrade={goPaywall} />}
        {tab === 'expression' && <AvatarEditorPanel editor={editor} section="expression" canAI={canPro} onUpgrade={goPaywall} />}
      </div>
      <ContinueBtn onClick={save} loading={editor.saving} />
    </div>
  );
};

/* 6 ─ Tell us about you */
const CATEGORIES = ['Creator', 'Coach', 'Consultant', 'Founder', 'Influencer', 'Educator', 'Artist', 'Freelancer', 'Business', 'Other'];
const LANGS = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Portuguese', 'Bengali', 'Tamil', 'Telugu'];
export const AboutStep: React.FC<StepProps> = ({ userId, next }) => {
  const [f, setF] = useState({ display_name: '', username: '', bio: '', profession: 'Creator', language: 'English' });
  const [taken, setTaken] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from('profiles').select('display_name, full_name, username, bio, profession').eq('id', userId).maybeSingle().then(({ data }) => {
      const d: any = data || {};
      setF((p) => ({ ...p, display_name: d.display_name || d.full_name || '', username: d.username || '', bio: d.bio || '', profession: d.profession || 'Creator' }));
    });
  }, [userId]);
  useEffect(() => {
    const u = f.username.trim().toLowerCase();
    if (u.length < 3) { setTaken(false); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').eq('username', u).neq('id', userId).maybeSingle();
      setTaken(!!data);
    }, 400);
    return () => clearTimeout(t);
  }, [f.username, userId]);
  const save = async () => {
    const username = f.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!f.display_name.trim() || username.length < 3) { toast.error('Display name and a username (3+ characters) are required'); return; }
    if (taken) { toast.error('That username is taken'); return; }
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: userId, display_name: f.display_name.trim(), username, bio: f.bio.trim() || null, profession: f.profession, updated_at: new Date().toISOString() } as any, { onConflict: 'id' });
    if (!error) await supabase.from('user_onboarding').update({ personal_info_data: { language: f.language, category: f.profession } } as any).eq('user_id', userId);
    setSaving(false);
    if (error) { toast.error(/duplicate|unique/i.test(error.message) ? 'That username is taken' : error.message); return; }
    window.dispatchEvent(new Event('avatartalk:profile-updated'));
    next();
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-3.5">
      <StepTitle title="Tell Us About You" sub="This shows on your public AI profile." />
      <div><p className="text-sm font-semibold text-slate-800 mb-1.5">Display Name <span className="text-rose-500">*</span></p><input value={f.display_name} onChange={set('display_name')} className={inputCls} data-testid="about-display-name" /></div>
      <div><p className="text-sm font-semibold text-slate-800 mb-1.5">Username <span className="text-rose-500">*</span></p>
        <div className="flex items-center rounded-xl border border-slate-200 bg-white pr-3 focus-within:ring-2 focus-within:ring-violet-200">
          <input value={f.username} onChange={set('username')} className="flex-1 h-11 px-3.5 text-sm bg-transparent focus:outline-none" data-testid="about-username" />
          <span className="text-sm text-slate-500">@avatartalk.co</span>
        </div>
        {taken && <p className="text-xs text-rose-600 mt-1">This username is already taken</p>}
      </div>
      <div><p className="text-sm font-semibold text-slate-800 mb-1.5">Bio</p><textarea value={f.bio} onChange={set('bio')} rows={3} maxLength={300} className={`${inputCls} h-auto py-2.5`} data-testid="about-bio" placeholder="AI Founder & Creator. Building tools to empower creators." /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-sm font-semibold text-slate-800 mb-1.5">Category</p><select value={f.profession} onChange={set('profession')} className={inputCls} data-testid="about-category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><p className="text-sm font-semibold text-slate-800 mb-1.5">Language</p><select value={f.language} onChange={set('language')} className={inputCls} data-testid="about-language">{LANGS.map((c) => <option key={c}>{c}</option>)}</select></div>
      </div>
      <ContinueBtn onClick={save} loading={saving} />
    </div>
  );
};

/* 8 ─ AI training */
export const TrainStep: React.FC<StepProps> = ({ next, goPaywall }) => {
  const [tab, setTab] = useState<'qa' | 'docs' | 'web' | 'voice'>('qa');
  const { qaPairs, addQAPair, deleteQAPair, fetchQAPairs } = useQAPairs() as any;
  const { documents, fetchDocuments, uploadDocument } = useTrainingDocuments() as any;
  const { webData, fetchWebData, scrapeUrl, isScraping } = useWebTraining() as any;
  const { limits, canAddQAPair, canAddDocument, canUseWebScraper } = usePlanFeatures() as any;
  const [q, setQ] = useState(''); const [a, setA] = useState(''); const [url, setUrl] = useState('');
  const docRef = useRef<HTMLInputElement>(null);
  useEffect(() => { fetchQAPairs?.(); fetchDocuments?.(); fetchWebData?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const addQA = async () => {
    if (!q.trim() || !a.trim()) { toast.error('Add both a question and an answer'); return; }
    if (!canAddQAPair((qaPairs || []).length)) { toast.error(`Your plan allows ${limits.qa_pairs} Q&A pairs`); goPaywall(); return; }
    try { await addQAPair({ question: q.trim(), answer: a.trim() }); setQ(''); setA(''); toast.success('Q&A added'); } catch { toast.error('Could not add Q&A'); }
  };
  return (
    <div>
      <StepTitle title="Train Your AI (Optional)" sub="Teach your avatar about you, your work, products, or any topic." />
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4">
        {([['qa', 'Q&A'], ['docs', 'Documents'], ['web', 'Web'], ['voice', 'Voice']] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} data-testid={`train-tab-${k}`} className={`py-1.5 text-xs sm:text-sm font-semibold rounded-lg ${tab === k ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600'}`}>{l}</button>
        ))}
      </div>
      {tab === 'qa' && (
        <div className="space-y-3">
          {(qaPairs || []).slice(0, 4).map((p: any) => (
            <div key={p.id} className="rounded-xl border border-slate-100 p-3 text-sm">
              <div className="flex justify-between gap-2"><p><b className="text-violet-600 mr-2">Q</b>{p.question}</p><button type="button" onClick={() => deleteQAPair(p.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button></div>
              <p className="mt-1 text-slate-600"><b className="text-slate-800 mr-2">A</b>{p.answer}</p>
            </div>
          ))}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you do?" className={inputCls} data-testid="train-question" />
          <textarea value={a} onChange={(e) => setA(e.target.value)} rows={2} placeholder="I build AI tools for creators and businesses." className={`${inputCls} h-auto py-2.5`} data-testid="train-answer" />
          <button type="button" onClick={addQA} className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-200 text-violet-700 font-semibold text-sm" data-testid="train-add-qa"><Plus className="w-4 h-4" />Add More Q&A</button>
          <p className="text-xs text-slate-500 text-center">{(qaPairs || []).length}/{limits.qa_pairs === -1 ? '∞' : limits.qa_pairs} on your plan</p>
        </div>
      )}
      {tab === 'docs' && (
        <div className="space-y-2">
          <input ref={docRef} type="file" accept=".pdf,.txt,.doc,.docx,.md" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0]; if (!file) return;
            if (!canAddDocument((documents || []).length)) { goPaywall(); return; }
            try { await uploadDocument(file); toast.success('Document uploaded'); } catch { toast.error('Upload failed'); }
          }} />
          <button type="button" onClick={() => docRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-violet-200 py-8 flex flex-col items-center gap-1 text-slate-600" data-testid="train-upload-doc"><FileText className="w-7 h-7 text-violet-600" /><span className="text-sm">Upload PDF, DOCX or TXT</span></button>
          {(documents || []).slice(0, 4).map((d: any) => <p key={d.id} className="text-sm text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4" />{d.file_name || d.name || 'Document'}</p>)}
        </div>
      )}
      {tab === 'web' && (
        canUseWebScraper ? (
          <div className="space-y-2">
            <div className="flex gap-2"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourwebsite.com" className={inputCls} data-testid="train-web-url" />
              <button type="button" disabled={isScraping || !url} onClick={async () => { try { await scrapeUrl(url); setUrl(''); toast.success('Website added'); } catch { toast.error('Could not read that page'); } }} className="px-4 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-60">{isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}</button></div>
            {(webData || []).slice(0, 4).map((w: any) => <p key={w.id} className="text-sm text-slate-700 flex items-center gap-2 truncate"><Globe className="w-4 h-4 shrink-0" />{w.url}</p>)}
          </div>
        ) : <LockedNote text="Website training is available on the Pro plan." onUnlock={goPaywall} />
      )}
      {tab === 'voice' && <LockedNote text="Record or upload voice samples from AI Training in your dashboard after setup (Pro plan for voice cloning)." onUnlock={goPaywall} />}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50/60 p-3 text-xs text-slate-600"><Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />Tip: Add 5–10 Q&A or upload documents for a smarter avatar.</div>
      <ContinueBtn onClick={next} />
    </div>
  );
};

const LockedNote: React.FC<{ text: string; onUnlock: () => void }> = ({ text, onUnlock }) => (
  <div className="rounded-2xl bg-slate-50 p-5 text-center"><Lock className="w-6 h-6 mx-auto text-amber-500" /><p className="text-sm text-slate-600 mt-2">{text}</p>
    <button type="button" onClick={onUnlock} className="mt-3 text-sm font-semibold text-violet-700 inline-flex items-center gap-1"><Crown className="w-4 h-4" />See plans</button></div>
);

/* 9 ─ Links */
const PLATFORMS = [
  { id: 'youtube', icon: Youtube, ph: 'youtube.com/@yourchannel', c: 'text-red-600' },
  { id: 'instagram', icon: Instagram, ph: 'instagram.com/you', c: 'text-pink-600' },
  { id: 'twitter', icon: () => <span className="font-black text-sm">𝕏</span>, ph: 'x.com/you', c: 'text-slate-900' },
  { id: 'linkedin', icon: Linkedin, ph: 'linkedin.com/in/you', c: 'text-blue-700' },
  { id: 'website', icon: Globe, ph: 'https://yoursite.com', c: 'text-slate-700' },
  { id: 'facebook', icon: Facebook, ph: 'facebook.com/you', c: 'text-blue-600' },
  { id: 'tiktok', icon: Music, ph: 'tiktok.com/@you', c: 'text-slate-900' },
  { id: 'github', icon: Github, ph: 'github.com/you', c: 'text-slate-900' },
];
const normUrl = (v: string) => { const t = v.trim(); if (!t) return null; return /^https?:\/\//i.test(t) ? t : `https://${t}`; };
export const LinksStep: React.FC<StepProps> = ({ userId, next }) => {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [shown, setShown] = useState(5);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from('social_links').select('*').eq('user_id', userId).maybeSingle().then(({ data }) => {
      if (!data) return;
      const v: Record<string, string> = {};
      PLATFORMS.forEach((p) => { const x = (data as any)[p.id]; if (x) v[p.id] = x; });
      setVals(v);
      const lastIdx = PLATFORMS.reduce((m, p, i) => ((data as any)[p.id] ? i : m), 4);
      setShown(Math.max(5, lastIdx + 1));
    });
  }, [userId]);
  const save = async () => {
    setSaving(true);
    const row: any = { user_id: userId };
    PLATFORMS.forEach((p) => { row[p.id] = normUrl(vals[p.id] || ''); });
    let { error } = await supabase.from('social_links').upsert(row, { onConflict: 'user_id' });
    if (error) {
      const { data: ex } = await supabase.from('social_links').select('id').eq('user_id', userId).maybeSingle();
      ({ error } = ex ? await supabase.from('social_links').update(row).eq('user_id', userId) : await supabase.from('social_links').insert(row));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    next();
  };
  return (
    <div>
      <StepTitle title="Add Your Links" sub="Connect your social profiles and important links." />
      <div className="space-y-2">
        {PLATFORMS.slice(0, shown).map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 h-12">
            <span className={`w-6 flex justify-center ${p.c}`}><p.icon className="w-5 h-5" /></span>
            <input value={vals[p.id] || ''} onChange={(e) => setVals((v) => ({ ...v, [p.id]: e.target.value }))} placeholder={p.ph} className="flex-1 text-sm bg-transparent focus:outline-none" data-testid={`link-${p.id}`} />
            {vals[p.id]?.trim() && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
        ))}
      </div>
      {shown < PLATFORMS.length && <button type="button" onClick={() => setShown((s) => s + 1)} className="mx-auto mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-200 text-violet-700 font-semibold text-sm" data-testid="add-another-link"><Plus className="w-4 h-4" />Add Another Link</button>}
      <ContinueBtn onClick={save} loading={saving} />
    </div>
  );
};

/* 10 ─ Products & services */
const PTYPES = [
  { k: 'digital', t: 'Digital Product', d: 'eBook, course, template, etc.', i: Monitor },
  { k: 'physical', t: 'Physical Product', d: 'Merch, brand items, etc.', i: Box },
  { k: 'service', t: 'Service / Booking', d: 'Consultation, meeting, calls', i: CalendarClock },
  { k: 'membership', t: 'Membership / Subscription', d: 'Exclusive content, community', i: Crown },
];
export const ProductsStep2: React.FC<StepProps> = ({ userId, next, goPaywall }) => {
  const { products, createProduct } = useProducts() as any;
  const { canAddProduct, hasFeature, limits } = usePlanFeatures() as any;
  const [type, setType] = useState('digital');
  const [form, setForm] = useState(false);
  const [f, setF] = useState({ title: '', price: '', description: '' });
  const [saving, setSaving] = useState(false);
  const add = async () => {
    if (!f.title.trim()) { toast.error('Give your product a title'); return; }
    if (type === 'physical' && !hasFeature('physical_products_enabled')) { toast.error('Physical products need the Business plan'); goPaywall(); return; }
    if (!canAddProduct((products || []).length)) { toast.error(`Your plan allows ${limits.products} products`); goPaywall(); return; }
    const price = parseFloat(f.price) || 0;
    if (price > 0 && !hasFeature('payments_enabled')) { toast.error('Selling paid products needs the Creator plan'); goPaywall(); return; }
    setSaving(true);
    try {
      await createProduct({ user_id: userId, title: f.title.trim(), description: (type === 'membership' ? '[Membership] ' : '') + (f.description.trim() || ''), price, product_type: type === 'membership' ? 'digital' : type, is_free: price === 0, status: 'published' });
      toast.success('Product added'); setF({ title: '', price: '', description: '' }); setForm(false);
    } catch (e: any) { toast.error(e?.message || 'Could not add product'); } finally { setSaving(false); }
  };
  return (
    <div>
      <StepTitle title="Add Products & Services (Optional)" sub="Sell digital or physical products, services, or subscriptions." />
      <div className="space-y-2">
        {PTYPES.map((p) => (
          <button key={p.k} type="button" onClick={() => { setType(p.k); setForm(true); }} data-testid={`ptype-${p.k}`}
            className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${type === p.k ? 'border-violet-500 bg-violet-50/50' : 'border-slate-100 bg-white'}`}>
            <p.i className="w-6 h-6 text-violet-600" /><span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{p.t}</span><span className="block text-xs text-slate-500">({p.d})</span></span>
            {type === p.k && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
          </button>
        ))}
      </div>
      {form ? (
        <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Product title" className={inputCls} data-testid="product-title" />
          <input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Price in ₹ (0 for free)" className={inputCls} data-testid="product-price" />
          <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} placeholder="Short description" className={`${inputCls} h-auto py-2.5`} />
          <button type="button" onClick={add} disabled={saving} className="w-full h-11 rounded-xl border border-violet-300 text-violet-700 font-semibold text-sm inline-flex items-center justify-center gap-2" data-testid="product-add">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Add Product</button>
        </div>
      ) : (
        <button type="button" onClick={() => setForm(true)} className="mx-auto mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-200 text-violet-700 font-semibold text-sm"><Plus className="w-4 h-4" />Add Product</button>
      )}
      {(products || []).length > 0 && <p className="text-xs text-slate-500 mt-2 text-center">{products.length} product(s) on your profile</p>}
      <ContinueBtn onClick={next} />
    </div>
  );
};

/* 11 ─ Preferences */
const STYLES = ['Short & Conversational', 'Detailed & Thorough', 'Bullet-point Summaries'];
export const PrefsStep: React.FC<StepProps> = ({ editor, userId, next }) => {
  const [voice, setVoice] = useState(editor.config.voice);
  const [persona, setPersona] = useState(editor.config.expression);
  const [style, setStyle] = useState(STYLES[0]);
  const [t, setT] = useState({ chat: true, products: true, meeting: true });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    editor.update({ voice, expression: persona });
    try {
      const { data: ex } = await supabase.from('avatar_settings').select('id').eq('user_id', userId).maybeSingle();
      const row: any = { user_id: userId, voice_type: voice, avatar_mood: persona };
      if (ex) await supabase.from('avatar_settings').update(row).eq('user_id', userId); else await supabase.from('avatar_settings').insert(row);
      const { data: onb } = await supabase.from('user_onboarding').select('personal_info_data').eq('user_id', userId).maybeSingle();
      await supabase.from('user_onboarding').update({ personal_info_data: { ...((onb as any)?.personal_info_data || {}), preferences: { voice, persona, response_style: style, allow_chat: t.chat, show_products: t.products, enable_booking: t.meeting } } } as any).eq('user_id', userId);
    } catch { /* non-blocking */ }
    setSaving(false);
    next();
  };
  const Sel: React.FC<{ label: string; value: string; onChange: (v: string) => void; opts: { id: string; label: string }[]; testId: string }> = ({ label, value, onChange, opts, testId }) => (
    <div><p className="text-sm font-semibold text-slate-800 mb-1.5">{label}</p><select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} data-testid={testId}>{opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select></div>
  );
  return (
    <div className="space-y-3.5">
      <StepTitle title="Set Your Preferences" sub="Customize your avatar's behavior and visibility." />
      <Sel label="Avatar Voice" value={voice} onChange={setVoice} opts={VOICES} testId="pref-voice" />
      <Sel label="Personality" value={persona} onChange={setPersona} opts={EXPRESSIONS} testId="pref-persona" />
      <Sel label="Response Style" value={style} onChange={setStyle} opts={STYLES.map((s) => ({ id: s, label: s }))} testId="pref-style" />
      {([['chat', 'Allow visitors to chat with my avatar'], ['products', 'Show products on my profile'], ['meeting', 'Enable meeting / booking']] as const).map(([k, l]) => (
        <label key={k} className="flex items-center justify-between py-1.5 text-sm text-slate-700">{l}
          <button type="button" onClick={() => setT((x) => ({ ...x, [k]: !x[k] }))} data-testid={`pref-toggle-${k}`} className={`w-11 h-6 rounded-full relative transition ${t[k] ? 'bg-violet-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${t[k] ? 'left-[22px]' : 'left-0.5'}`} /></button>
        </label>
      ))}
      <ContinueBtn onClick={save} loading={saving} />
    </div>
  );
};

/* 12 ─ All set */
export const DoneStep: React.FC<StepProps & { onDashboard: () => void }> = ({ userId, onDashboard }) => {
  const [p, setP] = useState<{ username?: string; avatar?: string }>({});
  useEffect(() => {
    supabase.from('profiles').select('username, profile_pic_url, avatar_url').eq('id', userId).maybeSingle().then(({ data }) => {
      const d: any = data || {}; setP({ username: d.username, avatar: d.profile_pic_url || d.avatar_url });
    });
  }, [userId]);
  const url = `${window.location.origin}/${p.username || ''}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success('Link copied'); } catch { toast.error('Copy failed'); } };
  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 text-xl mb-2">{['🎉', '✨', '🎊', '💜'].map((e) => <span key={e} className="animate-bounce">{e}</span>)}</div>
      <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200"><Check className="w-10 h-10 text-white" /></div>
      <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Your AI Avatar is Ready! 🎉</h2>
      <p className="text-sm text-slate-500 mt-2">Your profile is live. Share your link, start chatting, selling, and growing your audience.</p>
      <div className="relative mx-auto mt-5 w-40 h-40 rounded-2xl overflow-hidden bg-slate-100 shadow">{p.avatar && <img src={p.avatar} alt="" className="w-full h-full object-cover object-top" />}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[11px] font-semibold bg-white px-2 py-0.5 rounded-full text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Online</span></div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 h-11"><span className="flex-1 text-sm text-violet-700 font-medium truncate text-left" data-testid="done-profile-url">{url.replace(/^https?:\/\//, '')}</span><button type="button" onClick={copy} data-testid="done-copy-link"><Copy className="w-4 h-4 text-slate-500" /></button></div>
      <button type="button" onClick={() => window.open(url, '_blank')} className="w-full h-12 mt-4 rounded-xl text-white font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 inline-flex items-center justify-center gap-2" data-testid="done-view-profile">View My Profile <ArrowRight className="w-4 h-4" /></button>
      <button type="button" onClick={onDashboard} className="w-full h-12 mt-2 rounded-xl border border-slate-200 font-semibold text-slate-800 inline-flex items-center justify-center gap-2" data-testid="done-go-dashboard"><LayoutGrid className="w-4 h-4" />Go to Dashboard</button>
    </div>
  );
};
