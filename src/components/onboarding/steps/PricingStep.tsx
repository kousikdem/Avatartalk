import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, Rocket, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlatformPricingPlans } from '@/hooks/usePlatformPricingPlans';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PricingStepProps {
  onComplete: () => void;
}

type BillingDuration = '1' | '3' | '6' | '12' | '24';

const durationLabels: Record<BillingDuration, string> = {
  '1': '1 Month',
  '3': '3 Months',
  '6': '6 Months',
  '12': '1 Year',
  '24': '2 Years',
};

const durationDiscounts: Record<BillingDuration, number> = {
  '1': 0,
  '3': 5,
  '6': 10,
  '12': 20,
  '24': 30,
};

const PricingStep: React.FC<PricingStepProps> = ({ onComplete }) => {
  const { plans, loading } = usePlatformPricingPlans();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingDuration, setBillingDuration] = useState<BillingDuration>('1');

  const planIcons: Record<string, React.ReactNode> = {
    free: <Sparkles className="w-5 h-5" />,
    creator: <Crown className="w-5 h-5" />,
    pro: <Rocket className="w-5 h-5" />,
    business: <Crown className="w-5 h-5" />,
  };

  const planGradients: Record<string, string> = {
    free: 'from-slate-400 to-slate-500',
    creator: 'from-blue-500 to-indigo-600',
    pro: 'from-purple-500 to-indigo-600',
    business: 'from-amber-500 to-orange-600',
  };

  const handleChoosePlan = () => {
    if (!selectedPlan) {
      toast({ title: 'Please select a plan', variant: 'destructive' });
      return;
    }

    if (selectedPlan === 'free') {
      onComplete();
      return;
    }

    // For paid plans, in a real app this would open Razorpay
    // For now, trigger onComplete (integrate with platform-plan-checkout edge function)
    toast({ title: `${selectedPlan} plan selected!`, description: 'Redirecting to payment...' });
    onComplete();
  };

  const getDiscountedPrice = (basePrice: number) => {
    const discount = durationDiscounts[billingDuration];
    const months = parseInt(billingDuration);
    const totalBeforeDiscount = basePrice * months;
    const totalAfterDiscount = totalBeforeDiscount * (1 - discount / 100);
    return {
      total: Math.round(totalAfterDiscount),
      monthly: Math.round(totalAfterDiscount / months),
      saved: Math.round(totalBeforeDiscount - totalAfterDiscount),
      discount,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Billing Duration Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-0.5">
          {(Object.entries(durationLabels) as [BillingDuration, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setBillingDuration(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative',
                billingDuration === key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
              {durationDiscounts[key] > 0 && (
                <span className="absolute -top-1.5 -right-1 text-[8px] bg-green-500 text-white px-1 rounded-full font-bold">
                  -{durationDiscounts[key]}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.plan_key;
          const Icon = planIcons[plan.plan_key] || <Sparkles className="w-5 h-5" />;
          const gradient = planGradients[plan.plan_key] || 'from-slate-400 to-slate-500';
          const pricing = plan.price_inr > 0 ? getDiscountedPrice(plan.price_inr) : null;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-300 relative overflow-hidden h-full border',
                  isSelected
                    ? 'ring-2 ring-blue-500 border-blue-500 scale-[1.02] shadow-xl'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]',
                  plan.is_popular && 'border-blue-300'
                )}
                onClick={() => setSelectedPlan(plan.plan_key)}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px]">
                      Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2 p-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-2 shadow-lg',
                    gradient
                  )}>
                    {Icon}
                  </div>
                  <CardTitle className="text-base">{plan.plan_name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    {plan.price_inr === 0 ? (
                      <span className="text-2xl font-bold">Free</span>
                    ) : pricing ? (
                      <div>
                        {pricing.discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through mr-1">₹{plan.price_inr}</span>
                        )}
                        <span className="text-2xl font-bold">₹{pricing.monthly}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                        {pricing.saved > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Tag className="w-3 h-3 text-green-600" />
                            <span className="text-[10px] text-green-600 font-medium">Save ₹{pricing.saved}</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 p-4">
                  <ul className="space-y-1.5">
                    {plan.features_list?.slice(0, 4).map((feature, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button
          size="lg"
          className="w-full max-w-md bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={handleChoosePlan}
        >
          {selectedPlan === 'free' || !selectedPlan ? 'Start Free' : `Get ${selectedPlan?.charAt(0).toUpperCase()}${selectedPlan?.slice(1)} Plan`}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          You can upgrade or change your plan anytime from Settings
        </p>
      </div>
    </div>
  );
};

export default PricingStep;
