/**
 * POST /api/payment/plan-checkout/create-order
 *
 * Body: {
 *   planId: string,                   // matches platform_pricing_plans.id
 *   billingCycleMonths: 1 | 3 | 6 | 12,
 *   currency?: 'INR' | 'USD'          // defaults to INR
 * }
 *
 * Returns (rupees / dollars — NOT paise):
 *   { success, orderId, amount, currency, keyId, planName, billingCycleMonths }
 *
 * The frontend multiplies `amount` by 100 before opening Razorpay
 * checkout (Razorpay wants paise/cents). The Razorpay order itself is
 * already in paise — both halves agree.
 *
 * Schema reference (live DB):
 *   platform_pricing_plans columns used:
 *     id, plan_name, plan_key, is_active,
 *     price_inr, price_3_month_inr, price_6_month_inr, price_12_month_inr,
 *     price_usd, price_3_month_usd, price_6_month_usd, price_12_month_usd,
 *     discount_3_month, discount_6_month, discount_12_month
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

const VALID_CYCLES = new Set([1, 3, 6, 12]);
const DEFAULT_DISCOUNTS: Record<number, number> = { 1: 0, 3: 10, 6: 15, 12: 20 };

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
  if (currency !== 'INR' && currency !== 'USD') {
    return sendError(res, 400, 'currency must be INR or USD');
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    return sendError(res, 500, e?.message || 'Server misconfiguration');
  }

  const { data: plan, error: planErr } = await admin
    .from('platform_pricing_plans')
    .select(
      [
        'id',
        'plan_name',
        'plan_key',
        'is_active',
        'price_inr',
        'price_usd',
        'price_3_month_inr',
        'price_6_month_inr',
        'price_12_month_inr',
        'price_3_month_usd',
        'price_6_month_usd',
        'price_12_month_usd',
        'discount_3_month',
        'discount_6_month',
        'discount_12_month',
      ].join(', '),
    )
    .eq('id', planId)
    .maybeSingle();

  if (planErr) return sendError(res, 500, planErr.message);
  if (!plan || !(plan as any).is_active) {
    return sendError(res, 404, 'Plan not found or inactive');
  }

  if ((plan as any).plan_key === 'free') {
    return sendError(res, 400, 'Free plan does not require checkout');
  }

  // ── Compute the total amount for the chosen cycle ──
  const p: any = plan;
  const monthly = currency === 'INR' ? p.price_inr : p.price_usd;
  if (!Number.isFinite(monthly) || monthly <= 0) {
    return sendError(
      res,
      400,
      `Plan has no ${currency} price configured`,
    );
  }

  let totalAmount = monthly;
  if (billingCycleMonths === 1) {
    totalAmount = monthly;
  } else {
    const presetKey =
      currency === 'INR'
        ? `price_${billingCycleMonths}_month_inr`
        : `price_${billingCycleMonths}_month_usd`;
    const preset = p[presetKey];
    if (Number.isFinite(preset) && preset > 0) {
      totalAmount = preset;
    } else {
      const discount =
        p[`discount_${billingCycleMonths}_month`] ??
        DEFAULT_DISCOUNTS[billingCycleMonths] ??
        0;
      totalAmount = Math.round(monthly * billingCycleMonths * (1 - discount / 100));
    }
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return sendError(res, 400, 'Computed amount is invalid');
  }

  // Razorpay only accepts INR for accounts in India. If user picked
  // USD we still create the order in INR (Razorpay can't accept USD
  // without a special account). Convert at a flat rate for now.
  // TODO: replace with live FX once Razorpay International is enabled.
  let razorpayCurrency = 'INR';
  let razorpayAmount = totalAmount;
  if (currency === 'USD') {
    // 1 USD ≈ 83 INR (conservative)
    razorpayAmount = Math.round(totalAmount * 83);
  }

  let order;
  try {
    order = await createRazorpayOrder({
      amount: Math.round(razorpayAmount * 100),
      currency: razorpayCurrency,
      receipt: `pln_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: {
        user_id: user.id,
        plan_id: planId,
        plan_key: p.plan_key,
        plan_name: p.plan_name,
        billing_cycle_months: String(billingCycleMonths),
        display_currency: currency,
        display_amount: String(totalAmount),
      },
    });
  } catch (e: any) {
    return sendError(res, 502, e?.message || 'Razorpay order creation failed');
  }

  return res.status(200).json({
    success: true,
    orderId: order.id,
    amount: totalAmount,
    currency,
    keyId: getRazorpayCredentials().keyId,
    planName: p.plan_name,
    planKey: p.plan_key,
    billingCycleMonths,
  });
}
