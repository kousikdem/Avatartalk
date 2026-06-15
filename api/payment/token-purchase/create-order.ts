/**
 * POST /api/payment/token-purchase/create-order
 *
 * Body (custom slider purchase): { tokens: number, amount_inr: number }
 * Body (predefined package):     { package_id: string }
 *
 * Returns: {
 *   success: true,
 *   order_id, amount (paise), currency, key_id, tokens, purchase_id
 * }
 *
 * Schema reference (verified against the live DB):
 *   token_purchases:
 *     id, user_id, package_id, tokens_purchased, amount, currency,
 *     razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *     status, created_at
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  createRazorpayOrder,
  getAuthenticatedUser,
  getRazorpayCredentials,
  getSupabaseAdmin,
  sendError,
} from '../../_lib/helpers';

const MIN_AMOUNT_INR = 10; // Frontend slider min is ₹10

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
    tokens?: number;
    amount_inr?: number;
    package_id?: string;
    packageId?: string;
  };

  let tokens: number;
  let amountInr: number;
  let packageId: string | null = null;

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    return sendError(res, 500, e?.message || 'Server misconfiguration');
  }

  if (body.package_id || body.packageId) {
    packageId = (body.package_id || body.packageId)!;

    const { data: pkg, error } = await admin
      .from('token_packages')
      .select('id, tokens, price_inr, is_active')
      .eq('id', packageId)
      .maybeSingle();

    if (error) return sendError(res, 500, error.message);
    if (!pkg || !pkg.is_active) {
      return sendError(res, 404, 'Token package not found or inactive');
    }

    tokens = pkg.tokens;
    amountInr = pkg.price_inr;
  } else {
    if (typeof body.tokens !== 'number' || typeof body.amount_inr !== 'number') {
      return sendError(
        res,
        400,
        'Either {tokens, amount_inr} or {package_id} is required',
      );
    }
    tokens = body.tokens;
    amountInr = body.amount_inr;
  }

  if (!Number.isFinite(amountInr) || amountInr < MIN_AMOUNT_INR) {
    return sendError(
      res,
      400,
      `Minimum purchase amount is ₹${MIN_AMOUNT_INR}`,
    );
  }
  if (!Number.isFinite(tokens) || tokens <= 0) {
    return sendError(res, 400, 'Invalid token amount');
  }

  // ── Create the Razorpay order ──
  let order;
  try {
    order = await createRazorpayOrder({
      amount: Math.round(amountInr * 100),
      currency: 'INR',
      receipt: `tok_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: {
        user_id: user.id,
        tokens: String(tokens),
        type: packageId ? 'package' : 'custom',
        ...(packageId ? { package_id: packageId } : {}),
      },
    });
  } catch (e: any) {
    return sendError(res, 502, e?.message || 'Razorpay order creation failed');
  }

  // ── Persist a pending purchase row so verify can credit tokens ──
  let purchaseId: string | null = null;
  try {
    const insertRow: Record<string, any> = {
      user_id: user.id,
      tokens_purchased: tokens,
      amount: amountInr,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'pending',
    };
    if (packageId) insertRow.package_id = packageId;

    const { data: purchase, error } = await admin
      .from('token_purchases')
      .insert(insertRow)
      .select('id')
      .single();

    if (error) {
      console.warn(
        '[token create-order] failed to insert purchase row:',
        error.message,
      );
    } else {
      purchaseId = purchase?.id ?? null;
    }
  } catch (e: any) {
    console.warn('[token create-order] purchase row insert threw:', e?.message);
  }

  return res.status(200).json({
    success: true,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: getRazorpayCredentials().keyId,
    tokens,
    purchase_id: purchaseId,
  });
}
