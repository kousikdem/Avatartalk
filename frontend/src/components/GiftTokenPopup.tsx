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
import { useTokenPrice } from '@/hooks/useTokenPrice';

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
  const [minRetainTokens, setMinRetainTokens] = useState(15000);
  const { toast } = useToast();
  const { tokensPerRupee, pricePerMillion } = useTokenPrice();

  useEffect(() => {
    // Load Razorpay script
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Fetch sender balance, user ID, and min retain tokens
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

      // Fetch min retain tokens from system limits
      const { data: limitData } = await supabase
        .from('ai_system_limits')
        .select('limit_value')
        .eq('limit_key', 'visitor_gift_minimum_tokens')
        .maybeSingle();
      
      if (limitData?.limit_value) {
        const limitValue = limitData.limit_value as { limit?: number };
        if (limitValue.limit) {
          setMinRetainTokens(limitValue.limit);
        }
      }
    };
    fetchUserData();
  }, []);

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const calculatedTokens = Math.floor(finalAmount * tokensPerRupee);
  
  // User can gift from own tokens if they have enough to retain minRetainTokens after gifting
  const canGiftFromOwn = senderBalance !== null && senderBalance >= calculatedTokens + minRetainTokens;

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
        const { data, error } = await supabase.rpc('transfer_tokens', {
          p_sender_id: user.id,
          p_receiver_id: receiverId,
          p_amount: calculatedTokens,
          p_message: message || null
        });

        if (error) {
          console.error('Transfer tokens error:', error);
          throw new Error(error.message || 'Failed to transfer tokens');
        }

        // Check if the RPC returned an error in the response
        const result = data as { success: boolean; error?: string; gift_id?: string } | null;
        if (result && !result.success) {
          throw new Error(result.error || 'Transfer failed');
        }

        toast({
          title: 'Gift Sent! 🎁',
          description: `You gifted ${calculatedTokens.toLocaleString()} tokens to ${receiverName}`,
        });
        
        // Update sender balance locally
        setSenderBalance(prev => prev !== null ? prev - calculatedTokens : null);
        onOpenChange(false);
      } else {
        // Gift via Razorpay payment - requires login (token_gifts.sender_id is NOT NULL)
        if (!user) {
          toast({
            title: 'Login Required',
            description: 'Please login to send token gifts',
            variant: 'destructive'
          });
          setProcessing(false);
          return;
        }

        const { data: orderData, error: orderError } = await supabase.functions.invoke('gift-token-create-order', {
          body: {
            senderId: user.id,
            receiverId,
            amount: calculatedTokens,
            amountPaid: finalAmount, // Send in rupees, edge function converts to paise
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
                 throw new Error(verifyData?.error || verifyError?.message || 'Verification failed');
               }

               toast({
                 title: 'Gift Sent! 🎁',
                 description: `${receiverName} received ${calculatedTokens.toLocaleString()} tokens!`,
               });
               onOpenChange(false);
             } catch (error) {
               console.error('Verification error:', error);
               toast({
                 title: 'Error',
                 description: error instanceof Error ? error.message : 'Payment verification failed',
                 variant: 'destructive'
               });
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
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-pink-950/50 dark:via-slate-900 dark:to-purple-950/50 border-2 border-pink-300 dark:border-pink-700 p-4 sm:p-5">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-pink-700 dark:text-pink-300">
            <Gift className="w-5 h-5 text-pink-500" />
            Gift AI Tokens
          </DialogTitle>
          <DialogDescription className="text-sm text-pink-600 dark:text-pink-400">
            {isFirstTimeVisitor 
              ? customMessage || (
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <Volume2 className="w-3.5 h-3.5" />
                  Help {receiverName} power their AI!
                </span>
              )
              : `Support ${receiverName}'s AI conversations`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Receiver Info - Compact */}
          <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 rounded-lg border border-pink-200 dark:border-pink-700">
            <Avatar className="h-10 w-10 ring-2 ring-pink-300 dark:ring-pink-600">
              <AvatarImage src={receiverAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-sm font-bold">
                {receiverName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-pink-800 dark:text-pink-200">{receiverName}</p>
              <p className="text-xs text-pink-600 dark:text-pink-400">Will receive your gift</p>
            </div>
          </div>

          {/* Amount Selection - Compact Grid */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-pink-700 dark:text-pink-300">Select Amount</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset.amount}
                  variant={selectedAmount === preset.amount && !customAmount ? 'default' : 'outline'}
                  size="sm"
                  className={`relative h-auto py-1.5 px-1 ${selectedAmount === preset.amount && !customAmount 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-md' 
                    : 'border border-pink-300 dark:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30'}`}
                  onClick={() => {
                    setSelectedAmount(preset.amount);
                    setCustomAmount('');
                  }}
                >
                  {preset.popular && (
                    <Badge className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[8px] px-1 py-0 leading-tight">
                      ★
                    </Badge>
                  )}
                  <span className="font-bold text-xs">{preset.label}</span>
                </Button>
              ))}
            </div>

            <div className="relative">
              <Input
                type="number"
                placeholder={`Custom (min ₹${MIN_AMOUNT})`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={MIN_AMOUNT}
                className="pl-6 h-9 text-sm border border-pink-300 dark:border-pink-600 focus:border-pink-500"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-pink-500 font-bold text-sm">₹</span>
            </div>
          </div>

          {/* Token Preview - Compact */}
          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 rounded-lg border border-amber-300 dark:border-amber-600">
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Tokens</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {calculatedTokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Message - Compact */}
          <div className="space-y-1">
            <Label className="text-xs text-pink-700 dark:text-pink-300">Message (optional)</Label>
            <Textarea
              placeholder="Add a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={1}
              className="border border-pink-300 dark:border-pink-600 focus:border-pink-500 text-sm min-h-[36px] resize-none"
            />
          </div>

          {/* Your Balance - Compact */}
          {senderBalance !== null && (
            <div className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-between">
              <span>Your balance: <span className="font-bold text-pink-600">{senderBalance.toLocaleString()}</span></span>
              {canGiftFromOwn && <span className="text-green-600 font-medium">✓ Can gift</span>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              onClick={() => handleGift(false)}
              disabled={processing || finalAmount < MIN_AMOUNT}
              className="w-full h-9 text-sm font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-lg"
            >
              <Gift className="w-4 h-4 mr-1.5" />
              {processing ? 'Processing...' : `Pay ₹${finalAmount.toFixed(0)} & Gift`}
            </Button>

            {canGiftFromOwn && (
              <Button
                variant="outline"
                onClick={() => handleGift(true)}
                disabled={processing}
                size="sm"
                className="w-full h-8 border border-pink-400 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30 font-medium text-xs"
              >
                <Heart className="w-3.5 h-3.5 mr-1 text-pink-500" />
                Gift from My Tokens ({calculatedTokens.toLocaleString()} tokens)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiftTokenPopup;
