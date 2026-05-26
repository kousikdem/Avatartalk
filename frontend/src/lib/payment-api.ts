/**
 * Payment + profile API helper — calls Vercel serverless API routes.
 *
 * Architecture
 * ------------
 * AvatarTalk's production deploys live on Vercel. The serverless routes
 * under `/api/*` are co-located with the Vite SPA so a single
 * `git push origin main` deploys both halves atomically — no separate
 * Supabase CLI step required.
 *
 *  Frontend (Vite)              → calls `fetch('/api/payment/...')`
 *  Vercel Serverless (Node 18)  → /api/payment/...  &  /api/profile/...
 *  Razorpay REST API            → ←─ orders.create + signature verify
 *  Supabase (service role)      → ←─ persist purchases, credit tokens
 *
 * Why not Supabase Edge Functions?
 *  Those required a separate CLI deploy step (`supabase functions
 *  deploy ...`) and made every fix a two-place release. Vercel routes
 *  ship in the same commit as the frontend.
 *
 * Why not the FastAPI in /app/backend?
 *  That backend is only reachable in the Emergent preview via the
 *  Kubernetes ingress. On Vercel its URLs returned the SPA HTML shell
 *  (because of the old catch-all rewrite) and poisoned every JSON
 *  parse downstream.
 */
import { supabase } from '@/integrations/supabase/client';

function apiBase(): string {
  // Same-origin in production (`https://avatartalk.co`) and in the
  // Vercel preview. Also works in Emergent preview (localhost:3000).
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export interface PaymentApiError extends Error {
  status?: number;
  details?: unknown;
}

function makeError(message: string, status?: number, details?: unknown): PaymentApiError {
  const e = new Error(message) as PaymentApiError;
  e.status = status;
  e.details = details;
  return e;
}

async function readErrorMessage(res: Response): Promise<string> {
  // Try JSON first
  const text = await res.text();
  if (!text) return `HTTP ${res.status}`;
  try {
    const body = JSON.parse(text);
    return (
      body?.error ||
      body?.message ||
      body?.detail ||
      body?.error_description ||
      text
    );
  } catch {
    // Probably HTML (SPA shell). Don't echo a 5kb document into a toast.
    if (text.trim().startsWith('<')) {
      return `HTTP ${res.status} — API route not deployed yet. Push to main on Vercel.`;
    }
    return text.slice(0, 240);
  }
}

export async function callPaymentApi<T = any>(
  path: string,
  body: unknown,
): Promise<T> {
  const base = apiBase();
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
  };

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers,
    credentials: 'same-origin',
    body: JSON.stringify(body || {}),
  });

  if (!res.ok) {
    const reason = await readErrorMessage(res);
    throw makeError(reason, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw makeError('Server returned an empty response', res.status);
  }
}

/**
 * GET /api/profile/by-username/:username
 *
 * Returns null if the profile doesn't exist (404), throws on every
 * other error so the caller can show a real diagnostic.
 */
export async function fetchPublicProfile(username: string): Promise<any | null> {
  const base = apiBase();
  const res = await fetch(
    `${base}/api/profile/by-username/${encodeURIComponent(username)}`,
    { method: 'GET', credentials: 'omit' },
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    const reason = await readErrorMessage(res);
    throw makeError(reason, res.status);
  }

  const body = await res.json();
  if (!body?.profile) return null;
  return body;
}
