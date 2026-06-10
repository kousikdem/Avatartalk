/**
 * Smart Razorpay checkout opener.
 *
 * Behaves like `new window.Razorpay(options).open()` BUT if the order ID
 * starts with `demo_order_`, it opens our DemoCheckoutModal instead of
 * the real Razorpay modal (because the backend issued a fake order id
 * when Razorpay creds are invalid).
 *
 * The demo modal is mounted globally via DemoCheckoutPortal (in App.tsx),
 * communicating through window-level CustomEvents.
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

const DEMO_EVENT_OPEN = 'demo-checkout:open';
const DEMO_EVENT_RESULT = 'demo-checkout:result';

let demoSeq = 0;

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const isDemo = typeof options.order_id === 'string' && options.order_id.startsWith('demo_order_');

  if (isDemo) {
    // Demo flow — open the React-mounted DemoCheckoutModal via global event.
    const requestId = `demo-req-${++demoSeq}-${Date.now()}`;

    return new Promise((resolve) => {
      const handleResult = (e: Event) => {
        const detail = (e as CustomEvent).detail as {
          requestId: string;
          result: 'success' | 'cancel';
          payload?: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          };
        };
        if (detail.requestId !== requestId) return;
        window.removeEventListener(DEMO_EVENT_RESULT, handleResult);

        if (detail.result === 'success' && detail.payload) {
          options.handler(detail.payload);
        } else if (options.modal?.ondismiss) {
          options.modal.ondismiss();
        }
        resolve();
      };

      window.addEventListener(DEMO_EVENT_RESULT, handleResult);

      window.dispatchEvent(
        new CustomEvent(DEMO_EVENT_OPEN, {
          detail: {
            requestId,
            data: {
              order_id: options.order_id,
              amount: options.amount,
              currency: options.currency,
              description: options.description || options.name,
            },
          },
        }),
      );
    });
  }

  // Real Razorpay flow
  const loaded = await ensureRazorpayLoaded();
  if (!loaded || !window.Razorpay) {
    throw new Error('Payment system unavailable. Please refresh and try again.');
  }
  if (!options.key) {
    throw new Error('Razorpay key missing. Please contact support.');
  }
  const rzp = new window.Razorpay(options);
  rzp.open();
}

// Event constants — exported so DemoCheckoutPortal can subscribe.
export const DEMO_EVENTS = {
  OPEN: DEMO_EVENT_OPEN,
  RESULT: DEMO_EVENT_RESULT,
} as const;
