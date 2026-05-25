/**
 * Payment API helper — routes payment calls to Supabase Edge Functions.
 *
 * Why Edge Functions and not FastAPI?
 * -----------------------------------
 * In production AvatarTalk is deployed to Vercel as a pure Vite SPA. The
 * FastAPI backend in /app/backend is ONLY available in the Emergent
 * preview environment via the Kubernetes ingress. On Vercel, the SPA
 * rewrite `(.*) -> /index.html` catches `/api/payment/*` and returns the
 * HTML shell, which means `res.json()` either throws or `key_id` is
 * undefined → Razorpay checkout never opens and the user sees the generic
 * "Failed to create order" / "Failed to start checkout" toast.
 *
 * The fix is to call the equivalent **Supabase Edge Functions** which ARE
 * deployed in production and already have `RAZORPAY_KEY_ID` /
 * `RAZORPAY_KEY_SECRET` set as Supabase secrets.
 *
 * Path → Edge function mapping
 * ----------------------------
 *  /api/payment/token-purchase/create-order →
 *      • custom-token-purchase   when body has  {tokens, amount_inr}
 *      • token-purchase-create-order  when body has  {package_id|packageId}
 *  /api/payment/token-purchase/verify →
 *      • custom-token-verify     when body has  {purchase_id}  (slider)
 *      • razorpay-verify-payment when body has  {package_id|packageId}
 *  /api/payment/plan-checkout/create-order  → platform-plan-checkout
 *  /api/payment/plan-checkout/verify        → platform-plan-verify
 *
 * Callers keep using the same `/api/payment/...` paths — this helper does
 * the translation transparently so no call site needs to change.
 */
import { supabase } from '@/integrations/supabase/client';
import { extractFunctionsError } from '@/lib/supabase-errors';

type Body = Record<string, unknown> | undefined | null;

function pickFunction(path: string, body: Body): { fn: string; payload: Record<string, unknown> } {
  const normalised = path.replace(/\/+$/, '');
  const b = (body || {}) as Record<string, unknown>;
  const hasPackageId = 'package_id' in b || 'packageId' in b;

  switch (normalised) {
    case '/api/payment/token-purchase/create-order':
      if (hasPackageId) {
        const packageId = (b.packageId as string) || (b.package_id as string);
        return { fn: 'token-purchase-create-order', payload: { packageId } };
      }
      return {
        fn: 'custom-token-purchase',
        payload: { tokens: b.tokens, amount_inr: b.amount_inr },
      };

    case '/api/payment/token-purchase/verify':
      if (hasPackageId) {
        const packageId = (b.packageId as string) || (b.package_id as string);
        return {
          fn: 'token-purchase-verify',
          payload: {
            razorpay_payment_id: b.razorpay_payment_id,
            razorpay_order_id: b.razorpay_order_id,
            razorpay_signature: b.razorpay_signature,
            package_id: packageId,
          },
        };
      }
      return {
        fn: 'custom-token-verify',
        payload: {
          razorpay_payment_id: b.razorpay_payment_id,
          razorpay_order_id: b.razorpay_order_id,
          razorpay_signature: b.razorpay_signature,
          purchase_id: b.purchase_id,
        },
      };

    case '/api/payment/plan-checkout/create-order':
      return {
        fn: 'platform-plan-checkout',
        payload: {
          planId: b.planId,
          billingCycleMonths: b.billingCycleMonths,
          currency: b.currency,
        },
      };

    case '/api/payment/plan-checkout/verify':
      return {
        fn: 'platform-plan-verify',
        payload: {
          razorpay_order_id: b.razorpay_order_id,
          razorpay_payment_id: b.razorpay_payment_id,
          razorpay_signature: b.razorpay_signature,
          planId: b.planId,
          billingCycleMonths: b.billingCycleMonths,
        },
      };

    default:
      throw new Error(
        `Unknown payment endpoint: ${path}. Add a mapping in lib/payment-api.ts`,
      );
  }
}

export async function callPaymentApi<T = any>(
  path: string,
  body: unknown,
): Promise<T> {
  // Ensure the user is signed in — every payment endpoint requires it.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Please sign in to continue');
  }

  const { fn, payload } = pickFunction(path, body as Body);

  // supabase.functions.invoke automatically attaches the user's JWT as
  // `Authorization: Bearer ${session.access_token}` AND the project's
  // anon key — so edge functions can validate the caller via JWT.
  const { data, error } = await supabase.functions.invoke(fn, {
    body: payload,
  });

  // FunctionsHttpError (non-2xx) — extract the real Razorpay / validation
  // reason from the response body instead of the generic SDK message
  // ("Edge Function returned a non-2xx status code").
  if (error) {
    const reason = await extractFunctionsError(error, data);
    throw new Error(reason || 'Request failed');
  }

  // Some edge functions return 200 with `{ success:false, error:"..." }`
  // — surface that as a thrown error too so callers don't silently
  // proceed with an undefined `key_id` / `order_id`.
  if (data && typeof data === 'object' && (data as any).success === false) {
    throw new Error((data as any).error || 'Request failed');
  }

  return data as T;
}
