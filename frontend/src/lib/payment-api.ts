/**
 * Helper to call the FastAPI payment backend with the user's Supabase JWT.
 * Throws on failure with a descriptive message.
 */
import { supabase } from '@/integrations/supabase/client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

export async function callPaymentApi<T = any>(path: string, body: unknown): Promise<T> {
  if (!BACKEND_URL) {
    throw new Error('Payment backend URL not configured');
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Please sign in to continue');
  }
  const res = await fetch(`${BACKEND_URL}${path}`, {
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
