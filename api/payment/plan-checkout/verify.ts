/**
 * POST /api/payment/plan-checkout/verify
 *
 * Body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   planId: string,
 *   billingCycleMonths: 1 | 3 | 6 | 12
 * }
 *
 * Verifies the Razorpay HMAC signature, activates / extends the user's
 * subscription, and writes a payment history row. Idempotent — re-
 * verifying the same payment won't re-extend the subscription.
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
    planId?: string;
    billingCycleMonths?: number;
  };

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planId,
  } = body;
  const billingCycleMonths = Number(body.billingCycleMonths || 1);

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendError(res, 400, 'Missing required Razorpay fields');
  }
  if (!planId) return sendError(res, 400, 'planId is required');

  // ── HMAC verify ──
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

  // ── Idempotency: has this order already been processed? ──
  const { data: existing } = await admin
    .from('plan_payments')
    .select('id, status')
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();

  if (existing && existing.status === 'completed') {
    return res.status(200).json({
      success: true,
      already_processed: true,
    });
  }

  // ── Look up plan ──
  const { data: plan, error: planErr } = await admin
    .from('platform_plans')
    .select('id, name, monthly_token_credit')
    .eq('id', planId)
    .maybeSingle();

  if (planErr) return sendError(res, 500, planErr.message);
  if (!plan) return sendError(res, 404, 'Plan not found');

  // ── Compute the new subscription end date ──
  const now = new Date();
  const { data: currentSub } = await admin
    .from('user_subscriptions')
    .select('id, plan_id, ends_at, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .maybeSingle();

  let extendFrom = now;
  if (
    currentSub?.ends_at &&
    currentSub.plan_id === planId &&
    currentSub.status === 'active'
  ) {
    const endsAt = new Date(currentSub.ends_at);
    if (endsAt > now) extendFrom = endsAt;
  }
  const newEndsAt = new Date(extendFrom);
  newEndsAt.setMonth(newEndsAt.getMonth() + billingCycleMonths);

  // ── Upsert the subscription ──
  const { error: subErr } = await admin.from('user_subscriptions').upsert(
    {
      user_id: user.id,
      plan_id: planId,
      status: 'active',
      starts_at: now.toISOString(),
      ends_at: newEndsAt.toISOString(),
      billing_cycle_months: billingCycleMonths,
      updated_at: now.toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (subErr) {
    console.error('[plan verify] subscription upsert failed:', subErr);
    return sendError(res, 500, 'Failed to activate subscription');
  }

  // ── Credit any included tokens ──
  if (plan.monthly_token_credit && plan.monthly_token_credit > 0) {
    try {
      await admin.rpc('add_user_tokens', {
        p_user_id: user.id,
        p_tokens: plan.monthly_token_credit * billingCycleMonths,
        p_source: 'plan_purchase',
        p_metadata: {
          razorpay_order_id,
          razorpay_payment_id,
          plan_id: planId,
        },
      });
    } catch (e: any) {
      console.warn('[plan verify] token credit RPC failed:', e?.message);
    }
  }

  // ── Record the payment ──
  await admin.from('plan_payments').upsert(
    {
      user_id: user.id,
      plan_id: planId,
      razorpay_order_id,
      razorpay_payment_id,
      billing_cycle_months: billingCycleMonths,
      status: 'completed',
      completed_at: now.toISOString(),
    },
    { onConflict: 'razorpay_order_id' },
  );

  return res.status(200).json({
    success: true,
    plan_name: plan.name,
    ends_at: newEndsAt.toISOString(),
  });
}
