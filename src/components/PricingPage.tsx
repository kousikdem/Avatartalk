import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, Star, Zap, Crown, Rocket, User, Bot, UserCircle, Coins, FileText, 
  BarChart2, Link, Users, Gift, Sparkles, MessageCircle, Mic, Brain, FileUp,
  Package, CreditCard, Tag, BarChart3, Video, Calendar, Globe, MessageSquare,
  Mic2, AudioLines, CalendarDays, Link2, TrendingUp, DollarSign, UserCog,
  Shield, Infinity, Code, Users2, Building2, Handshake, Ticket, Receipt,
  ShoppingBag, Loader2
} from 'lucide-react';
import Navbar from './Navbar';
import { usePlatformPricingPlans, useUserPlatformSubscription, PlatformFeature } from '@/hooks/usePlatformPricingPlans';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MainAuth from './MainAuth';

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
  Zap, Crown, Rocket, Check
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

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plans, loading } = usePlatformPricingPlans();
  const { effectivePlanKey, refetch: refetchSubscription } = useUserPlatformSubscription();
  const { currency, formatPrice } = useCurrency();
  
  const [billingCycle, setBillingCycle] = useState<1 | 3 | 6 | 12>(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN' && selectedPlanForPurchase) {
        handlePurchase(selectedPlanForPurchase);
      }
    });

    return () => {
      subscription.unsubscribe();
      document.body.removeChild(script);
    };
  }, []);

  const getBillingLabel = () => {
    switch (billingCycle) {
      case 3: return '3 Months';
      case 6: return '6 Months';
      case 12: return '1 Year';
      default: return '1 Month';
    }
  };

  const getDiscount = (plan: any) => {
    switch (billingCycle) {
      case 3: return plan.discount_3_month || 10;
      case 6: return plan.discount_6_month || 15;
      case 12: return plan.discount_12_month || 20;
      default: return 0;
    }
  };

  const getPrice = (plan: any) => {
    const isINR = currency === 'INR';
    switch (billingCycle) {
      case 3:
        return isINR ? plan.price_3_month_inr : plan.price_3_month_usd;
      case 6:
        return isINR ? plan.price_6_month_inr : plan.price_6_month_usd;
      case 12:
        return isINR ? plan.price_12_month_inr : plan.price_12_month_usd;
      default:
        return isINR ? plan.price_inr : plan.price_usd;
    }
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
          currency: currency === 'INR' ? 'INR' : 'USD',
        },
      });

      if (error) throw error;

      const options = {
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'AvatarTalk',
        description: `${data.planName} Plan - ${getBillingLabel()}`,
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
              description: `Welcome to ${data.planName}! Your plan is now active.`,
            });

            refetchSubscription();
            navigate('/dashboard');
          } catch (err) {
            console.error('Verification error:', err);
            toast({
              title: "Error",
              description: "Payment verification failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#8B5CF6',
        },
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

  const renderFeatureIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Check;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navbar showAuth={true} />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Increase Your Brand Value to 10X with AI Avatars. Start free, scale as you grow.
            </p>
            
            {/* Billing Cycle Selector */}
            <div className="flex justify-center mb-8">
              <Tabs value={billingCycle.toString()} onValueChange={(v) => setBillingCycle(parseInt(v) as 1 | 3 | 6 | 12)}>
                <TabsList className="bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger value="1" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger value="3" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    3 Months
                    <Badge className="ml-2 bg-green-500/20 text-green-600 text-xs">-10%</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="6" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    6 Months
                    <Badge className="ml-2 bg-green-500/20 text-green-600 text-xs">-15%</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="12" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    1 Year
                    <Badge className="ml-2 bg-green-500/20 text-green-600 text-xs">-20%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const PlanIcon = planIcons[plan.plan_key] || Star;
              const gradient = planGradients[plan.plan_key] || planGradients.free;
              const price = getPrice(plan);
              const discount = getDiscount(plan);
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
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  {plan.offer_badge && (
                    <div className="absolute -top-3 left-4">
                      <Badge className="bg-orange-500 text-white px-3 py-1">
                        {plan.offer_badge}
                      </Badge>
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
                        <div className="text-4xl font-bold">
                          {currency === 'INR' ? '₹0' : '$0'}
                          <span className="text-base font-normal text-muted-foreground">/forever</span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl font-bold">
                            {currency === 'INR' ? '₹' : '$'}{price}
                            <span className="text-base font-normal text-muted-foreground">/{getBillingLabel()}</span>
                          </div>
                          {billingCycle > 1 && discount > 0 && (
                            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Save {discount}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* AI Tokens highlight */}
                    {plan.ai_tokens_monthly > 0 && (
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Coins className="w-4 h-4" />
                          <span>{formatTokens(plan.ai_tokens_monthly)} AI Tokens/month</span>
                        </div>
                      </div>
                    )}

                    {/* Features list */}
                    <ul className="space-y-2">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className={`mt-0.5 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                            {renderFeatureIcon(feature.icon)}
                          </span>
                          <span className={feature.coming_soon ? 'text-muted-foreground' : ''}>
                            {feature.text}
                            {feature.coming_soon && (
                              <Badge variant="outline" className="ml-2 text-xs">Soon</Badge>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className={`w-full mt-4 ${
                        isCurrentPlan
                          ? 'bg-green-500 hover:bg-green-600'
                          : plan.is_popular
                          ? `bg-gradient-to-r ${gradient} hover:opacity-90`
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      onClick={() => handlePurchase(plan.id)}
                      disabled={processing || isCurrentPlan}
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : plan.plan_key === 'free' ? (
                        'Get Started Free'
                      ) : (
                        'Subscribe Now'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Token Add-ons Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Need More AI Tokens?</h2>
            <p className="text-muted-foreground mb-6">
              Works with all paid plans. Scale your AI usage as needed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">AI Token Pack</h3>
                      <p className="text-sm text-muted-foreground">₹1000 = 1M tokens</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/buy-tokens')}>
                    Buy Tokens
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">API Usage</h3>
                      <p className="text-sm text-muted-foreground">Pay as you go</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">Can I change plans anytime?</h3>
                  <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </Card>
                <Card className="bg-card/80 backdrop-blur-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">What's included in the free plan?</h3>
                  <p className="text-muted-foreground">The free plan includes 10K AI tokens, basic avatar, public profile, and community access.</p>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
                  <p className="text-muted-foreground">Yes, we offer a 7-day money-back guarantee for all paid plans.</p>
                </Card>
                <Card className="bg-card/80 backdrop-blur-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">How do AI tokens work?</h3>
                  <p className="text-muted-foreground">AI tokens are used for text and voice AI responses. Each plan includes monthly tokens that reset.</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Continue</DialogTitle>
            <DialogDescription>
              Create an account or sign in to purchase this plan
            </DialogDescription>
          </DialogHeader>
          <MainAuth isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingPage;
