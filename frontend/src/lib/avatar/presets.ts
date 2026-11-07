// Preset avatar catalogue shared by onboarding + Avatar Studio.
// Realistic presets live in Supabase Storage (presets/index.json);
// cartoon + anime presets ship with the app under /public/avatars.

export type AvatarStyle = 'realistic' | 'cartoon' | 'anime';

export interface PresetAvatar {
  id: string;
  label: string;
  gender: 'male' | 'female' | 'other';
  category: 'professional' | 'casual' | 'creative' | 'other';
  style: AvatarStyle;
  image_url: string;
}

const local = (id: string, label: string, gender: 'male' | 'female', category: PresetAvatar['category'], style: AvatarStyle): PresetAvatar => ({
  id, label, gender, category, style, image_url: `/avatars/${id}.jpg`,
});

export const CARTOON_PRESETS: PresetAvatar[] = [
  local('cartoon_m1', 'Rohan', 'male', 'casual', 'cartoon'),
  local('cartoon_f1', 'Maya', 'female', 'casual', 'cartoon'),
  local('cartoon_m2', 'Jordan', 'male', 'professional', 'cartoon'),
  local('cartoon_f2', 'Yuna', 'female', 'casual', 'cartoon'),
  local('cartoon_m3', 'Leo', 'male', 'casual', 'cartoon'),
  local('cartoon_f3', 'Lucia', 'female', 'professional', 'cartoon'),
];

export const ANIME_PRESETS: PresetAvatar[] = [
  local('anime_m1', 'Ren', 'male', 'casual', 'anime'),
  local('anime_f1', 'Sakura', 'female', 'professional', 'anime'),
  local('anime_m2', 'Kaito', 'male', 'professional', 'anime'),
  local('anime_f2', 'Aoi', 'female', 'casual', 'anime'),
  local('anime_m3', 'Haru', 'male', 'casual', 'anime'),
  local('anime_f3', 'Mio', 'female', 'professional', 'anime'),
];

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
let realisticCache: PresetAvatar[] | null = null;

export async function fetchRealisticPresets(): Promise<PresetAvatar[]> {
  if (realisticCache) return realisticCache;
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/public/avatars/presets/index.json`);
    if (!r.ok) throw new Error('presets');
    const data = (await r.json()) as any[];
    realisticCache = (Array.isArray(data) ? data : [])
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((p) => ({
        id: p.id, label: p.label, gender: p.gender, category: p.category,
        style: 'realistic' as AvatarStyle, image_url: p.image_url,
      }));
    return realisticCache;
  } catch {
    return [];
  }
}

export function presetsForStyle(style: AvatarStyle, realistic: PresetAvatar[]): PresetAvatar[] {
  if (style === 'cartoon') return CARTOON_PRESETS;
  if (style === 'anime') return ANIME_PRESETS;
  return realistic;
}
