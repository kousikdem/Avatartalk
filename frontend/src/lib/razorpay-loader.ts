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

/**
 * Lightweight prefetch hint. Call from the root layout / App.tsx (or any
 * authenticated screen) the moment we know the user might pay soon.
 *
 *  • Injects a `<link rel="preload" as="script">` for the Razorpay
 *    checkout.js, which makes the browser start downloading it on the
 *    network's idle lane — competing with NOTHING for bandwidth.
 *  • Skips work if Razorpay is already on `window` or the preload link
 *    already exists.
 *  • Does NOT execute the script — that still happens inside
 *    `ensureRazorpayLoaded` when the user clicks Pay. The preload just
 *    primes the browser cache so the eventual `<script>` injection is
 *    near-instant (typically 5-50 ms vs 500-1500 ms cold).
 *
 * Cost: ~85 KB gzipped fetched in background, only once per session.
 */
export function preloadRazorpayCheckout(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.Razorpay) return;
  if (document.querySelector(`link[data-rzp-preload="1"]`)) return;
  if (document.querySelector(`script[src="${RAZORPAY_SRC}"]`)) return;

  try {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = RAZORPAY_SRC;
    link.crossOrigin = 'anonymous';
    link.setAttribute('data-rzp-preload', '1');
    document.head.appendChild(link);
  } catch {
    // Preload is best-effort — never throw to the caller.
  }
}

export function ensureRazorpayLoaded(timeoutMs = 8000): Promise<boolean> {
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
