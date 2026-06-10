import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * DemoCheckoutModal
 *
 * This modal is shown ONLY when the backend reports `demo_mode: true`
 * (which happens automatically when the configured Razorpay API key/secret
 * is invalid). It simulates Razorpay's hosted checkout UX so users can still
 * test the end-to-end purchase flow with the standard Razorpay test card.
 *
 * 🟠 IMPORTANT: This is a TEST/DEMO mode only. No real money is collected.
 * Tokens / plans ARE credited in the database so the post-purchase UI works.
 *
 * The moment the operator regenerates a working Razorpay key, the backend
 * stops returning `demo_mode: true` and the real Razorpay modal opens
 * automatically — no code changes needed here.
 */

export interface DemoCheckoutData {
  order_id: string;          // demo_order_xxx
  amount: number;            // in subunits (paise)
  currency: string;
  description?: string;
}

export interface DemoSuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Props {
  open: boolean;
  data: DemoCheckoutData | null;
  onClose: () => void;
  onSuccess: (payload: DemoSuccessPayload) => void;
  onFailure?: (reason: string) => void;
}

const TEST_CARD = '4111 1111 1111 1111';
const TEST_CVV = '123';
const TEST_EXP = '12/26';

const DemoCheckoutModal: React.FC<Props> = ({ open, data, onClose, onSuccess, onFailure }) => {
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fillTestCard = () => {
    setCard(TEST_CARD);
    setExp(TEST_EXP);
    setCvv(TEST_CVV);
    setName(name || 'Test User');
    setErrorMsg(null);
  };

  const handlePay = async () => {
    setErrorMsg(null);
    const cardDigits = card.replace(/\s+/g, '');

    // Accept only the Razorpay test card so users can't accidentally think
    // this is a real payment flow with arbitrary card data.
    if (cardDigits !== '4111111111111111') {
      setErrorMsg('Demo mode only accepts the test card 4111 1111 1111 1111.');
      return;
    }
    if (cvv.trim() !== TEST_CVV) {
      setErrorMsg('CVV must be 123 in demo mode.');
      return;
    }
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(exp.trim())) {
      setErrorMsg('Expiry must be in MM/YY format (e.g. 12/26).');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter the cardholder name.');
      return;
    }
    if (!data) {
      setErrorMsg('Demo order missing. Please retry.');
      return;
    }

    setProcessing(true);

    // Simulate Razorpay's processing delay so the UX feels real.
    await new Promise((r) => setTimeout(r, 1400));

    onSuccess({
      razorpay_payment_id: `demo_pay_${Math.random().toString(36).slice(2, 14)}${Date.now().toString(36)}`,
      razorpay_order_id: data.order_id,
      razorpay_signature: 'demo_signature_skip_verification',
    });

    // Reset for next time
    setProcessing(false);
    setCard('');
    setExp('');
    setCvv('');
    setName('');
  };

  const handleDismiss = () => {
    if (processing) return;
    setErrorMsg(null);
    onClose();
  };

  const amountDisplay = data
    ? `${data.currency === 'INR' ? '₹' : data.currency} ${(data.amount / 100).toFixed(2)}`
    : '';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Demo banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-xs">
            <Badge variant="outline" className="border-amber-500 text-amber-600 mb-1.5">
              DEMO MODE · No real money will be charged
            </Badge>
            <p className="text-muted-foreground leading-relaxed">
              Razorpay credentials on the server are currently invalid. This is a simulated
              payment flow for testing the UI — your tokens/plan will still be credited.
            </p>
          </div>
        </div>

        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Pay {amountDisplay}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {data?.description || 'Demo payment'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={fillTestCard}
            className="w-full text-xs h-8 border-dashed border-amber-500/50 hover:bg-amber-500/5"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Auto-fill Razorpay test card
          </Button>

          <div>
            <Label className="text-xs">Card Number</Label>
            <Input
              value={card}
              onChange={(e) => setCard(e.target.value)}
              placeholder="4111 1111 1111 1111"
              maxLength={19}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Expiry (MM/YY)</Label>
              <Input
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                placeholder="12/26"
                maxLength={5}
                className="font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">CVV</Label>
              <Input
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                maxLength={3}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Cardholder Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test User"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
              {errorMsg}
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Processing demo payment…
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Pay {amountDisplay} (Demo)
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            Test card: <span className="font-mono">4111 1111 1111 1111</span> · CVV{' '}
            <span className="font-mono">123</span> · Expiry{' '}
            <span className="font-mono">12/26</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoCheckoutModal;
