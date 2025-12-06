import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Globe, Plus, X, Save, Variable } from 'lucide-react';
import { useAITrainingSettings, AITrainingSettings } from '@/hooks/useAITrainingSettings';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
];

const TRIGGERS = [
  { value: 'first_open', label: 'First Chat Open' },
  { value: 'first_interaction', label: 'First Interaction' },
  { value: 'every_session', label: 'Every New Session' },
  { value: 'returning_visitor', label: 'Returning Visitor Only' },
];

const DEFAULT_VARIABLES = [
  { name: 'visitor_name', description: 'Visitor\'s name (if known)' },
  { name: 'username', description: 'Creator\'s username' },
  { name: 'time_of_day', description: 'Morning/Afternoon/Evening' },
  { name: 'visit_count', description: 'Number of times visitor has visited' },
];

export const WelcomeMessageSettings: React.FC = () => {
  const { settings, loading, saveSettings } = useAITrainingSettings();
  const [localSettings, setLocalSettings] = useState<Partial<AITrainingSettings>>({
    welcome_message_enabled: true,
    welcome_message_text: 'Hi {visitor_name}! I\'m here to help. How can I assist you today?',
    welcome_message_trigger: 'first_open',
    welcome_message_language: 'en',
    custom_variables: []
  });
  const [newVariable, setNewVariable] = useState({ name: '', description: '', defaultValue: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        welcome_message_enabled: settings.welcome_message_enabled,
        welcome_message_text: settings.welcome_message_text,
        welcome_message_trigger: settings.welcome_message_trigger,
        welcome_message_language: settings.welcome_message_language,
        custom_variables: settings.custom_variables || []
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(localSettings);
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomVariable = () => {
    if (!newVariable.name.trim()) return;
    
    const varName = newVariable.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const updatedVariables = [
      ...(localSettings.custom_variables || []),
      { name: varName, description: newVariable.description, defaultValue: newVariable.defaultValue }
    ];
    setLocalSettings(prev => ({ ...prev, custom_variables: updatedVariables }));
    setNewVariable({ name: '', description: '', defaultValue: '' });
  };

  const removeCustomVariable = (index: number) => {
    const updatedVariables = (localSettings.custom_variables || []).filter((_, i) => i !== index);
    setLocalSettings(prev => ({ ...prev, custom_variables: updatedVariables }));
  };

  const insertVariable = (varName: string) => {
    const currentText = localSettings.welcome_message_text || '';
    setLocalSettings(prev => ({
      ...prev,
      welcome_message_text: currentText + `{${varName}}`
    }));
  };

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="h-48" /></Card>;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          AI Welcome Message
        </CardTitle>
        <CardDescription>
          Configure the welcome message that appears when visitors open your chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="welcome-enabled">Enable Welcome Message</Label>
            <p className="text-sm text-muted-foreground">
              Show an AI-generated welcome message to visitors
            </p>
          </div>
          <Switch
            id="welcome-enabled"
            checked={localSettings.welcome_message_enabled}
            onCheckedChange={(checked) => 
              setLocalSettings(prev => ({ ...prev, welcome_message_enabled: checked }))
            }
          />
        </div>

        {localSettings.welcome_message_enabled && (
          <>
            {/* Welcome Message Text */}
            <div className="space-y-2">
              <Label htmlFor="welcome-text">Welcome Message</Label>
              <Textarea
                id="welcome-text"
                value={localSettings.welcome_message_text}
                onChange={(e) => 
                  setLocalSettings(prev => ({ ...prev, welcome_message_text: e.target.value }))
                }
                placeholder="Hi! I'm here to help..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Use variables like {'{visitor_name}'} for personalization
              </p>
            </div>

            {/* Available Variables */}
            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_VARIABLES.map((v) => (
                  <Badge
                    key={v.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => insertVariable(v.name)}
                    title={v.description}
                  >
                    <Variable className="w-3 h-3 mr-1" />
                    {'{' + v.name + '}'}
                  </Badge>
                ))}
                {(localSettings.custom_variables || []).map((v) => (
                  <Badge
                    key={v.name}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => insertVariable(v.name)}
                    title={v.description}
                  >
                    <Variable className="w-3 h-3 mr-1" />
                    {'{' + v.name + '}'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Variables */}
            <div className="space-y-3">
              <Label>Custom Variables</Label>
              <div className="space-y-2">
                {(localSettings.custom_variables || []).map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Badge variant="secondary">{'{' + v.name + '}'}</Badge>
                    <span className="text-sm text-muted-foreground flex-1">{v.description}</span>
                    {v.defaultValue && (
                      <span className="text-xs text-muted-foreground">Default: {v.defaultValue}</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomVariable(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Variable name"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Description"
                  value={newVariable.description}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Default value"
                    value={newVariable.defaultValue}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                  />
                  <Button variant="outline" size="icon" onClick={addCustomVariable}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Trigger */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={localSettings.welcome_message_trigger}
                  onValueChange={(value) => 
                    setLocalSettings(prev => ({ ...prev, welcome_message_trigger: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <Select
                  value={localSettings.welcome_message_language}
                  onValueChange={(value) => 
                    setLocalSettings(prev => ({ ...prev, welcome_message_language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Welcome Message Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
