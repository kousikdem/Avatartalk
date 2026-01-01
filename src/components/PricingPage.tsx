import React, { useState, useEffect, useRef } from 'react';
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
  ShoppingBag, Loader2, Eye, Lock, ChevronRight
} from 'lucide-react';
import Navbar from './Navbar';
import { usePlatformPricingPlans, useUserPlatformSubscription, PlatformFeature } from '@/hooks/usePlatformPricingPlans';
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

// Duration options in months
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

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plans, loading } = usePlatformPricingPlans();
  const { effectivePlanKey, refetch: refetchSubscription } = useUserPlatformSubscription();
  
  // Default to 12 months (1 year) and USD
  const [durationIndex, setDurationIndex] = useState(3); // Index 3 = 12 months
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const billingCycle = durationOptions[durationIndex];

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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const getPrice = (plan: any) => {
    const isINR = currency === 'INR';
    const months = billingCycle;
    
    // Get base monthly price
    let baseMonthly = isINR ? plan.price_inr : plan.price_usd;
    
    // Check for pre-set multi-month prices
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
    
    // Calculate with discount for other durations
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
          currency: currency,
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

  const renderFeatureIcon = (iconName: string, included: boolean) => {
    const IconComponent = iconMap[iconName] || Check;
    return (
      <span className={included ? 'text-primary' : 'text-muted-foreground/40'}>
        <IconComponent className="w-4 h-4" />
      </span>
    );
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
            
            {/* Currency Toggle */}
            <div className="flex justify-center gap-2 mb-6">
              <Button 
                variant={currency === 'USD' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrency('USD')}
                className={currency === 'USD' ? 'bg-primary' : ''}
              >
                $ USD
              </Button>
              <Button 
                variant={currency === 'INR' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrency('INR')}
                className={currency === 'INR' ? 'bg-primary' : ''}
              >
                ₹ INR
              </Button>
            </div>
            
            {/* Duration Slider */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border">
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-medium">{durationLabels[billingCycle]}</span>
                  {billingCycle > 1 && (
                    <Badge className="bg-green-500/20 text-green-600">
                      Save {durationDiscounts[billingCycle]}%
                    </Badge>
                  )}
                </div>
                <Slider
                  value={[durationIndex]}
                  onValueChange={(value) => setDurationIndex(value[0])}
                  min={0}
                  max={4}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  {durationOptions.map((d, i) => (
                    <span 
                      key={d} 
                      className={`cursor-pointer ${i === durationIndex ? 'text-primary font-medium' : ''}`}
                      onClick={() => setDurationIndex(i)}
                    >
                      {d === 1 ? '1M' : d === 3 ? '3M' : d === 6 ? '6M' : d === 12 ? '1Y' : '2Y'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const PlanIcon = planIcons[plan.plan_key] || Star;
              const gradient = planGradients[plan.plan_key] || planGradients.free;
              const price = getPrice(plan);
              const monthlyPrice = getMonthlyPrice(plan);
              const discount = durationDiscounts[billingCycle];
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
                          </div>
                          <div className="text-sm text-muted-foreground">
                            for {durationLabels[billingCycle]}
                          </div>
                          {billingCycle > 1 && (
                            <div className="text-xs text-primary mt-1">
                              ≈ {currency === 'INR' ? '₹' : '$'}{monthlyPrice}/month
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* AI Tokens highlight */}
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}/10 border border-current/10`}>
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Coins className="w-5 h-5" />
                        <span className="text-lg">{formatTokens(plan.ai_tokens_monthly)} AI Tokens</span>
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        Added to your account on activation
                      </p>
                    </div>

                    {/* Features list with icons */}
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

                    {/* CTA Button */}
                    <Button
                      className={`w-full mt-4 ${
                        isCurrentPlan
                          ? 'bg-green-500 hover:bg-green-600'
                          : plan.is_popular
                          ? `bg-gradient-to-r ${gradient} hover:opacity-90`
                          : ''
                      }`}
                      variant={isCurrentPlan || plan.is_popular ? 'default' : 'outline'}
                      onClick={() => handlePurchase(plan.id)}
                      disabled={processing || isCurrentPlan}
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Current Plan
                        </>
                      ) : plan.plan_key === 'free' ? (
                        'Get Started Free'
                      ) : (
                        <>
                          Subscribe Now
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
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
              Buy additional tokens anytime. Works with all plans.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="outline" onClick={() => navigate('/buy-tokens')}>
                <Coins className="w-5 h-5 mr-2" />
                Buy Token Pack
              </Button>
            </div>
          </div>

          {/* Feature Comparison - Key Highlights */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-8">Plan Features at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: ShoppingBag, label: 'Sell Products', plan: 'Creator+' },
                { icon: CreditCard, label: 'Paid Posts', plan: 'Creator+' },
                { icon: Mic2, label: 'Voice Clone', plan: 'Pro+' },
                { icon: Video, label: 'Virtual Meetings', plan: 'Pro+' },
                { icon: BarChart3, label: 'Advanced Analytics', plan: 'Pro+' },
                { icon: Eye, label: 'Visitors List', plan: 'Business' },
                { icon: Code, label: 'API Access', plan: 'Business' },
                { icon: Users2, label: 'Team System', plan: 'Business' },
              ].map(({ icon: Icon, label, plan }) => (
                <Card key={label} className="bg-card/60 p-4 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-sm">{label}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">{plan}</Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-2">How do tokens work?</h3>
                <p className="text-muted-foreground">When you subscribe, your plan's tokens are immediately added to your account. Use them for AI chat, voice responses, and more. Buy extra tokens anytime if needed.</p>
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
                <p className="text-muted-foreground">The Creator plan unlocks product sales and payments. For full voice cloning and virtual meetings, go Pro.</p>
              </Card>
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
