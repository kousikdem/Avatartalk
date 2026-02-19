import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Sparkles, Rocket, Tag, ChevronDown, ChevronUp, Zap, Loader2, Shield, Users, Brain, Package, Video, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlatformPricingPlans, useUserPlatformSubscription } from '@/hooks/usePlatformPricingPlans';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PricingStepProps {
  onComplete: (planKey?: string) => void;
}

type BillingDuration = '1' | '3' | '6' | '12' | '24';

const durationLabels: Record<BillingDuration, string> = { '1': '1 Month', '3': '3 Months', '6': '6 Months', '12': '1 Year', '24': '2 Years' };
const durationDiscounts: Record<BillingDuration, number> = { '1': 0, '3': 5, '6': 10, '12': 20, '24': 30 };

const planOrder = ['free', 'creator', 'pro', 'business'];

const currencies = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
];

const PricingStep: React.FC<PricingStepProps> = ({ onComplete }) => {
  const { plans, loading } = usePlatformPricingPlans();
  const { effectivePlanKey, subscription } = useUserPlatformSubscription();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingDuration, setBillingDuration] = useState<BillingDuration>('12');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const planIcons: Record<string, React.ReactNode> = {
    free: <Sparkles className="w-5 h-5" />, creator: <Crown className="w-5 h-5" />,
    pro: <Rocket className="w-5 h-5" />, business: <Crown className="w-5 h-5" />,
  };
  const planGradients: Record<string, string> = {
    free: 'from-slate-400 to-slate-500', creator: 'from-blue-500 to-indigo-600',
    pro: 'from-purple-500 to-indigo-600', business: 'from-amber-500 to-orange-600',
  };

  const getPrice = (plan: any) => {
    const isINR = currency === 'INR';
    const basePrice = isINR ? plan.price_inr : plan.price_usd;
    if (basePrice === 0) return { base: 0, monthly: 0, total: 0, saved: 0, discount: 0 };
    const discount = durationDiscounts[billingDuration];
    const months = parseInt(billingDuration);
    let total: number;
    if (isINR) {
      switch (billingDuration) {
        case '3': total = plan.price_3_month_inr || basePrice * 3 * (1 - discount / 100); break;
        case '6': total = plan.price_6_month_inr || basePrice * 6 * (1 - discount / 100); break;
        case '12': total = plan.price_12_month_inr || basePrice * 12 * (1 - discount / 100); break;
        default: total = basePrice * months * (1 - discount / 100);
      }
    } else {
      switch (billingDuration) {
        case '3': total = plan.price_3_month_usd || basePrice * 3 * (1 - discount / 100); break;
        case '6': total = plan.price_6_month_usd || basePrice * 6 * (1 - discount / 100); break;
        case '12': total = plan.price_12_month_usd || basePrice * 12 * (1 - discount / 100); break;
        default: total = basePrice * months * (1 - discount / 100);
      }
    }
    const totalBeforeDiscount = basePrice * months;
    return { base: basePrice, monthly: Math.round(total / months), total: Math.round(total), saved: Math.round(totalBeforeDiscount - total), discount };
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  // Check if plan is an upgrade
  const isUpgrade = (planKey: string) => {
    const currentIdx = planOrder.indexOf(effectivePlanKey || 'free');
    const targetIdx = planOrder.indexOf(planKey);
    return targetIdx > currentIdx;
  };

  const isSamePlan = (planKey: string) => effectivePlanKey === planKey;

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleChoosePlan = async () => {
    if (!selectedPlan || !user) {
      toast({ title: 'Please select a plan', variant: 'destructive' });
      return;
    }

    // Prevent buying same plan
    if (isSamePlan(selectedPlan)) {
      toast({ title: 'Already on this plan', description: 'You are already subscribed to this plan.', variant: 'destructive' });
      return;
    }

    setPurchasing(true);

    if (selectedPlan === 'free') {
      try {
        const { data: existing } = await supabase.from('user_platform_subscriptions').select('id').eq('user_id', user.id).maybeSingle();
        const subData = {
          user_id: user.id, plan_key: 'free', status: 'active', billing_cycle_months: 0,
          price_paid: 0, currency, starts_at: new Date().toISOString(), expires_at: null,
        };
        if (existing) { await supabase.from('user_platform_subscriptions').update(subData).eq('id', existing.id); }
        else { await supabase.from('user_platform_subscriptions').insert([subData]); }
        toast({ title: 'Free plan activated!' });
        setPurchasing(false);
        onComplete('free');
      } catch (err) {
        console.error(err);
        setPurchasing(false);
        toast({ title: 'Error activating plan', variant: 'destructive' });
      }
      return;
    }

    // Paid plan
    try {
      const plan = plans.find(p => p.plan_key === selectedPlan);
      if (!plan) throw new Error('Plan not found');
      const months = parseInt(billingDuration);
      const pricing = getPrice(plan);

      const loaded = await loadRazorpay();
      if (!loaded) { toast({ title: 'Payment gateway failed', variant: 'destructive' }); setPurchasing(false); return; }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('platform-plan-checkout', {
        body: { planId: plan.id, billingCycleMonths: months, currency },
      });

      if (response.error) throw new Error(response.error.message || 'Checkout failed');
      const orderData = response.data;
      if (!orderData?.success) throw new Error(orderData?.error || 'Failed to create order');

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'AvatarTalk.Co',
        description: `${orderData.planName} Plan - ${durationLabels[billingDuration]}`,
        order_id: orderData.orderId,
        handler: async (rzpResponse: any) => {
          try {
            const verifyRes = await supabase.functions.invoke('platform-plan-verify', {
              body: {
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                planId: plan.id,
                billingCycleMonths: months,
              },
            });

            if (verifyRes.error) throw new Error(verifyRes.error.message || 'Verification failed');
            const verifyData = verifyRes.data;

            if (verifyData?.success) {
              toast({ title: `${plan.plan_name} Plan Activated!`, description: `Active until ${new Date(verifyData.expiresAt).toLocaleDateString()}` });
              setPurchasing(false);
              onComplete(selectedPlan);
            } else {
              throw new Error(verifyData?.error || 'Verification failed');
            }
          } catch (err: any) {
            console.error('Verify error:', err);
            toast({ title: 'Verification Error', description: err.message, variant: 'destructive' });
            setPurchasing(false);
          }
        },
        modal: {
          ondismiss: () => { setPurchasing(false); toast({ title: 'Payment cancelled', variant: 'destructive' }); },
        },
        prefill: { email: user.email || '' },
        theme: { color: '#4F46E5' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to start payment', variant: 'destructive' });
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Billing:</span>
          <Select value={billingDuration} onValueChange={(v) => setBillingDuration(v as BillingDuration)}>
            <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(durationLabels) as [BillingDuration, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    {label}
                    {durationDiscounts[key] > 0 && <Badge className="bg-green-100 text-green-700 text-[9px] px-1 py-0">-{durationDiscounts[key]}%</Badge>}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Currency:</span>
          <Select value={currency} onValueChange={(v) => setCurrency(v as 'INR' | 'USD')}>
            <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {effectivePlanKey && effectivePlanKey !== 'free' && (
        <div className="text-center">
          <Badge className="bg-blue-100 text-blue-700 text-xs">Current: {effectivePlanKey.charAt(0).toUpperCase() + effectivePlanKey.slice(1)}</Badge>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.plan_key;
          const isCurrent = isSamePlan(plan.plan_key);
          const canUpgrade = isUpgrade(plan.plan_key);
          const Icon = planIcons[plan.plan_key] || <Sparkles className="w-5 h-5" />;
          const gradient = planGradients[plan.plan_key] || 'from-slate-400 to-slate-500';
          const pricing = getPrice(plan);
          const isExpanded = expandedPlan === plan.plan_key;
          const allFeatures = plan.features_list || [];

          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-300 relative overflow-hidden h-full border',
                  isSelected ? 'ring-2 ring-blue-500 border-blue-500 scale-[1.02] shadow-xl' :
                    isCurrent ? 'ring-1 ring-green-400 border-green-400' :
                      'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]',
                  plan.is_popular && !isSelected && 'border-blue-300'
                )}
                onClick={() => !isCurrent && setSelectedPlan(plan.plan_key)}
              >
                {plan.is_popular && <div className="absolute top-0 right-0"><Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px]">Popular</Badge></div>}
                {isCurrent && <div className="absolute top-0 left-0"><Badge className="rounded-none rounded-br-lg bg-green-500 text-white text-[10px]">Current</Badge></div>}

                <CardHeader className="pb-2 p-3">
                  <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-1.5 shadow-lg', gradient)}>{Icon}</div>
                  <CardTitle className="text-sm">{plan.plan_name}</CardTitle>
                  <div className="mt-1">
                    {pricing.base === 0 ? (
                      <span className="text-2xl font-bold">Free</span>
                    ) : (
                      <div>
                        {pricing.discount > 0 && <span className="text-xs text-muted-foreground line-through mr-1">{currencySymbol}{pricing.base}</span>}
                        <span className="text-2xl font-bold text-foreground">{currencySymbol}{pricing.monthly}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                        {pricing.saved > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Tag className="w-3 h-3 text-green-600" />
                            <span className="text-[10px] text-green-600 font-semibold">Save {currencySymbol}{pricing.saved} ({pricing.discount}%)</span>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-0.5">Total: {currencySymbol}{pricing.total}</p>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 p-3">
                  <ul className="space-y-1">
                    {allFeatures.slice(0, isExpanded ? allFeatures.length : 5).map((feature: any, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <Check className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  {allFeatures.length > 5 && (
                    <button className="flex items-center gap-1 text-[10px] text-blue-600 mt-1.5 hover:underline"
                      onClick={(e) => { e.stopPropagation(); setExpandedPlan(isExpanded ? null : plan.plan_key); }}>
                      {isExpanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> +{allFeatures.length - 5} more</>}
                    </button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 pt-2">
        <Button size="lg"
          className="w-full max-w-md bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg h-12 text-sm font-semibold"
          onClick={handleChoosePlan} disabled={purchasing || !selectedPlan || isSamePlan(selectedPlan || '')}>
          {purchasing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> :
            isSamePlan(selectedPlan || '') ? 'Already on this plan' :
              selectedPlan === 'free' ? <><Zap className="w-4 h-4 mr-2" /> Activate Free Plan</> :
                selectedPlan ? <><Zap className="w-4 h-4 mr-2" /> {isUpgrade(selectedPlan) ? 'Upgrade to' : 'Buy'} {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} — {currencySymbol}{getPrice(plans.find(p => p.plan_key === selectedPlan) || plans[0]).total}</> :
                  'Select a Plan'}
        </Button>
        <p className="text-[10px] text-muted-foreground">Upgrade or change anytime</p>
      </div>
    </div>
  );
};

export default PricingStep;
