import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { 
  Check, Star, Zap, Crown, Rocket, User, Bot, UserCircle, Coins, FileText, 
  BarChart2, Link, Users, Gift, Sparkles, MessageCircle, Mic, Brain, FileUp,
  Package, CreditCard, Tag, BarChart3, Video, Calendar, Globe, MessageSquare,
  Mic2, AudioLines, CalendarDays, Link2, TrendingUp, DollarSign, UserCog,
  Shield, Infinity, Code, Users2, Building2, Handshake, Ticket, Receipt,
  ShoppingBag, Loader2, Eye, Lock, ChevronRight, Upload, BookOpen, HelpCircle
} from 'lucide-react';
import { usePlatformPricingPlans, useUserPlatformSubscription, PlatformFeature } from '@/hooks/usePlatformPricingPlans';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import MainAuth from './MainAuth';
import ShareModal from './ShareModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES, useCurrency } from '@/hooks/useCurrency';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Bot, UserCircle, Coins, FileText, BarChart2, Link, Users, Gift,
  Sparkles, MessageCircle, Mic, Brain, FileUp, Package, CreditCard, Tag,
  BarChart3, Video, Calendar, Globe, MessageSquare, Mic2, AudioLines,
  CalendarDays, Link2, TrendingUp, DollarSign, UserCog, Shield, Infinity,
  Code, Users2, Building2, Handshake, Ticket, Receipt, ShoppingBag, Star,
  Zap, Crown, Rocket, Check, Eye, Lock
};

const planGradients: Record<string, string> = {
  free: 'from-slate-400 to-slate-500',
  creator: 'from-blue-500 to-purple-500',
  pro: 'from-purple-500 to-pink-500',
  business: 'from-orange-500 to-red-500',
};

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Star,
  creator: Zap,
  pro: Crown,
  business: Rocket,
};

const durationOptions = [1, 3, 6, 12, 24];
const durationLabels: Record<number, string> = {
  1: '1 Month',
  3: '3 Months',
  6: '6 Months',
  12: '1 Year',
  24: '2 Years',
};

const durationDiscounts: Record<number, number> = {
  1: 0,
  3: 10,
  6: 15,
  12: 20,
  24: 30,
};

// Token Purchase Add-on Component
const TokenPurchaseAddon = ({ currSymbol }: { currSymbol: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pricePerMillion, tokensPerRupee } = useTokenPrice();
  const { formatPrice, convertFromINR } = useCurrency();
  const [tokenAmount, setTokenAmount] = useState(1000000);
  const [processing, setProcessing] = useState(false);

  const MIN_AMOUNT_INR = 10;
  const MAX_TOKENS = 50000000;
  const MIN_TOKENS = Math.floor(MIN_AMOUNT_INR * tokensPerRupee);
  
  const priceInINR = (tokenAmount / 1000000) * pricePerMillion;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toLocaleString();
  };

  const quickOptions = [
    { tokens: Math.floor(50 * tokensPerRupee), label: '50' },
    { tokens: Math.floor(100 * tokensPerRupee), label: '100' },
    { tokens: Math.floor(500 * tokensPerRupee), label: '500' },
    { tokens: 1000000, label: '1M tokens' },
    { tokens: 5000000, label: '5M tokens' },
  ];

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

      const { data: orderData, error: orderError } = await supabase.functions.invoke('custom-token-purchase', {
        body: { tokens: tokenAmount, amount_inr: priceInINR, user_id: user.id }
      });

      if (orderError || !orderData?.success) throw new Error(orderData?.error || 'Failed to create order');
      
      if (!window.Razorpay) {
        toast({ title: "Error", description: "Payment system not loaded", variant: "destructive" });
        setProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AvatarTalk.Co",
        description: `${formatTokens(tokenAmount)} AI Tokens`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('custom-token-verify', {
            body: { 
              razorpay_payment_id: response.razorpay_payment_id, 
              razorpay_order_id: response.razorpay_order_id, 
              razorpay_signature: response.razorpay_signature, 
              user_id: user.id, 
              purchase_id: orderData.purchase_id 
            }
          });
          if (!verifyError && verifyData?.success) {
            toast({ title: "🎉 Success!", description: `${formatTokens(verifyData.tokens_credited)} tokens added to your account!` });
          } else {
            toast({ title: "Verification Failed", variant: "destructive" });
          }
          setProcessing(false);
        },
        theme: { color: "#f59e0b" },
        modal: { ondismiss: () => setProcessing(false) }
      });
      razorpay.open();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
      setProcessing(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/30 dark:to-yellow-950/30 shadow-xl">
      <CardContent className="p-6 space-y-6">
        {/* Token Display */}
        <div className="text-center py-4 bg-gradient-to-br from-amber-100/50 to-yellow-100/50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl border border-amber-200/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-8 h-8 text-amber-500" />
            <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {formatTokens(tokenAmount)}
            </span>
          </div>
          <p className="text-muted-foreground">{tokenAmount.toLocaleString()} tokens</p>
        </div>

        {/* Slider */}
        <div className="px-2">
          <Slider 
            value={[tokenAmount]} 
            onValueChange={(v) => setTokenAmount(v[0])} 
            min={MIN_TOKENS} 
            max={MAX_TOKENS} 
            step={100000}
            className="w-full"
          />
        </div>

        {/* Quick Options */}
        <div className="flex flex-wrap gap-2 justify-center">
          {quickOptions.map((opt) => (
            <Button 
              key={opt.label} 
              variant={tokenAmount === opt.tokens ? "default" : "outline"} 
              size="sm"
              onClick={() => setTokenAmount(opt.tokens)}
              className={tokenAmount === opt.tokens ? "bg-gradient-to-r from-amber-500 to-yellow-500 border-0" : "border-amber-300 hover:border-amber-500"}
            >
              {opt.label.includes('M') ? opt.label : `${currSymbol}${opt.label}`}
            </Button>
          ))}
        </div>

        {/* Price & Buy Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card rounded-xl border">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">Total Price</p>
            <p className="text-3xl font-bold text-amber-600">
              {formatPrice(priceInINR)}
            </p>
            <p className="text-xs text-muted-foreground">1M tokens = {formatPrice(pricePerMillion)}</p>
          </div>
          <Button 
            onClick={handlePurchase} 
            disabled={processing || priceInINR < MIN_AMOUNT_INR}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold px-8"
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
            ) : (
              <><CreditCard className="w-5 h-5 mr-2" />Buy Now</>
            )}
          </Button>
        </div>

        {/* View More Link */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/settings/buy-tokens')} className="text-amber-600 hover:text-amber-700">
            View full token dashboard <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plans, loading } = usePlatformPricingPlans();
  const { effectivePlanKey, refetch: refetchSubscription } = useUserPlatformSubscription();
  const { currency: selectedCurrency, setCurrency: setGlobalCurrency } = useCurrency();
  
  const [durationIndex, setDurationIndex] = useState(3);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const billingCycle = durationOptions[durationIndex];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, display_name, profile_pic_url')
          .eq('id', user.id)
          .single();
        setUserProfile({ ...data, email: user.email });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN' && selectedPlanForPurchase) {
        handlePurchase(selectedPlanForPurchase);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const getPrice = (plan: any) => {
    const isINR = selectedCurrency === 'INR';
    const months = billingCycle;
    let baseMonthly = isINR ? plan.price_inr : plan.price_usd;
    
    if (months === 3) {
      const preset = isINR ? plan.price_3_month_inr : plan.price_3_month_usd;
      if (preset) return preset;
    } else if (months === 6) {
      const preset = isINR ? plan.price_6_month_inr : plan.price_6_month_usd;
      if (preset) return preset;
    } else if (months === 12) {
      const preset = isINR ? plan.price_12_month_inr : plan.price_12_month_usd;
      if (preset) return preset;
    }
    
    const discount = durationDiscounts[months] || 0;
    const total = baseMonthly * months;
    return Math.round(total * (1 - discount / 100));
  };

  const getMonthlyPrice = (plan: any) => {
    const totalPrice = getPrice(plan);
    return Math.round(totalPrice / billingCycle);
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${tokens / 1000000}M`;
    if (tokens >= 1000) return `${tokens / 1000}K`;
    return tokens.toString();
  };

  const handlePurchase = async (planId: string) => {
    if (!user) {
      setSelectedPlanForPurchase(planId);
      setShowAuthModal(true);
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.plan_key === 'free') {
      toast({ title: "Info", description: "You're already on the free plan!" });
      return;
    }

    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('platform-plan-checkout', {
        body: {
          planId,
          billingCycleMonths: billingCycle,
          currency: selectedCurrency === 'INR' ? 'INR' : 'USD',
        },
      });

      if (error) throw error;

      const options = {
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'AvatarTalk',
        description: `${data.planName} Plan - ${durationLabels[billingCycle]}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            const { error: verifyError } = await supabase.functions.invoke('platform-plan-verify', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
                billingCycleMonths: billingCycle,
              },
            });

            if (verifyError) throw verifyError;

            toast({
              title: "🎉 Subscription Activated!",
              description: `Welcome to ${data.planName}! ${formatTokens(plan.ai_tokens_monthly)} tokens have been added to your account.`,
            });

            refetchSubscription();
            navigate('/settings/dashboard');
          } catch (err) {
            console.error('Verification error:', err);
            toast({
              title: "Error",
              description: "Payment verification failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: { email: user.email },
        theme: { color: '#8B5CF6' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderFeatureIcon = (iconName: string, included: boolean) => {
    const IconComponent = iconMap[iconName] || Check;
    return (
      <span className={included ? 'text-primary' : 'text-muted-foreground/40'}>
        <IconComponent className="w-4 h-4" />
      </span>
    );
  };

  const profileUrl = userProfile?.username 
    ? `${window.location.origin}/${userProfile.username}`
    : window.location.origin;
  const currSymbol = CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || '$';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <div className="pt-4 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Compact Billing & Currency Selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Select value={durationIndex.toString()} onValueChange={(val) => setDurationIndex(parseInt(val))}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Billing" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((d, i) => (
                <SelectItem key={d} value={i.toString()}>
                  {durationLabels[d]}
                  {durationDiscounts[d] > 0 && ` (-${durationDiscounts[d]}%)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCurrency} onValueChange={(val) => setGlobalCurrency(val as any)}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {billingCycle > 1 && (
            <Badge className="bg-green-500/20 text-green-600">
              Save {durationDiscounts[billingCycle]}%
            </Badge>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-muted-foreground">
            Start free, scale as you grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const PlanIcon = planIcons[plan.plan_key] || Star;
            const gradient = planGradients[plan.plan_key] || planGradients.free;
            const price = getPrice(plan);
            const monthlyPrice = getMonthlyPrice(plan);
            const isCurrentPlan = effectivePlanKey === plan.plan_key;
            const features = (plan.features_list || []) as PlatformFeature[];

            return (
              <Card 
                key={plan.id} 
                className={`relative bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  plan.is_popular ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={`bg-gradient-to-r ${gradient} text-white px-4 py-1`}>
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white px-3 py-1">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4 pt-8">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                    <PlanIcon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{plan.plan_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  
                  <div className="mt-4">
                    {plan.plan_key === 'free' ? (
                      <div>
                        <div className="text-5xl md:text-6xl font-extrabold text-primary">
                          {currSymbol}0
                        </div>
                        <div className="text-lg font-medium text-muted-foreground mt-1">forever free</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                          {currSymbol}{monthlyPrice}
                        </div>
                        <div className="text-lg font-medium text-muted-foreground mt-1">/month</div>
                        {billingCycle > 1 && (
                          <div className="text-sm text-primary font-semibold mt-2 p-2 bg-primary/10 rounded-lg">
                            {currSymbol}{price} billed for {durationLabels[billingCycle]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}/10 border border-current/10`}>
                    <div className="flex items-center justify-center gap-2 font-medium">
                      <Coins className="w-5 h-5" />
                      <span className="text-lg">{formatTokens(plan.ai_tokens_monthly)} AI Tokens</span>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Added to your balance on plan activation
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {features.slice(0, 8).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {renderFeatureIcon(feature.icon, true)}
                        <span className={feature.coming_soon ? 'text-muted-foreground' : ''}>
                          {feature.text}
                          {feature.coming_soon && (
                            <Badge variant="outline" className="ml-1 text-[10px] px-1">Soon</Badge>
                          )}
                        </span>
                      </li>
                    ))}
                    {features.length > 8 && (
                      <li className="text-xs text-muted-foreground text-center">
                        +{features.length - 8} more features
                      </li>
                    )}
                  </ul>

                  <Button
                    className={`w-full mt-4 ${
                      isCurrentPlan ? 'bg-green-500 hover:bg-green-600' : plan.is_popular ? `bg-gradient-to-r ${gradient} hover:opacity-90` : ''
                    }`}
                    variant={isCurrentPlan || plan.is_popular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(plan.id)}
                    disabled={processing || isCurrentPlan}
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      <><Check className="w-4 h-4 mr-1" />Current Plan</>
                    ) : plan.plan_key === 'free' ? (
                      'Get Started Free'
                    ) : (
                      <>Subscribe Now<ChevronRight className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add-on Token Purchase Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Need More AI Tokens?
              </span>
            </h2>
            <p className="text-muted-foreground">Buy additional tokens anytime. Works with all plans.</p>
          </div>
          
          <TokenPurchaseAddon currSymbol={currSymbol} />
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-8">Plan Features at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShoppingBag, label: 'Products', plan: 'Free: 2, Creator: 20, Pro: 50, Business: ∞' },
              { icon: Video, label: 'Collaborations', plan: 'Free: 2, Creator: 20, Pro: 50, Business: ∞' },
              { icon: FileText, label: 'Q&A Pairs', plan: 'Free: 10, Creator: 100, Pro: 200, Business: ∞' },
              { icon: Upload, label: 'Documents', plan: 'Free: 2, Creator: 10, Pro: 50, Business: ∞' },
              { icon: Globe, label: 'Web Scraper', plan: 'Pro: 10, Business: 40' },
              { icon: BookOpen, label: 'AI Topics', plan: 'Creator+' },
              { icon: HelpCircle, label: 'Follow-ups', plan: 'Pro+' },
              { icon: Mic2, label: 'Voice Training', plan: 'Pro+' },
              { icon: Tag, label: 'Promo Codes', plan: 'Creator+' },
              { icon: CreditCard, label: 'Paid Posts', plan: 'Creator+' },
              { icon: BarChart3, label: 'Advanced Analytics', plan: 'Pro+' },
              { icon: Eye, label: 'Visitors List', plan: 'Business' },
            ].map(({ icon: Icon, label, plan }) => (
              <Card key={label} className="bg-card/60 p-4 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">{label}</p>
                <Badge variant="secondary" className="mt-1 text-xs">{plan}</Badge>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-2">How do tokens work?</h3>
              <p className="text-muted-foreground">When you subscribe, your plan's tokens are immediately added to your account. Use them for AI chat, voice responses, and more.</p>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Can I upgrade anytime?</h3>
              <p className="text-muted-foreground">Yes! Upgrade instantly from your dashboard. Your new plan's tokens will be added to your existing balance.</p>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-2">What's the refund policy?</h3>
              <p className="text-muted-foreground">We offer a 7-day money-back guarantee for all paid plans. No questions asked.</p>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Which plan is best for creators?</h3>
              <p className="text-muted-foreground">The Creator plan unlocks product sales and payments. For voice cloning and virtual meetings, go Pro.</p>
            </Card>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={profileUrl}
        username={userProfile?.username || 'user'}
      />

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Continue</DialogTitle>
            <DialogDescription>Create an account or sign in to purchase this plan</DialogDescription>
          </DialogHeader>
          <MainAuth isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingPage;