import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, Plus, ArrowRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VirtualCollaborationStepProps {
  onComplete: () => void;
}

const VirtualCollaborationStep: React.FC<VirtualCollaborationStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canHostVirtualMeetings, hasFeature, limits, canAddCollaboration, getRemainingCollaborations } = usePlanFeatures();

  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collabType, setCollabType] = useState('one_to_one');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');

  const currentCount = collaborations.length;
  const remaining = getRemainingCollaborations(currentCount);
  const canAdd = canAddCollaboration(currentCount);

  // Load existing
  React.useEffect(() => {
    if (!user) return;
    supabase.from('virtual_products').select('id, title, product_type, price, duration_mins').eq('user_id', user.id).then(({ data }) => {
      if (data) setCollaborations(data);
    });
  }, [user]);

  const handleAdd = async () => {
    if (!title.trim() || !user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from('virtual_products').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || '',
        product_type: collabType,
        price: parseFloat(price) || 0,
        duration_mins: parseInt(duration) || 30,
        currency: 'INR',
        capacity: collabType === 'webinar' ? 50 : 1,
        provider: 'manual',
        auto_generate_link: false,
        status: 'published',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        scheduling_mode: 'scheduled',
        available_slots: [],
        booking_form_fields: [],
        refund_policy: 'flexible',
        refund_days: 7,
      }).select().single();

      if (error) throw error;
      setCollaborations(prev => [...prev, data]);
      setTitle(''); setDescription(''); setPrice(''); setDuration('30');
      setShowForm(false);
      toast({ title: 'Collaboration added!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-xs text-muted-foreground text-center">Offer paid video sessions and connect with your audience</p>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{currentCount} / {limits.collaborations === -1 ? '∞' : limits.collaborations} collaborations</Badge>
          <span className="text-[10px] text-muted-foreground">{remaining === 'unlimited' ? 'Unlimited' : `${remaining} remaining`}</span>
        </div>

        {/* Existing */}
        {collaborations.length > 0 && (
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {collaborations.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{c.title}</p>
                  <p className="text-[9px] text-muted-foreground">{c.product_type} · {c.duration_mins}min · ₹{c.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline form */}
        {showForm ? (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Add Collaboration</Label>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowForm(false)}><X className="w-3 h-3" /></Button>
            </div>
            <Input placeholder="Session Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="resize-none text-sm" />
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={collabType} onValueChange={setCollabType}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_to_one">1:1 Call</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="brand_collaboration">Brand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (₹)</Label>
                <Input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duration (min)</Label>
                <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={!title.trim() || saving} className="w-full h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs">
              {saving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Adding...</> : <><Plus className="w-3 h-3 mr-1" /> Add Collaboration</>}
            </Button>
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg text-sm font-semibold h-12"
              onClick={() => setShowForm(true)} disabled={!canAdd}>
              <Plus className="w-5 h-5 mr-2" /> Add Collaboration ({remaining === 'unlimited' ? '∞' : remaining} available)
            </Button>
          </motion.div>
        )}

        {!canAdd && <p className="text-xs text-center text-muted-foreground">Limit reached. Upgrade plan.</p>}

        <Button size="lg" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={onComplete}>
          Continue to Choose Plan <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default VirtualCollaborationStep;
