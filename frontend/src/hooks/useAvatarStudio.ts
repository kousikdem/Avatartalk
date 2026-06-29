import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AvatarPreset {
  id: string;
  label: string;
  gender: 'male' | 'female' | 'other';
  category: 'professional' | 'casual' | 'creative' | 'other';
  style: string | null;
  image_url: string;
  sort_order: number;
}

const BACKEND = (import.meta.env.REACT_APP_BACKEND_URL as string) || (window.location.origin);

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function useAvatarStudio() {
  const [presets, setPresets] = useState<AvatarPreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [quota, setQuota] = useState<{
    plan: string;
    monthly_limit: number;
    used_this_month: number;
    remaining: number;
    can_customize: boolean;
    can_upload: boolean;
  } | null>(null);

  const fetchPresets = useCallback(async () => {
    setPresetsLoading(true);
    try {
      // 1) Prefer backend (service-role, always works)
      const r = await fetch(`${BACKEND}/api/avatar/presets`);
      if (r.ok) {
        const data = await r.json();
        setPresets((data.presets || []) as AvatarPreset[]);
        return;
      }
    } catch (e) {
      // fall through
    }
    // 2) Fallback to direct Supabase
    try {
      const { data } = await supabase
        .from('avatar_presets' as any)
        .select('id,label,gender,category,style,image_url,sort_order')
        .order('sort_order');
      setPresets((data || []) as unknown as AvatarPreset[]);
    } catch (e) {
      setPresets([]);
    } finally {
      setPresetsLoading(false);
    }
  }, []);

  const fetchQuota = useCallback(async () => {
    try {
      const headers = await authHeader();
      const r = await fetch(`${BACKEND}/api/avatar/quota`, { headers });
      if (r.ok) {
        const data = await r.json();
        setQuota(data);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPresets();
    fetchQuota();
  }, [fetchPresets, fetchQuota]);

  const faceSwap = useCallback(async (userFace: File, presetId: string): Promise<{
    success: boolean;
    image_url?: string;
    error?: string;
  }> => {
    try {
      const headers = await authHeader();
      const fd = new FormData();
      fd.append('user_face', userFace);
      fd.append('preset_id', presetId);
      const r = await fetch(`${BACKEND}/api/avatar/face-swap`, {
        method: 'POST',
        headers,
        body: fd,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { success: false, error: data.detail || 'Face swap failed' };
      await fetchQuota();
      return { success: true, image_url: data.image_url };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' };
    }
  }, [fetchQuota]);

  const setProfileAvatar = useCallback(async (avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const headers = await authHeader();
      const r = await fetch(`${BACKEND}/api/avatar/set-profile`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { success: false, error: data.detail || 'Failed to save' };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' };
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<{ success: boolean; image_url?: string; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { success: false, error: 'Not signed in' };
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `uploads/${session.user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true,
        contentType: file.type || 'image/png',
      });
      if (upErr) return { success: false, error: upErr.message };
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      return { success: true, image_url: pub.publicUrl };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Upload failed' };
    }
  }, []);

  return {
    presets,
    presetsLoading,
    quota,
    refetchQuota: fetchQuota,
    faceSwap,
    setProfileAvatar,
    uploadAvatar,
  };
}
