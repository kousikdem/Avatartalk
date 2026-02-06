import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlatformPricingPlans } from '@/hooks/usePlatformPricingPlans';
import { cn } from '@/lib/utils';

interface PricingStepProps {
  onComplete: () => void;
}

const PricingStep: React.FC<PricingStepProps> = ({ onComplete }) => {
  const { plans, loading } = usePlatformPricingPlans();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const planIcons: Record<string, React.ReactNode> = {
    free: <Sparkles className="w-6 h-6" />,
    creator: <Crown className="w-6 h-6" />,
    pro: <Rocket className="w-6 h-6" />,
    business: <Crown className="w-6 h-6" />,
  };

  const planGradients: Record<string, string> = {
    free: 'from-slate-400 to-slate-500',
    creator: 'from-blue-500 to-indigo-600',
    pro: 'from-purple-500 to-indigo-600',
    business: 'from-amber-500 to-orange-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.plan_key;
          const Icon = planIcons[plan.plan_key] || <Sparkles className="w-6 h-6" />;
          const gradient = planGradients[plan.plan_key] || 'from-slate-400 to-slate-500';

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
                    <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3 shadow-lg',
                    gradient
                  )}>
                    {Icon}
                  </div>
                  <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr}`}
                    </span>
                    {plan.price_inr > 0 && (
                      <span className="text-sm text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {plan.features_list?.slice(0, 5).map((feature, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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

      <div className="flex flex-col items-center gap-4 pt-4">
        <Button
          size="lg"
          className="w-full max-w-md bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={onComplete}
        >
          {selectedPlan === 'free' || !selectedPlan ? 'Start Free' : 'Continue with Selected Plan'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          You can upgrade or change your plan anytime from Settings
        </p>
      </div>
    </div>
  );
};

export default PricingStep;
