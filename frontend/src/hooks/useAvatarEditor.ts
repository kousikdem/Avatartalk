import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import {
  AvatarConfig, CharacterConfig, DEFAULT_CONFIG, DEFAULT_PHOTO, PhotoAdjust,
  imageToBase64, loadLocalConfig, loadRemoteConfig, saveAvatarEverywhere, saveLocalConfig, uploadAvatarBlob,
} from '@/lib/avatar/avatarConfig';
import { fetchRealisticPresets } from '@/lib/avatar/presets';

const API_BASE = (import.meta.env.VITE_BACKEND_URL as string) || '';

/** Editable avatar state with undo/redo, AI edits and "save everywhere". */
export function useAvatarEditor() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AvatarConfig>(() => loadLocalConfig(user?.id) || DEFAULT_CONFIG);
  const past = useRef<AvatarConfig[]>([]);
  const future = useRef<AvatarConfig[]>([]);
  const [, force] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (!user || loaded.current) return;
    loaded.current = true;
    const local = loadLocalConfig(user.id);
    if (local) setConfig(local);
    loadRemoteConfig(user.id).then(async (remote) => {
      if (remote && !local) { setConfig(remote); return; }
      if (local?.imageUrl || local?.mode === 'character') return;
      // nothing chosen yet → start from the current profile picture or the first realistic preset
      const { data } = await supabase.from('profiles').select('avatar_url, profile_pic_url').eq('id', user.id).maybeSingle();
      const current = (data as any)?.profile_pic_url || (data as any)?.avatar_url;
      if (current) { setConfig((c) => ({ ...c, imageUrl: current, mode: 'photo' })); return; }
      const presets = await fetchRealisticPresets();
      if (presets[0]) setConfig((c) => ({ ...c, imageUrl: presets[0].image_url, presetId: presets[0].id, label: presets[0].label }));
    });
  }, [user]);

  // keep a draft locally so onboarding <-> studio share the same edits
  useEffect(() => { if (user) saveLocalConfig(user.id, config); }, [config, user]);

  const update = useCallback((patch: Partial<AvatarConfig> | ((c: AvatarConfig) => Partial<AvatarConfig>)) => {
    setConfig((prev) => {
      const p = typeof patch === 'function' ? patch(prev) : patch;
      past.current = [...past.current.slice(-49), prev];
      future.current = [];
      return { ...prev, ...p };
    });
    force((n) => n + 1);
  }, []);

  const updateCharacter = useCallback((p: Partial<CharacterConfig>) =>
    update((c) => ({ character: { ...c.character, ...p } })), [update]);
  const updatePhoto = useCallback((p: Partial<PhotoAdjust>) =>
    update((c) => ({ photo: { ...c.photo, ...p } })), [update]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    setConfig((cur) => { future.current.push(cur); return prev; });
    force((n) => n + 1);
  }, []);
  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    setConfig((cur) => { past.current.push(cur); return next; });
    force((n) => n + 1);
  }, []);

  /** Realistic photo edit with AI (outfit, colour, body style, hair…). */
  const aiEdit = useCallback(async (instruction: string) => {
    if (!user) throw new Error('Please sign in');
    if (!config.imageUrl) throw new Error('Pick an avatar first');
    setAiBusy(true);
    try {
      const image_b64 = await imageToBase64(config.imageUrl, 768);
      const { data } = await supabase.auth.getSession();
      const r = await fetch(`${API_BASE}/api/avatar/ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` },
        body: JSON.stringify({ image_b64, instruction, style: config.style }),
      });
      const res = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(res.detail || 'AI edit failed');
      const bin = Uint8Array.from(atob(res.image_b64), (ch) => ch.charCodeAt(0));
      const url = await uploadAvatarBlob(user.id, new Blob([bin], { type: 'image/png' }), 'png');
      update({ imageUrl: url, presetId: null, photo: DEFAULT_PHOTO, mode: 'photo' });
      return url;
    } finally {
      setAiBusy(false);
    }
  }, [user, config.imageUrl, config.style, update]);

  const save = useCallback(async (snapshot?: () => Promise<Blob | null>) => {
    if (!user) throw new Error('Please sign in');
    setSaving(true);
    try {
      return await saveAvatarEverywhere(user.id, config, snapshot);
    } finally {
      setSaving(false);
    }
  }, [user, config]);

  const upload = useCallback(async (file: File) => {
    if (!user) throw new Error('Please sign in');
    if (!/^image\//.test(file.type)) throw new Error('Please choose an image');
    if (file.size > 10 * 1024 * 1024) throw new Error('Max 10MB');
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const url = await uploadAvatarBlob(user.id, file, ext);
    update({ imageUrl: url, presetId: null, mode: 'photo', photo: DEFAULT_PHOTO, label: 'My photo' });
    return url;
  }, [user, update]);

  return {
    config, update, updateCharacter, updatePhoto, undo, redo,
    canUndo: past.current.length > 0, canRedo: future.current.length > 0,
    aiEdit, aiBusy, save, saving, upload,
  };
}

export type AvatarEditor = ReturnType<typeof useAvatarEditor>;
