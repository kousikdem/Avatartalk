import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Video, Users, Clock, DollarSign, Calendar, 
  Settings, FileText, Zap, Globe, Mail, Phone,
  Building2, CheckCircle2, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { VirtualProduct, HostIntegrations } from '@/hooks/useVirtualCollaborations';

interface VirtualProductFormProps {
  product?: VirtualProduct | null;
  onClose: () => void;
  onSave: (data: Partial<VirtualProduct>) => void;
  integrations?: HostIntegrations | null;
}

const VirtualProductForm: React.FC<VirtualProductFormProps> = ({
  product,
  onClose,
  onSave,
  integrations
}) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    product_type: product?.product_type || 'one_to_one',
    price: product?.price || 0,
    currency: product?.currency || 'INR',
    duration_mins: product?.duration_mins || 60,
    capacity: product?.capacity || 1,
    provider: product?.provider || 'google_meet',
    auto_generate_link: product?.auto_generate_link ?? true,
    status: product?.status || 'draft',
    timezone: product?.timezone || 'Asia/Kolkata',
    scheduling_mode: product?.scheduling_mode || 'scheduled',
    refund_policy: product?.refund_policy || '24 hour full refund',
    refund_days: product?.refund_days || 1,
    event_date: product?.event_date || '',
    thumbnail_url: product?.thumbnail_url || '',
    manual_link: product?.manual_link || '',
    booking_form_fields: product?.booking_form_fields || [
      { key: 'full_name', label: 'Full Name', required: true, type: 'text' },
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'phone', label: 'Phone', required: false, type: 'tel' },
    ]
  });

  const [customFields, setCustomFields] = useState<any[]>(formData.booking_form_fields.slice(3));

  const handleSubmit = () => {
    const allFields = [
      ...formData.booking_form_fields.slice(0, 3),
      ...customFields
    ];
    
    onSave({
      ...formData,
      booking_form_fields: allFields
    });
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { key: `custom_${Date.now()}`, label: '', required: false, type: 'text' }
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: string, value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="meeting">Meeting</TabsTrigger>
          <TabsTrigger value="booking">Booking Form</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="e.g., 1:1 Strategy Call"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this virtual collaboration includes..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Product Type *</Label>
              <Select 
                value={formData.product_type} 
                onValueChange={(v) => setFormData({ ...formData, product_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_to_one">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      One-to-One Call
                    </div>
                  </SelectItem>
                  <SelectItem value="webinar">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Webinar / Event
                    </div>
                  </SelectItem>
                  <SelectItem value="brand_collaboration">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Brand Collaboration
                    </div>
                  </SelectItem>
                  <SelectItem value="recurring">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Recurring Series
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
              <Input
                id="thumbnail"
                placeholder="https://example.com/image.jpg"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Add a cover image for your virtual collaboration
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (in smallest unit, e.g., paise)</Label>
                <Input
                  id="price"
                  type="number"
                  min="100"
                  placeholder="e.g., 50000 for ₹500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Display: ₹{(formData.price / 100).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Refund Policy</Label>
              <Textarea
                placeholder="Describe your refund policy..."
                value={formData.refund_policy}
                onChange={(e) => setFormData({ ...formData, refund_policy: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund_days">Auto-refund Window (days)</Label>
              <Input
                id="refund_days"
                type="number"
                min="0"
                max="30"
                value={formData.refund_days}
                onChange={(e) => setFormData({ ...formData, refund_days: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Buyers can request automatic refund within {formData.refund_days} days
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span>Platform fee: 10% will be deducted from each booking</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="scheduling" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration_mins}
                  onChange={(e) => setFormData({ ...formData, duration_mins: parseInt(e.target.value) || 60 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (max attendees)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(v) => setFormData({ ...formData, timezone: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scheduling Mode</Label>
              <Select 
                value={formData.scheduling_mode} 
                onValueChange={(v) => setFormData({ ...formData, scheduling_mode: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled Slots</SelectItem>
                  <SelectItem value="instant">Instant / On-demand</SelectItem>
                  <SelectItem value="recurring">Recurring Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Date/Time for Webinars */}
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date & Time</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Set the date and time for your event/webinar
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Meeting Platform Tab */}
        <TabsContent value="meeting" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Meeting Platform</Label>
              <Select 
                value={formData.provider} 
                onValueChange={(v) => setFormData({ ...formData, provider: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_meet">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google Meet
                    </div>
                  </SelectItem>
                  <SelectItem value="zoom">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#2D8CFF">
                        <path d="M4.5 4.5h10.8c1.32 0 2.4 1.08 2.4 2.4v6c0 1.32-1.08 2.4-2.4 2.4H4.5c-1.32 0-2.4-1.08-2.4-2.4v-6c0-1.32 1.08-2.4 2.4-2.4zm13.2 3l3.9-2.4v7.8l-3.9-2.4V7.5z"/>
                      </svg>
                      Zoom
                    </div>
                  </SelectItem>
                  <SelectItem value="manual">Manual Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Integration Status */}
            {formData.provider !== 'manual' && (
              <Card className={integrations?.[formData.provider === 'google_meet' ? 'google_connected' : 'zoom_connected'] 
                ? "border-green-200 bg-green-50 dark:bg-green-950/20" 
                : "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
              }>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {integrations?.[formData.provider === 'google_meet' ? 'google_connected' : 'zoom_connected'] ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 dark:text-green-400">
                          {formData.provider === 'google_meet' ? 'Google' : 'Zoom'} connected - Meeting links will be auto-generated
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <span className="text-orange-700 dark:text-orange-400">
                          Connect {formData.provider === 'google_meet' ? 'Google' : 'Zoom'} from the integration bar to auto-generate links
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Meeting Link</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically create meeting link when booking is confirmed
                </p>
              </div>
              <Switch
                checked={formData.auto_generate_link}
                onCheckedChange={(v) => setFormData({ ...formData, auto_generate_link: v })}
                disabled={formData.provider === 'manual'}
              />
            </div>

            {/* Manual Link Input */}
            {formData.provider === 'manual' && (
              <div className="space-y-2">
                <Label htmlFor="manual_link">Meeting Link (Manual)</Label>
                <Input
                  id="manual_link"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or zoom.us/j/xxxxx"
                  value={formData.manual_link}
                  onChange={(e) => setFormData({ ...formData, manual_link: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your own meeting link (Google Meet, Zoom, or any other platform)
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Booking Form Tab */}
        <TabsContent value="booking" className="space-y-4 mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure the information you want to collect from buyers when they book
            </p>

            {/* Default Fields */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Default Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>Full Name</span>
                  </div>
                  <Badge>Required</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Email</span>
                  </div>
                  <Badge>Required</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>Phone</span>
                  </div>
                  <Badge variant="outline">Optional</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Custom Fields</CardTitle>
                  <Button variant="outline" size="sm" onClick={addCustomField}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {customFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No custom fields added. Click "Add Field" to create one.
                  </p>
                ) : (
                  customFields.map((field, index) => (
                    <div key={field.key} className="flex items-center gap-2 p-2 border rounded-lg">
                      <Input
                        placeholder="Field label"
                        value={field.label}
                        onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Select 
                        value={field.type} 
                        onValueChange={(v) => updateCustomField(index, 'type', v)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="tel">Phone</SelectItem>
                          <SelectItem value="textarea">Long Text</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(v) => updateCustomField(index, 'required', v)}
                        />
                        <span className="text-xs text-muted-foreground">Required</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => removeCustomField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => handleSubmit()}>
          Save as Draft
        </Button>
        <Button onClick={() => {
          setFormData({ ...formData, status: 'published' });
          handleSubmit();
        }}>
          Publish
        </Button>
      </div>
    </div>
  );
};

export default VirtualProductForm;
