/**
 * Lightweight public profile cache.
 *
 * Public profile pages are visited frequently (a creator's own dashboard
 * link, social shares, referral links). The Supabase round-trip is
 * ~150-300ms even for the SECURITY DEFINER RPC. Caching the result in
 * sessionStorage for 60s makes second-visit / back-button navigation
 * feel instant without risking stale data across sessions.
 *
 * sessionStorage (not localStorage) because:
 *   - cache resets when the tab/window closes — keeps data fresh
 *   - one cache per tab so a creator editing their profile in another tab
 *     doesn't see stale data on this tab forever
 */

const TTL_MS = 60_000;
const KEY_PREFIX = 'avt.profile.v1.';

interface CachedEntry<T> {
  ts: number;
  data: T;
}

function safeGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value);
  } catch {
    /* quota / private mode — silently skip */
  }
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readProfileCache<T = unknown>(username: string): T | null {
  if (!username) return null;
  const raw = safeGet(KEY_PREFIX + username.toLowerCase());
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedEntry<T>;
    if (Date.now() - parsed.ts > TTL_MS) {
      safeRemove(KEY_PREFIX + username.toLowerCase());
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeProfileCache<T = unknown>(username: string, data: T): void {
  if (!username || !data) return;
  const entry: CachedEntry<T> = { ts: Date.now(), data };
  safeSet(KEY_PREFIX + username.toLowerCase(), JSON.stringify(entry));
}

export function clearProfileCache(username?: string): void {
  if (!username) {
    // Clear all profile cache entries (e.g. on logout)
    try {
      if (typeof window === 'undefined') return;
      const ss = window.sessionStorage;
      const toDelete: string[] = [];
      for (let i = 0; i < ss.length; i++) {
        const k = ss.key(i);
        if (k && k.startsWith(KEY_PREFIX)) toDelete.push(k);
      }
      toDelete.forEach((k) => ss.removeItem(k));
    } catch {
      /* ignore */
    }
    return;
  }
  safeRemove(KEY_PREFIX + username.toLowerCase());
}
