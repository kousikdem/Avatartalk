import React, { useState } from 'react';
import { Lock, Loader2, Sparkles, Wand2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { AvatarEditor } from '@/hooks/useAvatarEditor';
import {
  BACKGROUNDS, CLOTH_COLORS, DEFAULT_PHOTO, EYE_COLORS, HAIR_COLORS, SKIN_TONES, CharacterConfig,
} from '@/lib/avatar/avatarConfig';

export type EditorSection =
  | 'body' | 'face' | 'hair' | 'clothing' | 'accessories' | 'background' | 'photo' | 'advanced' | 'voice' | 'expression';

const COLOR_NAMES: Record<string, string> = {
  '#1f2a44': 'navy blue', '#111827': 'black', '#374151': 'charcoal grey', '#9ca3af': 'light grey', '#ffffff': 'white',
  '#6d5dfc': 'violet', '#2563eb': 'royal blue', '#059669': 'emerald green', '#dc2626': 'red', '#f59e0b': 'mustard yellow',
  '#ec4899': 'pink', '#a16207': 'camel brown', '#111111': 'jet black', '#2b1d14': 'dark brown', '#5a3825': 'brown',
  '#8b5a2b': 'light brown', '#c9a15b': 'dark blonde', '#e6cf8f': 'platinum blonde', '#b8b8b8': 'silver grey', '#a33a2c': 'auburn red',
  '#e57ab3': 'pastel pink',
};

export const VOICES = [
  { id: 'male_natural', label: 'Male (Natural)' }, { id: 'female_natural', label: 'Female (Natural)' },
  { id: 'male_deep', label: 'Male (Deep)' }, { id: 'female_warm', label: 'Female (Warm)' },
  { id: 'neutral_calm', label: 'Neutral (Calm)' },
];
export const EXPRESSIONS = [
  { id: 'friendly', label: 'Friendly & Helpful' }, { id: 'professional', label: 'Professional' },
  { id: 'playful', label: 'Playful' }, { id: 'calm', label: 'Calm & Wise' }, { id: 'energetic', label: 'Energetic' },
];

const Chip: React.FC<{ active?: boolean; onClick: () => void; children: React.ReactNode; testId?: string; disabled?: boolean }> = ({ active, onClick, children, testId, disabled }) => (
  <button
    type="button" onClick={onClick} disabled={disabled} data-testid={testId}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all disabled:opacity-50 ${active
      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-sm'
      : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:text-violet-700'}`}
  >{children}</button>
);

const Swatches: React.FC<{ colors: string[]; value?: string; onPick: (c: string) => void; testId: string }> = ({ colors, value, onPick, testId }) => (
  <div className="flex flex-wrap gap-2">
    {colors.map((c) => (
      <button
        key={c} type="button" onClick={() => onPick(c)} data-testid={`${testId}-${c.slice(1)}`} title={COLOR_NAMES[c] || c}
        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${value === c ? 'border-violet-600 ring-2 ring-violet-200' : 'border-white shadow'}`}
        style={{ background: c }}
      />
    ))}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">{children}</p>
);

interface Props {
  editor: AvatarEditor;
  section: EditorSection;
  canAI: boolean;
  onUpgrade: () => void;
}

const AvatarEditorPanel: React.FC<Props> = ({ editor, section, canAI, onUpgrade }) => {
  const { config, updateCharacter, updatePhoto, update, aiEdit, aiBusy } = editor;
  const c = config.character;
  const isPhoto = config.mode === 'photo';
  const [prompt, setPrompt] = useState('');

  const runAI = async (instruction: string) => {
    if (!canAI) { onUpgrade(); return; }
    try {
      toast.loading('Editing your avatar with AI…', { id: 'ai-edit' });
      await aiEdit(instruction);
      toast.success('Avatar updated', { id: 'ai-edit' });
    } catch (e: any) {
      toast.error(e?.message || 'AI edit failed', { id: 'ai-edit' });
    }
  };

  const AIBlock: React.FC<{ title: string; chips: string[]; colors?: { list: string[]; tpl: (n: string) => string } }> = ({ title, chips, colors }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        {!canAI && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Lock className="w-3 h-3" /> Creator</span>}
      </div>
      {colors && <Swatches colors={colors.list} onPick={(col) => runAI(colors.tpl(COLOR_NAMES[col] || col))} testId="ai-color" />}
      <div className="flex flex-wrap gap-2">
        {chips.map((ch) => (
          <Chip key={ch} disabled={aiBusy} onClick={() => runAI(ch)} testId={`ai-chip-${ch.slice(0, 12).replace(/\s+/g, '-').toLowerCase()}`}>
            <span className="inline-flex items-center gap-1"><Wand2 className="w-3 h-3" />{ch}</span>
          </Chip>
        ))}
      </div>
      {aiBusy && <p className="text-xs text-violet-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Working on it (about 10–20 s)…</p>}
    </div>
  );

  const ch = <K extends keyof CharacterConfig>(k: K, v: CharacterConfig[K]) => updateCharacter({ [k]: v } as Partial<CharacterConfig>);

  switch (section) {
    case 'body':
      return isPhoto ? (
        <AIBlock title="Body style (AI)" chips={['Make the body build slimmer', 'Make the body build athletic and muscular', 'Make the shoulders broader', 'Change skin tone slightly lighter', 'Change skin tone slightly darker']} />
      ) : (
        <div className="space-y-5">
          <div><Label>Body type</Label><div className="flex flex-wrap gap-2">
            {(['male', 'female'] as const).map((g) => <Chip key={g} active={c.gender === g} onClick={() => ch('gender', g)} testId={`gender-${g}`}>{g === 'male' ? 'Male' : 'Female'}</Chip>)}
          </div></div>
          <div><Label>Build</Label><div className="flex flex-wrap gap-2">
            {(['slim', 'average', 'athletic', 'heavy'] as const).map((b) => <Chip key={b} active={c.bodyType === b} onClick={() => ch('bodyType', b)} testId={`body-${b}`}>{b[0].toUpperCase() + b.slice(1)}</Chip>)}
          </div></div>
          <div><Label>Height · {Math.round(c.height * 100)}%</Label>
            <Slider value={[c.height * 100]} min={90} max={110} step={1} onValueChange={([v]) => ch('height', v / 100)} data-testid="height-slider" /></div>
          <div><Label>Skin tone</Label><Swatches colors={SKIN_TONES} value={c.skinTone} onPick={(v) => ch('skinTone', v)} testId="skin" /></div>
        </div>
      );
    case 'face':
      return isPhoto ? (
        <AIBlock title="Facial features (AI)" chips={['Add a warm natural smile', 'Add a short trimmed beard', 'Make it clean shaven', 'Make the expression confident', 'Look slightly younger']} />
      ) : (
        <div className="space-y-5">
          <div><Label>Expression</Label><div className="flex flex-wrap gap-2">
            {(['smile', 'happy', 'neutral', 'serious'] as const).map((e) => <Chip key={e} active={c.expression === e} onClick={() => ch('expression', e)} testId={`expr-${e}`}>{e[0].toUpperCase() + e.slice(1)}</Chip>)}
          </div></div>
          <div><Label>Eye colour</Label><Swatches colors={EYE_COLORS} value={c.eyeColor} onPick={(v) => ch('eyeColor', v)} testId="eye" /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Beard</span><Switch checked={c.beard} onCheckedChange={(v) => ch('beard', v)} data-testid="beard-toggle" /></div>
        </div>
      );
    case 'hair':
      return isPhoto ? (
        <AIBlock title="Hair (AI)" chips={['Short fade haircut', 'Long wavy hair', 'Curly voluminous hair', 'Slicked back hair', 'Hair tied in a bun']}
          colors={{ list: HAIR_COLORS, tpl: (n) => `Change the hair colour to ${n}` }} />
      ) : (
        <div className="space-y-5">
          <div><Label>Hair style</Label><div className="flex flex-wrap gap-2">
            {(['short', 'buzz', 'long', 'curly', 'bun', 'ponytail', 'bald'] as const).map((h) => <Chip key={h} active={c.hairStyle === h} onClick={() => ch('hairStyle', h)} testId={`hair-${h}`}>{h[0].toUpperCase() + h.slice(1)}</Chip>)}
          </div></div>
          <div><Label>Hair colour</Label><Swatches colors={HAIR_COLORS} value={c.hairColor} onPick={(v) => ch('hairColor', v)} testId="hair-color" /></div>
        </div>
      );
    case 'clothing':
      return isPhoto ? (
        <AIBlock title="Clothing & style (AI)" chips={['Navy business suit with white shirt and tie', 'Casual white t-shirt', 'Grey hoodie', 'Denim shirt', 'Black turtleneck']}
          colors={{ list: CLOTH_COLORS, tpl: (n) => `Change the outfit colour to ${n}, keep the same style` }} />
      ) : (
        <div className="space-y-5">
          <div><Label>Outfit</Label><div className="flex flex-wrap gap-2">
            {(['suit', 'shirt', 'tshirt', 'hoodie'] as const).map((t) => <Chip key={t} active={c.topStyle === t} onClick={() => ch('topStyle', t)} testId={`top-${t}`}>{t === 'tshirt' ? 'T-shirt' : t[0].toUpperCase() + t.slice(1)}</Chip>)}
          </div></div>
          <div><Label>Top colour</Label><Swatches colors={CLOTH_COLORS} value={c.topColor} onPick={(v) => ch('topColor', v)} testId="top-color" /></div>
          <div><Label>Bottom colour</Label><Swatches colors={CLOTH_COLORS} value={c.bottomColor} onPick={(v) => ch('bottomColor', v)} testId="bottom-color" /></div>
          {c.topStyle === 'suit' && <div><Label>Tie colour</Label><Swatches colors={CLOTH_COLORS} value={c.tieColor} onPick={(v) => ch('tieColor', v)} testId="tie-color" /></div>}
        </div>
      );
    case 'accessories':
      return isPhoto ? (
        <AIBlock title="Accessories (AI)" chips={['Add thin modern eyeglasses', 'Remove eyeglasses', 'Add a smart wristwatch', 'Add small stud earrings', 'Add a baseball cap']} />
      ) : (
        <div className="space-y-4">
          {([['glasses', 'Glasses'], ['earrings', 'Earrings'], ['hat', 'Hat']] as const).map(([k, l]) => (
            <div key={k} className="flex items-center justify-between"><span className="text-sm text-slate-700">{l}</span>
              <Switch checked={c[k]} onCheckedChange={(v) => ch(k, v)} data-testid={`acc-${k}`} /></div>
          ))}
        </div>
      );
    case 'background':
      return (
        <div className="space-y-4">
          <Label>3D stage background</Label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(BACKGROUNDS).map(([k, b]) => (
              <button key={k} type="button" onClick={() => update({ background: k })} data-testid={`bg-${k}`}
                className={`h-12 rounded-xl border-2 text-[10px] font-semibold flex items-end justify-center pb-1 ${config.background === k ? 'border-violet-600' : 'border-transparent'}`}
                style={{ background: b.css, color: k === 'night' || k === 'brand' ? '#fff' : '#334155' }}>{b.label}</button>
            ))}
          </div>
          {isPhoto && <AIBlock title="Photo background (AI)" chips={['Replace the background with a modern office', 'Replace the background with a plain light grey studio', 'Replace the background with a city skyline']} />}
        </div>
      );
    case 'photo':
      if (!isPhoto) return <p className="text-sm text-slate-500">Colour & light controls apply to photo avatars. Switch to a preset or upload to use them.</p>;
      return (
        <div className="space-y-4">
          {([['brightness', 'Brightness', 50, 150], ['contrast', 'Contrast', 50, 150], ['saturation', 'Colour intensity', 0, 200], ['hue', 'Colour shift', -180, 180], ['warmth', 'Warmth', -100, 100]] as const).map(([k, l, min, max]) => (
            <div key={k}><Label>{l} · {config.photo[k]}</Label>
              <Slider value={[config.photo[k]]} min={min} max={max} step={1} onValueChange={([v]) => updatePhoto({ [k]: v })} data-testid={`photo-${k}`} /></div>
          ))}
          <button type="button" onClick={() => updatePhoto(DEFAULT_PHOTO)} className="inline-flex items-center gap-1 text-xs text-violet-700 font-medium" data-testid="photo-reset"><RotateCcw className="w-3 h-3" /> Reset colours</button>
        </div>
      );
    case 'advanced':
      return (
        <div className="space-y-4">
          {isPhoto ? (
            <>
              <Label>Describe any change</Label>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} data-testid="ai-prompt"
                placeholder="e.g. wear a black leather jacket and smile"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              <button type="button" disabled={!prompt.trim() || aiBusy} onClick={() => runAI(prompt.trim())} data-testid="ai-prompt-apply"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50">
                {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : canAI ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />} Apply with AI
              </button>
            </>
          ) : <p className="text-sm text-slate-500">Your 3D character updates live. Use Body, Face, Hair, Clothing and Accessories to fine-tune every detail.</p>}
          <button type="button" onClick={() => update({ photo: DEFAULT_PHOTO, background: 'studio' })} className="text-xs text-slate-500 underline">Reset look</button>
        </div>
      );
    case 'voice':
      return (
        <div className="flex flex-wrap gap-2">
          {VOICES.map((v) => <Chip key={v.id} active={config.voice === v.id} onClick={() => update({ voice: v.id })} testId={`voice-${v.id}`}>{v.label}</Chip>)}
        </div>
      );
    case 'expression':
      return (
        <div className="flex flex-wrap gap-2">
          {EXPRESSIONS.map((v) => <Chip key={v.id} active={config.expression === v.id} onClick={() => update({ expression: v.id })} testId={`persona-${v.id}`}>{v.label}</Chip>)}
        </div>
      );
    default:
      return null;
  }
};

export default AvatarEditorPanel;
