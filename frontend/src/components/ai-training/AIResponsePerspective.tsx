import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCircle, Target, Sparkles, MessageSquare, Eye, Clock, CheckCircle, Shield } from "lucide-react";
import { AITrainingSettings } from "@/hooks/useAITrainingSettings";
import LoyaltyBadge, { getLoyaltyTier } from "@/components/LoyaltyBadge";

interface AIResponsePerspectiveProps {
  settings: AITrainingSettings;
  onSave: (updates: Partial<AITrainingSettings>) => void;
  isSaving: boolean;
}

// Fixed loyalty score weights - not editable
const FIXED_LOYALTY_WEIGHTS = {
  chatCount: 2,
  visitCount: 1,
  responseTime: 1,
  followUpCompletion: 2
};

export const AIResponsePerspective: React.FC<AIResponsePerspectiveProps> = ({
  settings,
  onSave,
  isSaving
}) => {
  const [globalDescribeText, setGlobalDescribeText] = useState(settings.globalDescribeText);
  const [globalDescribePriority, setGlobalDescribePriority] = useState(settings.globalDescribePriority);

  const handleSave = () => {
    onSave({
      globalDescribeText,
      globalDescribePriority,
      engagementScoreWeight: FIXED_LOYALTY_WEIGHTS
    });
  };

  // All loyalty tiers with actual thresholds
  const allTiers = [
    { score: 50, label: 'Bronze', description: 'Score < 100' },
    { score: 300, label: 'Silver', description: 'Score 100-499' },
    { score: 750, label: 'Gold', description: 'Score 500-999' },
    { score: 5000, label: 'Platinum', description: 'Score 1,000-9,999' },
    { score: 100000, label: 'Diamond', description: 'Score 100,000+' }
  ];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Persona & Response Style
        </CardTitle>
        <CardDescription>
          Define your AI's personality, tone, and how it represents you to visitors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Persona Prompt */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            AI Persona Prompt
          </Label>
          <Textarea
            value={globalDescribeText}
            onChange={(e) => setGlobalDescribeText(e.target.value)}
            placeholder={`Define your AI persona. Include:
• Who you are (Creator type: Artist, Coach, Educator, etc.)
• How to talk to visitors (Friendly, Professional, Casual, etc.)
• Topics/categories you specialize in
• Your communication tone and style
• Any specific phrases or greetings to use

Example: "I am Sarah, a fitness coach and nutrition expert. I speak in an encouraging, supportive tone and help visitors with workout plans, diet tips, and healthy lifestyle advice. I'm enthusiastic about fitness and always motivate people to stay consistent."`}
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This persona prompt shapes how your AI responds to all visitor interactions. Be specific about your identity, expertise, and communication style.
          </p>
        </div>

        {/* Priority Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
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

        {/* Loyalty Score Weights - Read Only */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Loyalty Score Weights
            </Label>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              Fixed System Values
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            These weights determine how user interactions contribute to their loyalty score (1-100)
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm">Chat Messages</span>
              </div>
              <span className="text-lg font-bold text-primary">{FIXED_LOYALTY_WEIGHTS.chatCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Profile Visits</span>
              </div>
              <span className="text-lg font-bold text-blue-500">{FIXED_LOYALTY_WEIGHTS.visitCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm">Response Time</span>
              </div>
              <span className="text-lg font-bold text-green-500">{FIXED_LOYALTY_WEIGHTS.responseTime}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Follow-up Done</span>
              </div>
              <span className="text-lg font-bold text-purple-500">{FIXED_LOYALTY_WEIGHTS.followUpCompletion}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Profile visits count once per day per user.
          </p>
        </div>

        {/* All Loyalty Badge Tiers with Scores */}
        <div className="space-y-4 p-4 bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg border">
          <div>
            <Label className="text-base font-semibold">All Loyalty Badge Tiers</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Users earn badges based on their loyalty score from interactions
            </p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {allTiers.map((tier) => (
              <div key={tier.label} className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg border shadow-sm">
                <LoyaltyBadge score={tier.score} size="lg" showScore={true} showTierName={true} />
                <span className="text-[10px] text-muted-foreground text-center">{tier.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Example Preview */}
        <div className="space-y-2">
          <Label>Persona Preview</Label>
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium">How your AI will introduce itself:</p>
            <p className="text-sm text-muted-foreground italic">
              {globalDescribeText ? 
                `"${globalDescribeText.substring(0, 200)}${globalDescribeText.length > 200 ? '...' : ''}"` :
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
            'Save AI Persona Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
