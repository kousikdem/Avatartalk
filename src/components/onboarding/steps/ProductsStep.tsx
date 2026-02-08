import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Tag, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';

interface ProductsStepProps {
  onComplete: () => void;
}

const ProductsStep: React.FC<ProductsStepProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { canSellDigitalProducts, canSellPhysicalProducts, limits, canAddProduct, getRemainingProducts } = usePlanFeatures();
  const { products } = useProducts();

  const currentCount = products?.length || 0;
  const remaining = getRemainingProducts(currentCount);
  const canAdd = canAddProduct(currentCount);

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
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          Showcase and sell products directly from your profile
        </p>

        {/* Limit badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {currentCount} / {limits.products === -1 ? '∞' : limits.products} products
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {remaining === 'unlimited' ? 'Unlimited' : `${remaining} remaining`}
          </span>
        </div>

        <div className="grid gap-2.5">
          {productTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`relative overflow-hidden p-3 rounded-xl border transition-all ${
                  type.available ? 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/20' : 'border-slate-100 opacity-60'
                }`}>
                  {!type.available && (
                    <div className="absolute top-2 right-2">
                      <PlanBadge planKey={type.requiredPlan} size="sm" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{type.title}</h3>
                      <p className="text-xs text-muted-foreground mb-1.5">{type.description}</p>
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

        {/* Add Product Button - always visible */}
        <Button
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 gap-2"
          onClick={() => navigate('/settings/products')}
          disabled={!canAdd}
        >
          <Plus className="w-4 h-4" />
          Add Product ({remaining === 'unlimited' ? '∞' : remaining} left)
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </Button>

        {!canAdd && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Product limit reached. Upgrade to add more.</span>
          </div>
        )}

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={onComplete}
        >
          Continue to Next Step →
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductsStep;
