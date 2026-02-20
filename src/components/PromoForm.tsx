import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreatePromoData, usePromos } from '@/hooks/usePromos';
import { useProducts, Product } from '@/hooks/useProducts';
import { useVirtualCollaborations, VirtualProduct } from '@/hooks/useVirtualCollaborations';
import { Sparkles, RefreshCw, Calendar, Users, Package, Target, Zap, Video, ShoppingBag } from 'lucide-react';

interface PromoFormProps {
  open: boolean;
  onClose: () => void;
  promo?: any;
}

export const PromoForm = ({ open, onClose, promo }: PromoFormProps) => {
  const { createPromo, updatePromo, generatePromoCode } = usePromos();
  const { products } = useProducts();
  const { products: virtualCollaborations } = useVirtualCollaborations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(promo?.applicable_product_ids || []);

  const [formData, setFormData] = useState<CreatePromoData>({
    code: promo?.code || '',
    discount_type: promo?.discount_type || 'percent',
    discount_value: promo?.discount_value || 0,
    description: promo?.description || '',
    active: promo?.active ?? true,
    auto_apply: promo?.auto_apply ?? false,
    combinable: promo?.combinable ?? false,
    max_uses: promo?.max_uses || null,
    max_uses_per_user: promo?.max_uses_per_user || 1,
    min_order_value: promo?.min_order_value || null,
    min_quantity: promo?.min_quantity || 1,
    starts_at: promo?.starts_at || null,
    expires_at: promo?.expires_at || null,
    priority: promo?.priority || 0,
    target_buyer_type: promo?.target_buyer_type || 'all',
    target_product_type: promo?.target_product_type || 'all',
    free_shipping: promo?.free_shipping ?? false,
    flash_sale: promo?.flash_sale ?? false,
    scope: promo?.scope || 'store',
    applicable_product_ids: promo?.applicable_product_ids || null,
  });

  useEffect(() => {
    if (promo?.applicable_product_ids) {
      setSelectedProductIds(promo.applicable_product_ids);
    }
  }, [promo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        applicable_product_ids: formData.scope === 'product' ? selectedProductIds : null,
      };
      
      if (promo) {
        await updatePromo(promo.id, submitData);
      } else {
        await createPromo(submitData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving promo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCode = () => {
    setFormData(prev => ({ ...prev, code: generatePromoCode() }));
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    const allIds = [...products.map(p => p.id), ...virtualCollaborations.map(v => v.id)];
    setSelectedProductIds(allIds);
  };

  const clearAllProducts = () => {
    setSelectedProductIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {promo ? 'Edit Promo Code' : 'Create New Promo Code'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Promo Code Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Promo Code *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER2025"
                        required
                      />
                      <Button type="button" variant="outline" onClick={handleGenerateCode}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Special summer discount for all products"
                      rows={2}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount_type">Discount Type *</Label>
                      <Select
                        value={formData.discount_type}
                        onValueChange={(value: any) => setFormData({ ...formData, discount_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentage Off (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                          <SelectItem value="free_shipping">Free Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.discount_type !== 'free_shipping' && (
                      <div className="space-y-2">
                        <Label htmlFor="discount_value">
                          Discount Value * {formData.discount_type === 'percent' ? '(%)' : '(₹)'}
                        </Label>
                        <Input
                          id="discount_value"
                          type="number"
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                          min="0"
                          max={formData.discount_type === 'percent' ? 100 : undefined}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority (0-100)</Label>
                      <Input
                        id="priority"
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                      />
                      <p className="text-xs text-muted-foreground">Higher priority overrides lower</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scope">Scope</Label>
                      <Select
                        value={formData.scope}
                        onValueChange={(value) => setFormData({ ...formData, scope: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="store">All My Products</SelectItem>
                          <SelectItem value="product">Specific Products</SelectItem>
                          <SelectItem value="collection">Product Collection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Targeting Tab */}
            <TabsContent value="targeting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Target Audience & Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_buyer_type" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Target Buyers
                    </Label>
                    <Select
                      value={formData.target_buyer_type}
                      onValueChange={(value) => setFormData({ ...formData, target_buyer_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Buyers</SelectItem>
                        <SelectItem value="new">New Buyers Only</SelectItem>
                        <SelectItem value="returning">Returning Buyers</SelectItem>
                        <SelectItem value="followers">Followers Only</SelectItem>
                        <SelectItem value="subscribers">Subscribers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_product_type" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Target Products
                    </Label>
                    <Select
                      value={formData.target_product_type}
                      onValueChange={(value) => setFormData({ ...formData, target_product_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="digital">Digital Products Only</SelectItem>
                        <SelectItem value="physical">Physical Products Only</SelectItem>
                        <SelectItem value="virtual">Virtual Collaborations Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Specific Products Selection */}
              {formData.scope === 'product' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Select Specific Products & Collaborations
                      </span>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={selectAllProducts}>
                          Select All
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={clearAllProducts}>
                          Clear All
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Products Section */}
                    {products.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <ShoppingBag className="w-4 h-4 text-primary" />
                          Products ({products.length})
                        </Label>
                        <ScrollArea className="h-[150px] border rounded-md p-2">
                          <div className="space-y-2">
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                  selectedProductIds.includes(product.id)
                                    ? 'bg-primary/10 border border-primary/30'
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => toggleProductSelection(product.id)}
                              >
                                <Checkbox
                                  checked={selectedProductIds.includes(product.id)}
                                  onCheckedChange={() => toggleProductSelection(product.id)}
                                />
                                {product.thumbnail_url && (
                                  <img
                                    src={product.thumbnail_url}
                                    alt={product.title}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{product.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.product_type} • ₹{product.price || 0}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {product.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Virtual Collaborations Section */}
                    {virtualCollaborations.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Video className="w-4 h-4 text-blue-500" />
                          Virtual Collaborations ({virtualCollaborations.length})
                        </Label>
                        <ScrollArea className="h-[150px] border rounded-md p-2">
                          <div className="space-y-2">
                            {virtualCollaborations.map((collab) => (
                              <div
                                key={collab.id}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                  selectedProductIds.includes(collab.id)
                                    ? 'bg-blue-500/10 border border-blue-500/30'
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => toggleProductSelection(collab.id)}
                              >
                                <Checkbox
                                  checked={selectedProductIds.includes(collab.id)}
                                  onCheckedChange={() => toggleProductSelection(collab.id)}
                                />
                                {collab.thumbnail_url && (
                                  <img
                                    src={collab.thumbnail_url}
                                    alt={collab.title}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{collab.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {collab.product_type} • ₹{collab.price || 0}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                                  Virtual
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Selected Summary */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        {selectedProductIds.length} item(s) selected
                      </p>
                      {selectedProductIds.length > 0 && (
                        <div className="flex gap-1 flex-wrap max-w-[300px]">
                          {selectedProductIds.slice(0, 3).map((id) => {
                            const product = products.find(p => p.id === id);
                            const collab = virtualCollaborations.find(v => v.id === id);
                            const item = product || collab;
                            return item ? (
                              <Badge key={id} variant="secondary" className="text-xs truncate max-w-[100px]">
                                {item.title}
                              </Badge>
                            ) : null;
                          })}
                          {selectedProductIds.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedProductIds.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Limits Tab */}
            <TabsContent value="limits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Usage Limits & Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_uses">Max Total Uses</Label>
                      <Input
                        id="max_uses"
                        type="number"
                        value={formData.max_uses || ''}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Unlimited"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_uses_per_user">Max Uses Per User</Label>
                      <Input
                        id="max_uses_per_user"
                        type="number"
                        value={formData.max_uses_per_user || ''}
                        onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value ? parseInt(e.target.value) : null })}
                        min="1"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_order_value">Min Order Value (₹)</Label>
                      <Input
                        id="min_order_value"
                        type="number"
                        value={formData.min_order_value || ''}
                        onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="No minimum"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min_quantity">Min Quantity</Label>
                      <Input
                        id="min_quantity"
                        type="number"
                        value={formData.min_quantity}
                        onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="starts_at">Start Date</Label>
                      <Input
                        id="starts_at"
                        type="datetime-local"
                        value={formData.starts_at || ''}
                        onChange={(e) => setFormData({ ...formData, starts_at: e.target.value || null })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expires_at">End Date</Label>
                      <Input
                        id="expires_at"
                        type="datetime-local"
                        value={formData.expires_at || ''}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value || null })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-xs text-muted-foreground">Enable or disable this promo</p>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Apply</Label>
                      <p className="text-xs text-muted-foreground">Automatically apply at checkout</p>
                    </div>
                    <Switch
                      checked={formData.auto_apply}
                      onCheckedChange={(checked) => setFormData({ ...formData, auto_apply: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Combinable</Label>
                      <p className="text-xs text-muted-foreground">Can be stacked with other promos</p>
                    </div>
                    <Switch
                      checked={formData.combinable}
                      onCheckedChange={(checked) => setFormData({ ...formData, combinable: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Flash Sale</Label>
                      <p className="text-xs text-muted-foreground">Mark as limited-time flash sale</p>
                    </div>
                    <Switch
                      checked={formData.flash_sale}
                      onCheckedChange={(checked) => setFormData({ ...formData, flash_sale: checked })}
                    />
                  </div>

                  {formData.discount_type !== 'free_shipping' && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Free Shipping</Label>
                        <p className="text-xs text-muted-foreground">Provide free shipping with this promo</p>
                      </div>
                      <Switch
                        checked={formData.free_shipping}
                        onCheckedChange={(checked) => setFormData({ ...formData, free_shipping: checked })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg font-mono">
                        {formData.code || 'PROMO'}
                      </Badge>
                      {formData.flash_sale && <Badge variant="destructive">FLASH SALE</Badge>}
                      {formData.auto_apply && <Badge className="bg-green-500">AUTO APPLY</Badge>}
                    </div>
                    <p className="text-sm">
                      {formData.discount_type === 'percent' && `${formData.discount_value}% off`}
                      {formData.discount_type === 'fixed' && `₹${formData.discount_value} off`}
                      {formData.discount_type === 'free_shipping' && 'Free Shipping'}
                      {formData.min_order_value && ` on orders above ₹${formData.min_order_value}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : promo ? 'Update Promo' : 'Create Promo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};