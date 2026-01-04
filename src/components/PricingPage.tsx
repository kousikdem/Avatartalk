import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Check, Star, Zap, Crown, Rocket, User, Bot, UserCircle, Coins, FileText, 
  BarChart2, Link, Users, Gift, Sparkles, MessageCircle, Mic, Brain, FileUp,
  Package, CreditCard, Tag, BarChart3, Video, Calendar, Globe, MessageSquare,
  Mic2, AudioLines, CalendarDays, Link2, TrendingUp, DollarSign, UserCog,
  Shield, Infinity, Code, Users2, Building2, Handshake, Ticket, Receipt,
  ShoppingBag, Loader2, Eye, Lock, ChevronRight, Share2, ChevronDown, LogOut
} from 'lucide-react';
import { usePlatformPricingPlans, useUserPlatformSubscription, PlatformFeature } from '@/hooks/usePlatformPricingPlans';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MainAuth from './MainAuth';
import Logo from './Logo';
import TokenDisplay from './TokenDisplay';
import ShareModal from './ShareModal';
import PlanBadge from './PlanBadge';
import DashboardSidebar from './DashboardSidebar';
import CurrencySelector from './CurrencySelector';
import { useSidebar } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plans, loading } = usePlatformPricingPlans();
  const { effectivePlanKey, refetch: refetchSubscription } = useUserPlatformSubscription();
  const { currency: selectedCurrency, setCurrency: setGlobalCurrency } = useCurrency();
  const { toggleSidebar } = useSidebar();
  
  const [durationIndex, setDurationIndex] = useState(3);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const renderFeatureIcon = (iconName: string, included: boolean) => {
    const IconComponent = iconMap[iconName] || Check;
    return (
      <span className={included ? 'text-primary' : 'text-muted-foreground/40'}>
        <IconComponent className="w-4 h-4" />
      </span>
    );
  };

  const displayName = userProfile?.display_name || userProfile?.username || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
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
    <div className="flex min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Sidebar */}
      <DashboardSidebar onCreatePost={() => setShowCreatePost(true)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Strip - White with gradient text */}
        <div className="w-full bg-white border-b border-gray-200 px-3 py-2 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {/* Left section - Menu Toggle and Logo */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 text-gray-700 hover:bg-gray-100"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div 
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate('/settings/dashboard')}
              >
                <Logo size="sm" className="shadow-md" />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-semibold text-base hidden sm:block">
                  AvatarTalk.Co
                </span>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:block">
                <CurrencySelector compact />
              </div>
              
              {user && <TokenDisplay compact />}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="gap-1 h-7 px-2 text-gray-700 hover:bg-gray-100"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-xs">Share</span>
              </Button>

              {user ? (
                <>
                  <div className="hidden sm:block cursor-pointer" onClick={() => navigate('/pricing')}>
                    <PlanBadge size="sm" showIcon />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1.5 h-8 px-1.5 text-gray-700 hover:bg-gray-100">
                        <Avatar className="h-6 w-6 border border-gray-300">
                          <AvatarImage src={userProfile?.profile_pic_url || ''} alt={displayName} />
                          <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-3 w-3 hidden sm:block" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                      </div>
                      <DropdownMenuItem onClick={() => navigate('/settings/account')}>
                        <User className="w-4 h-4 mr-2" />
                        Account Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings/dashboard')}>
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowAuthModal(true)} className="h-7 text-xs">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 pt-4 pb-16 px-4 sm:px-6 lg:px-8">
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
                        <div className="text-4xl font-bold">
                          {currSymbol}0
                          <span className="text-base font-normal text-muted-foreground">/forever</span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl font-bold">{currSymbol}{price}</div>
                          <div className="text-sm text-muted-foreground">for {durationLabels[billingCycle]}</div>
                          {billingCycle > 1 && (
                            <div className="text-xs text-primary mt-1">≈ {currSymbol}{monthlyPrice}/month</div>
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
                        Added to your account on activation
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

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Need More AI Tokens?</h2>
            <p className="text-muted-foreground mb-6">Buy additional tokens anytime. Works with all plans.</p>
            <Button size="lg" variant="outline" onClick={() => navigate('/settings/buy-tokens')}>
              <Coins className="w-5 h-5 mr-2" />
              Buy Token Pack
            </Button>
          </div>

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
    </div>
  );
};

export default PricingPage;