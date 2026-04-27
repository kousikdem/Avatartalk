/**
 * Auth Cache Utility
 * Caches authentication state in localStorage to prevent loading flash
 */

export interface CachedAuthState {
  user: any | null;
  session: any | null;
  cachedAt: number;
}

const AUTH_CACHE_KEY = 'avatartalk_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached auth state
 * Returns cached data if it exists and is not expired
 */
export function getCachedAuth(): CachedAuthState | null {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;

    const data: CachedAuthState = JSON.parse(cached);
    const age = Date.now() - data.cachedAt;

    // Return cached data if less than 5 minutes old
    if (age < CACHE_DURATION) {
      return data;
    }

    // Expired, remove it
    localStorage.removeItem(AUTH_CACHE_KEY);
    return null;
  } catch (err) {
    console.error('Failed to read auth cache:', err);
    return null;
  }
}

/**
 * Save auth state to cache
 */
export function setCachedAuth(user: any | null, session: any | null): void {
  try {
    const data: CachedAuthState = {
      user,
      session,
      cachedAt: Date.now(),
    };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save auth cache:', err);
  }
}

/**
 * Clear auth cache
 */
export function clearAuthCache(): void {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
  } catch (err) {
    console.error('Failed to clear auth cache:', err);
  }
}
