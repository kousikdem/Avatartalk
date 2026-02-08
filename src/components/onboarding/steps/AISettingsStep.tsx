import React, { useState } from 'react';
import { Settings, MessageSquare, Sparkles, ListChecks, MessageCircle, Save, Check } from 'lucide-react';
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

interface AISettingsStepProps {
  onComplete: () => void;
}

const AISettingsStep: React.FC<AISettingsStepProps> = ({ onComplete }) => {
  const { canUseAITopics } = usePlanFeatures();
  const { settings, saveSettings, isLoading: settingsLoading } = useAITrainingSettings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('perspective');

  const [formData, setFormData] = useState({
    welcomeEnabled: settings?.welcomeMessage?.enabled ?? true,
    welcomeMessage: settings?.welcomeMessage?.text || "Hi! 👋 I'm here to help you learn more about me and my work. Feel free to ask anything!",
    perspective: settings?.globalDescribeText || '',
    tone: 'friendly',
  });

  const [topicName, setTopicName] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');

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
      toast({
        title: 'AI settings saved!',
        description: 'Your AI assistant is configured.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save AI settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            Configure how your AI behaves and interacts with visitors
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            <TabsTrigger value="perspective" className="text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Perspective
            </TabsTrigger>
            <TabsTrigger value="welcome" className="text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Welcome
            </TabsTrigger>
            <TabsTrigger value="topics" className="text-xs sm:text-sm relative">
              <ListChecks className="w-3.5 h-3.5 mr-1.5" />
              Topics
              {!canUseAITopics && <span className="absolute -top-1 -right-1"><PlanBadge planKey="creator" size="sm" showIcon={false} /></span>}
            </TabsTrigger>
            <TabsTrigger value="followup" className="text-xs sm:text-sm relative">
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Follow-up
              {!canUseAITopics && <span className="absolute -top-1 -right-1"><PlanBadge planKey="creator" size="sm" showIcon={false} /></span>}
            </TabsTrigger>
          </TabsList>

          {/* Perspective Tab */}
          <TabsContent value="perspective" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Communication Tone</Label>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((tone) => (
                  <div
                    key={tone.value}
                    className={`cursor-pointer p-3 rounded-lg border transition-all ${
                      formData.tone === tone.value
                        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                    onClick={() => setFormData({ ...formData, tone: tone.value })}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tone.emoji}</span>
                      <span className="text-sm font-medium">{tone.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="perspective" className="text-sm font-medium">
                AI Perspective (How AI talks about you)
              </Label>
              <Textarea
                id="perspective"
                placeholder="Example: I am [Your Name]'s AI assistant. I help answer questions about their work..."
                value={formData.perspective}
                onChange={(e) => {
                  setFormData({ ...formData, perspective: e.target.value });
                  setSaved(false);
                }}
                rows={4}
                className="resize-none"
              />
            </div>
          </TabsContent>

          {/* Welcome Tab */}
          <TabsContent value="welcome" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="welcome-toggle" className="text-sm font-medium">Enable Welcome Message</Label>
                <p className="text-xs text-muted-foreground">Greet visitors on first chat</p>
              </div>
              <Switch
                id="welcome-toggle"
                checked={formData.welcomeEnabled}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, welcomeEnabled: checked });
                  setSaved(false);
                }}
              />
            </div>

            {formData.welcomeEnabled && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Welcome Message</Label>
                <Textarea
                  placeholder="Write a friendly welcome message..."
                  value={formData.welcomeMessage}
                  onChange={(e) => {
                    setFormData({ ...formData, welcomeMessage: e.target.value });
                    setSaved(false);
                  }}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{visitor_name}'} to personalize
                </p>
              </div>
            )}
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-4 mt-4">
            {canUseAITopics ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Add a Topic</Label>
                  <Input
                    placeholder="e.g., Pricing, Services, About Me"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Topics help organize how your AI responds to different subjects.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <ListChecks className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-muted-foreground">Topics require Creator plan or above</p>
                <PlanBadge planKey="creator" size="sm" className="mt-2" />
              </div>
            )}
          </TabsContent>

          {/* Follow-up Tab */}
          <TabsContent value="followup" className="space-y-4 mt-4">
            {canUseAITopics ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Follow-up Question</Label>
                  <Input
                    placeholder="e.g., Would you like to know more about pricing?"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Follow-up questions guide conversations.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-muted-foreground">Follow-ups require Creator plan or above</p>
                <PlanBadge planKey="creator" size="sm" className="mt-2" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!saved ? (
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="w-full border-green-200 text-green-700 hover:bg-green-50"
            onClick={onComplete}
          >
            <Check className="w-4 h-4 mr-2" />
            Settings Saved — Continue
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AISettingsStep;
