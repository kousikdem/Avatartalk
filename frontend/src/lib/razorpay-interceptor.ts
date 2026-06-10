/**
 * Razorpay Edge Function Interceptor
 *
 * The Supabase Edge Functions `razorpay-create-order` and
 * `razorpay-verify-payment` deployed in the user's Supabase project use the
 * same Razorpay credentials that are currently invalid (HTTP 401 from
 * api.razorpay.com). When those edge functions fail, the entire payment
 * flow breaks for product purchases, virtual collabs, gifts, subscriptions
 * via SubscribeButton, etc.
 *
 * This module patches `supabase.functions.invoke()` so any call targeting
 * `razorpay-create-order` or `razorpay-verify-payment` is transparently
 * re-routed through our FastAPI backend (`/api/payment/razorpay-create-order`
 * and `/api/payment/razorpay-verify-payment`), which has a Demo Mode
 * fallback baked in.
 *
 * 🟢 When valid Razorpay keys are eventually configured on the backend,
 *    `demo_mode:false` is returned and the standard Razorpay modal opens
 *    naturally — no code changes needed anywhere in the app.
 */
import { supabase } from '@/integrations/supabase/client';

const BACKEND_URL = (import.meta as any).env?.REACT_APP_BACKEND_URL || '';

const INTERCEPT_MAP: Record<string, string> = {
  'razorpay-create-order': '/api/payment/razorpay-create-order',
  'razorpay-verify-payment': '/api/payment/razorpay-verify-payment',
};

let installed = false;

export function installRazorpayInterceptor() {
  if (installed) return;
  installed = true;

  const originalInvoke = supabase.functions.invoke.bind(supabase.functions);

  // @ts-expect-error - intentionally overriding
  supabase.functions.invoke = async (functionName: string, options?: any) => {
    const mappedPath = INTERCEPT_MAP[functionName];
    if (!mappedPath) {
      return originalInvoke(functionName, options);
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        return { data: null, error: new Error('Not authenticated') as any };
      }

      const res = await fetch(`${BACKEND_URL}${mappedPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(options?.body || {}),
      });

      let body: any = null;
      try { body = await res.json(); } catch { /* keep null */ }

      if (!res.ok) {
        const err = new Error(body?.detail || body?.error || `Request failed: ${res.status}`);
        return { data: null, error: err as any };
      }

      return { data: body, error: null };
    } catch (err: any) {
      // Fall back to the original edge function on network error so we
      // don't accidentally break flows when the backend itself is down.
      console.warn(`[razorpayInterceptor] FastAPI route failed, falling back to edge function:`, err?.message);
      return originalInvoke(functionName, options);
    }
  };

  if (typeof window !== 'undefined') {
    console.info('[razorpayInterceptor] Installed — Razorpay edge function calls will route through FastAPI with demo-mode fallback.');
  }
}
