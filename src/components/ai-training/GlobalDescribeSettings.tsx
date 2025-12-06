import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, Save, ChevronDown, Lightbulb, AlertTriangle } from 'lucide-react';

interface GlobalDescribeSettingsProps {
  settings: {
    global_describe_text: string | null;
    global_describe_priority: boolean;
  } | null;
  onUpdate: (updates: any) => Promise<void>;
  isSaving: boolean;
}

const EXAMPLE_TEMPLATES = [
  {
    name: 'Sales Focus',
    text: 'Be persuasive but not pushy. Highlight benefits before features. Always offer a call-to-action. Use social proof when available. Sample: "Many of our clients have seen 40% improvement after implementing our solution."'
  },
  {
    name: 'Support Focus',
    text: 'Be empathetic and patient. Acknowledge the issue first. Provide step-by-step solutions. Offer escalation options when needed. Avoid technical jargon with non-technical users.'
  },
  {
    name: 'Onboarding',
    text: 'Be welcoming and enthusiastic. Guide users step-by-step. Celebrate small wins. Provide shortcuts for experienced users. Sample: "Great choice! Let me help you get started in just 3 simple steps."'
  },
  {
    name: 'FAQ Handler',
    text: 'Be concise and direct. Use bullet points for multiple items. Link to documentation when available. Offer follow-up questions to ensure clarity.'
  },
  {
    name: 'Lead Qualification',
    text: 'Ask qualifying questions naturally. Understand budget, timeline, and decision-making process. Segment leads based on responses. Sample: "To better assist you, could you share a bit about your current needs?"'
  }
];

// Simple safety check for potentially problematic content
const checkSafety = (text: string): string[] => {
  const warnings: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (/\b(password|ssn|social security|bank account|credit card)\b/i.test(text)) {
    warnings.push('Contains sensitive data request terms');
  }
  if (/\b(guaranteed|100% success|will definitely)\b/i.test(text)) {
    warnings.push('Contains potentially misleading marketing claims');
  }
  if (/<[^>]*>/.test(text)) {
    warnings.push('Contains HTML/code elements');
  }
  
  return warnings;
};

const GlobalDescribeSettings: React.FC<GlobalDescribeSettingsProps> = ({
  settings,
  onUpdate,
  isSaving
}) => {
  const [localSettings, setLocalSettings] = useState({
    global_describe_text: settings?.global_describe_text ?? '',
    global_describe_priority: settings?.global_describe_priority ?? false
  });
  const [showExamples, setShowExamples] = useState(false);

  const charCount = localSettings.global_describe_text?.length || 0;
  const maxChars = 2000;
  const safetyWarnings = checkSafety(localSettings.global_describe_text || '');

  const handleSave = () => {
    onUpdate(localSettings);
  };

  const applyTemplate = (text: string) => {
    setLocalSettings(prev => ({
      ...prev,
      global_describe_text: prev.global_describe_text 
        ? `${prev.global_describe_text}\n\n${text}` 
        : text
    }));
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Global Describe
        </CardTitle>
        <CardDescription>
          Write freeform instructions for how your AI should interact across all topics. This is high-priority guidance merged into every response.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <Label>Use as Priority</Label>
            <p className="text-sm text-muted-foreground">
              When ON, global describe overrides topic-specific settings
            </p>
          </div>
          <Switch
            checked={localSettings.global_describe_priority}
            onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, global_describe_priority: checked }))}
          />
        </div>

        {/* Main Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Describe Instructions</Label>
            <span className={`text-xs ${charCount > maxChars ? 'text-destructive' : 'text-muted-foreground'}`}>
              {charCount}/{maxChars} characters
            </span>
          </div>
          <Textarea
            value={localSettings.global_describe_text || ''}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, global_describe_text: e.target.value }))}
            placeholder="Example: Be transparent about pricing. Always mention our trial period. Use a friendly but professional tone. Avoid promising features not yet available. Sample reply: 'Our Pro plan starts at $29/mo and includes...'

Write your own guidance here..."
            rows={8}
            className="resize-y font-mono text-sm"
          />
        </div>

        {/* Safety Warnings */}
        {safetyWarnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Safety Check Warnings
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {safetyWarnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Example Templates */}
        <Collapsible open={showExamples} onOpenChange={setShowExamples}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Example Templates
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-2">
            {EXAMPLE_TEMPLATES.map((template) => (
              <div key={template.name} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{template.name}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => applyTemplate(template.text)}>
                    Use Template
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{template.text}</p>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Button 
          onClick={handleSave} 
          disabled={isSaving || charCount > maxChars} 
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Global Describe'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GlobalDescribeSettings;
