/**
 * POST /api/payment/plan-checkout/payment-link
 *
 * Server-side hosted-checkout fallback for paid platform plans.
 * Mirror of the token-purchase counterpart. Webhook
 * (`POST /api/payment/webhook`) activates the subscription once
 * Razorpay fires `payment_link.paid`.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  createRazorpayPaymentLink,
  getAuthenticatedUser,
  getSupabaseAdmin,
  sendError,
} from '../../_lib/helpers';

const VALID_CYCLES = new Set([1, 3, 6, 12]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');

  const user = await getAuthenticatedUser(req);
  if (!user) return sendError(res, 401, 'Authentication required');

  const body = (req.body || {}) as {
    planId?: string;
    billingCycleMonths?: number;
    currency?: string;
    callback_url?: string;
  };
  const planId = body.planId;
  const months = Number(body.billingCycleMonths || 1);
  const currency = (body.currency || 'INR').toUpperCase();
  if (!planId) return sendError(res, 400, 'planId is required');
  if (!VALID_CYCLES.has(months)) {
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
      ].join(', '),
    )
    .eq('id', planId)
    .maybeSingle();

  if (planErr) return sendError(res, 500, planErr.message);
  if (!plan || !(plan as any).is_active) {
    return sendError(res, 404, 'Plan not found or inactive');
  }

  const p: any = plan;
  let amount = 0;
  if (months === 1) {
    amount = currency === 'INR' ? p.price_inr : p.price_usd;
  } else {
    amount =
      currency === 'INR'
        ? p[`price_${months}_month_inr`]
        : p[`price_${months}_month_usd`];
    if (!amount) {
      const monthly = currency === 'INR' ? p.price_inr : p.price_usd;
      amount = monthly * months;
    }
  }
  if (!amount || amount <= 0) {
    return sendError(res, 400, 'Invalid plan price');
  }

  // Convert USD → INR for Razorpay (no demo support, real INR only).
  const rzpCurrency = 'INR';
  const rzpAmount = currency === 'USD' ? Math.round(amount * 83) : amount;
  const amountSubunits = Math.round(rzpAmount * 100);

  // Pre-insert pending transaction row.
  const placeholderOrderId = `pending_plink_${Date.now()}_${user.id.slice(0, 8)}`;
  const { data: txnRow, error: txnErr } = await admin
    .from('platform_plan_transactions')
    .insert({
      user_id: user.id,
      plan_id: planId,
      plan_key: p.plan_key,
      amount: amount,
      currency,
      billing_cycle_months: months,
      razorpay_order_id: placeholderOrderId,
      status: 'pending',
      transaction_type: 'purchase',
    })
    .select('id')
    .single();
  if (txnErr || !txnRow?.id) {
    return sendError(res, 500, txnErr?.message || 'Failed to record transaction');
  }
  const transactionId: string = txnRow.id;

  const payload: Record<string, unknown> = {
    amount: amountSubunits,
    currency: rzpCurrency,
    accept_partial: false,
    description: `${p.plan_name} (${months} mo)`,
    customer: {
      name: user.email || 'AvatarTalk User',
      email: user.email || '',
    },
    notify: { sms: false, email: false },
    reminder_enable: false,
    notes: {
      user_id: user.id,
      transaction_id: transactionId,
      plan_id: planId,
      plan_key: p.plan_key,
      billing_cycle_months: String(months),
      type: 'plan_purchase',
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
      .from('platform_plan_transactions')
      .update({ status: 'failed' })
      .eq('id', transactionId);
    return sendError(res, 502, e?.message || 'Failed to create payment link');
  }

  await admin
    .from('platform_plan_transactions')
    .update({ razorpay_order_id: pl.id })
    .eq('id', transactionId);

  return res.status(200).json({
    success: true,
    payment_link_id: pl.id,
    payment_link_url: pl.short_url || pl.url,
    transaction_id: transactionId,
    amount,
    currency,
    planName: p.plan_name,
    billingCycleMonths: months,
  });
}
