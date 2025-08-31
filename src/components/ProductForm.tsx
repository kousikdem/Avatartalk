
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

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    price: 0,
    isFree: false,
    status: 'Draft',
    media: null as File | null
  });

  const productTypes = [
    'Virtual Meeting',
    'Digital Product',
    'Brand Collection',
    'Event',
    'Collaboration',
    'Other'
  ];

  const handleSubmit = (action: 'draft' | 'publish') => {
    const productData = {
      ...formData,
      status: action === 'draft' ? 'Draft' : 'Published'
    };
    onSave(productData);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="media">Media & Assets</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                    Product Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
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
                        checked={formData.isFree}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked }))}
                      />
                      <Label htmlFor="free" className="text-sm">Free Product</Label>
                    </div>
                  </div>
                  {!formData.isFree && (
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Hidden">Hidden</SelectItem>
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
                className="mt-1 min-h-[120px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Media Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="media"
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <label htmlFor="media" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-500">Images, videos, or documents</p>
                    </label>
                  </div>

                  {formData.media && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      {React.createElement(getMediaIcon(formData.media), { className: "w-5 h-5 text-slate-600" })}
                      <span className="flex-1 text-sm text-slate-700">{formData.media.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, media: null }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600">
                  Additional product settings and configurations will be available here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit('draft')}
            className="bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit('publish')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Publish Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
