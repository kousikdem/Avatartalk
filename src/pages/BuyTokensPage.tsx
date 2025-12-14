import React, { useState, useEffect, useMemo } from 'react';
import { Coins, Zap, Calculator, CreditCard, Info, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTokens } from '@/hooks/useTokens';
import TokenDisplay from '@/components/TokenDisplay';
import TokenUsageDashboard from '@/components/TokenUsageDashboard';
import DashboardHeader from '@/components/DashboardHeader';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Pricing: 1 Token = $0.000005, 1M Tokens = $5 = ₹420 (approx)
const PRICE_PER_MILLION_TOKENS_USD = 5;
const PRICE_PER_MILLION_TOKENS_INR = 420;
const MIN_TOKENS = 100000; // 100K minimum
const MAX_TOKENS = 100000000; // 100M maximum
const MIN_AMOUNT_INR = 42; // ₹42 = 100K tokens

const BuyTokensPage: React.FC = () => {
  const [tokenAmount, setTokenAmount] = useState<number>(1000000);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [customTokenInput, setCustomTokenInput] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const { tokenBalance, dailyUsage, refetch } = useTokens();
  const { toast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Calculate price from tokens
  const priceInINR = useMemo(() => {
    return (tokenAmount / 1000000) * PRICE_PER_MILLION_TOKENS_INR;
  }, [tokenAmount]);

  const priceInUSD = useMemo(() => {
    return (tokenAmount / 1000000) * PRICE_PER_MILLION_TOKENS_USD;
  }, [tokenAmount]);

  const pricePerToken = useMemo(() => {
    return PRICE_PER_MILLION_TOKENS_INR / 1000000;
  }, []);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newTokens = value[0];
    setTokenAmount(newTokens);
    setCustomPriceInput('');
    setCustomTokenInput('');
  };

  // Handle custom price input
  const handlePriceInputChange = (value: string) => {
    setCustomPriceInput(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      const calculatedTokens = Math.floor((numericValue / PRICE_PER_MILLION_TOKENS_INR) * 1000000);
      const clampedTokens = Math.min(Math.max(calculatedTokens, MIN_TOKENS), MAX_TOKENS);
      setTokenAmount(clampedTokens);
    }
  };

  // Handle custom token input
  const handleTokenInputChange = (value: string) => {
    setCustomTokenInput(value);
    const numericValue = parseInt(value.replace(/,/g, ''));
    if (!isNaN(numericValue) && numericValue > 0) {
      const clampedTokens = Math.min(Math.max(numericValue, MIN_TOKENS), MAX_TOKENS);
      setTokenAmount(clampedTokens);
    }
  };

  // Format numbers
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toLocaleString();
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (processing || priceInINR < MIN_AMOUNT_INR) return;

    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase tokens",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }

      // Create order for custom amount
      const { data: orderData, error: orderError } = await supabase.functions.invoke('custom-token-purchase', {
        body: {
          tokens: tokenAmount,
          amount_inr: priceInINR,
          user_id: user.id
        }
      });

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || 'Failed to create order');
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
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AvatarTalk.Co",
        description: `${formatTokens(tokenAmount)} AI Tokens`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('custom-token-verify', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user.id,
                purchase_id: orderData.purchase_id
              }
            });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            toast({
              title: "Purchase Successful!",
              description: `${formatTokens(verifyData.tokens_credited)} tokens have been added to your account`,
            });

            await refetch();
          } catch (error) {
            console.error('Verification error:', error);
            toast({
              title: "Verification Failed",
              description: "Please contact support if tokens are not credited",
              variant: "destructive"
            });
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
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  // Quick select options
  const quickOptions = [
    { tokens: 500000, label: '500K' },
    { tokens: 1000000, label: '1M' },
    { tokens: 5000000, label: '5M' },
    { tokens: 10000000, label: '10M' },
    { tokens: 50000000, label: '50M' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader
          title="AI Tokens"
          description="Buy tokens and track your AI usage"
          icon={<Coins className="w-8 h-8 text-amber-500" />}
        />

            {/* Tabs for Buy / Usage */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="buy" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Buy Tokens
                </TabsTrigger>
                <TabsTrigger value="usage" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Usage Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-6 mt-6">

          {/* Main Purchase Card */}
          <Card className="border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Select Token Amount
              </CardTitle>
              <CardDescription>
                Drag the slider or enter a custom amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Token Display */}
              <div className="text-center py-6 bg-gradient-to-br from-amber-100/50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-2">Tokens to receive</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  {formatTokens(tokenAmount)}
                </p>
                <p className="text-lg text-muted-foreground mt-2">
                  {tokenAmount.toLocaleString()} tokens
                </p>
              </div>

              {/* Slider */}
              <div className="px-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>100K</span>
                  <span>100M</span>
                </div>
                <Slider
                  value={[tokenAmount]}
                  onValueChange={handleSliderChange}
                  min={MIN_TOKENS}
                  max={MAX_TOKENS}
                  step={100000}
                  className="w-full"
                />
              </div>

              {/* Quick Select */}
              <div className="flex flex-wrap gap-2 justify-center">
                {quickOptions.map((option) => (
                  <Button
                    key={option.tokens}
                    variant={tokenAmount === option.tokens ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTokenAmount(option.tokens);
                      setCustomPriceInput('');
                      setCustomTokenInput('');
                    }}
                    className={tokenAmount === option.tokens ? "bg-gradient-to-r from-amber-500 to-yellow-500" : ""}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <Separator />

              {/* Custom Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Enter Amount (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter price in INR"
                    value={customPriceInput}
                    onChange={(e) => handlePriceInputChange(e.target.value)}
                    min={MIN_AMOUNT_INR}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Min: ₹{MIN_AMOUNT_INR}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Enter Tokens
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter token amount"
                    value={customTokenInput}
                    onChange={(e) => handleTokenInputChange(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Min: {formatTokens(MIN_TOKENS)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <Card className="bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Price Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tokens</span>
                      <span className="font-medium">{tokenAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per 1M tokens</span>
                      <span className="font-medium">₹{PRICE_PER_MILLION_TOKENS_INR}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per token</span>
                      <span className="font-medium">₹{pricePerToken.toFixed(6)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Price</span>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">₹{priceInINR.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">(~${priceInUSD.toFixed(2)})</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                disabled={processing || priceInINR < MIN_AMOUNT_INR}
                size="lg"
                className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg"
              >
                {processing ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₹{priceInINR.toFixed(2)} with Razorpay
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold">Token Usage</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tokens are used for AI chat responses. Input and output are counted separately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
              <CardContent className="pt-6">
                <Sparkles className="w-8 h-8 text-emerald-500 mb-3" />
                <h3 className="font-semibold">Never Expire</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Purchased tokens never expire and carry over indefinitely.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
              <CardContent className="pt-6">
                <Coins className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold">Best Value</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ₹420 for 1M tokens. Average conversation uses 50-100 tokens.
                </p>
              </CardContent>
            </Card>
          </div>
              </TabsContent>

              <TabsContent value="usage" className="mt-6">
                <TokenUsageDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
  );
};

export default BuyTokensPage;