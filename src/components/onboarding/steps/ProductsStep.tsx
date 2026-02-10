import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Tag, Plus, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductsStepProps {
  onComplete: () => void;
}

const ProductsStep: React.FC<ProductsStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canSellDigitalProducts, canSellPhysicalProducts, limits, canAddProduct, getRemainingProducts } = usePlanFeatures();
  const { products, createProduct, isLoading } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productType, setProductType] = useState('digital');

  const currentCount = products?.length || 0;
  const remaining = getRemainingProducts(currentCount);
  const canAdd = canAddProduct(currentCount);

  const handleAddProduct = async () => {
    if (!title.trim() || !user) return;
    setSaving(true);
    try {
      await createProduct({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price) || 0,
        product_type: productType,
        is_free: !price || parseFloat(price) === 0,
        status: 'published',
      });
      setTitle(''); setDescription(''); setPrice(''); setProductType('digital');
      setShowForm(false);
      toast({ title: 'Product added!' });
    } catch {
      toast({ title: 'Error adding product', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-xs text-muted-foreground text-center">Showcase and sell products from your profile</p>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{currentCount} / {limits.products === -1 ? '∞' : limits.products} products</Badge>
          <span className="text-[10px] text-muted-foreground">{remaining === 'unlimited' ? 'Unlimited' : `${remaining} remaining`}</span>
        </div>

        {/* Existing products */}
        {products && products.length > 0 && (
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {products.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{p.title}</p>
                  <p className="text-[9px] text-muted-foreground">{p.product_type} · {p.is_free ? 'Free' : `₹${p.price}`}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline Add Form */}
        {showForm ? (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Add New Product</Label>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowForm(false)}><X className="w-3 h-3" /></Button>
            </div>
            <Input placeholder="Product Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="resize-none text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Price (₹)</Label>
                <Input type="number" placeholder="0 = Free" value={price} onChange={(e) => setPrice(e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddProduct} disabled={!title.trim() || saving} className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              {saving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Adding...</> : <><Plus className="w-3 h-3 mr-1" /> Add Product</>}
            </Button>
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button size="lg" className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg text-sm font-semibold h-12"
              onClick={() => setShowForm(true)} disabled={!canAdd}>
              <Plus className="w-5 h-5 mr-2" /> Add Product ({remaining === 'unlimited' ? '∞' : remaining} available)
            </Button>
          </motion.div>
        )}

        {!canAdd && <p className="text-xs text-center text-muted-foreground">Product limit reached. Upgrade your plan.</p>}

        <Button size="lg" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={onComplete}>
          Continue to Next Step <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductsStep;
