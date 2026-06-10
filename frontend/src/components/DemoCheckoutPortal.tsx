/**
 * DemoCheckoutPortal
 *
 * Mounted once at the App root. Listens for `demo-checkout:open` events
 * fired by openRazorpayCheckout() and renders DemoCheckoutModal globally
 * so ANY component that calls openRazorpayCheckout (or even raw
 * new window.Razorpay) with a demo_order_* order ID gets the demo modal.
 *
 * Posts the result back via `demo-checkout:result` event.
 */
import React, { useEffect, useState } from 'react';
import DemoCheckoutModal, { DemoCheckoutData, DemoSuccessPayload } from './DemoCheckoutModal';
import { DEMO_EVENTS } from '@/lib/razorpay-checkout';

interface PendingRequest {
  requestId: string;
  data: DemoCheckoutData;
}

const DemoCheckoutPortal: React.FC = () => {
  const [pending, setPending] = useState<PendingRequest | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as PendingRequest;
      setPending(detail);
    };
    window.addEventListener(DEMO_EVENTS.OPEN, handler);
    return () => window.removeEventListener(DEMO_EVENTS.OPEN, handler);
  }, []);

  const dispatchResult = (result: 'success' | 'cancel', payload?: DemoSuccessPayload) => {
    if (!pending) return;
    window.dispatchEvent(
      new CustomEvent(DEMO_EVENTS.RESULT, {
        detail: { requestId: pending.requestId, result, payload },
      }),
    );
    setPending(null);
  };

  return (
    <DemoCheckoutModal
      open={!!pending}
      data={pending?.data || null}
      onClose={() => dispatchResult('cancel')}
      onSuccess={(payload) => dispatchResult('success', payload)}
      onFailure={() => dispatchResult('cancel')}
    />
  );
};

export default DemoCheckoutPortal;
