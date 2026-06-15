import React, { useState, useEffect, useMemo } from 'react';
import { Coins, Zap, Calculator, CreditCard, Sparkles, BarChart3, Gift, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { callPaymentApi } from '@/lib/payment-api';
import { ensureRazorpayLoaded } from '@/lib/razorpay-loader';
import { useTokens } from '@/hooks/useTokens';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { useCurrency } from '@/hooks/useCurrency';
import TokenUsageDashboard from '@/components/TokenUsageDashboard';
import DashboardHeader from '@/components/DashboardHeader';
import GiftTokenPopup from '@/components/GiftTokenPopup';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const MIN_AMOUNT_INR = 10;
const MAX_TOKENS = 100000000;

const BuyTokensPage: React.FC = () => {
  const [tokenAmount, setTokenAmount] = useState<number>(1000000);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [customTokenInput, setCustomTokenInput] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const { refetch } = useTokens();
  const { pricePerMillion, tokensPerRupee } = useTokenPrice();
  const { formatPrice, getCurrencyInfo, convertFromINR } = useCurrency();
  const { toast } = useToast();

  const currencyInfo = getCurrencyInfo();
  const MIN_TOKENS = useMemo(() => Math.floor(MIN_AMOUNT_INR * tokensPerRupee), [tokensPerRupee]);

  // Warm up the Razorpay script on mount so opening the checkout is
  // instant when the user clicks Buy. The actual click handler still
  // awaits the loader so a slow page load can't break the flow.
  useEffect(() => {
    ensureRazorpayLoaded().catch(() => undefined);
  }, []);

  const priceInINR = useMemo(() => (tokenAmount / 1000000) * pricePerMillion, [tokenAmount, pricePerMillion]);
  const priceInSelectedCurrency = useMemo(() => convertFromINR(priceInINR), [priceInINR, convertFromINR]);

  const handleSliderChange = (value: number[]) => {
    setTokenAmount(value[0]);
    setCustomPriceInput('');
    setCustomTokenInput('');
  };

  const handlePriceInputChange = (value: string) => {
    setCustomPriceInput(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      const calculatedTokens = Math.floor((numericValue / pricePerMillion) * 1000000);
      setTokenAmount(Math.min(Math.max(calculatedTokens, MIN_TOKENS), MAX_TOKENS));
    }
  };

  const handleTokenInputChange = (value: string) => {
    setCustomTokenInput(value);
    const numericValue = parseInt(value.replace(/,/g, ''));
    if (!isNaN(numericValue) && numericValue > 0) {
      setTokenAmount(Math.min(Math.max(numericValue, MIN_TOKENS), MAX_TOKENS));
    }
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toLocaleString();
  };

  const handlePurchase = async () => {
    if (processing || priceInINR < MIN_AMOUNT_INR) return;
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Login Required", description: "Please log in to purchase tokens", variant: "destructive" });
        setProcessing(false);
        return;
      }

      const orderData = await callPaymentApi<any>('/api/payment/token-purchase/create-order', {
        tokens: tokenAmount,
        amount_inr: priceInINR,
      });

      const scriptLoaded = await ensureRazorpayLoaded();
      if (!scriptLoaded || !window.Razorpay) {
        toast({
          title: "Payment system unavailable",
          description: "Could not load Razorpay. Please disable ad-blockers and refresh.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay({
        // `key_id` is returned by the edge function from the server-side
        // RAZORPAY_KEY_ID Supabase secret. We also accept a Vercel-side
        // VITE_RAZORPAY_KEY_ID as a redundant fallback so the modal still
        // opens if the edge function ever returns a payload missing the
        // key field (older deploy versions).
        key: orderData.key_id || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AvatarTalk.Co",
        description: `${formatTokens(tokenAmount)} AI Tokens`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const verifyData = await callPaymentApi<any>('/api/payment/token-purchase/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              purchase_id: orderData.purchase_id,
            });
            toast({ title: "Success!", description: `${formatTokens(verifyData.tokens_credited)} tokens added` });
            await refetch();
          } catch (verr: any) {
            toast({ title: "Verification Failed", description: verr?.message || "Please contact support if amount was debited.", variant: "destructive" });
          }
          setProcessing(false);
        },
        theme: { color: "#f59e0b" },
        modal: { ondismiss: () => setProcessing(false) }
      });
      razorpay.on('payment.failed', (resp: any) => {
        const err = resp?.error || {};
        toast({
          title: "Payment Failed",
          description: err.description || err.reason || err.code || 'Payment could not be completed.',
          variant: "destructive",
        });
        setProcessing(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Token purchase error:', error);
      toast({
        title: "Failed to create order",
        description: (error?.message || 'Please try again.') + ' Tip: use "Pay via Razorpay (hosted page)" below as a backup.',
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  /**
   * Server-side hosted-checkout fallback.
   *
   * Asks the backend for a Razorpay-hosted payment link, then opens
   * it in a new tab. The user completes payment on Razorpay's own
   * domain; our webhook (`POST /api/payment/webhook`) credits the
   * tokens once `payment_link.paid` fires — no `/verify` round-trip
   * required.
   */
  const openHostedCheckout = async () => {
    setProcessing(true);
    try {
      const linkData = await callPaymentApi<any>('/api/payment/token-purchase/payment-link', {
        tokens: tokenAmount,
        amount_inr: priceInINR,
        callback_url: `${window.location.origin}/settings/buy-tokens?paid=1`,
      });
      const url = linkData?.payment_link_url;
      if (!url) throw new Error('No payment link returned by server');
      toast({
        title: 'Opening hosted checkout',
        description: 'Complete the payment in the new tab. Tokens credit automatically.',
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      toast({
        title: 'Hosted checkout failed',
        description: e?.message || 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const quickOptions = useMemo(() => {
    const baseOptions = [10, 50, 100, 500, 1000];
    return baseOptions.map(inr => ({
      tokens: Math.floor(inr * tokensPerRupee),
      label: formatPrice(inr)
    }));
  }, [tokensPerRupee, formatPrice]);

  const handleUserSearch = async () => {
    if (!userSearch.trim()) return;
    setSearchLoading(true);
    const { data } = await supabase.from('profiles').select('id, username, display_name, profile_pic_url').or(`username.ilike.%${userSearch}%,display_name.ilike.%${userSearch}%`).limit(10);
    if (data) setSearchResults(data);
    setSearchLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <DashboardHeader title="AI Tokens" description="Buy tokens and track usage" icon={<Coins className="w-7 h-7 text-amber-500" />} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-sm">
            <TabsTrigger value="buy"><CreditCard className="w-4 h-4 mr-1" />Buy</TabsTrigger>
            <TabsTrigger value="gift"><Gift className="w-4 h-4 mr-1" />Gift</TabsTrigger>
            <TabsTrigger value="usage"><BarChart3 className="w-4 h-4 mr-1" />Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-4">
            <Card className="border border-amber-200/50 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 dark:from-amber-950/20 dark:to-yellow-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg"><Zap className="w-5 h-5 text-amber-500" />Buy Tokens</CardTitle>
                <CardDescription>Select the amount of tokens you want to purchase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-3 bg-gradient-to-br from-amber-100/50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl">
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{formatTokens(tokenAmount)}</p>
                  <p className="text-sm text-muted-foreground">{tokenAmount.toLocaleString()} tokens</p>
                </div>

                <Slider value={[tokenAmount]} onValueChange={handleSliderChange} min={MIN_TOKENS} max={MAX_TOKENS} step={100000} />

                <div className="flex flex-wrap gap-1.5 justify-center">
                  {quickOptions.map((opt) => (
                    <Button key={opt.label} variant={tokenAmount === opt.tokens ? "default" : "outline"} size="sm" onClick={() => { setTokenAmount(opt.tokens); setCustomPriceInput(''); setCustomTokenInput(''); }} className={tokenAmount === opt.tokens ? "bg-gradient-to-r from-amber-500 to-yellow-500" : ""}>{opt.label}</Button>
                  ))}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium"><Calculator className="w-3 h-3 inline mr-1" />Amount ({currencyInfo.symbol})</label><Input type="number" placeholder={`Min ${formatPrice(MIN_AMOUNT_INR)}`} value={customPriceInput} onChange={(e) => handlePriceInputChange(e.target.value)} className="h-9" /></div>
                  <div><label className="text-xs font-medium"><Sparkles className="w-3 h-3 inline mr-1" />Tokens</label><Input type="text" placeholder="Tokens" value={customTokenInput} onChange={(e) => handleTokenInputChange(e.target.value)} className="h-9" /></div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-amber-600">{formatPrice(priceInINR)} <span className="text-xs text-muted-foreground">(₹{priceInINR.toFixed(0)})</span></span>
                </div>

                <Button onClick={handlePurchase} disabled={processing || priceInINR < MIN_AMOUNT_INR} className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600" data-testid="buy-tokens-button">
                  {processing ? 'Processing...' : <><CreditCard className="w-4 h-4 mr-2" />Pay {formatPrice(priceInINR)}</>}
                </Button>

                <Button
                  onClick={openHostedCheckout}
                  disabled={processing || priceInINR < MIN_AMOUNT_INR}
                  variant="outline"
                  className="w-full h-9 text-xs"
                  data-testid="open-hosted-checkout-fallback"
                >
                  Pay via Razorpay (hosted page) — no popup required
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gift" className="mt-4">
            <Card className="border border-pink-200/50 bg-gradient-to-br from-pink-50/30 to-purple-50/30 dark:from-pink-950/20 dark:to-purple-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg"><Gift className="w-5 h-5 text-pink-500" />Gift Tokens</CardTitle>
                <CardDescription>Search and gift tokens to creators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Search username..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()} className="h-10" />
                  <Button onClick={handleUserSearch} disabled={searchLoading}>{searchLoading ? '...' : 'Search'}</Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div key={user.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${selectedUser?.id === user.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30' : 'hover:bg-pink-50 dark:hover:bg-pink-950/30'}`} onClick={() => setSelectedUser(user)}>
                        <Avatar className="h-8 w-8"><AvatarImage src={user.profile_pic_url} /><AvatarFallback className="bg-pink-100 text-pink-700">{(user.display_name || user.username || 'U')[0].toUpperCase()}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{user.display_name || user.username}</p><p className="text-xs text-muted-foreground">@{user.username}</p></div>
                        {selectedUser?.id === user.id && <Badge className="bg-pink-500">✓</Badge>}
                      </div>
                    ))}
                  </div>
                )}

                {selectedUser && (
                  <Button onClick={() => setGiftModalOpen(true)} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" data-testid="gift-tokens-button">
                    <Gift className="w-4 h-4 mr-2" />Gift to {selectedUser.display_name || selectedUser.username}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="mt-4">
            <TokenUsageDashboard />
          </TabsContent>
        </Tabs>

        {selectedUser && <GiftTokenPopup open={giftModalOpen} onOpenChange={setGiftModalOpen} receiverId={selectedUser.id} receiverName={selectedUser.display_name || selectedUser.username} receiverAvatar={selectedUser.profile_pic_url} />}
      </div>
    </div>
  );
};

export default BuyTokensPage;
