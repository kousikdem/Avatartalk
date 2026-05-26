/**
 * POST /api/payment/plan-checkout/create-order
 *
 * Body: {
 *   planId: string,                  // matches platform_plans.id
 *   billingCycleMonths: 1 | 3 | 6 | 12,
 *   currency?: 'INR' | 'USD' | ...   // defaults to INR
 * }
 *
 * Returns: {
 *   success, orderId, amount (rupees), currency, keyId,
 *   planName, billingCycleMonths
 * }
 *
 * The frontend multiplies `amount` by 100 before passing to Razorpay
 * checkout (Razorpay needs paise). The order on Razorpay is already
 * created with paise — both halves agree.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  createRazorpayOrder,
  getAuthenticatedUser,
  getSupabaseAdmin,
  sendError,
} from '../../_lib/helpers';

const VALID_CYCLES = new Set([1, 3, 6, 12]);

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
    planId?: string;
    billingCycleMonths?: number;
    currency?: string;
  };

  const planId = body.planId;
  const billingCycleMonths = Number(body.billingCycleMonths || 1);
  const currency = (body.currency || 'INR').toUpperCase();

  if (!planId) return sendError(res, 400, 'planId is required');
  if (!VALID_CYCLES.has(billingCycleMonths)) {
    return sendError(res, 400, 'billingCycleMonths must be 1, 3, 6, or 12');
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    return sendError(res, 500, e?.message || 'Server misconfiguration');
  }

  // ── Look up the plan ──
  const { data: plan, error: planErr } = await admin
    .from('platform_plans')
    .select(
      'id, name, price_inr, price_inr_3mo, price_inr_6mo, price_inr_12mo, is_active',
    )
    .eq('id', planId)
    .maybeSingle();

  if (planErr) return sendError(res, 500, planErr.message);
  if (!plan || !plan.is_active) {
    return sendError(res, 404, 'Plan not found or inactive');
  }

  const cycleColumn = {
    1: 'price_inr',
    3: 'price_inr_3mo',
    6: 'price_inr_6mo',
    12: 'price_inr_12mo',
  }[billingCycleMonths as 1 | 3 | 6 | 12];

  const priceInr = (plan as any)[cycleColumn];

  if (!Number.isFinite(priceInr) || priceInr <= 0) {
    return sendError(
      res,
      400,
      `Plan does not have a price configured for a ${billingCycleMonths}-month cycle`,
    );
  }

  // ── Create Razorpay order ──
  let order;
  try {
    order = await createRazorpayOrder({
      amount: Math.round(priceInr * 100),
      currency,
      receipt: `pln_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: {
        user_id: user.id,
        plan_id: planId,
        billing_cycle_months: String(billingCycleMonths),
        plan_name: plan.name,
      },
    });
  } catch (e: any) {
    return sendError(res, 502, e?.message || 'Razorpay order creation failed');
  }

  return res.status(200).json({
    success: true,
    orderId: order.id,
    amount: priceInr, // rupees — frontend multiplies by 100 before checkout
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    planName: plan.name,
    billingCycleMonths,
  });
}
