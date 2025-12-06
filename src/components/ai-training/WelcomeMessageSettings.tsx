import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Plus, Trash2, Variable, Globe, Loader2 } from "lucide-react";
import { WelcomeMessageSettings as WelcomeSettings } from "@/hooks/useAITrainingSettings";

interface WelcomeMessageSettingsProps {
  settings: WelcomeSettings;
  onSave: (settings: WelcomeSettings) => void;
  isSaving: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

const DEFAULT_VARIABLES = [
  { name: 'visitor_name', description: 'Visitor\'s name (if known)' },
  { name: 'username', description: 'Creator\'s username' },
  { name: 'time_of_day', description: 'Morning/Afternoon/Evening greeting' },
  { name: 'visit_count', description: 'Number of times visitor has visited' },
];

export const WelcomeMessageSettingsComponent: React.FC<WelcomeMessageSettingsProps> = ({
  settings,
  onSave,
  isSaving
}) => {
  const [localSettings, setLocalSettings] = useState<WelcomeSettings>(settings);
  const [newVariable, setNewVariable] = useState({ name: '', defaultValue: '', description: '' });

  const handleAddVariable = () => {
    if (!newVariable.name.trim()) return;
    setLocalSettings(prev => ({
      ...prev,
      customVariables: [
        ...prev.customVariables,
        { 
          name: newVariable.name.replace(/[^a-zA-Z0-9_]/g, '_'),
          defaultValue: newVariable.defaultValue,
          description: newVariable.description
        }
      ]
    }));
    setNewVariable({ name: '', defaultValue: '', description: '' });
  };

  const handleRemoveVariable = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      customVariables: prev.customVariables.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  const insertVariable = (varName: string) => {
    const textArea = document.getElementById('welcome-message-text') as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = localSettings.text;
      const newText = text.substring(0, start) + `{${varName}}` + text.substring(end);
      setLocalSettings(prev => ({ ...prev, text: newText }));
    } else {
      setLocalSettings(prev => ({ ...prev, text: prev.text + ` {${varName}}` }));
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          AI Welcome Message
        </CardTitle>
        <CardDescription>
          Configure the welcome message that appears when visitors open the chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Welcome Message</Label>
            <p className="text-sm text-muted-foreground">Show a greeting when chat opens</p>
          </div>
          <Switch
            checked={localSettings.enabled}
            onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        {localSettings.enabled && (
          <>
            {/* Trigger Selection */}
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select
                value={localSettings.trigger}
                onValueChange={(value: 'first_open' | 'first_interaction') => 
                  setLocalSettings(prev => ({ ...prev, trigger: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_open">On First Chat Open</SelectItem>
                  <SelectItem value="first_interaction">On First Interaction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </Label>
              <Select
                value={localSettings.language}
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Welcome Message Text */}
            <div className="space-y-2">
              <Label htmlFor="welcome-message-text">Welcome Message</Label>
              <Textarea
                id="welcome-message-text"
                value={localSettings.text}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Hi {visitor_name}! Welcome to my profile. How can I help you today?"
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{variable_name}'} syntax to insert personalization variables
              </p>
            </div>

            {/* Available Variables */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Variable className="w-4 h-4" />
                Available Variables
              </Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_VARIABLES.map(v => (
                  <Badge
                    key={v.name}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => insertVariable(v.name)}
                    title={v.description}
                  >
                    {'{' + v.name + '}'}
                  </Badge>
                ))}
                {localSettings.customVariables.map((v, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/20 transition-colors gap-1"
                    onClick={() => insertVariable(v.name)}
                    title={v.description}
                  >
                    {'{' + v.name + '}'}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveVariable(idx); }}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Add Custom Variable */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <Label>Add Custom Variable (for non-registered users)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Variable name"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Default value"
                  value={newVariable.defaultValue}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                />
                <Input
                  placeholder="Description"
                  value={newVariable.description}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddVariable} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  {localSettings.text
                    .replace('{visitor_name}', 'John')
                    .replace('{username}', 'creator')
                    .replace('{time_of_day}', 'afternoon')
                    .replace('{visit_count}', '1')
                  }
                </p>
              </div>
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Welcome Message Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
