import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';

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
    <Card className="border-0 shadow-xl bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
        >
          <Package className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <CardTitle className="text-2xl">Add your products</CardTitle>
        <CardDescription>
          Showcase and sell products directly from your profile
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {productTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden ${!type.available ? 'opacity-60' : ''}`}>
                  {!type.available && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={type.requiredPlan} size="sm" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{type.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {type.examples.map((example) => (
                            <span
                              key={example}
                              className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Ready to sell?</p>
              <p className="text-xs text-muted-foreground">
                You can add products from the Products page in your dashboard after completing setup
              </p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/80"
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
