import React, { useState, useEffect } from 'react';
import { Coins, Sparkles, Check, Zap, Crown, Star, Rocket, Building } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTokens } from '@/hooks/useTokens';
import { useToast } from '@/hooks/use-toast';

interface TokenPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const packageIcons: Record<string, React.ReactNode> = {
  Starter: <Zap className="w-5 h-5" />,
  Basic: <Star className="w-5 h-5" />,
  Popular: <Crown className="w-5 h-5" />,
  Pro: <Rocket className="w-5 h-5" />,
  Enterprise: <Building className="w-5 h-5" />,
};

const packageColors: Record<string, string> = {
  Starter: 'from-gray-400 to-gray-500',
  Basic: 'from-blue-400 to-blue-500',
  Popular: 'from-amber-400 to-yellow-500',
  Pro: 'from-purple-400 to-purple-500',
  Enterprise: 'from-emerald-400 to-emerald-500',
};

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { packages, purchaseTokens, verifyPurchase, tokenBalance } = useTokens();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePurchase = async (packageId: string) => {
    if (processing) return;
    
    setProcessing(true);
    setSelectedPackage(packageId);

    try {
      const orderData = await purchaseTokens(packageId);
      
      if (!orderData) {
        setProcessing(false);
        return;
      }

      if (!window.Razorpay) {
        toast({
          title: "Payment Error",
          description: "Payment system not loaded. Please refresh and try again.",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AvatarTalk.Co",
        description: `${orderData.tokens} AI Tokens`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const success = await verifyPurchase(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
            packageId
          );

          if (success) {
            onOpenChange(false);
          }
          setProcessing(false);
        },
        prefill: {},
        theme: {
          color: "#f59e0b"
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
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500">
              <Coins className="w-5 h-5 text-white" />
            </div>
            Buy AI Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Balance */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold text-slate-800">{tokenBalance.toLocaleString()} tokens</p>
            </div>
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>

          {/* Token Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const totalTokens = pkg.tokens + pkg.bonus_tokens;
              const pricePerToken = pkg.price_inr / totalTokens;
              const isPopular = pkg.is_popular;
              const colorClass = packageColors[pkg.name] || 'from-gray-400 to-gray-500';

              return (
                <div
                  key={pkg.id}
                  className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedPackage === pkg.id
                      ? 'border-amber-400 bg-amber-50'
                      : isPopular
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {isPopular && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500">
                      Most Popular
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} text-white`}>
                      {packageIcons[pkg.name] || <Coins className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        ₹{pricePerToken.toFixed(4)}/token
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">₹{pkg.price_inr}</span>
                      {pkg.price_usd && (
                        <span className="text-sm text-muted-foreground">
                          (~${pkg.price_usd})
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">{formatTokens(pkg.tokens)} tokens</span>
                      </div>
                      {pkg.bonus_tokens > 0 && (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">+{formatTokens(pkg.bonus_tokens)} bonus!</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Total: {formatTokens(totalTokens)} tokens
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(pkg.id);
                    }}
                    disabled={processing}
                    className={`w-full mt-4 ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                        : ''
                    }`}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {processing && selectedPackage === pkg.id ? (
                      'Processing...'
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700">
            <p className="font-medium mb-1">How tokens work:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Tokens are used for AI chat responses on your profile</li>
              <li>Input and output messages consume tokens based on length</li>
              <li>Average conversation uses ~50-100 tokens</li>
              <li>Tokens never expire and carry over</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenPurchaseModal;
