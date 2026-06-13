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

  // Live-probe Razorpay credentials.
  if (keyId && keySecret) {
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const probe = await fetch(
        'https://api.razorpay.com/v1/payments?count=1',
        {
          method: 'GET',
          headers: { Authorization: `Basic ${auth}` },
        },
      );
      if (probe.status === 200) {
        diag.razorpay_auth_ok = true;
      } else if (probe.status === 401) {
        try {
          const body = (await probe.json()) as RazorpayErrorBody;
          diag.razorpay_auth_error =
            body?.error?.description || 'Authentication failed (401)';
        } catch {
          diag.razorpay_auth_error = 'Authentication failed (401)';
        }
      } else {
        diag.razorpay_auth_error = `HTTP ${probe.status}`;
      }
    } catch (e: unknown) {
      const name = e instanceof Error ? e.constructor.name : 'Error';
      diag.razorpay_auth_error = `Network error: ${name}`;
    }
  }

  diag.ready = diag.razorpay_auth_ok && diag.supabase_service_role_configured;

  res.status(200).json(diag);
}
