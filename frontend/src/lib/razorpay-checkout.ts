/**
 * Razorpay checkout opener.
 *
 * Thin wrapper around `new window.Razorpay(options).open()` that:
 *   1) ensures the Razorpay JS SDK is loaded (cached after the first call so
 *      subsequent clicks open the modal instantly),
 *   2) wires up a default `payment.failed` handler that surfaces the actual
 *      Razorpay error to the caller's `modal.ondismiss`,
 *   3) throws clear, user-friendly errors when the SDK / key is missing.
 *
 * ⚠️ The demo-mode / DemoCheckoutModal escape hatch was removed — every
 * payment now opens the real Razorpay window (test-mode keys produce
 * the same Razorpay modal, just with test cards enabled).
 */

import { ensureRazorpayLoaded } from './razorpay-loader';

export interface RazorpayOptions {
  key: string | null;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
  [key: string]: any;
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const loaded = await ensureRazorpayLoaded();
  if (!loaded || !window.Razorpay) {
    throw new Error(
      'Payment system unavailable. Please disable ad-blockers and refresh.',
    );
  }
  if (!options.key) {
    throw new Error(
      'Razorpay key missing on the server. Set RAZORPAY_KEY_ID in env vars.',
    );
  }
  if (!options.order_id) {
    throw new Error('Order ID missing — cannot open checkout.');
  }

  const rzp = new window.Razorpay(options);

  // Surface Razorpay payment failures (network / declined card / cvv etc.)
  rzp.on('payment.failed', (resp: any) => {
    const err = resp?.error || {};
    const msg =
      err.description ||
      err.reason ||
      err.code ||
      'Payment could not be completed.';
    console.error('[razorpay] payment.failed:', err);
    // Re-dispatch so callers can attach their own listener if they wish.
    window.dispatchEvent(
      new CustomEvent('razorpay:payment-failed', { detail: { message: msg, error: err } }),
    );
    // Also dismiss the modal so the caller's ondismiss runs.
    options.modal?.ondismiss?.();
  });

  rzp.open();
}
