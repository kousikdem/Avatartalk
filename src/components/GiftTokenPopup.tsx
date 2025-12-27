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
import { Gift, Coins, Heart, Sparkles, Mic, Volume2 } from 'lucide-react';
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

// Regular token price: 1M tokens = ₹420
const TOKENS_PER_RUPEE = 1000000 / 420; // ~2380.95 tokens per ₹1
const MIN_AMOUNT = 10; // ₹10 minimum

const presetAmounts = [
  { amount: 10, label: '₹10', popular: false },
  { amount: 50, label: '₹50', popular: false },
  { amount: 100, label: '₹100', popular: true },
  { amount: 250, label: '₹250', popular: false },
  { amount: 500, label: '₹500', popular: false },
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Fetch sender balance and user ID
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data } = await supabase
          .from('profiles')
          .select('token_balance')
          .eq('id', user.id)
          .single();
        if (data) setSenderBalance(data.token_balance);
      }
    };
    fetchUserData();
  }, []);

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const calculatedTokens = Math.floor(finalAmount * TOKENS_PER_RUPEE);
  
  // User can gift from own tokens if they have enough to retain 15k after gifting
  const canGiftFromOwn = senderBalance !== null && senderBalance >= calculatedTokens + 15000;

  const handleGift = async (fromOwnTokens: boolean) => {
    if (processing) return;
    if (finalAmount < MIN_AMOUNT) {
      toast({ title: `Minimum ₹${MIN_AMOUNT}`, description: `Minimum gift amount is ₹${MIN_AMOUNT}`, variant: 'destructive' });
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
        const { data, error } = await supabase.rpc('transfer_tokens' as any, {
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
        // Gift via Razorpay payment - works for anyone (even visitors with no tokens)
        const { data: orderData, error: orderError } = await supabase.functions.invoke('gift-token-create-order', {
          body: {
            senderId: user?.id || null, // Can be null for anonymous
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-pink-950/50 dark:via-slate-900 dark:to-purple-950/50 border-2 border-pink-300 dark:border-pink-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-pink-700 dark:text-pink-300">
            <Gift className="w-7 h-7 text-pink-500" />
            Gift AI Tokens
          </DialogTitle>
          <DialogDescription className="text-base text-pink-600 dark:text-pink-400">
            {isFirstTimeVisitor 
              ? customMessage || (
                <span className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <Volume2 className="w-4 h-4" />
                  Help {receiverName} power their AI assistant with voice + text capabilities!
                </span>
              )
              : `Send tokens to support ${receiverName}'s AI conversations`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Receiver Info */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 rounded-xl border-2 border-pink-200 dark:border-pink-700">
            <Avatar className="h-14 w-14 ring-4 ring-pink-300 dark:ring-pink-600">
              <AvatarImage src={receiverAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xl font-bold">
                {receiverName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg text-pink-800 dark:text-pink-200">{receiverName}</p>
              <p className="text-sm text-pink-600 dark:text-pink-400">Will receive your gift</p>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-pink-700 dark:text-pink-300">Select Amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset.amount}
                  variant={selectedAmount === preset.amount && !customAmount ? 'default' : 'outline'}
                  className={`relative h-auto py-3 ${selectedAmount === preset.amount && !customAmount 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg' 
                    : 'border-2 border-pink-300 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30'}`}
                  onClick={() => {
                    setSelectedAmount(preset.amount);
                    setCustomAmount('');
                  }}
                >
                  {preset.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-1.5 shadow-md">
                      Popular
                    </Badge>
                  )}
                  <div className="text-center">
                    <div className="font-bold text-lg">{preset.label}</div>
                    <div className="text-xs opacity-80">{Math.floor(preset.amount * TOKENS_PER_RUPEE).toLocaleString()} tokens</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="relative mt-3">
              <Input
                type="number"
                placeholder={`Custom amount (min ₹${MIN_AMOUNT})`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={MIN_AMOUNT}
                className="pl-8 h-12 text-lg border-2 border-pink-300 dark:border-pink-600 focus:border-pink-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 font-bold">₹</span>
            </div>
          </div>

          {/* Token Preview */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 rounded-xl border-2 border-amber-300 dark:border-amber-600">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-500" />
              <span className="text-base font-medium text-amber-700 dark:text-amber-300">Tokens to gift</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {calculatedTokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label className="text-pink-700 dark:text-pink-300 font-medium">Message (optional)</Label>
            <Textarea
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="border-2 border-pink-300 dark:border-pink-600 focus:border-pink-500"
            />
          </div>

          {/* Your Balance - only show if logged in */}
          {senderBalance !== null && (
            <div className="text-sm p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              Your balance: <span className="font-bold text-pink-600">{senderBalance.toLocaleString()} tokens</span>
              {canGiftFromOwn && (
                <span className="text-green-600 ml-2 font-medium">✓ Can gift from own tokens</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleGift(false)}
              disabled={processing || finalAmount < MIN_AMOUNT}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <Gift className="w-5 h-5 mr-2" />
              {processing ? 'Processing...' : `Pay ₹${finalAmount.toFixed(0)} & Gift ${calculatedTokens.toLocaleString()} Tokens`}
            </Button>

            {canGiftFromOwn && (
              <Button
                variant="outline"
                onClick={() => handleGift(true)}
                disabled={processing}
                className="w-full h-12 border-2 border-pink-400 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30 font-semibold"
              >
                <Heart className="w-4 h-4 mr-2 text-pink-500" />
                Gift from My Tokens (Keep 15K)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiftTokenPopup;
