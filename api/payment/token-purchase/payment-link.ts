/**
 * POST /api/payment/token-purchase/payment-link
 *
 * Hosted-checkout fallback. Server creates a Razorpay-hosted
 * Payment Link and returns the URL — the frontend opens it in a new
 * tab. The webhook (`POST /api/payment/webhook`) credits tokens once
 * Razorpay fires `payment_link.paid`.
 *
 * Body: { tokens: number, amount_inr: number, callback_url?: string }
 * Returns: {
 *   success, payment_link_url, payment_link_id, purchase_id,
 *   amount (paise), currency, tokens
 * }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  createRazorpayPaymentLink,
  getAuthenticatedUser,
  getSupabaseAdmin,
  sendError,
} from '../../_lib/helpers';

const MIN_AMOUNT_INR = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');

  const user = await getAuthenticatedUser(req);
  if (!user) return sendError(res, 401, 'Authentication required');

  const body = (req.body || {}) as {
    tokens?: number;
    amount_inr?: number;
    callback_url?: string;
  };
  const tokens = Number(body.tokens);
  const amountInr = Number(body.amount_inr);
  if (!Number.isFinite(tokens) || tokens <= 0) {
    return sendError(res, 400, 'Invalid token amount');
  }
  if (!Number.isFinite(amountInr) || amountInr < MIN_AMOUNT_INR) {
    return sendError(res, 400, `Minimum purchase is ₹${MIN_AMOUNT_INR}`);
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    return sendError(res, 500, e?.message || 'Server misconfiguration');
  }

  // Pre-insert pending row so we have a purchase_id to put in notes.
  const placeholderOrderId = `pending_plink_${Date.now()}_${user.id.slice(0, 8)}`;
  const { data: inserted, error: insertErr } = await admin
    .from('token_purchases')
    .insert({
      user_id: user.id,
      tokens_purchased: tokens,
      amount: amountInr,
      currency: 'INR',
      razorpay_order_id: placeholderOrderId,
      status: 'pending',
    })
    .select('id')
    .single();
  if (insertErr || !inserted?.id) {
    return sendError(res, 500, insertErr?.message || 'Failed to record purchase');
  }
  const purchaseId: string = inserted.id;

  const amountPaise = Math.round(amountInr * 100);
  const payload: Record<string, unknown> = {
    amount: amountPaise,
    currency: 'INR',
    accept_partial: false,
    description: `${tokens.toLocaleString()} AI Tokens`,
    customer: {
      name: user.email || 'AvatarTalk User',
      email: user.email || '',
    },
    notify: { sms: false, email: false },
    reminder_enable: false,
    notes: {
      user_id: user.id,
      purchase_id: purchaseId,
      tokens: String(tokens),
      type: 'custom_token_purchase',
    },
  };
  if (body.callback_url) {
    payload.callback_url = body.callback_url;
    payload.callback_method = 'get';
  }

  let pl;
  try {
    pl = await createRazorpayPaymentLink(payload);
  } catch (e: any) {
    await admin
      .from('token_purchases')
      .update({ status: 'failed' })
      .eq('id', purchaseId);
    return sendError(res, 502, e?.message || 'Failed to create payment link');
  }

  await admin
    .from('token_purchases')
    .update({ razorpay_order_id: pl.id })
    .eq('id', purchaseId);

  return res.status(200).json({
    success: true,
    payment_link_id: pl.id,
    payment_link_url: pl.short_url || pl.url,
    purchase_id: purchaseId,
    amount: amountPaise,
    currency: 'INR',
    tokens,
  });
}
