import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const BACKEND = (import.meta.env.REACT_APP_BACKEND_URL as string) || window.location.origin;

export type SubMethod = 'card' | 'upi';
export type PlanKey = 'creator' | 'pro' | 'business';

export interface RzpSubscription {
  id: string;
  user_id: string;
  platform_plan_key: PlanKey;
  razorpay_subscription_id: string;
  razorpay_plan_id: string;
  payment_method: SubMethod;
  status: string;
  paid_count: number;
  total_count: number;
  current_start: number | null;
  current_end: number | null;
  short_url: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function useSubscription() {
  const [active, setActive] = useState<RzpSubscription | null>(null);
  const [history, setHistory] = useState<RzpSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await authHeader();
      const r = await fetch(`${BACKEND}/api/subscription/status`, { headers });
      if (r.ok) {
        const d = await r.json();
        setActive(d.active || null);
        setHistory(d.history || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const subscribe = useCallback(async (planKey: PlanKey, paymentMethod: SubMethod, totalCount = 12): Promise<{
    success: boolean; error?: string;
  }> => {
    try {
      const headers = await authHeader();
      const r = await fetch(`${BACKEND}/api/subscription/create`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_key: planKey, payment_method: paymentMethod, total_count: totalCount }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { success: false, error: data.detail || 'Failed to create subscription' };

      // Load Razorpay checkout
      const ok = await loadRazorpayScript();
      if (!ok) return { success: false, error: 'Failed to load Razorpay checkout' };

      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      const name = (userData?.user?.user_metadata as any)?.full_name || '';

      const options: any = {
        key: data.razorpay_key_id,
        subscription_id: data.subscription_id,
        name: 'AvatarTalk',
        description: `${planKey.toUpperCase()} plan — ${paymentMethod.toUpperCase()} recurring`,
        prefill: { email, name },
        method: paymentMethod === 'upi' ? { upi: true, card: false, netbanking: false, wallet: false } : undefined,
        theme: { color: '#7c3aed' },
        handler: async (resp: any) => {
          try {
            const vh = await authHeader();
            const vr = await fetch(`${BACKEND}/api/subscription/verify`, {
              method: 'POST',
              headers: { ...vh, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_subscription_id: resp.razorpay_subscription_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });
            const vd = await vr.json().catch(() => ({}));
            if (!vr.ok || !vd.success) {
              alert('Payment verification failed: ' + (vd.detail || 'unknown'));
            }
            await refresh();
          } catch (e) {
            alert('Verification error: ' + (e as any)?.message);
          }
        },
        modal: { ondismiss: () => refresh() },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        alert('Payment failed: ' + (resp?.error?.description || 'unknown'));
      });
      rzp.open();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' };
    }
  }, [refresh]);

  const cancel = useCallback(async (subId: string, cancelAtCycleEnd = true): Promise<{ success: boolean; error?: string }> => {
    const headers = await authHeader();
    const r = await fetch(`${BACKEND}/api/subscription/cancel`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpay_subscription_id: subId, cancel_at_cycle_end: cancelAtCycleEnd }),
    });
    const d = await r.json().catch(() => ({}));
    await refresh();
    if (!r.ok) return { success: false, error: d.detail || 'Cancel failed' };
    return { success: true };
  }, [refresh]);

  const pause = useCallback(async (subId: string): Promise<{ success: boolean; error?: string }> => {
    const headers = await authHeader();
    const r = await fetch(`${BACKEND}/api/subscription/pause`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpay_subscription_id: subId }),
    });
    const d = await r.json().catch(() => ({}));
    await refresh();
    if (!r.ok) return { success: false, error: d.detail || 'Pause failed' };
    return { success: true };
  }, [refresh]);

  const resume = useCallback(async (subId: string): Promise<{ success: boolean; error?: string }> => {
    const headers = await authHeader();
    const r = await fetch(`${BACKEND}/api/subscription/resume`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpay_subscription_id: subId }),
    });
    const d = await r.json().catch(() => ({}));
    await refresh();
    if (!r.ok) return { success: false, error: d.detail || 'Resume failed' };
    return { success: true };
  }, [refresh]);

  return { active, history, loading, refresh, subscribe, cancel, pause, resume };
}
