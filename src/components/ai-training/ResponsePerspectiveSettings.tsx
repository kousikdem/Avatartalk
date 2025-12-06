import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Brain, Save, Sparkles, MessageSquareText } from 'lucide-react';
import { useAITrainingSettings } from '@/hooks/useAITrainingSettings';

export const ResponsePerspectiveSettings: React.FC = () => {
  const { settings, loading, saveSettings } = useAITrainingSettings();
  const [describeText, setDescribeText] = useState('');
  const [describePriority, setDescribePriority] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Persona settings
  const [toneSettings, setToneSettings] = useState({
    formality: 50,
    verbosity: 50,
    friendliness: 80,
    humor: 30
  });

  useEffect(() => {
    if (settings) {
      setDescribeText(settings.global_describe_text || '');
      setDescribePriority(settings.global_describe_priority);
      // Load engagement weights for persona settings
      const weights = settings.engagement_score_weight || {};
      if (typeof weights === 'object') {
        setToneSettings({
          formality: (weights as any).formality || 50,
          verbosity: (weights as any).verbosity || 50,
          friendliness: (weights as any).friendliness || 80,
          humor: (weights as any).humor || 30
        });
      }
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings({
        global_describe_text: describeText,
        global_describe_priority: describePriority,
        engagement_score_weight: {
          chat_count: 5,
          visit_count: 1,
          response_time: 2,
          follow_up_completion: 3,
          formality: toneSettings.formality,
          verbosity: toneSettings.verbosity,
          friendliness: toneSettings.friendliness,
          humor: toneSettings.humor
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getToneLabel = (value: number, type: string) => {
    if (type === 'formality') {
      if (value < 30) return 'Casual';
      if (value < 70) return 'Balanced';
      return 'Professional';
    }
    if (type === 'verbosity') {
      if (value < 30) return 'Concise';
      if (value < 70) return 'Moderate';
      return 'Detailed';
    }
    if (type === 'friendliness') {
      if (value < 30) return 'Reserved';
      if (value < 70) return 'Warm';
      return 'Very Friendly';
    }
    if (type === 'humor') {
      if (value < 30) return 'Serious';
      if (value < 70) return 'Light';
      return 'Playful';
    }
    return '';
  };

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="h-48" /></Card>;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Response Perspective
        </CardTitle>
        <CardDescription>
          Define how your AI should talk to visitors/users in your profile's chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Describe Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="describe-text" className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4" />
              Response Perspective Description
            </Label>
            <Badge variant={describePriority ? 'default' : 'secondary'}>
              {describePriority ? 'High Priority' : 'Normal Priority'}
            </Badge>
          </div>
          <Textarea
            id="describe-text"
            value={describeText}
            onChange={(e) => setDescribeText(e.target.value)}
            placeholder="Describe how your AI should interact with visitors. Example: 'I am a UX designer who loves creating accessible templates. I should be helpful, focus on practical solutions, and always suggest templates when relevant...'"
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            This text guides how the AI responds across all topics. Be specific about your expertise, values, and communication style.
          </p>
        </div>

        {/* Persona Tone Controls */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Persona Tone Settings
          </Label>
          
          <div className="grid gap-6">
            {/* Formality */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Formality</span>
                <Badge variant="outline">{getToneLabel(toneSettings.formality, 'formality')}</Badge>
              </div>
              <Slider
                value={[toneSettings.formality]}
                onValueChange={([value]) => setToneSettings(prev => ({ ...prev, formality: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Casual</span>
                <span>Professional</span>
              </div>
            </div>

            {/* Verbosity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Verbosity</span>
                <Badge variant="outline">{getToneLabel(toneSettings.verbosity, 'verbosity')}</Badge>
              </div>
              <Slider
                value={[toneSettings.verbosity]}
                onValueChange={([value]) => setToneSettings(prev => ({ ...prev, verbosity: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Concise</span>
                <span>Detailed</span>
              </div>
            </div>

            {/* Friendliness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Friendliness</span>
                <Badge variant="outline">{getToneLabel(toneSettings.friendliness, 'friendliness')}</Badge>
              </div>
              <Slider
                value={[toneSettings.friendliness]}
                onValueChange={([value]) => setToneSettings(prev => ({ ...prev, friendliness: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Reserved</span>
                <span>Very Friendly</span>
              </div>
            </div>

            {/* Humor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Humor Level</span>
                <Badge variant="outline">{getToneLabel(toneSettings.humor, 'humor')}</Badge>
              </div>
              <Slider
                value={[toneSettings.humor]}
                onValueChange={([value]) => setToneSettings(prev => ({ ...prev, humor: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Serious</span>
                <span>Playful</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <input
            type="checkbox"
            id="describe-priority"
            checked={describePriority}
            onChange={(e) => setDescribePriority(e.target.checked)}
            className="rounded border-primary"
          />
          <div>
            <Label htmlFor="describe-priority">High Priority Mode</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, this perspective will override topic-specific settings
            </p>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Response Perspective'}
        </Button>
      </CardContent>
    </Card>
  );
};
