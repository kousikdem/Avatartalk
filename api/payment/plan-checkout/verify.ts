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
 * platform subscription, credits the plan's monthly token allowance
 * (multiplied by cycle), and writes an audit row to
 * platform_plan_transactions. Idempotent — re-verifying the same
 * payment is a no-op.
 *
 * Schema reference (live DB):
 *   user_platform_subscriptions:
 *     id, user_id, plan_id, plan_key, status, billing_cycle_months,
 *     price_paid, currency, starts_at, expires_at, auto_renew,
 *     razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *     metadata, created_at, updated_at
 *   platform_plan_transactions:
 *     id, user_id, plan_id, plan_key, amount, currency,
 *     billing_cycle_months, razorpay_order_id, razorpay_payment_id,
 *     razorpay_signature, status, previous_plan_key, transaction_type,
 *     metadata, created_at
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  getAuthenticatedUser,
  getSupabaseAdmin,
  sendError,
  verifyRazorpaySignature,
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
  if (!VALID_CYCLES.has(billingCycleMonths)) {
    return sendError(res, 400, 'billingCycleMonths must be 1, 3, 6, or 12');
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

  // ── Idempotency: have we already processed this exact Razorpay order? ──
  // Check the subscription row directly, because
  // platform_plan_transactions may not have a unique constraint on
  // razorpay_order_id that would let an upsert short-circuit.
  const { data: dupSub } = await admin
    .from('user_platform_subscriptions')
    .select('id, plan_key, expires_at')
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();
  if (dupSub) {
    return res.status(200).json({
      success: true,
      already_processed: true,
      plan_key: dupSub.plan_key,
      expires_at: dupSub.expires_at,
    });
  }

  // ── Look up plan ──
  const { data: plan, error: planErr } = await admin
    .from('platform_pricing_plans')
    .select('id, plan_name, plan_key, ai_tokens_monthly, price_inr')
    .eq('id', planId)
    .maybeSingle();
  if (planErr) return sendError(res, 500, planErr.message);
  if (!plan) return sendError(res, 404, 'Plan not found');

  const planRow: any = plan;
  const now = new Date();

  // ── Existing subscription? extend if same plan & active ──
  const { data: currentSub } = await admin
    .from('user_platform_subscriptions')
    .select('id, plan_id, plan_key, expires_at, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .maybeSingle();

  const previousPlanKey = currentSub?.plan_key ?? 'free';

  let extendFrom = now;
  if (
    currentSub?.expires_at &&
    currentSub.plan_id === planId &&
    currentSub.status === 'active'
  ) {
    const expires = new Date(currentSub.expires_at);
    if (expires > now) extendFrom = expires;
  }
  const expiresAt = new Date(extendFrom);
  expiresAt.setMonth(expiresAt.getMonth() + billingCycleMonths);

  const subscriptionRow: Record<string, any> = {
    user_id: user.id,
    plan_id: planId,
    plan_key: planRow.plan_key,
    status: 'active',
    billing_cycle_months: billingCycleMonths,
    currency: 'INR',
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    auto_renew: false,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    updated_at: now.toISOString(),
    metadata: {
      previous_plan_key: previousPlanKey,
      activated_via: 'vercel_api',
    },
  };

  // Upsert by user_id (one active subscription per user)
  if (currentSub?.id) {
    const { error: updErr } = await admin
      .from('user_platform_subscriptions')
      .update(subscriptionRow)
      .eq('id', currentSub.id);
    if (updErr) {
      console.error('[plan verify] subscription update failed:', updErr);
      return sendError(res, 500, 'Failed to activate subscription');
    }
  } else {
    const { error: insErr } = await admin
      .from('user_platform_subscriptions')
      .insert(subscriptionRow);
    if (insErr) {
      console.error('[plan verify] subscription insert failed:', insErr);
      return sendError(res, 500, 'Failed to activate subscription');
    }
  }

  // ── Credit the plan's monthly token allowance × cycle months ──
  const tokensToCredit =
    Number(planRow.ai_tokens_monthly || 0) * billingCycleMonths;

  let newBalance: number | null = null;
  if (tokensToCredit > 0) {
    const { data: profile } = await admin
      .from('profiles')
      .select('token_balance')
      .eq('id', user.id)
      .maybeSingle();
    const prev = Number(profile?.token_balance ?? 0);
    newBalance = prev + tokensToCredit;
    const { error: balErr } = await admin
      .from('profiles')
      .update({
        token_balance: newBalance,
        updated_at: now.toISOString(),
      })
      .eq('id', user.id);
    if (balErr) {
      console.warn('[plan verify] balance update failed:', balErr);
    } else {
      await admin.from('token_events').insert({
        user_id: user.id,
        change: tokensToCredit,
        balance_after: newBalance,
        reason: `plan_activation_${planRow.plan_key}`,
        metadata: {
          razorpay_order_id,
          razorpay_payment_id,
          plan_id: planId,
          billing_cycle_months: billingCycleMonths,
        },
      });
    }
  }

  // ── Audit row ──
  const txnType =
    previousPlanKey === planRow.plan_key
      ? 'renewal'
      : previousPlanKey === 'free'
      ? 'new_subscription'
      : 'change';

  await admin.from('platform_plan_transactions').insert({
    user_id: user.id,
    plan_id: planId,
    plan_key: planRow.plan_key,
    amount: planRow.price_inr || 0,
    currency: 'INR',
    billing_cycle_months: billingCycleMonths,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    status: 'completed',
    previous_plan_key: previousPlanKey,
    transaction_type: txnType,
    metadata: { tokens_credited: tokensToCredit, new_balance: newBalance },
  });

  return res.status(200).json({
    success: true,
    plan_name: planRow.plan_name,
    plan_key: planRow.plan_key,
    expires_at: expiresAt.toISOString(),
    tokens_credited: tokensToCredit,
    new_balance: newBalance,
  });
}
