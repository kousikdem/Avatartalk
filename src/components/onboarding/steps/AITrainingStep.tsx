import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Sparkles, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { useAITrainingSettings } from '@/hooks/useAITrainingSettings';
import { useToast } from '@/hooks/use-toast';

interface AITrainingStepProps {
  onComplete: () => void;
}

const AITrainingStep: React.FC<AITrainingStepProps> = ({ onComplete }) => {
  const { canUseAITopics } = usePlanFeatures();
  const { settings, saveSettings, isLoading: settingsLoading } = useAITrainingSettings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    welcomeEnabled: settings?.welcomeMessage?.enabled ?? true,
    welcomeMessage: settings?.welcomeMessage?.text || "Hi! 👋 I'm here to help you learn more about me and my work. Feel free to ask anything!",
    perspective: settings?.globalDescribeText || '',
    tone: 'friendly',
  });

  const toneOptions = [
    { value: 'friendly', label: 'Friendly & Casual', emoji: '😊' },
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'enthusiastic', label: 'Enthusiastic', emoji: '🎉' },
    { value: 'calm', label: 'Calm & Supportive', emoji: '🧘' },
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
      toast({
        title: 'AI settings saved!',
        description: 'Your AI assistant is ready to go.',
      });
      onComplete();
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
    <Card className="border-0 shadow-xl bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center"
        >
          <Bot className="w-8 h-8 text-accent-foreground" />
        </motion.div>
        <CardTitle className="text-2xl">Train your AI assistant</CardTitle>
        <CardDescription>
          Configure how your AI represents you to visitors
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="welcome" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="welcome">
              <MessageSquare className="w-4 h-4 mr-2" />
              Welcome Message
            </TabsTrigger>
            <TabsTrigger value="perspective">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Perspective
            </TabsTrigger>
          </TabsList>

          <TabsContent value="welcome" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="welcome-toggle">Enable Welcome Message</Label>
                <p className="text-sm text-muted-foreground">
                  Greet visitors when they start a chat
                </p>
              </div>
              <Switch
                id="welcome-toggle"
                checked={formData.welcomeEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, welcomeEnabled: checked })
                }
              />
            </div>

            {formData.welcomeEnabled && (
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  placeholder="Write a friendly welcome message..."
                  value={formData.welcomeMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, welcomeMessage: e.target.value })
                  }
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{visitor_name}'} to personalize the greeting
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="perspective" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Communication Tone</Label>
              <div className="grid grid-cols-2 gap-3">
                {toneOptions.map((tone) => (
                  <Card
                    key={tone.value}
                    className={`cursor-pointer transition-all p-3 ${
                      formData.tone === tone.value
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, tone: tone.value })}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tone.emoji}</span>
                      <span className="text-sm font-medium">{tone.label}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="perspective">AI Perspective (How AI talks about you)</Label>
                {!canUseAITopics && <PlanBadge planKey="creator" size="sm" />}
              </div>
              <Textarea
                id="perspective"
                placeholder="Example: I am [Your Name]'s AI assistant. I help answer questions about their work, services, and expertise..."
                value={formData.perspective}
                onChange={(e) =>
                  setFormData({ ...formData, perspective: e.target.value })
                }
                rows={3}
                className="resize-none"
                disabled={!canUseAITopics}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Advanced Training Available</p>
              <p className="text-xs text-muted-foreground">
                Add Q&A pairs, documents, and web content from the AI Training dashboard after setup
              </p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/80"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AITrainingStep;
