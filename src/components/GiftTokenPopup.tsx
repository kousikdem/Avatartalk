import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift, Coins, Heart, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface GiftTokenPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  customMessage?: string;
  isFirstTimeVisitor?: boolean;
}

const TOKENS_PER_RUPEE = 100000 / 420; // 1M tokens = ₹420

const presetAmounts = [
  { amount: 50, tokens: 11904, label: '₹50', popular: false },
  { amount: 100, tokens: 23809, label: '₹100', popular: true },
  { amount: 250, tokens: 59523, label: '₹250', popular: false },
  { amount: 500, tokens: 119047, label: '₹500', popular: false },
];

const GiftTokenPopup: React.FC<GiftTokenPopupProps> = ({
  open,
  onOpenChange,
  receiverId,
  receiverName,
  receiverAvatar,
  customMessage,
  isFirstTimeVisitor = false,
}) => {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [senderBalance, setSenderBalance] = useState<number | null>(null);
  const [giftFromOwn, setGiftFromOwn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Fetch sender balance
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('token_balance')
          .eq('id', user.id)
          .single();
        if (data) setSenderBalance(data.token_balance);
      }
    };
    fetchBalance();
  }, []);

  const calculatedTokens = Math.floor((customAmount ? parseFloat(customAmount) : selectedAmount) * TOKENS_PER_RUPEE);
  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const canGiftFromOwn = senderBalance !== null && senderBalance >= calculatedTokens + 15000;

  const handleGift = async (fromOwnTokens: boolean) => {
    if (processing) return;
    if (finalAmount < 10) {
      toast({ title: 'Minimum ₹10', description: 'Minimum gift amount is ₹10', variant: 'destructive' });
      return;
    }

    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (fromOwnTokens) {
        if (!user) {
          toast({ title: 'Login Required', description: 'Please login to gift from your tokens', variant: 'destructive' });
          setProcessing(false);
          return;
        }

        // Gift from own tokens - direct transfer
        const { data, error } = await supabase.rpc('transfer_tokens', {
          p_sender_id: user.id,
          p_receiver_id: receiverId,
          p_amount: calculatedTokens,
          p_message: message || null
        });

        if (error) throw error;

        toast({
          title: 'Gift Sent! 🎁',
          description: `You gifted ${calculatedTokens.toLocaleString()} tokens to ${receiverName}`,
        });
        onOpenChange(false);
      } else {
        // Gift via payment
        const { data: orderData, error: orderError } = await supabase.functions.invoke('gift-token-create-order', {
          body: {
            senderId: user?.id,
            receiverId,
            amount: calculatedTokens,
            amountPaid: Math.ceil(finalAmount * 100), // paise
            message
          }
        });

        if (orderError || !orderData?.success) {
          throw new Error(orderData?.error || 'Failed to create order');
        }

        if (!window.Razorpay) {
          toast({ title: 'Error', description: 'Payment system not loaded', variant: 'destructive' });
          setProcessing(false);
          return;
        }

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'AvatarTalk Gift',
          description: `Gift ${calculatedTokens.toLocaleString()} tokens to ${receiverName}`,
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
                throw new Error(verifyData?.error || 'Verification failed');
              }

              toast({
                title: 'Gift Sent! 🎁',
                description: `${receiverName} received ${calculatedTokens.toLocaleString()} tokens!`,
              });
              onOpenChange(false);
            } catch (error) {
              console.error('Verification error:', error);
              toast({ title: 'Error', description: 'Payment verification failed', variant: 'destructive' });
            }
            setProcessing(false);
          },
          theme: { color: '#ec4899' },
          modal: { ondismiss: () => setProcessing(false) }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        return;
      }
    } catch (error) {
      console.error('Gift error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send gift',
        variant: 'destructive'
      });
    }
    setProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="w-6 h-6 text-pink-500" />
            Gift AI Tokens
          </DialogTitle>
          <DialogDescription>
            {isFirstTimeVisitor 
              ? customMessage || `Help ${receiverName} power their AI assistant with voice + text capabilities!`
              : `Send tokens to support ${receiverName}'s AI conversations`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Receiver Info */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-lg">
            <Avatar className="h-12 w-12 ring-2 ring-pink-200">
              <AvatarImage src={receiverAvatar} />
              <AvatarFallback className="bg-pink-100 text-pink-700">
                {receiverName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{receiverName}</p>
              <p className="text-sm text-muted-foreground">Will receive your gift</p>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-3">
            <Label>Select Amount</Label>
            <div className="grid grid-cols-2 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset.amount}
                  variant={selectedAmount === preset.amount && !customAmount ? 'default' : 'outline'}
                  className={`relative ${selectedAmount === preset.amount && !customAmount ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}`}
                  onClick={() => {
                    setSelectedAmount(preset.amount);
                    setCustomAmount('');
                  }}
                >
                  {preset.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-amber-500 text-xs px-1">
                      Popular
                    </Badge>
                  )}
                  <div className="text-center">
                    <div className="font-bold">{preset.label}</div>
                    <div className="text-xs opacity-80">{preset.tokens.toLocaleString()} tokens</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="relative">
              <Input
                type="number"
                placeholder="Custom amount (₹)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={10}
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            </div>
          </div>

          {/* Token Preview */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="text-sm">Tokens to gift</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xl font-bold text-amber-600">
                {calculatedTokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>

          {/* Your Balance */}
          {senderBalance !== null && (
            <div className="text-sm text-muted-foreground">
              Your balance: <span className="font-medium">{senderBalance.toLocaleString()} tokens</span>
              {canGiftFromOwn && (
                <span className="text-green-600 ml-2">✓ Can gift from own tokens</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => handleGift(false)}
              disabled={processing || finalAmount < 10}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Gift className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : `Pay ₹${finalAmount.toFixed(0)} & Gift`}
            </Button>

            {canGiftFromOwn && (
              <Button
                variant="outline"
                onClick={() => handleGift(true)}
                disabled={processing}
                className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Heart className="w-4 h-4 mr-2" />
                Gift from My Tokens
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiftTokenPopup;
