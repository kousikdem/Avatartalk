/**
 * POST /api/payment/token-purchase/verify
 *
 * Body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   purchase_id?: string, package_id?: string
 * }
 *
 * Verifies the Razorpay HMAC signature, credits tokens to the user's
 * balance, and marks the purchase row as 'completed'. Idempotent — if
 * the purchase is already completed, returns success without double-
 * crediting.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  getAuthenticatedUser,
  getSupabaseAdmin,
  sendError,
  verifyRazorpaySignature,
} from '../../_lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed');
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return sendError(res, 401, 'Authentication required');
  }

  const body = (req.body || {}) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    purchase_id?: string;
    package_id?: string;
    packageId?: string;
  };

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body;
  const packageId = body.package_id || body.packageId || null;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendError(res, 400, 'Missing required Razorpay fields');
  }

  // ── HMAC verify ──
  const signatureOk = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );
  if (!signatureOk) {
    return sendError(res, 400, 'Invalid payment signature');
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    return sendError(res, 500, e?.message || 'Server misconfiguration');
  }

  // ── Find the purchase row ──
  const { data: purchase, error: lookupErr } = await admin
    .from('token_purchases')
    .select('id, user_id, tokens, status, package_id')
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();

  if (lookupErr) return sendError(res, 500, lookupErr.message);

  if (!purchase) {
    return sendError(res, 404, 'Purchase record not found');
  }

  // Ensure the caller is the owner of the purchase
  if (purchase.user_id !== user.id) {
    return sendError(res, 403, 'Not allowed to verify this purchase');
  }

  // Idempotency — already completed, return success
  if (purchase.status === 'completed') {
    return res.status(200).json({
      success: true,
      tokens_credited: purchase.tokens,
      already_processed: true,
    });
  }

  // ── Credit tokens ──
  // Try the canonical RPC if it exists; fall back to direct update.
  let credited = false;
  try {
    const { error: rpcErr } = await admin.rpc('add_user_tokens', {
      p_user_id: user.id,
      p_tokens: purchase.tokens,
      p_source: 'razorpay_token_purchase',
      p_metadata: {
        razorpay_order_id,
        razorpay_payment_id,
        purchase_id: purchase.id,
        package_id: packageId ?? purchase.package_id,
      },
    });
    if (!rpcErr) credited = true;
  } catch {
    /* RPC not present — falls back below */
  }

  if (!credited) {
    // Direct increment fallback. Assumes a `user_tokens` table with a
    // `balance` column keyed on user_id. If your schema differs, adjust
    // here.
    const { data: existing } = await admin
      .from('user_tokens')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    const newBalance = (existing?.balance ?? 0) + purchase.tokens;
    const { error: upsertErr } = await admin.from('user_tokens').upsert(
      {
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (upsertErr) {
      console.error('[token verify] balance upsert failed:', upsertErr);
      return sendError(res, 500, 'Failed to credit tokens');
    }
  }

  // Mark purchase complete (idempotent)
  await admin
    .from('token_purchases')
    .update({
      status: 'completed',
      razorpay_payment_id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', purchase.id);

  return res.status(200).json({
    success: true,
    tokens_credited: purchase.tokens,
  });
}
