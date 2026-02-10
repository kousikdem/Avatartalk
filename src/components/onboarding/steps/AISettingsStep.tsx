import React, { useState, useEffect } from 'react';
import { Settings, MessageSquare, Sparkles, ListChecks, MessageCircle, Save, Check, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { useAITrainingSettings } from '@/hooks/useAITrainingSettings';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AISettingsStepProps {
  onComplete: () => void;
}

const AISettingsStep: React.FC<AISettingsStepProps> = ({ onComplete }) => {
  const { canUseAITopics } = usePlanFeatures();
  const { settings, topics, followUps, saveSettings, addTopic, deleteTopic, addFollowUp, deleteFollowUp, isLoading: settingsLoading } = useAITrainingSettings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('perspective');

  const [formData, setFormData] = useState({
    welcomeEnabled: true,
    welcomeMessage: "Hi! 👋 I'm here to help you learn more about me and my work.",
    perspective: '',
    tone: 'friendly',
  });

  // Sync from settings
  useEffect(() => {
    if (settings) {
      setFormData({
        welcomeEnabled: settings.welcomeMessage?.enabled ?? true,
        welcomeMessage: settings.welcomeMessage?.text || formData.welcomeMessage,
        perspective: settings.globalDescribeText || '',
        tone: 'friendly',
      });
    }
  }, [settings]);

  // Topic form
  const [topicName, setTopicName] = useState('');
  const [topicAuthority, setTopicAuthority] = useState<'authoritative' | 'neutral' | 'deflect'>('neutral');
  const [topicDoRules, setTopicDoRules] = useState('');
  const [topicAvoidRules, setTopicAvoidRules] = useState('');
  const [topicKeywords, setTopicKeywords] = useState('');

  // Follow-up form
  const [followUpText, setFollowUpText] = useState('');
  const [followUpType, setFollowUpType] = useState<'choice' | 'open' | 'rating' | 'boolean'>('choice');
  const [followUpChoices, setFollowUpChoices] = useState('');
  const [followUpPresentation, setFollowUpPresentation] = useState<'inline' | 'modal' | 'suggest_button'>('inline');

  const toneOptions = [
    { value: 'friendly', label: 'Friendly', emoji: '😊' },
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'enthusiastic', label: 'Enthusiastic', emoji: '🎉' },
    { value: 'calm', label: 'Calm', emoji: '🧘' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveSettings({
        welcomeMessage: {
          enabled: formData.welcomeEnabled,
          text: formData.welcomeMessage,
          trigger: 'first_open',
          language: 'en',
          customVariables: [],
        },
        globalDescribeText: formData.perspective,
      });
      setSaved(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    if (!topicName.trim()) return;
    try {
      await addTopic({
        topicName: topicName.trim(),
        priority: 10,
        authority: topicAuthority,
        doRules: topicDoRules.split('\n').filter(Boolean),
        avoidRules: topicAvoidRules.split('\n').filter(Boolean),
        samplePrompts: [],
        keywords: topicKeywords.split(',').map(k => k.trim()).filter(Boolean),
        isActive: true,
      });
      setTopicName(''); setTopicDoRules(''); setTopicAvoidRules(''); setTopicKeywords('');
    } catch { /* handled */ }
  };

  const handleAddFollowUp = async () => {
    if (!followUpText.trim()) return;
    try {
      await addFollowUp({
        questionText: followUpText.trim(),
        questionType: followUpType,
        choices: followUpChoices.split(',').map(c => c.trim()).filter(Boolean),
        presentation: followUpPresentation,
        conditions: {},
        probabilityPct: 100,
        maxPerSession: 3,
        cooldownSeconds: 300,
        alwaysAsk: false,
        isActive: true,
      });
      setFollowUpText(''); setFollowUpChoices('');
    } catch { /* handled */ }
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            <TabsTrigger value="perspective" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />Perspective</TabsTrigger>
            <TabsTrigger value="welcome" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />Welcome</TabsTrigger>
            <TabsTrigger value="topics" className="text-xs relative">
              <ListChecks className="w-3 h-3 mr-1" />Topics
              {!canUseAITopics && <span className="absolute -top-1 -right-1"><PlanBadge planKey="creator" size="sm" showIcon={false} /></span>}
            </TabsTrigger>
            <TabsTrigger value="followup" className="text-xs relative">
              <MessageCircle className="w-3 h-3 mr-1" />Follow-up
              {!canUseAITopics && <span className="absolute -top-1 -right-1"><PlanBadge planKey="creator" size="sm" showIcon={false} /></span>}
            </TabsTrigger>
          </TabsList>

          {/* Perspective */}
          <TabsContent value="perspective" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Communication Tone</Label>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((tone) => (
                  <div key={tone.value} onClick={() => { setFormData({ ...formData, tone: tone.value }); setSaved(false); }}
                    className={`cursor-pointer p-2.5 rounded-lg border transition-all ${formData.tone === tone.value ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-2"><span className="text-lg">{tone.emoji}</span><span className="text-sm font-medium">{tone.label}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">AI Perspective</Label>
              <Textarea placeholder="Example: I am [Name]'s AI assistant..." value={formData.perspective}
                onChange={(e) => { setFormData({ ...formData, perspective: e.target.value }); setSaved(false); }} rows={3} className="resize-none text-sm" />
            </div>
          </TabsContent>

          {/* Welcome */}
          <TabsContent value="welcome" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Welcome Message</Label>
                <p className="text-xs text-muted-foreground">Greet visitors on first chat</p>
              </div>
              <Switch checked={formData.welcomeEnabled} onCheckedChange={(checked) => { setFormData({ ...formData, welcomeEnabled: checked }); setSaved(false); }} />
            </div>
            {formData.welcomeEnabled && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Welcome Message</Label>
                <Textarea placeholder="Write a friendly welcome..." value={formData.welcomeMessage}
                  onChange={(e) => { setFormData({ ...formData, welcomeMessage: e.target.value }); setSaved(false); }} rows={3} className="resize-none text-sm" />
                <p className="text-[10px] text-muted-foreground">Use {'{visitor_name}'} to personalize</p>
              </div>
            )}
          </TabsContent>

          {/* Topics */}
          <TabsContent value="topics" className="space-y-3 mt-3">
            {canUseAITopics ? (
              <>
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Topic Name *</Label>
                      <Input placeholder="e.g., Pricing" value={topicName} onChange={(e) => setTopicName(e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Authority</Label>
                      <Select value={topicAuthority} onValueChange={(v: any) => setTopicAuthority(v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="deflect">Deflect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Do Rules (one per line)</Label>
                    <Textarea placeholder="Always mention pricing page..." value={topicDoRules} onChange={(e) => setTopicDoRules(e.target.value)} rows={2} className="resize-none text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Avoid Rules (one per line)</Label>
                    <Textarea placeholder="Don't discuss competitors..." value={topicAvoidRules} onChange={(e) => setTopicAvoidRules(e.target.value)} rows={2} className="resize-none text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Keywords (comma-separated)</Label>
                    <Input placeholder="price, cost, plan" value={topicKeywords} onChange={(e) => setTopicKeywords(e.target.value)} className="h-7 text-xs" />
                  </div>
                  <Button onClick={handleAddTopic} disabled={!topicName.trim()} className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-3 h-3 mr-1" /> Add Topic Rule
                  </Button>
                </div>
                {topics.length > 0 && (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {topics.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <div className="min-w-0">
                          <p className="text-xs font-medium">{t.topicName}</p>
                          <p className="text-[9px] text-muted-foreground">{t.authority} · {t.keywords.join(', ')}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteTopic(t.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <ListChecks className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-muted-foreground">Topics require Creator plan</p>
                <PlanBadge planKey="creator" size="sm" className="mt-2" />
              </div>
            )}
          </TabsContent>

          {/* Follow-up */}
          <TabsContent value="followup" className="space-y-3 mt-3">
            {canUseAITopics ? (
              <>
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Follow-up Question *</Label>
                    <Input placeholder="e.g., Would you like to know about pricing?" value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Type</Label>
                      <Select value={followUpType} onValueChange={(v: any) => setFollowUpType(v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="choice">Choice</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="boolean">Yes/No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Presentation</Label>
                      <Select value={followUpPresentation} onValueChange={(v: any) => setFollowUpPresentation(v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inline">Inline</SelectItem>
                          <SelectItem value="modal">Modal</SelectItem>
                          <SelectItem value="suggest_button">Button</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {followUpType === 'choice' && (
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Choices (comma-separated)</Label>
                      <Input placeholder="Yes, No, Maybe" value={followUpChoices} onChange={(e) => setFollowUpChoices(e.target.value)} className="h-7 text-xs" />
                    </div>
                  )}
                  <Button onClick={handleAddFollowUp} disabled={!followUpText.trim()} className="w-full h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-3 h-3 mr-1" /> Add Follow-up
                  </Button>
                </div>
                {followUps.length > 0 && (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {followUps.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{f.questionText}</p>
                          <p className="text-[9px] text-muted-foreground">{f.questionType} · {f.presentation}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteFollowUp(f.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <MessageCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-muted-foreground">Follow-ups require Creator plan</p>
                <PlanBadge planKey="creator" size="sm" className="mt-2" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!saved ? (
          <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg"
            onClick={handleSubmit} disabled={loading}>
            <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        ) : (
          <Button size="lg" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" onClick={onComplete}>
            <Check className="w-4 h-4 mr-2" /> Settings Saved — Continue
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AISettingsStep;
