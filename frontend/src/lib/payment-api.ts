/**
 * Helper to call the FastAPI payment backend with the user's Supabase JWT.
 *
 * Backend URL resolution priority:
 *   1. VITE_BACKEND_URL  (Vite-native env var — set this on Vercel/prod)
 *   2. VITE_API_URL      (alias kept for compatibility with other scripts)
 *   3. window.location.origin  (works on the Emergent preview where the
 *      Kubernetes ingress routes /api/* to FastAPI on the same domain)
 */
import { supabase } from '@/integrations/supabase/client';

function resolveBackendUrl(): string {
  const env = (import.meta as any).env || {};
  const fromEnv = env.VITE_BACKEND_URL || env.VITE_API_URL;
  if (fromEnv && typeof fromEnv === 'string') return fromEnv.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export async function callPaymentApi<T = any>(path: string, body: unknown): Promise<T> {
  const backend = resolveBackendUrl();
  if (!backend) {
    throw new Error('Payment backend URL not configured. Set VITE_BACKEND_URL in your environment.');
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Please sign in to continue');
  }
  const res = await fetch(`${backend}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const reason = data?.detail || data?.error || `HTTP ${res.status}`;
    throw new Error(typeof reason === 'string' ? reason : JSON.stringify(reason));
  }
  return data as T;
}
