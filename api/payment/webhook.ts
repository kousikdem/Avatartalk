/**
 * POST /api/payment/webhook
 *
 * Razorpay → server callback. Razorpay POSTs the event payload and
 * an `X-Razorpay-Signature` header (HMAC SHA-256 over the raw body
 * using `RAZORPAY_WEBHOOK_SECRET`). Configure in Razorpay Dashboard
 * → Settings → Webhooks → URL = `https://<domain>/api/payment/webhook`,
 * Active Events = `payment.captured`, `payment_link.paid`.
 *
 * Handles:
 *   - `payment.captured` (Standard Checkout) → credits tokens / activates plan
 *   - `payment_link.paid` (hosted page flow) → same
 *
 * Idempotent: completing an already-completed row is a no-op.
 *
 * The body parser is disabled (`bodyParser: false` in the config
 * export below) so we can read the raw bytes for HMAC verification.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCors,
  getSupabaseAdmin,
  sendError,
  verifyRazorpayWebhookSignature,
} from '../_lib/helpers';

// Tell Vercel not to parse the body — we need the raw bytes to verify
// Razorpay's HMAC signature.
export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

interface WebhookPayload {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, any> };
    payment_link?: { entity?: Record<string, any> };
  };
}

async function creditTokenPurchase(
  admin: ReturnType<typeof getSupabaseAdmin>,
  purchaseId: string,
  orderId: string | undefined,
  paymentId: string | undefined,
) {
  const { data: purchase, error: lookupErr } = await admin
    .from('token_purchases')
    .select('id, user_id, tokens_purchased, status')
    .eq('id', purchaseId)
    .maybeSingle();
  if (lookupErr) throw new Error(lookupErr.message);
  if (!purchase) throw new Error('Purchase not found');

  if (purchase.status === 'completed') {
    return { tokens_credited: purchase.tokens_purchased, already_processed: true };
  }

  const tokens = Number(purchase.tokens_purchased) || 0;
  const { data: profile } = await admin
    .from('profiles')
    .select('token_balance')
    .eq('id', purchase.user_id)
    .maybeSingle();
  const prev = Number(profile?.token_balance ?? 0);
  const next = prev + tokens;

  await admin
    .from('profiles')
    .update({ token_balance: next, updated_at: new Date().toISOString() })
    .eq('id', purchase.user_id);

  await admin.from('token_events').insert({
    user_id: purchase.user_id,
    change: tokens,
    balance_after: next,
    reason: 'razorpay_webhook_token_purchase',
    metadata: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      purchase_id: purchase.id,
      via: 'webhook',
    },
  });

  const patch: Record<string, any> = { status: 'completed' };
  if (orderId) patch.razorpay_order_id = orderId;
  if (paymentId) patch.razorpay_payment_id = paymentId;
  await admin.from('token_purchases').update(patch).eq('id', purchase.id);

  return { tokens_credited: tokens, new_balance: next, already_processed: false };
}

async function activatePlan(
  admin: ReturnType<typeof getSupabaseAdmin>,
  transactionId: string,
  orderId: string | undefined,
  paymentId: string | undefined,
) {
  const { data: txn, error: txnErr } = await admin
    .from('platform_plan_transactions')
    .select('*')
    .eq('id', transactionId)
    .maybeSingle();
  if (txnErr) throw new Error(txnErr.message);
  if (!txn) throw new Error('Transaction not found');

  if (txn.status === 'completed') {
    return { already_processed: true, plan_key: txn.plan_key };
  }

  const { data: plan, error: planErr } = await admin
    .from('platform_pricing_plans')
    .select('id, plan_name, plan_key, ai_tokens_monthly, price_inr')
    .eq('id', txn.plan_id)
    .maybeSingle();
  if (planErr) throw new Error(planErr.message);
  if (!plan) throw new Error('Plan not found');

  const months = Number(txn.billing_cycle_months) || 1;
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);

  const subRow: Record<string, any> = {
    user_id: txn.user_id,
    plan_id: txn.plan_id,
    plan_key: plan.plan_key,
    status: 'active',
    billing_cycle_months: months,
    currency: txn.currency || 'INR',
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    auto_renew: false,
    razorpay_order_id: orderId || txn.razorpay_order_id,
    razorpay_payment_id: paymentId,
    updated_at: now.toISOString(),
    metadata: { activated_via: 'vercel_webhook' },
  };

  const { data: existing } = await admin
    .from('user_platform_subscriptions')
    .select('id')
    .eq('user_id', txn.user_id)
    .maybeSingle();
  if (existing?.id) {
    await admin
      .from('user_platform_subscriptions')
      .update(subRow)
      .eq('id', existing.id);
  } else {
    await admin.from('user_platform_subscriptions').insert(subRow);
  }

  const tokensToCredit = Number(plan.ai_tokens_monthly || 0) * months;
  if (tokensToCredit > 0) {
    const { data: profile } = await admin
      .from('profiles')
      .select('token_balance')
      .eq('id', txn.user_id)
      .maybeSingle();
    const prev = Number(profile?.token_balance ?? 0);
    const next = prev + tokensToCredit;
    await admin
      .from('profiles')
      .update({ token_balance: next, updated_at: now.toISOString() })
      .eq('id', txn.user_id);
    await admin.from('token_events').insert({
      user_id: txn.user_id,
      change: tokensToCredit,
      balance_after: next,
      reason: `webhook_plan_activation_${plan.plan_key}`,
      metadata: { razorpay_order_id: orderId, razorpay_payment_id: paymentId },
    });
  }

  const txnPatch: Record<string, any> = { status: 'completed' };
  if (paymentId) txnPatch.razorpay_payment_id = paymentId;
  if (orderId) txnPatch.razorpay_order_id = orderId;
  await admin.from('platform_plan_transactions').update(txnPatch).eq('id', txn.id);

  return {
    already_processed: false,
    plan_key: plan.plan_key,
    expires_at: expiresAt.toISOString(),
    tokens_credited: tokensToCredit,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');

  const rawBody = await readRawBody(req);
  const signature =
    (req.headers['x-razorpay-signature'] as string | undefined) ||
    (req.headers['X-Razorpay-Signature'] as unknown as string | undefined) ||
    '';

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    console.warn('[webhook] signature mismatch');
    return sendError(res, 400, 'Invalid webhook signature');
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody || '{}') as WebhookPayload;
  } catch {
    return sendError(res, 400, 'Invalid JSON');
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e: any) {
    return sendError(res, 500, e?.message || 'Server misconfiguration');
  }

  const event = payload.event || '';
  const container = payload.payload || {};

  try {
    if (event === 'payment.captured') {
      const payment = (container.payment?.entity || {}) as any;
      const notes = (payment.notes || {}) as Record<string, string>;
      const ptype = notes.type;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      if (ptype === 'custom_token_purchase' && notes.purchase_id) {
        const result = await creditTokenPurchase(
          admin,
          notes.purchase_id,
          orderId,
          paymentId,
        );
        return res.status(200).json({ success: true, event, ...result });
      }
      if (ptype === 'plan_purchase' && notes.transaction_id) {
        const result = await activatePlan(
          admin,
          notes.transaction_id,
          orderId,
          paymentId,
        );
        return res.status(200).json({ success: true, event, ...result });
      }
      // No notes type → look up by order_id (Standard Checkout path).
      if (orderId) {
        const { data: purchase } = await admin
          .from('token_purchases')
          .select('id')
          .eq('razorpay_order_id', orderId)
          .maybeSingle();
        if (purchase?.id) {
          const result = await creditTokenPurchase(
            admin,
            purchase.id,
            orderId,
            paymentId,
          );
          return res.status(200).json({ success: true, event, ...result });
        }
        const { data: txn } = await admin
          .from('platform_plan_transactions')
          .select('id')
          .eq('razorpay_order_id', orderId)
          .maybeSingle();
        if (txn?.id) {
          const result = await activatePlan(admin, txn.id, orderId, paymentId);
          return res.status(200).json({ success: true, event, ...result });
        }
      }
      return res.status(200).json({ success: true, event, ignored: true });
    }

    if (event === 'payment_link.paid') {
      const pl = (container.payment_link?.entity || {}) as any;
      const notes = (pl.notes || {}) as Record<string, string>;
      const ptype = notes.type;
      const payment = (container.payment?.entity || {}) as any;
      const orderId = payment.order_id || pl.order_id;
      const paymentId = payment.id;

      if (ptype === 'custom_token_purchase' && notes.purchase_id) {
        const result = await creditTokenPurchase(
          admin,
          notes.purchase_id,
          orderId,
          paymentId,
        );
        return res.status(200).json({ success: true, event, ...result });
      }
      if (ptype === 'plan_purchase' && notes.transaction_id) {
        const result = await activatePlan(
          admin,
          notes.transaction_id,
          orderId,
          paymentId,
        );
        return res.status(200).json({ success: true, event, ...result });
      }
      return res.status(200).json({ success: true, event, ignored: true });
    }

    // Acknowledge any other event so Razorpay doesn't retry.
    return res.status(200).json({ success: true, event, ignored: true });
  } catch (e: any) {
    console.error('[webhook] handler error:', e);
    return sendError(res, 500, e?.message || 'Webhook handler failed');
  }
}
