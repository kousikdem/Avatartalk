import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, Plus, Trash2, ChevronDown, ChevronUp, X, Loader2,
  MessageSquare, MousePointer, Percent
} from "lucide-react";
import { FollowUpQuestion, TopicRule } from "@/hooks/useAITrainingSettings";

interface FollowUpQuestionsPanelProps {
  followUps: FollowUpQuestion[];
  topics: TopicRule[];
  onAdd: (followUp: Omit<FollowUpQuestion, 'id'>) => Promise<FollowUpQuestion>;
  onUpdate: (id: string, updates: Partial<FollowUpQuestion>) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const DEFAULT_FOLLOWUP: Omit<FollowUpQuestion, 'id'> = {
  questionText: '',
  questionType: 'choice',
  choices: [],
  presentation: 'inline',
  conditions: {},
  probabilityPct: 100,
  maxPerSession: 3,
  cooldownSeconds: 300,
  alwaysAsk: false,
  isActive: true
};

export const FollowUpQuestionsPanel: React.FC<FollowUpQuestionsPanelProps> = ({
  followUps,
  topics,
  onAdd,
  onUpdate,
  onDelete,
  isLoading
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState<Omit<FollowUpQuestion, 'id'>>(DEFAULT_FOLLOWUP);
  const [expandedFollowUps, setExpandedFollowUps] = useState<Set<string>>(new Set());
  const [newChoice, setNewChoice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedFollowUps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUp.questionText.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(newFollowUp);
      setNewFollowUp(DEFAULT_FOLLOWUP);
      setIsAddingNew(false);
    } finally {
      setIsSaving(false);
    }
  };

  const addChoice = (followUpId?: string) => {
    if (!newChoice.trim()) return;
    
    if (followUpId) {
      const followUp = followUps.find(f => f.id === followUpId);
      if (followUp) {
        onUpdate(followUpId, { choices: [...followUp.choices, newChoice] });
      }
    } else {
      setNewFollowUp(prev => ({ ...prev, choices: [...prev.choices, newChoice] }));
    }
    setNewChoice('');
  };

  const removeChoice = (index: number, followUpId?: string) => {
    if (followUpId) {
      const followUp = followUps.find(f => f.id === followUpId);
      if (followUp) {
        onUpdate(followUpId, { choices: followUp.choices.filter((_, i) => i !== index) });
      }
    } else {
      setNewFollowUp(prev => ({ ...prev, choices: prev.choices.filter((_, i) => i !== index) }));
    }
  };

  const renderFollowUpForm = (followUp: Omit<FollowUpQuestion, 'id'> | FollowUpQuestion, isNew: boolean = false) => {
    const followUpId = 'id' in followUp ? followUp.id : undefined;
    
    return (
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <Label>Question Text</Label>
          <Input
            value={followUp.questionText}
            onChange={(e) => {
              if (isNew) {
                setNewFollowUp(prev => ({ ...prev, questionText: e.target.value }));
              } else if (followUpId) {
                onUpdate(followUpId, { questionText: e.target.value });
              }
            }}
            placeholder="Would you like to learn more about our services?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Question Type */}
          <div>
            <Label>Question Type</Label>
            <Select
              value={followUp.questionType}
              onValueChange={(value: 'choice' | 'open' | 'rating' | 'boolean') => {
                if (isNew) {
                  setNewFollowUp(prev => ({ ...prev, questionType: value }));
                } else if (followUpId) {
                  onUpdate(followUpId, { questionType: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="choice">Choice (Multiple Options)</SelectItem>
                <SelectItem value="open">Open (Free Text)</SelectItem>
                <SelectItem value="rating">Rating (Stars/Emoji)</SelectItem>
                <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Presentation */}
          <div>
            <Label>Presentation Style</Label>
            <Select
              value={followUp.presentation}
              onValueChange={(value: 'inline' | 'modal' | 'suggest_button') => {
                if (isNew) {
                  setNewFollowUp(prev => ({ ...prev, presentation: value }));
                } else if (followUpId) {
                  onUpdate(followUpId, { presentation: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">Inline (In Message)</SelectItem>
                <SelectItem value="modal">Modal (Popup)</SelectItem>
                <SelectItem value="suggest_button">Suggest Button (Subtle)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Topic Association */}
        <div>
          <Label>Associated Topic (Optional)</Label>
          <Select
            value={followUp.topicId || 'none'}
            onValueChange={(value) => {
              const topicId = value === 'none' ? undefined : value;
              if (isNew) {
                setNewFollowUp(prev => ({ ...prev, topicId }));
              } else if (followUpId) {
                onUpdate(followUpId, { topicId });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No specific topic</SelectItem>
              {topics.map(topic => (
                <SelectItem key={topic.id} value={topic.id}>{topic.topicName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Choices (for choice type) */}
        {followUp.questionType === 'choice' && (
          <div>
            <Label className="flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Quick Reply Choices (max 4)
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {followUp.choices.map((choice, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {choice}
                  <button onClick={() => removeChoice(idx, followUpId)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {followUp.choices.length < 4 && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newChoice}
                  onChange={(e) => setNewChoice(e.target.value)}
                  placeholder="Add choice"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addChoice(followUpId)}
                />
                <Button onClick={() => addChoice(followUpId)} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Probability */}
        <div>
          <Label className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Probability ({followUp.probabilityPct}%)
          </Label>
          <Slider
            value={[followUp.probabilityPct]}
            onValueChange={([value]) => {
              if (isNew) {
                setNewFollowUp(prev => ({ ...prev, probabilityPct: value }));
              } else if (followUpId) {
                onUpdate(followUpId, { probabilityPct: value });
              }
            }}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Chance this follow-up will be asked when conditions are met
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Max Per Session */}
          <div>
            <Label>Max Per Session</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={followUp.maxPerSession}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                if (isNew) {
                  setNewFollowUp(prev => ({ ...prev, maxPerSession: value }));
                } else if (followUpId) {
                  onUpdate(followUpId, { maxPerSession: value });
                }
              }}
            />
          </div>

          {/* Cooldown */}
          <div>
            <Label>Cooldown (seconds)</Label>
            <Input
              type="number"
              min={0}
              step={60}
              value={followUp.cooldownSeconds}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (isNew) {
                  setNewFollowUp(prev => ({ ...prev, cooldownSeconds: value }));
                } else if (followUpId) {
                  onUpdate(followUpId, { cooldownSeconds: value });
                }
              }}
            />
          </div>
        </div>

        {/* Conditions */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <Label>Conditions (Optional)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Visit Count Less Than</Label>
              <Input
                type="number"
                min={0}
                value={followUp.conditions.visitCountLt || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  const newConditions = { ...followUp.conditions, visitCountLt: value };
                  if (isNew) {
                    setNewFollowUp(prev => ({ ...prev, conditions: newConditions }));
                  } else if (followUpId) {
                    onUpdate(followUpId, { conditions: newConditions });
                  }
                }}
                placeholder="e.g., 3"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={followUp.conditions.isNewVisitor || false}
                onCheckedChange={(checked) => {
                  const newConditions = { ...followUp.conditions, isNewVisitor: checked };
                  if (isNew) {
                    setNewFollowUp(prev => ({ ...prev, conditions: newConditions }));
                  } else if (followUpId) {
                    onUpdate(followUpId, { conditions: newConditions });
                  }
                }}
              />
              <Label className="text-xs">New Visitors Only</Label>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={followUp.alwaysAsk}
              onCheckedChange={(checked) => {
                if (isNew) {
                  setNewFollowUp(prev => ({ ...prev, alwaysAsk: checked }));
                } else if (followUpId) {
                  onUpdate(followUpId, { alwaysAsk: checked });
                }
              }}
            />
            <Label className="text-sm">Always Ask (ignores probability)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={followUp.isActive}
              onCheckedChange={(checked) => {
                if (isNew) {
                  setNewFollowUp(prev => ({ ...prev, isActive: checked }));
                } else if (followUpId) {
                  onUpdate(followUpId, { isActive: checked });
                }
              }}
            />
            <Label className="text-sm">Active</Label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Follow-Up Questions
        </CardTitle>
        <CardDescription>
          Configure questions the AI will ask to drive engagement and collect information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Follow-ups */}
        {followUps.map((followUp) => (
          <Collapsible key={followUp.id} open={expandedFollowUps.has(followUp.id)}>
            <Card className={`${followUp.isActive ? 'border-primary/30' : 'border-muted opacity-60'}`}>
              <CollapsibleTrigger asChild>
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(followUp.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium truncate">{followUp.questionText}</span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {followUp.questionType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {followUp.probabilityPct}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(followUp.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    {expandedFollowUps.has(followUp.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 border-t">
                  {renderFollowUpForm(followUp)}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}

        {/* Add New Follow-up */}
        {isAddingNew ? (
          <Card className="border-dashed border-2 border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">New Follow-Up Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderFollowUpForm(newFollowUp, true)}
              <div className="flex gap-2">
                <Button onClick={handleAddFollowUp} disabled={isSaving || !newFollowUp.questionText.trim()}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Follow-Up'
                  )}
                </Button>
                <Button variant="outline" onClick={() => { setIsAddingNew(false); setNewFollowUp(DEFAULT_FOLLOWUP); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Follow-Up Question
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
