import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Sparkles, Rocket, Tag, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlatformPricingPlans } from '@/hooks/usePlatformPricingPlans';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

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

  const handleChoosePlan = async () => {
    if (!selectedPlan) {
      toast({ title: 'Please select a plan', variant: 'destructive' });
      return;
    }

    setPurchasing(true);

    if (selectedPlan === 'free') {
      toast({ title: 'Free plan activated!', description: 'You can upgrade anytime.' });
      setPurchasing(false);
      onComplete();
      return;
    }

    // For paid plans - trigger payment flow
    toast({ title: `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan selected!`, description: 'Processing payment...' });
    // In production, this would open Razorpay checkout
    setTimeout(() => {
      setPurchasing(false);
      onComplete();
    }, 1000);
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
      {/* Billing Duration - Dropdown at top */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Billing:</span>
        <Select value={billingDuration} onValueChange={(v) => setBillingDuration(v as BillingDuration)}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(durationLabels) as [BillingDuration, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  {label}
                  {durationDiscounts[key] > 0 && (
                    <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                      -{durationDiscounts[key]}%
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.plan_key;
          const Icon = planIcons[plan.plan_key] || <Sparkles className="w-5 h-5" />;
          const gradient = planGradients[plan.plan_key] || 'from-slate-400 to-slate-500';
          const pricing = plan.price_inr > 0 ? getDiscountedPrice(plan.price_inr) : null;
          const isExpanded = expandedPlan === plan.plan_key;
          const allFeatures = plan.features_list || [];

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
                  {/* Show first 4 features always */}
                  <ul className="space-y-1.5">
                    {allFeatures.slice(0, 4).map((feature: any, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Expandable features */}
                  <AnimatePresence>
                    {isExpanded && allFeatures.length > 4 && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-1.5 mt-1.5 overflow-hidden"
                      >
                        {allFeatures.slice(4).map((feature: any, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature.text}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  {allFeatures.length > 4 && (
                    <button
                      className="flex items-center gap-1 text-[10px] text-blue-600 mt-2 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPlan(isExpanded ? null : plan.plan_key);
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          +{allFeatures.length - 4} more features
                        </>
                      )}
                    </button>
                  )}
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
          disabled={purchasing}
        >
          <Zap className="w-4 h-4 mr-2" />
          {purchasing ? 'Processing...' : selectedPlan === 'free' || !selectedPlan 
            ? 'Start Free' 
            : `Activate ${selectedPlan?.charAt(0).toUpperCase()}${selectedPlan?.slice(1)} Plan`
          }
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          You can upgrade or change your plan anytime from Settings
        </p>
      </div>
    </div>
  );
};

export default PricingStep;
