// Single source of truth for an avatar's editable configuration and the
// "save everywhere" pipeline (storage upload -> profiles row -> live event).
import { supabase } from '@/integrations/supabase/client';
import type { AvatarStyle } from './presets';

export type AvatarMode = 'photo' | 'character';

export interface PhotoAdjust {
  brightness: number; // 50..150
  contrast: number;   // 50..150
  saturation: number; // 0..200
  hue: number;        // -180..180
  warmth: number;     // -100..100
}

export interface CharacterConfig {
  gender: 'male' | 'female';
  bodyType: 'slim' | 'average' | 'athletic' | 'heavy';
  height: number; // 0.9..1.1
  skinTone: string;
  hairStyle: 'short' | 'buzz' | 'long' | 'curly' | 'bun' | 'ponytail' | 'bald';
  hairColor: string;
  eyeColor: string;
  expression: 'smile' | 'neutral' | 'happy' | 'serious';
  beard: boolean;
  topStyle: 'tshirt' | 'hoodie' | 'shirt' | 'suit';
  topColor: string;
  bottomColor: string;
  tieColor: string;
  glasses: boolean;
  earrings: boolean;
  hat: boolean;
}

export interface AvatarConfig {
  mode: AvatarMode;
  style: AvatarStyle;
  imageUrl: string;
  presetId: string | null;
  label: string;
  photo: PhotoAdjust;
  background: string; // key of BACKGROUNDS
  character: CharacterConfig;
  voice: string;
  expression: string;
}

export const DEFAULT_PHOTO: PhotoAdjust = { brightness: 100, contrast: 100, saturation: 100, hue: 0, warmth: 0 };

export const DEFAULT_CHARACTER: CharacterConfig = {
  gender: 'male', bodyType: 'average', height: 1, skinTone: '#c68863', hairStyle: 'short',
  hairColor: '#2b1d14', eyeColor: '#4a2f1b', expression: 'smile', beard: false,
  topStyle: 'suit', topColor: '#1f2a44', bottomColor: '#23262f', tieColor: '#111827',
  glasses: false, earrings: false, hat: false,
};

export const DEFAULT_CONFIG: AvatarConfig = {
  mode: 'photo', style: 'realistic', imageUrl: '', presetId: null, label: 'My Avatar',
  photo: DEFAULT_PHOTO, background: 'studio', character: DEFAULT_CHARACTER,
  voice: 'male_natural', expression: 'friendly',
};

export const BACKGROUNDS: Record<string, { label: string; css: string; stops: string[] }> = {
  studio: { label: 'Studio', css: 'linear-gradient(160deg,#f4f4f7 0%,#d9dae2 100%)', stops: ['#f4f4f7', '#d9dae2'] },
  lavender: { label: 'Lavender', css: 'linear-gradient(160deg,#efeaff 0%,#c9bdfd 100%)', stops: ['#efeaff', '#c9bdfd'] },
  ocean: { label: 'Ocean', css: 'linear-gradient(160deg,#dff3ff 0%,#7cc4f5 100%)', stops: ['#dff3ff', '#7cc4f5'] },
  sunset: { label: 'Sunset', css: 'linear-gradient(160deg,#ffe8d6 0%,#f7a07c 100%)', stops: ['#ffe8d6', '#f7a07c'] },
  mint: { label: 'Mint', css: 'linear-gradient(160deg,#e3fbef 0%,#86dcb0 100%)', stops: ['#e3fbef', '#86dcb0'] },
  night: { label: 'Night', css: 'linear-gradient(160deg,#2b2f4a 0%,#0e1022 100%)', stops: ['#2b2f4a', '#0e1022'] },
  brand: { label: 'Brand', css: 'linear-gradient(135deg,#6d5dfc 0%,#3b5bfd 100%)', stops: ['#6d5dfc', '#3b5bfd'] },
  white: { label: 'White', css: '#ffffff', stops: ['#ffffff', '#ffffff'] },
};

export const SKIN_TONES = ['#f6d7c3', '#eac2a4', '#d9a37e', '#c68863', '#a86b45', '#8a5433', '#6b3e24', '#4a2a17'];
export const HAIR_COLORS = ['#111111', '#2b1d14', '#5a3825', '#8b5a2b', '#c9a15b', '#e6cf8f', '#b8b8b8', '#a33a2c', '#6d5dfc', '#e57ab3'];
export const EYE_COLORS = ['#4a2f1b', '#6b4423', '#2f6f4f', '#3b6ea8', '#6b7c8a', '#111111'];
export const CLOTH_COLORS = ['#1f2a44', '#111827', '#374151', '#9ca3af', '#ffffff', '#6d5dfc', '#2563eb', '#059669', '#dc2626', '#f59e0b', '#ec4899', '#a16207'];

export const isPhotoAdjusted = (p: PhotoAdjust) =>
  p.brightness !== 100 || p.contrast !== 100 || p.saturation !== 100 || p.hue !== 0 || p.warmth !== 0;

const LS_KEY = (uid?: string) => `avatartalk.avatarConfig.${uid || 'anon'}`;

export function mergeConfig(raw: Partial<AvatarConfig> | null | undefined): AvatarConfig {
  const r = raw || {};
  return {
    ...DEFAULT_CONFIG,
    ...r,
    photo: { ...DEFAULT_PHOTO, ...(r.photo || {}) },
    character: { ...DEFAULT_CHARACTER, ...(r.character || {}) },
  } as AvatarConfig;
}

export function loadLocalConfig(uid?: string): AvatarConfig | null {
  try {
    const s = localStorage.getItem(LS_KEY(uid));
    return s ? mergeConfig(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

export function saveLocalConfig(uid: string | undefined, cfg: AvatarConfig) {
  try { localStorage.setItem(LS_KEY(uid), JSON.stringify(cfg)); } catch { /* quota */ }
}

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';

export async function loadRemoteConfig(uid: string): Promise<AvatarConfig | null> {
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/public/avatars/uploads/${uid}/avatar-config.json?t=${Date.now()}`);
    if (!r.ok) return null;
    return mergeConfig(await r.json());
  } catch {
    return null;
  }
}

export async function uploadAvatarBlob(uid: string, blob: Blob, ext = 'png'): Promise<string> {
  const path = `uploads/${uid}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    upsert: true, contentType: blob.type || `image/${ext}`,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

/** Draws an image with colour adjustments onto a canvas (used for 3D texture + export). */
export function renderAdjustedCanvas(img: HTMLImageElement, p: PhotoAdjust, maxSize = 1024): HTMLCanvasElement {
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const w = Math.max(1, Math.round((img.naturalWidth || 512) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || 512) * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.filter = `brightness(${p.brightness}%) contrast(${p.contrast}%) saturate(${p.saturation}%) hue-rotate(${p.hue}deg)`;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = 'none';
  if (p.warmth !== 0) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = Math.min(0.6, Math.abs(p.warmth) / 160);
    ctx.fillStyle = p.warmth > 0 ? '#ff8a3d' : '#3d8bff';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  return c;
}

export const canvasToBlob = (c: HTMLCanvasElement, type = 'image/png', q = 0.92) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Export failed'))), type, q));

/** Downscaled JPEG base64 (no prefix) – used to send an image to the AI editor. */
export async function imageToBase64(src: string, max = 768): Promise<string> {
  const img = await loadImage(src);
  const c = renderAdjustedCanvas(img, DEFAULT_PHOTO, max);
  return c.toDataURL('image/jpeg', 0.9).split(',')[1];
}

export const AVATAR_EVENT = 'avatartalk:avatar-updated';

/**
 * Persist the avatar everywhere at once:
 *  1. produce final image (snapshot for 3D character, adjusted photo, or preset)
 *  2. upload to Supabase Storage
 *  3. update profiles.avatar_url + profile_pic_url (public profile, header, chat…)
 *  4. persist config JSON (local + storage) and broadcast a live event
 */
export async function saveAvatarEverywhere(
  uid: string,
  cfg: AvatarConfig,
  snapshot?: () => Promise<Blob | null>,
): Promise<string> {
  let url = cfg.imageUrl;
  if (cfg.mode === 'character') {
    const blob = snapshot ? await snapshot() : null;
    if (!blob) throw new Error('Could not capture the 3D avatar');
    url = await uploadAvatarBlob(uid, blob, 'png');
  } else {
    if (!cfg.imageUrl) throw new Error('Pick an avatar first');
    const isLocal = cfg.imageUrl.startsWith('/') || cfg.imageUrl.startsWith(window.location.origin);
    if (isPhotoAdjusted(cfg.photo) || isLocal) {
      const img = await loadImage(cfg.imageUrl);
      const canvas = renderAdjustedCanvas(img, cfg.photo, 1024);
      url = await uploadAvatarBlob(uid, await canvasToBlob(canvas, 'image/jpeg', 0.92), 'jpg');
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url, profile_pic_url: url, updated_at: new Date().toISOString() } as any)
    .eq('id', uid);
  if (error) throw new Error(error.message);

  const saved = { ...cfg, savedUrl: url } as AvatarConfig & { savedUrl: string };
  saveLocalConfig(uid, saved);
  try {
    await supabase.storage.from('avatars').upload(
      `uploads/${uid}/avatar-config.json`,
      new Blob([JSON.stringify(saved)], { type: 'application/json' }),
      { upsert: true, contentType: 'application/json' },
    );
  } catch { /* non-fatal */ }

  window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: { url } }));
  return url;
}
