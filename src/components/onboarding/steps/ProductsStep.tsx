import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Tag, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { useNavigate } from 'react-router-dom';

interface ProductsStepProps {
  onComplete: () => void;
}

const ProductsStep: React.FC<ProductsStepProps> = ({ onComplete }) => {
  const { canSellDigitalProducts, canSellPhysicalProducts } = usePlanFeatures();

  const productTypes = [
    {
      icon: Package,
      title: 'Digital Products',
      description: 'E-books, courses, templates, and downloads',
      examples: ['PDF guides', 'Video courses', 'Design templates'],
      available: canSellDigitalProducts,
      requiredPlan: 'creator',
    },
    {
      icon: ShoppingBag,
      title: 'Physical Products',
      description: 'Merchandise, prints, and tangible goods',
      examples: ['T-shirts', 'Art prints', 'Books'],
      available: canSellPhysicalProducts,
      requiredPlan: 'business',
    },
    {
      icon: Tag,
      title: 'Services',
      description: 'Consulting, coaching, and custom work',
      examples: ['1:1 coaching', 'Design services', 'Consulting'],
      available: canSellDigitalProducts,
      requiredPlan: 'creator',
    },
  ];

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            Showcase and sell products directly from your profile
          </p>
        </div>

        <div className="grid gap-3">
          {productTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`relative overflow-hidden p-4 rounded-xl border transition-all ${
                  type.available ? 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/20' : 'border-slate-100 opacity-60'
                }`}>
                  {!type.available && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={type.requiredPlan} size="sm" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{type.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{type.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {type.examples.map((example) => (
                          <span key={example} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-muted-foreground">
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Ready to sell?</p>
              <p className="text-xs text-muted-foreground">
                Add products from the Products page in your dashboard after completing setup
              </p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={onComplete}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductsStep;
