import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Gift, Coins, AlertCircle, Loader2, Sparkles, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface TokenGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  receiverName: string;
  senderId?: string;
}

const TOKENS_PER_RUPEE = 1000; // 1000 tokens per ₹1

const TokenGiftModal: React.FC<TokenGiftModalProps> = ({
  open,
  onOpenChange,
  receiverId,
  receiverName,
  senderId
}) => {
  const [amount, setAmount] = useState<number>(10);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [senderBalance, setSenderBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const { toast } = useToast();

  const tokensToGift = amount * TOKENS_PER_RUPEE;
  const hasEnoughTokens = senderBalance >= 15000;

  useEffect(() => {
    const loadRazorpay = () => {
      if (!document.getElementById('razorpay-script')) {
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };
    loadRazorpay();
  }, []);

  useEffect(() => {
    const fetchSenderBalance = async () => {
      if (!senderId) {
        setLoadingBalance(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('token_balance')
          .eq('id', senderId)
          .single();

        if (!error && data) {
          setSenderBalance(data.token_balance || 0);
        }
      } catch (err) {
        console.error('Error fetching sender balance:', err);
      } finally {
        setLoadingBalance(false);
      }
    };

    if (open && senderId) {
      fetchSenderBalance();
    }
  }, [open, senderId]);

  const handleGift = async () => {
    if (!senderId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send token gifts",
        variant: "destructive"
      });
      return;
    }

    if (amount < 10) {
      toast({
        title: "Minimum Amount",
        description: "Minimum gift amount is ₹10",
        variant: "destructive"
      });
      return;
    }

    if (!hasEnoughTokens) {
      toast({
        title: "Insufficient Tokens",
        description: "You need at least 15,000 tokens to send gifts",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Create gift order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('gift-token-create-order', {
        body: {
          senderId,
          receiverId,
          amount: tokensToGift,
          amountPaid: amount,
          message: message || null
        }
      });

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create gift order');
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Token Gift",
        description: `Gift ${tokensToGift.toLocaleString()} tokens to ${receiverName}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('gift-token-verify', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                gift_id: orderData.gift_id
              }
            });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            toast({
              title: "Gift Sent! 🎁",
              description: `You've gifted ${tokensToGift.toLocaleString()} tokens to ${receiverName}!`
            });

            onOpenChange(false);
            setAmount(10);
            setMessage('');
          } catch (err) {
            console.error('Verification error:', err);
            toast({
              title: "Verification Failed",
              description: "Payment was made but verification failed. Please contact support.",
              variant: "destructive"
            });
          }
        },
        prefill: {},
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Gift error:', error);
      toast({
        title: "Gift Failed",
        description: error instanceof Error ? error.message : "Failed to process gift",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const presetAmounts = [10, 50, 100, 500, 1000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Gift className="h-5 w-5 text-pink-500" />
            Gift Tokens to {receiverName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Sender Balance Check */}
          {loadingBalance ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : !hasEnoughTokens ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Minimum 15K Tokens Required</p>
                  <p className="text-sm text-red-400/80 mt-1">
                    Your balance: {senderBalance.toLocaleString()} tokens
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Purchase more tokens to unlock gifting feature.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Your Balance */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Your Token Balance</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-white font-semibold">{senderBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-3">
                <Label className="text-slate-300">Gift Amount (₹)</Label>
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAmount(preset)}
                      className={amount === preset 
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0" 
                        : "border-slate-600 text-slate-300 hover:bg-slate-800"
                      }
                    >
                      ₹{preset}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 10))}
                  className="bg-slate-800/50 border-slate-600 text-white"
                  placeholder="Custom amount (min ₹10)"
                />
              </div>

              {/* Tokens Preview */}
              <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-xl p-4 border border-pink-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    <span className="text-slate-300">Tokens to Gift</span>
                  </div>
                  <Badge className="bg-pink-600 text-white text-lg px-4 py-1">
                    {tokensToGift.toLocaleString()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  1,000 tokens per ₹1
                </p>
              </div>

              {/* Optional Message */}
              <div className="space-y-2">
                <Label className="text-slate-300">Message (optional)</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a heartfelt message..."
                  className="bg-slate-800/50 border-slate-600 text-white resize-none"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-xs text-slate-500 text-right">{message.length}/200</p>
              </div>

              {/* Gift Button */}
              <Button
                onClick={handleGift}
                disabled={processing || amount < 10}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-6 text-lg font-semibold"
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Heart className="h-5 w-5 mr-2" />
                )}
                {processing ? "Processing..." : `Gift ₹${amount} (${tokensToGift.toLocaleString()} tokens)`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenGiftModal;
