import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { AVATAR_EVENT } from '@/lib/avatar/avatarConfig';

export interface MiniProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  full_name: string | null;
  bio: string | null;
  profession: string | null;
  avatar: string | null;
  token_balance: number;
  followers_count: number;
  following_count: number;
}

/** Live profile basics (name, avatar, tokens) shared by header, sidebar and dashboard. */
export function useProfileAvatar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MiniProfile | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, full_name, bio, profession, avatar_url, profile_pic_url, token_balance, followers_count, following_count')
      .eq('id', user.id)
      .maybeSingle();
    if (data) {
      const d: any = data;
      setProfile({
        id: d.id, username: d.username, display_name: d.display_name, full_name: d.full_name,
        bio: d.bio, profession: d.profession, avatar: d.profile_pic_url || d.avatar_url || null,
        token_balance: d.token_balance || 0, followers_count: d.followers_count || 0,
        following_count: d.following_count || 0,
      });
    }
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const onEvt = (e: Event) => {
      const url = (e as CustomEvent).detail?.url;
      if (url) setProfile((p) => (p ? { ...p, avatar: url } : p));
      load();
    };
    window.addEventListener(AVATAR_EVENT, onEvt);
    window.addEventListener('avatartalk:profile-updated', load);
    const ch = supabase
      .channel(`mini-profile-${user.id}-${Math.random().toString(36).slice(2, 7)}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => {
      window.removeEventListener(AVATAR_EVENT, onEvt);
      window.removeEventListener('avatartalk:profile-updated', load);
      supabase.removeChannel(ch);
    };
  }, [user, load]);

  return { profile, reload: load, user };
}
