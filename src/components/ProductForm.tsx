
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image, Video, FileText } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    product_type: '',
    description: '',
    price: 0,
    is_free: false,
    status: 'draft',
    media: null as File | null,
    thumbnail: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const { createProduct, uploadThumbnail } = useProducts();
  const { toast } = useToast();

  const productTypes = [
    'Virtual Meeting',
    'Digital Product',
    'Brand Collection',
    'Event',
    'Collaboration',
    'Other'
  ];

  const handleSubmit = async (action: 'draft' | 'publish') => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create products",
          variant: "destructive",
        });
        return;
      }

      let thumbnailUrl = '';
      if (formData.thumbnail) {
        thumbnailUrl = await uploadThumbnail(formData.thumbnail, user.id);
      }

      const productData = {
        user_id: user.id,
        title: formData.title,
        product_type: formData.product_type,
        description: formData.description,
        price: formData.is_free ? null : formData.price,
        is_free: formData.is_free,
        status: action === 'draft' ? 'draft' : 'published',
        thumbnail_url: thumbnailUrl
      };

      await createProduct(productData);
      onSave(productData);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        product_type: '',
        description: '',
        price: 0,
        is_free: false,
        status: 'draft',
        media: null,
        thumbnail: null
      });
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));
    }
  };

  const getMediaIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    return FileText;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border-slate-200/60">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 border border-slate-200/60">
            <TabsTrigger value="details" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:to-blue-50/30">Product Details</TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:to-blue-50/30">Media & Assets</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:to-blue-50/30">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                    Product Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter product title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 bg-white/80 border-slate-200/60"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                    Product Type *
                  </Label>
                  <Select value={formData.product_type} onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value }))}>
                    <SelectTrigger className="mt-1 bg-white/80 border-slate-200/60">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-slate-700">Pricing</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="free"
                        checked={formData.is_free}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
                      />
                      <Label htmlFor="free" className="text-sm">Free Product</Label>
                    </div>
                  </div>
                  {!formData.is_free && (
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 bg-white/80 border-slate-200/60"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="mt-1 bg-white/80 border-slate-200/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 min-h-[120px] bg-white/80 border-slate-200/60"
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6 mt-6">
            {/* Thumbnail Upload */}
            <Card className="bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/20 border-emerald-200/60">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent">Thumbnail Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors bg-gradient-to-br from-emerald-50/50 to-cyan-50/50">
                    <input
                      type="file"
                      id="thumbnail"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                    <label htmlFor="thumbnail" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Click to upload thumbnail image</p>
                      <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                    </label>
                  </div>

                  {formData.thumbnail && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
                      <Image className="w-5 h-5 text-emerald-600" />
                      <span className="flex-1 text-sm text-slate-700">{formData.thumbnail.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                        className="hover:bg-gradient-to-r hover:from-red-100/80 hover:to-pink-100/80"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-blue-200/60">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Media Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                    <input
                      type="file"
                      id="media"
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <label htmlFor="media" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-500">Images, videos, or documents</p>
                    </label>
                  </div>

                  {formData.media && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200/60">
                      {React.createElement(getMediaIcon(formData.media), { className: "w-5 h-5 text-blue-600" })}
                      <span className="flex-1 text-sm text-slate-700">{formData.media.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, media: null }))}
                        className="hover:bg-gradient-to-r hover:from-red-100/80 hover:to-pink-100/80"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 border-purple-200/60">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Additional Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600">
                  Additional product settings and configurations will be available here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-gradient-to-r from-white to-slate-50/60 hover:from-slate-50 hover:to-slate-100 border-slate-300"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit('draft')}
            disabled={isUploading}
            className="bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700"
          >
            {isUploading ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={() => handleSubmit('publish')}
            disabled={isUploading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {isUploading ? 'Publishing...' : 'Publish Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
