/**
 * Shared helpers for Vercel serverless API routes.
 *
 * These run in Node.js on Vercel. They are the server-side counterpart
 * to the Vite SPA's `lib/payment-api.ts` and `components/ProfilePage.tsx`
 * calls. By keeping them in the same git repo as the frontend, every
 * `git push origin main` deploys both halves atomically — no separate
 * Supabase CLI step required.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Node < 22 doesn't have a native global WebSocket, but
 * @supabase/realtime-js@2.106+ requires one when RealtimeClient is
 * constructed. Vercel runs Node 22+ in production so this branch is a
 * no-op there; locally (Node 20) we polyfill from the `ws` package.
 *
 * IMPORTANT: must be a sync `require()` inside a function — NOT a
 * top-level `await import()` — because Vercel's @vercel/node runtime
 * compiles to CommonJS and top-level await causes
 * FUNCTION_INVOCATION_FAILED on every request.
 */
function ensureWebSocketPolyfill(): void {
  if (typeof (globalThis as any).WebSocket !== 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require('ws');
    (globalThis as any).WebSocket = ws.WebSocket || ws.default || ws;
  } catch {
    /* ws not installed — production Node 22+ path */
  }
}

/** ---------- CORS ---------- */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  // The frontend lives on the same Vercel domain so technically we don't
  // need CORS, but we still set permissive headers so /api/* is callable
  // from local dev (vite on :3000) and the Emergent preview.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // request handled
  }
  return false;
}

/** ---------- Supabase clients ---------- */
let _admin: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  ensureWebSocketPolyfill();
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL env var is missing');
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY env var is missing. Get it from ' +
        'Supabase Dashboard → Settings → API → service_role → Reveal',
    );
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

export function getSupabaseAnon(): SupabaseClient {
  if (_anon) return _anon;
  ensureWebSocketPolyfill();
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase anon credentials missing');
  }
  _anon = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _anon;
}

/** ---------- Auth helper ---------- */
export async function getAuthenticatedUser(
  req: VercelRequest,
): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  // Verify via the admin client so we don't need RLS — getUser() with a
  // JWT validates the signature and returns the user record if valid.
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}

/** ---------- Razorpay helpers ---------- */
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

interface RazorpayErrorBody {
  error?: { code?: string; description?: string; reason?: string };
}

export async function createRazorpayOrder(opts: {
  amount: number; // in paise
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET env vars missing on Vercel. ' +
        'Set them under Project Settings → Environment Variables.',
    );
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const resp = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: Math.round(opts.amount),
      currency: opts.currency,
      receipt: opts.receipt,
      notes: opts.notes,
    }),
  });

  if (resp.ok) {
    return (await resp.json()) as RazorpayOrder;
  }

  // ── Razorpay returned non-2xx ──
  let detail = `Razorpay returned HTTP ${resp.status}`;
  try {
    const body = (await resp.json()) as RazorpayErrorBody;
    detail =
      body?.error?.description ||
      body?.error?.reason ||
      body?.error?.code ||
      detail;
  } catch {
    /* non-JSON body */
  }

  // Surface the real Razorpay error to the caller so the UI can show
  // an accurate message (e.g. "Authentication failed" when keys are
  // invalid). No demo-mode fallback — payments must go through real
  // Razorpay or fail loudly.
  throw new Error(detail);
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  // constant-time compare
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  } catch {
    return false;
  }
}

/** ---------- Standard error responder ---------- */
export function sendError(
  res: VercelResponse,
  status: number,
  error: string,
  details?: unknown,
): void {
  res.status(status).json({
    success: false,
    error,
    ...(details ? { details } : {}),
  });
}
