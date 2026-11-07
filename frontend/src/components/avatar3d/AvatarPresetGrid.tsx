import React, { useEffect, useMemo, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { AvatarStyle, PresetAvatar, fetchRealisticPresets, presetsForStyle } from '@/lib/avatar/presets';

type Filter = 'all' | 'male' | 'female' | 'professional' | 'casual';

interface Props {
  style: AvatarStyle;
  selectedId: string | null;
  onSelect: (p: PresetAvatar) => void;
  onStyleChange?: (s: AvatarStyle) => void;
  showStyleTabs?: boolean;
  columns?: string;
  limit?: number;
  compact?: boolean;
}

export const STYLE_LABELS: Record<AvatarStyle, string> = { realistic: 'Realistic', cartoon: 'Cartoon', anime: 'Anime' };

const AvatarPresetGrid: React.FC<Props> = ({
  style, selectedId, onSelect, onStyleChange, showStyleTabs = true, columns = 'grid-cols-3', limit, compact,
}) => {
  const [realistic, setRealistic] = useState<PresetAvatar[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [shuffle, setShuffle] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { fetchRealisticPresets().then(setRealistic); }, []);

  const list = useMemo(() => {
    let l = presetsForStyle(style, realistic);
    if (filter === 'male' || filter === 'female') l = l.filter((p) => p.gender === filter);
    else if (filter !== 'all') l = l.filter((p) => p.category === filter);
    if (shuffle) l = [...l].sort((a, b) => ((a.id.charCodeAt(0) * shuffle) % 7) - ((b.id.charCodeAt(1) * shuffle) % 7));
    const max = showAll ? l.length : limit ?? 9;
    return l.slice(0, max);
  }, [style, realistic, filter, shuffle, showAll, limit]);

  return (
    <div className="space-y-3" data-testid="avatar-preset-grid">
      {showStyleTabs && onStyleChange && (
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          {(Object.keys(STYLE_LABELS) as AvatarStyle[]).map((s) => (
            <button key={s} type="button" onClick={() => onStyleChange(s)} data-testid={`style-tab-${s}`}
              className={`py-1.5 text-xs font-semibold rounded-lg transition ${style === s ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>
              {STYLE_LABELS[s]}
            </button>
          ))}
        </div>
      )}
      {!compact && (
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {(['all', 'male', 'female', 'professional', 'casual'] as Filter[]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} data-testid={`preset-filter-${f}`}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap font-medium ${filter === f ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:text-slate-900'}`}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}
      <div className={`grid ${columns} gap-2.5`}>
        {list.map((p) => {
          const active = selectedId === p.id;
          return (
            <button key={p.id} type="button" onClick={() => onSelect(p)} data-testid={`preset-${p.id}`}
              className={`relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-violet-600 shadow-violet-200 shadow-lg' : 'border-transparent'}`}>
              <img src={p.image_url} alt={p.label} loading="lazy" className="w-full h-full object-cover object-top" />
              {active && <span className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center"><Check className="w-3 h-3" /></span>}
            </button>
          );
        })}
        {list.length === 0 && <p className="col-span-full text-sm text-slate-500 py-6 text-center">Loading avatars…</p>}
      </div>
      {!compact && (
        <button type="button" onClick={() => { setShuffle((s) => s + 1); setShowAll(true); }} data-testid="regenerate-avatars"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100">
          <RefreshCw className="w-4 h-4" /> Regenerate More Avatars
        </button>
      )}
    </div>
  );
};

export default AvatarPresetGrid;
