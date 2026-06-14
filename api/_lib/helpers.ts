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

/**
 * Tiny sleep helper (Promise-based setTimeout).
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Heuristic — does this Razorpay error description look like a
 * transient gateway hiccup we should retry, vs a real validation
 * failure (bad amount, bad currency, etc.) we should surface
 * immediately?
 *
 * Mirrors the FastAPI-side `_create_razorpay_order` logic in
 * `/app/backend/payment_routes.py` so both backends behave the same
 * way against the same flaky test keys.
 */
function isTransientRazorpayError(message: string, status: number): boolean {
  const msg = (message || '').toLowerCase();
  if (
    msg.includes('authentication failed') ||
    msg.includes('api key') ||
    msg.includes('try again') ||
    msg.includes('temporarily') ||
    msg.includes('timeout')
  ) {
    return true;
  }
  // Treat 5xx and 408/429 as transient too.
  if (status >= 500 || status === 408 || status === 429) return true;
  return false;
}

export async function createRazorpayOrder(opts: {
  amount: number; // in paise
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
  maxAttempts?: number;
}): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET env vars missing on Vercel. ' +
        'Set them under Project Settings → Environment Variables.',
    );
  }

  const maxAttempts = Math.max(1, opts.maxAttempts ?? 4);
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const requestBody = JSON.stringify({
    amount: Math.round(opts.amount),
    currency: opts.currency,
    receipt: opts.receipt,
    notes: opts.notes,
  });

  let lastError = `Razorpay order create failed after ${maxAttempts} attempts`;
  let lastStatus = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let resp: Response;
    try {
      resp = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: requestBody,
      });
    } catch (e: any) {
      // Network-layer failure — retry with backoff.
      lastError = e?.message || 'Network error talking to Razorpay';
      if (attempt < maxAttempts) {
        console.warn(
          `[razorpay] network error (attempt ${attempt}/${maxAttempts}): ${lastError} — retrying`,
        );
        await sleep(400 * attempt);
        continue;
      }
      throw new Error(lastError);
    }

    if (resp.ok) {
      return (await resp.json()) as RazorpayOrder;
    }

    // ── Razorpay returned non-2xx ──
    lastStatus = resp.status;
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
    lastError = detail;

    if (attempt < maxAttempts && isTransientRazorpayError(detail, resp.status)) {
      console.warn(
        `[razorpay] transient ${resp.status} (attempt ${attempt}/${maxAttempts}): ${detail} — retrying`,
      );
      await sleep(400 * attempt);
      continue;
    }

    // Non-retryable, or out of attempts. Surface the real reason so
    // the UI can show an accurate message (e.g. "Authentication
    // failed" when keys are invalid). No demo-mode fallback —
    // payments must go through real Razorpay or fail loudly.
    throw new Error(detail);
  }

  // Defensive — loop should always either return or throw.
  throw new Error(`${lastError} (HTTP ${lastStatus})`);
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
