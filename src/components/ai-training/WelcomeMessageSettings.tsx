import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Plus, Trash2, Variable, Globe, Sparkles, Save } from 'lucide-react';

interface WelcomeMessageSettingsProps {
  settings: {
    welcome_message_enabled: boolean;
    welcome_message_text: string;
    welcome_message_trigger: 'first_open' | 'first_interaction';
    welcome_message_language: string;
    custom_variables: Array<{ name: string; value: string; description?: string }>;
  } | null;
  onUpdate: (updates: any) => Promise<void>;
  isSaving: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
];

const DEFAULT_VARIABLES = [
  { name: 'visitor_name', description: 'Visitor\'s name if known' },
  { name: 'username', description: 'Your profile username' },
  { name: 'display_name', description: 'Your display name' },
  { name: 'time_of_day', description: 'Morning/Afternoon/Evening' },
];

const WelcomeMessageSettings: React.FC<WelcomeMessageSettingsProps> = ({
  settings,
  onUpdate,
  isSaving
}) => {
  const [localSettings, setLocalSettings] = useState({
    welcome_message_enabled: settings?.welcome_message_enabled ?? true,
    welcome_message_text: settings?.welcome_message_text ?? 'Hi! How can I help you today?',
    welcome_message_trigger: settings?.welcome_message_trigger ?? 'first_open',
    welcome_message_language: settings?.welcome_message_language ?? 'en',
    custom_variables: settings?.custom_variables ?? []
  });

  const [newVariable, setNewVariable] = useState({ name: '', value: '', description: '' });

  const handleSave = () => {
    onUpdate(localSettings);
  };

  const addCustomVariable = () => {
    if (!newVariable.name.trim()) return;
    const formatted = newVariable.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    setLocalSettings(prev => ({
      ...prev,
      custom_variables: [...prev.custom_variables, { ...newVariable, name: formatted }]
    }));
    setNewVariable({ name: '', value: '', description: '' });
  };

  const removeCustomVariable = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      custom_variables: prev.custom_variables.filter((_, i) => i !== index)
    }));
  };

  const insertVariable = (varName: string) => {
    const variable = `{${varName}}`;
    setLocalSettings(prev => ({
      ...prev,
      welcome_message_text: prev.welcome_message_text + variable
    }));
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          AI Welcome Message
        </CardTitle>
        <CardDescription>
          Configure the personalized greeting visitors see when they open your chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Welcome Message</Label>
            <p className="text-sm text-muted-foreground">Show a greeting when visitors open chat</p>
          </div>
          <Switch
            checked={localSettings.welcome_message_enabled}
            onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, welcome_message_enabled: checked }))}
          />
        </div>

        {localSettings.welcome_message_enabled && (
          <>
            {/* Welcome Message Text */}
            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Textarea
                value={localSettings.welcome_message_text}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, welcome_message_text: e.target.value }))}
                placeholder="Hi {visitor_name}! I'm {display_name}. How can I help you today?"
                rows={3}
                className="resize-none"
              />
              <div className="flex flex-wrap gap-1">
                {DEFAULT_VARIABLES.map(v => (
                  <Badge 
                    key={v.name}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => insertVariable(v.name)}
                  >
                    <Variable className="w-3 h-3 mr-1" />
                    {`{${v.name}}`}
                  </Badge>
                ))}
                {localSettings.custom_variables.map(v => (
                  <Badge 
                    key={v.name}
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => insertVariable(v.name)}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {`{${v.name}}`}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trigger Setting */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={localSettings.welcome_message_trigger}
                  onValueChange={(value: 'first_open' | 'first_interaction') => 
                    setLocalSettings(prev => ({ ...prev, welcome_message_trigger: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_open">First chat open</SelectItem>
                    <SelectItem value="first_interaction">First message from visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
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
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Variables */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Variable className="w-4 h-4" />
                Custom Personalization Variables
              </Label>
              
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Variable name"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Default value"
                  value={newVariable.value}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                />
                <Button variant="outline" onClick={addCustomVariable} disabled={!newVariable.name.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {localSettings.custom_variables.length > 0 && (
                <div className="space-y-2">
                  {localSettings.custom_variables.map((variable, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Badge variant="secondary">{`{${variable.name}}`}</Badge>
                      <span className="text-sm text-muted-foreground flex-1">= {variable.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomVariable(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Welcome Message Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessageSettings;
