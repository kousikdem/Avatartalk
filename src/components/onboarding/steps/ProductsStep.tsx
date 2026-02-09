import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Tag, Plus, ArrowRight } from 'lucide-react';
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

        {/* Product types info */}
        <div className="grid gap-2">
          {[
            { icon: Package, title: 'Digital', desc: 'E-books, courses, templates', available: canSellDigitalProducts, plan: 'creator' },
            { icon: ShoppingBag, title: 'Physical', desc: 'Merchandise, prints, goods', available: canSellPhysicalProducts, plan: 'business' },
            { icon: Tag, title: 'Services', desc: 'Consulting, coaching', available: canSellDigitalProducts, plan: 'creator' },
          ].map((type, i) => (
            <div key={type.title} className={`flex items-center gap-3 p-2.5 rounded-lg border ${type.available ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <type.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">{type.title}</span>
                <span className="text-xs text-muted-foreground ml-2">{type.desc}</span>
              </div>
              {!type.available && <PlanBadge planKey={type.plan} size="sm" />}
            </div>
          ))}
        </div>

        {/* Prominent Add Product Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg text-sm font-semibold h-12"
            onClick={() => navigate('/settings/products')}
            disabled={!canAdd}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product ({remaining === 'unlimited' ? '∞' : remaining} available)
          </Button>
        </motion.div>

        {!canAdd && (
          <p className="text-xs text-center text-muted-foreground">Product limit reached. Upgrade your plan.</p>
        )}

        <Button
          size="lg"
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={onComplete}
        >
          Continue to Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductsStep;