/**
 * Razorpay checkout script loader.
 *
 * Centralised because half-a-dozen components used to each ship their own
 * `script.src = "https://checkout.razorpay.com/v1/checkout.js"` block,
 * and several of them did NOT `await` the load — which caused
 * `new window.Razorpay()` to throw "Razorpay is not a constructor" /
 * "Payment system not loaded" toasts when the user clicked the button
 * before the script finished downloading. That's the real cause of
 * "Razorpay checkout doesn't open at all" on a fresh page load.
 *
 * Usage:
 *   const ok = await ensureRazorpayLoaded();
 *   if (!ok) { toast.error('Payment system unavailable'); return; }
 *   const rzp = new window.Razorpay(options);
 *   rzp.open();
 */

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

// Module-level promise — first caller starts the load, subsequent callers
// await the same promise. No duplicate <script> tags, no race conditions.
let loadPromise: Promise<boolean> | null = null;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function ensureRazorpayLoaded(timeoutMs = 15000): Promise<boolean> {
  // Already loaded → resolve immediately.
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<boolean>((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    // Reuse existing tag if one was already injected by an older component.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SRC}"]`,
    );

    const finalise = (ok: boolean) => {
      // Reset the promise on failure so a subsequent click can retry.
      if (!ok) loadPromise = null;
      resolve(ok);
    };

    if (existing) {
      if (window.Razorpay) {
        finalise(true);
        return;
      }
      existing.addEventListener('load', () => finalise(!!window.Razorpay));
      existing.addEventListener('error', () => finalise(false));
    } else {
      const script = document.createElement('script');
      script.src = RAZORPAY_SRC;
      script.async = true;
      script.onload = () => finalise(!!window.Razorpay);
      script.onerror = () => finalise(false);
      document.body.appendChild(script);
    }

    // Safety net: hard timeout so a slow/blocked network doesn't hang the
    // UI forever.
    window.setTimeout(() => {
      if (!window.Razorpay) finalise(false);
    }, timeoutMs);
  });

  return loadPromise;
}
