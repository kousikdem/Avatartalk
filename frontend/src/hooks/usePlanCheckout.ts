import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { callPaymentApi } from '@/lib/payment-api';
import { ensureRazorpayLoaded } from '@/lib/razorpay-loader';
import type { PlatformPricingPlan } from '@/hooks/usePlatformPricingPlans';

/** Razorpay plan checkout (server-side order + HMAC verify) shared by paywall + pricing. */
export function usePlanCheckout() {
  const [busy, setBusy] = useState<string | null>(null);

  const checkout = (plan: PlatformPricingPlan, months: 1 | 12, currency: 'INR' | 'USD' = 'INR') =>
    new Promise<{ ok: boolean; message?: string; expiresAt?: string }>(async (resolve) => {
      setBusy(plan.plan_key);
      const done = (r: { ok: boolean; message?: string; expiresAt?: string }) => { setBusy(null); resolve(r); };
      try {
        const loaded = await ensureRazorpayLoaded();
        if (!loaded) return done({ ok: false, message: 'Could not load the payment window. Disable ad-blockers and retry.' });
        const { data: s } = await supabase.auth.getSession();
        if (!s.session) return done({ ok: false, message: 'Please sign in again.' });
        const order = await callPaymentApi<any>('/api/payment/plan-checkout/create-order', { planId: plan.id, billingCycleMonths: months, currency });
        if (!order?.orderId) return done({ ok: false, message: 'Failed to create payment order' });
        const rzp = new (window as any).Razorpay({
          key: order.keyId,
          amount: Math.round(order.amount * 100),
          currency: order.currency || 'INR',
          name: 'AvatarTalk.Co',
          description: `${order.planName || plan.plan_name} Plan \u2013 ${months === 12 ? 'Yearly' : 'Monthly'}`,
          order_id: order.orderId,
          prefill: { email: s.session.user.email || '' },
          theme: { color: '#6D4AFF' },
          handler: async (resp: any) => {
            try {
              const v = await callPaymentApi<any>('/api/payment/plan-checkout/verify', {
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                planId: plan.id,
                billingCycleMonths: months,
              });
              if (!v?.success) return done({ ok: false, message: v?.message || 'Verification failed' });
              window.dispatchEvent(new Event('avatartalk:plan-updated'));
              done({ ok: true, expiresAt: v.expiresAt });
            } catch (e: any) { done({ ok: false, message: e?.message || 'Verification failed' }); }
          },
          modal: { ondismiss: () => done({ ok: false, message: 'Payment cancelled' }) },
        });
        rzp.on('payment.failed', (r: any) => done({ ok: false, message: r?.error?.description || 'Payment failed' }));
        rzp.open();
      } catch (e: any) {
        done({ ok: false, message: e?.message || 'Failed to start checkout' });
      }
    });

  return { checkout, busy };
}

export const yearlyPrice = (p: PlatformPricingPlan) => p.price_12_month_inr || Math.round(p.price_inr * 12 * 0.8);
