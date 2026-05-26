/**
 * POST /api/payment/token-purchase/verify
 *
 * Body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   purchase_id?: string, package_id?: string
 * }
 *
 * Verifies the Razorpay HMAC signature, credits tokens to
 * profiles.token_balance, writes a token_events audit row, and marks
 * the purchase row as 'completed'. Idempotent — re-running verify on
 * an already-completed purchase is a no-op.
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
  };

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendError(res, 400, 'Missing required Razorpay fields');
  }

  if (
    !verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    )
  ) {
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
    .select('id, user_id, tokens_purchased, status, package_id')
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();

  if (lookupErr) return sendError(res, 500, lookupErr.message);
  if (!purchase) return sendError(res, 404, 'Purchase record not found');
  if (purchase.user_id !== user.id) {
    return sendError(res, 403, 'Not allowed to verify this purchase');
  }

  // Idempotency
  if (purchase.status === 'completed') {
    return res.status(200).json({
      success: true,
      tokens_credited: purchase.tokens_purchased,
      already_processed: true,
    });
  }

  const tokensToCredit = Number(purchase.tokens_purchased) || 0;

  // ── Credit tokens via read-modify-write on profiles.token_balance ──
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('token_balance')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr) {
    console.error('[token verify] profile read failed:', profileErr);
    return sendError(res, 500, 'Failed to read token balance');
  }

  const previousBalance = Number(profile?.token_balance ?? 0);
  const newBalance = previousBalance + tokensToCredit;

  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      token_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateErr) {
    console.error('[token verify] balance update failed:', updateErr);
    return sendError(res, 500, 'Failed to credit tokens');
  }

  // ── Audit log ──
  await admin.from('token_events').insert({
    user_id: user.id,
    change: tokensToCredit,
    balance_after: newBalance,
    reason: 'razorpay_token_purchase',
    metadata: {
      razorpay_order_id,
      razorpay_payment_id,
      purchase_id: purchase.id,
      package_id: purchase.package_id,
    },
  });

  // ── Mark purchase complete ──
  await admin
    .from('token_purchases')
    .update({
      status: 'completed',
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq('id', purchase.id);

  return res.status(200).json({
    success: true,
    tokens_credited: tokensToCredit,
    new_balance: newBalance,
  });
}
