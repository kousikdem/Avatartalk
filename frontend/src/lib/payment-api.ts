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

/**
 * Optional override for the payment API base URL.
 *
 * When `VITE_PAYMENT_API_BASE` is set at build time, every
 * `/api/payment/*` request is routed there instead of `window.location.origin`.
 * This is an opt-in escape hatch — useful if Vercel's serverless
 * functions ever break or need to be bypassed.
 *
 * Default behaviour (empty string) → same-origin, i.e.
 *   • Production:        `https://avatartalk.co/api/payment/*` → Vercel serverless
 *   • Emergent preview:  routed by Kubernetes ingress to FastAPI on port 8001
 *   • Local dev:         Vite dev proxy or Vercel CLI
 */
const PAYMENT_API_BASE_OVERRIDE: string =
  ((import.meta as any)?.env?.VITE_PAYMENT_API_BASE as string | undefined) ||
  ((import.meta as any)?.env?.VITE_BACKEND_API_URL as string | undefined) ||
  '';

function apiBase(): string {
  // Same-origin in production (`https://avatartalk.co`) and in the
  // Vercel preview. Also works in Emergent preview (localhost:3000).
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/**
 * Base URL used specifically for `/api/payment/*` endpoints. Falls back
 * to same-origin (`apiBase()`) when the override env var is unset.
 */
function paymentApiBase(): string {
  if (PAYMENT_API_BASE_OVERRIDE) return PAYMENT_API_BASE_OVERRIDE.replace(/\/+$/, '');
  return apiBase();
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
    // Vercel's "FUNCTION_INVOCATION_FAILED" plain-text response. This
    // happens when a serverless function throws at top-level (e.g.
    // top-level await in CJS, missing env var at import time, etc.).
    if (text.includes('FUNCTION_INVOCATION_FAILED') || text.includes('server error has occurred')) {
      return `Server error (${res.status}). The payment service is misconfigured. Please contact support.`;
    }
    return text.slice(0, 240);
  }
}

export async function callPaymentApi<T = any>(
  path: string,
  body: unknown,
): Promise<T> {
  const base = paymentApiBase();
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
  };

  // When using an override base (cross-origin), don't send credentials —
  // CORS preflight + Authorization header is enough and matches the
  // FastAPI CORS config which uses `allow_origins=[...]` (not "*").
  const useOverride = Boolean(PAYMENT_API_BASE_OVERRIDE);

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers,
    credentials: useOverride ? 'omit' : 'same-origin',
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
