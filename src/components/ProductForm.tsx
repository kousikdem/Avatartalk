import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Tag, Package, Download } from 'lucide-react';
import { useProducts, Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  editProduct?: Product | null;
}

const getInitialFormData = (product?: Product | null) => ({
  title: product?.title || '',
  description: product?.description || '',
  product_category: product?.product_category || '',
  brand: product?.brand || '',
  tags: product?.tags || [],
  product_type: (product?.product_type || 'physical') as 'physical' | 'digital',
  base_currency: product?.base_currency || 'INR',
  price: product?.price ? product.price / 100 : 1,
  compare_at_price: product?.compare_at_price ? product.compare_at_price / 100 : 0,
  is_free: product?.is_free || false,
  free_for_subscribers: product?.free_for_subscribers || false,
  taxable: product?.taxable ?? true,
  tax_class: product?.tax_class || 'standard',
  track_inventory: product?.track_inventory ?? true,
  inventory_quantity: product?.inventory_quantity || 0,
  low_stock_threshold: product?.low_stock_threshold || 5,
  sku: product?.sku || '',
  shipping_enabled: product?.shipping_enabled ?? true,
  shipping_weight: product?.shipping_weight || 0,
  shipping_cost: product?.shipping_cost ? product.shipping_cost / 100 : 0,
  cod_enabled: product?.cod_enabled || false,
  download_limit: product?.download_limit || 3,
  license_type: product?.license_type || 'single-use',
  status: product?.status || 'draft',
  seo_title: product?.seo_title || '',
  seo_description: product?.seo_description || '',
  thumbnail: null as File | null,
  media: null as File | null,
  thumbnail_url: product?.thumbnail_url || ''
});

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSave, editProduct }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { createProduct, updateProduct, uploadThumbnail } = useProducts();
  const { toast } = useToast();

  const isEditMode = !!editProduct;

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(editProduct));
    }
  }, [isOpen, editProduct]);

  const handleSubmit = async (action: 'draft' | 'publish') => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage products",
          variant: "destructive",
        });
        return;
      }

      let thumbnailUrl = formData.thumbnail_url;
      if (formData.thumbnail) {
        thumbnailUrl = await uploadThumbnail(formData.thumbnail, user.id);
      }

      const productData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        product_type: formData.product_type,
        product_category: formData.product_category,
        brand: formData.brand,
        tags: formData.tags,
        base_currency: formData.base_currency,
        price: formData.is_free ? null : Math.round(formData.price * 100),
        compare_at_price: formData.compare_at_price ? Math.round(formData.compare_at_price * 100) : null,
        is_free: formData.is_free,
        free_for_subscribers: formData.free_for_subscribers,
        taxable: formData.taxable,
        tax_class: formData.tax_class,
        track_inventory: formData.product_type === 'physical' ? formData.track_inventory : false,
        inventory_quantity: formData.product_type === 'physical' ? formData.inventory_quantity : null,
        low_stock_threshold: formData.product_type === 'physical' ? formData.low_stock_threshold : null,
        sku: formData.sku || null,
        shipping_enabled: formData.product_type === 'physical' ? formData.shipping_enabled : false,
        shipping_weight: formData.product_type === 'physical' ? formData.shipping_weight : null,
        shipping_cost: formData.product_type === 'physical' && formData.shipping_cost ? Math.round(formData.shipping_cost * 100) : null,
        cod_enabled: formData.product_type === 'physical' ? formData.cod_enabled : false,
        download_limit: formData.product_type === 'digital' ? formData.download_limit : null,
        license_type: formData.product_type === 'digital' ? formData.license_type : null,
        status: action === 'draft' ? 'draft' : 'published',
        seo_title: formData.seo_title || formData.title,
        seo_description: formData.seo_description || formData.description,
        thumbnail_url: thumbnailUrl
      };

      if (isEditMode && editProduct) {
        await updateProduct(editProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      
      onSave(productData);
      onClose();
      
      toast({
        title: "Success",
        description: `Product ${isEditMode ? 'updated' : (action === 'draft' ? 'saved as draft' : 'published')} successfully`,
      });
      
      // Reset form
      setFormData(getInitialFormData());
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <Label>Product Type *</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    type="button"
                    variant={formData.product_type === 'physical' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, product_type: 'physical' }))}
                    className="flex-1"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Physical Product
                  </Button>
                  <Button
                    type="button"
                    variant={formData.product_type === 'digital' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, product_type: 'digital' }))}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Digital Product
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.product_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_category: e.target.value }))}
                    placeholder="e.g., Electronics"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed product description"
                  rows={5}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tags..."
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Thumbnail Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.files?.[0] || null }))}
                    className="hidden"
                  />
                  <label htmlFor="thumbnail" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Click to upload thumbnail</p>
                  </label>
                  {formData.thumbnail && (
                    <p className="text-sm mt-2 text-muted-foreground">{formData.thumbnail.name}</p>
                  )}
                  {!formData.thumbnail && formData.thumbnail_url && (
                    <div className="mt-2">
                      <img src={formData.thumbnail_url} alt="Current thumbnail" className="w-20 h-20 object-cover mx-auto rounded" />
                      <p className="text-xs text-muted-foreground mt-1">Current thumbnail</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4 mt-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Free Product</Label>
                  <Switch
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Free for Subscribers</Label>
                    <p className="text-xs text-muted-foreground">Subscribers get this product for free</p>
                  </div>
                  <Switch
                    checked={formData.free_for_subscribers}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, free_for_subscribers: checked }))}
                  />
                </div>

                {!formData.is_free && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="1"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: Math.max(1, parseFloat(e.target.value) || 1) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="compare_price">Compare at Price (₹)</Label>
                        <Input
                          id="compare_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.compare_at_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={formData.base_currency} onValueChange={(v) => setFormData(prev => ({ ...prev, base_currency: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tax_class">Tax Class (GST)</Label>
                        <Select value={formData.tax_class} onValueChange={(v) => setFormData(prev => ({ ...prev, tax_class: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zero">0% (Exempt)</SelectItem>
                            <SelectItem value="reduced">5% GST</SelectItem>
                            <SelectItem value="standard-12">12% GST</SelectItem>
                            <SelectItem value="standard">18% GST</SelectItem>
                            <SelectItem value="luxury">28% GST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Taxable</Label>
                      <Switch
                        checked={formData.taxable}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, taxable: checked }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4 mt-6">
            {formData.product_type === 'physical' ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Product SKU"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Track Inventory</Label>
                    <Switch
                      checked={formData.track_inventory}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, track_inventory: checked }))}
                    />
                  </div>

                  {formData.track_inventory && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Stock Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          value={formData.inventory_quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, inventory_quantity: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="threshold">Low Stock Alert</Label>
                        <Input
                          id="threshold"
                          type="number"
                          min="0"
                          value={formData.low_stock_threshold}
                          onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 5 }))}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    Inventory tracking is not applicable for digital products
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="space-y-4 mt-6">
            {formData.product_type === 'physical' ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Shipping</Label>
                    <Switch
                      checked={formData.shipping_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shipping_enabled: checked }))}
                    />
                  </div>

                  {formData.shipping_enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.shipping_weight}
                            onChange={(e) => setFormData(prev => ({ ...prev, shipping_weight: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="shipping_cost">Shipping Cost (₹)</Label>
                          <Input
                            id="shipping_cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.shipping_cost}
                            onChange={(e) => setFormData(prev => ({ ...prev, shipping_cost: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Cash on Delivery (COD)</Label>
                          <p className="text-sm text-muted-foreground">Allow COD payments</p>
                        </div>
                        <Switch
                          checked={formData.cod_enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cod_enabled: checked }))}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    Shipping is not applicable for digital products
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Digital Tab */}
          <TabsContent value="digital" className="space-y-4 mt-6">
            {formData.product_type === 'digital' ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="download_limit">Download Limit</Label>
                    <Input
                      id="download_limit"
                      type="number"
                      min="1"
                      value={formData.download_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, download_limit: parseInt(e.target.value) || 3 }))}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Number of times customer can download
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="license">License Type</Label>
                    <Select value={formData.license_type} onValueChange={(v) => setFormData(prev => ({ ...prev, license_type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-use">Single Use</SelectItem>
                        <SelectItem value="multi-use">Multi Use</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Digital Files</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <input
                        type="file"
                        id="digital-file"
                        onChange={(e) => setFormData(prev => ({ ...prev, media: e.target.files?.[0] || null }))}
                        className="hidden"
                      />
                      <label htmlFor="digital-file" className="cursor-pointer">
                        <Download className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">Upload digital file</p>
                      </label>
                      {formData.media && (
                        <p className="text-sm mt-2 text-muted-foreground">{formData.media.name}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    Digital settings are not applicable for physical products
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4 mt-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="Optimized title for search engines"
                  />
                </div>

                <div>
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Meta description for search engines"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isEditMode && (
            <Button
              variant="secondary"
              onClick={() => handleSubmit('draft')}
              disabled={isUploading}
            >
              Save Draft
            </Button>
          )}
          <Button
            onClick={() => handleSubmit('publish')}
            disabled={isUploading}
          >
            {isUploading ? 'Saving...' : isEditMode ? 'Update Product' : 'Publish Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
