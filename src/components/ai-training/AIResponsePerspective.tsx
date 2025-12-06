import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCircle, Mic2, Target, Sparkles } from "lucide-react";
import { AITrainingSettings } from "@/hooks/useAITrainingSettings";

interface AIResponsePerspectiveProps {
  settings: AITrainingSettings;
  onSave: (updates: Partial<AITrainingSettings>) => void;
  isSaving: boolean;
}

export const AIResponsePerspective: React.FC<AIResponsePerspectiveProps> = ({
  settings,
  onSave,
  isSaving
}) => {
  const [globalDescribeText, setGlobalDescribeText] = useState(settings.globalDescribeText);
  const [globalDescribePriority, setGlobalDescribePriority] = useState(settings.globalDescribePriority);
  const [engagementWeight, setEngagementWeight] = useState(settings.engagementScoreWeight);

  const handleSave = () => {
    onSave({
      globalDescribeText,
      globalDescribePriority,
      engagementScoreWeight: engagementWeight
    });
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Response Perspective
        </CardTitle>
        <CardDescription>
          Define how the AI should interact with visitors across all topics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Perspective Text */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            AI Persona Description
          </Label>
          <Textarea
            value={globalDescribeText}
            onChange={(e) => setGlobalDescribeText(e.target.value)}
            placeholder="Describe how your AI should talk to visitors. Example: 'I am a friendly and professional assistant who helps visitors learn about our products and services. I speak in a warm, approachable tone and always aim to provide helpful information.'"
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This description tells the AI how to behave and respond to all visitor queries.
          </p>
        </div>

        {/* Priority Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Prioritize Persona Over Topic Rules</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, persona guidelines take priority over topic-specific rules
            </p>
          </div>
          <Switch
            checked={globalDescribePriority}
            onCheckedChange={setGlobalDescribePriority}
          />
        </div>

        {/* Engagement Score Weights */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Engagement Score Weights
          </Label>
          <p className="text-xs text-muted-foreground">
            Adjust how different interactions contribute to the engagement score (1-100)
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Chat Messages</Label>
                <span className="text-sm font-medium">{engagementWeight.chatCount}</span>
              </div>
              <Slider
                value={[engagementWeight.chatCount]}
                onValueChange={([value]) => setEngagementWeight(prev => ({ ...prev, chatCount: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Profile Visits</Label>
                <span className="text-sm font-medium">{engagementWeight.visitCount}</span>
              </div>
              <Slider
                value={[engagementWeight.visitCount]}
                onValueChange={([value]) => setEngagementWeight(prev => ({ ...prev, visitCount: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Response Time Bonus</Label>
                <span className="text-sm font-medium">{engagementWeight.responseTime}</span>
              </div>
              <Slider
                value={[engagementWeight.responseTime]}
                onValueChange={([value]) => setEngagementWeight(prev => ({ ...prev, responseTime: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Follow-up Completion</Label>
                <span className="text-sm font-medium">{engagementWeight.followUpCompletion}</span>
              </div>
              <Slider
                value={[engagementWeight.followUpCompletion]}
                onValueChange={([value]) => setEngagementWeight(prev => ({ ...prev, followUpCompletion: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Example Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium">Sample AI Response Style:</p>
            <p className="text-sm text-muted-foreground italic">
              {globalDescribeText ? 
                `"${globalDescribeText.substring(0, 150)}${globalDescribeText.length > 150 ? '...' : ''}"` :
                '"Hi there! How can I help you today?"'
              }
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save AI Perspective Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
