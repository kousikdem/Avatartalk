/**
 * GET /api/payment/diagnostics
 *
 * Read-only health check for the Vercel-side payment integration.
 * Returns NON-SENSITIVE flags so you can verify whether the Razorpay +
 * Supabase env vars are actually loaded on this deployment.
 *
 * NEVER leaks the secret. Returns:
 *   - key id PREFIX only (first 12 chars + ellipsis)
 *   - secret LENGTH only (not value)
 *   - a live `razorpay_auth_ok` flag from a no-op Razorpay API call
 *
 * Use this to debug "Failed to create order — Authentication failed"
 * toasts on production: just open
 *   https://avatartalk.co/api/payment/diagnostics
 * and inspect the returned JSON.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_lib/helpers';

interface RazorpayErrorBody {
  error?: { code?: string; description?: string; reason?: string };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const diag: Record<string, unknown> = {
    runtime: 'vercel-serverless',
    razorpay_key_id_configured: Boolean(keyId),
    razorpay_key_id_prefix: keyId ? `${keyId.slice(0, 12)}…` : null,
    razorpay_key_id_mode: keyId.startsWith('rzp_test_')
      ? 'test'
      : keyId.startsWith('rzp_live_')
      ? 'live'
      : 'unknown',
    razorpay_secret_configured: Boolean(keySecret),
    razorpay_secret_length: keySecret.length || 0,
    supabase_url_configured: Boolean(supabaseUrl),
    supabase_service_role_configured: Boolean(supabaseService),
    razorpay_auth_ok: false,
    razorpay_auth_error: null as string | null,
  };

  // Live-probe Razorpay credentials by actually creating a tiny test
  // order (₹1). This mirrors the FastAPI diagnostics endpoint — some
  // test accounts have `orders.create` but no `payments.read` scope,
  // which made the old `GET /v1/payments` probe falsely report
  // "expired". The flaky-test-key 401s are absorbed by retrying up
  // to 3 times before declaring auth dead.
  if (keyId && keySecret) {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    let lastErr: string | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const probe = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: 100,
            currency: 'INR',
            receipt: `diag_${Date.now()}_${attempt}`,
            notes: { probe: 'diagnostics' },
          }),
        });
        if (probe.status === 200 || probe.status === 201) {
          diag.razorpay_auth_ok = true;
          diag.razorpay_auth_error = null;
          lastErr = null;
          break;
        }
        try {
          const body = (await probe.json()) as RazorpayErrorBody;
          lastErr =
            body?.error?.description ||
            body?.error?.reason ||
            body?.error?.code ||
            `HTTP ${probe.status}`;
        } catch {
          lastErr = `HTTP ${probe.status}`;
        }
      } catch (e: unknown) {
        const name = e instanceof Error ? e.constructor.name : 'Error';
        lastErr = `Network error: ${name}`;
      }
      // Back off briefly before the next probe attempt.
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
    if (!diag.razorpay_auth_ok && lastErr) {
      diag.razorpay_auth_error = lastErr;
    }
  }

  diag.ready = diag.razorpay_auth_ok && diag.supabase_service_role_configured;

  res.status(200).json(diag);
}
