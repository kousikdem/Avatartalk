import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Video, Clock, DollarSign, Calendar, Settings, Users, Bell, 
  FileText, Upload, X, Image 
} from 'lucide-react';
import { VirtualProduct } from '@/hooks/useVirtualProducts';

interface AddVirtualProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<VirtualProduct>) => Promise<void>;
  editProduct?: VirtualProduct | null;
}

const AddVirtualProductModal: React.FC<AddVirtualProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editProduct
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<Partial<VirtualProduct>>({
    title: editProduct?.title || '',
    tagline: editProduct?.tagline || '',
    description: editProduct?.description || '',
    product_type: editProduct?.product_type || 'one_to_one',
    visibility: editProduct?.visibility || 'public',
    price: editProduct?.price || 0,
    currency: editProduct?.currency || 'INR',
    price_model: editProduct?.price_model || 'per_session',
    tax_rate: editProduct?.tax_rate || 18,
    tax_inclusive: editProduct?.tax_inclusive || false,
    refund_policy: editProduct?.refund_policy || '24 hour full refund',
    scheduling_mode: editProduct?.scheduling_mode || 'scheduled_slots',
    timezone: editProduct?.timezone || 'Asia/Kolkata',
    duration_mins: editProduct?.duration_mins || 60,
    capacity: editProduct?.capacity || 1,
    buffer_time_mins: editProduct?.buffer_time_mins || 15,
    min_booking_notice_hours: editProduct?.min_booking_notice_hours || 24,
    max_bookings_per_user: editProduct?.max_bookings_per_user || 10,
    waitlist_enabled: editProduct?.waitlist_enabled || false,
    meeting_provider: editProduct?.meeting_provider || 'google_meet',
    auto_generate_meeting_link: editProduct?.auto_generate_meeting_link ?? true,
    recording_allowed: editProduct?.recording_allowed || false,
    join_link_visibility: editProduct?.join_link_visibility || 'after_payment',
    require_terms_consent: editProduct?.require_terms_consent ?? true,
    require_recording_consent: editProduct?.require_recording_consent || false,
    send_calendar_invite: editProduct?.send_calendar_invite ?? true,
    reminder_24h: editProduct?.reminder_24h ?? true,
    reminder_1h: editProduct?.reminder_1h ?? true,
    notify_host_on_booking: editProduct?.notify_host_on_booking ?? true,
    promo_codes_enabled: editProduct?.promo_codes_enabled ?? true,
    status: editProduct?.status || 'draft'
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof VirtualProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
            {editProduct ? 'Edit Virtual Product' : 'Add Virtual Product'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="meeting">Meeting</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., 1:1 Strategy Call"
                  />
                </div>
                
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={formData.tagline || ''}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Short description"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Detailed description of what's included"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Type</Label>
                    <Select 
                      value={formData.product_type} 
                      onValueChange={(v) => updateField('product_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_to_one">1:1 Meeting</SelectItem>
                        <SelectItem value="one_to_many">Webinar/Event</SelectItem>
                        <SelectItem value="brand_collaboration">Brand Collaboration</SelectItem>
                        <SelectItem value="recurring_series">Recurring Series</SelectItem>
                        <SelectItem value="on_demand">On Demand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Visibility</Label>
                    <Select 
                      value={formData.visibility} 
                      onValueChange={(v) => updateField('visibility', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="invite_only">Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <Label>Thumbnail</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="thumbnail"
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="thumbnail" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload thumbnail</p>
                    </label>
                    {thumbnail && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Image className="w-4 h-4" />
                        <span className="text-sm">{thumbnail.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setThumbnail(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Pricing & Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                      min={0}
                    />
                  </div>

                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(v) => updateField('currency', v)}
                    >
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
                </div>

                <div>
                  <Label>Price Model</Label>
                  <Select 
                    value={formData.price_model} 
                    onValueChange={(v) => updateField('price_model', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_session">Per Session</SelectItem>
                      <SelectItem value="multi_session_pass">Multi-Session Pass</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pay_what_you_want">Pay What You Want</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={formData.tax_rate || 0}
                      onChange={(e) => updateField('tax_rate', parseFloat(e.target.value) || 0)}
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.tax_inclusive || false}
                      onCheckedChange={(v) => updateField('tax_inclusive', v)}
                    />
                    <Label>Tax Inclusive</Label>
                  </div>
                </div>

                <div>
                  <Label>Refund Policy</Label>
                  <Textarea
                    value={formData.refund_policy || ''}
                    onChange={(e) => updateField('refund_policy', e.target.value)}
                    placeholder="Describe your refund policy"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.promo_codes_enabled || false}
                    onCheckedChange={(v) => updateField('promo_codes_enabled', v)}
                  />
                  <Label>Enable Promo Codes</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Scheduling & Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Scheduling Mode</Label>
                  <Select 
                    value={formData.scheduling_mode} 
                    onValueChange={(v) => updateField('scheduling_mode', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant_on_demand">Instant On-Demand</SelectItem>
                      <SelectItem value="scheduled_slots">Scheduled Slots</SelectItem>
                      <SelectItem value="recurring_schedule">Recurring Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration_mins}
                      onChange={(e) => updateField('duration_mins', parseInt(e.target.value) || 60)}
                      min={15}
                      step={15}
                    />
                  </div>

                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => updateField('capacity', parseInt(e.target.value) || 1)}
                      min={1}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Buffer Time (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.buffer_time_mins || 0}
                      onChange={(e) => updateField('buffer_time_mins', parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </div>

                  <div>
                    <Label>Min Booking Notice (hours)</Label>
                    <Input
                      type="number"
                      value={formData.min_booking_notice_hours || 0}
                      onChange={(e) => updateField('min_booking_notice_hours', parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(v) => updateField('timezone', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.waitlist_enabled || false}
                    onCheckedChange={(v) => updateField('waitlist_enabled', v)}
                  />
                  <Label>Enable Waitlist</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meeting Tab */}
          <TabsContent value="meeting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Meeting Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meeting Provider</Label>
                  <Select 
                    value={formData.meeting_provider} 
                    onValueChange={(v) => updateField('meeting_provider', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_meet">Google Meet</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="manual">Manual Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.auto_generate_meeting_link || false}
                    onCheckedChange={(v) => updateField('auto_generate_meeting_link', v)}
                  />
                  <Label>Auto-generate Meeting Link</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.recording_allowed || false}
                    onCheckedChange={(v) => updateField('recording_allowed', v)}
                  />
                  <Label>Recording Allowed</Label>
                </div>

                <div>
                  <Label>Join Link Visibility</Label>
                  <Select 
                    value={formData.join_link_visibility || 'after_payment'} 
                    onValueChange={(v) => updateField('join_link_visibility', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="after_payment">After Payment</SelectItem>
                      <SelectItem value="after_confirmation">After Confirmation</SelectItem>
                      <SelectItem value="after_reminder">After Reminder Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Consent Requirements</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.require_terms_consent || false}
                        onCheckedChange={(v) => updateField('require_terms_consent', v)}
                      />
                      <span className="text-sm">Require Terms & Conditions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.require_recording_consent || false}
                        onCheckedChange={(v) => updateField('require_recording_consent', v)}
                      />
                      <span className="text-sm">Require Recording Consent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Notifications & Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.send_calendar_invite || false}
                    onCheckedChange={(v) => updateField('send_calendar_invite', v)}
                  />
                  <Label>Send Calendar Invite</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.reminder_24h || false}
                    onCheckedChange={(v) => updateField('reminder_24h', v)}
                  />
                  <Label>24-hour Reminder</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.reminder_1h || false}
                    onCheckedChange={(v) => updateField('reminder_1h', v)}
                  />
                  <Label>1-hour Reminder</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.notify_host_on_booking || false}
                    onCheckedChange={(v) => updateField('notify_host_on_booking', v)}
                  />
                  <Label>Notify Host on New Booking</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? 'Saving...' : (editProduct ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVirtualProductModal;
