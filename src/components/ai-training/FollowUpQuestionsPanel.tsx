import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, Plus, Trash2, ChevronDown, ChevronUp, Save,
  MessageCircleQuestion, Percent, Clock, Target
} from 'lucide-react';
import { useAIFollowUps, AIFollowUp } from '@/hooks/useAIFollowUps';
import { useAITopics } from '@/hooks/useAITopics';

const QUESTION_TYPES = [
  { value: 'choice', label: 'Multiple Choice', description: 'Quick reply buttons' },
  { value: 'open', label: 'Open-ended', description: 'Free text response' },
  { value: 'rating', label: 'Rating', description: 'Star/emoji rating' },
  { value: 'boolean', label: 'Yes/No', description: 'Simple confirmation' },
];

const PRESENTATION_TYPES = [
  { value: 'inline', label: 'Inline', description: 'Part of the message with buttons' },
  { value: 'modal', label: 'Modal', description: 'Popup dialog' },
  { value: 'suggest_button', label: 'Suggestion', description: 'Subtle suggestion button' },
];

export const FollowUpQuestionsPanel: React.FC = () => {
  const { followUps, loading, createFollowUp, updateFollowUp, deleteFollowUp } = useAIFollowUps();
  const { topics } = useAITopics();
  const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null);
  const [editingFollowUp, setEditingFollowUp] = useState<Partial<AIFollowUp> | null>(null);
  const [newChoice, setNewChoice] = useState('');

  const handleCreateFollowUp = async () => {
    await createFollowUp({
      question_text: 'Would you like to know more?',
      question_type: 'choice',
      choices: ['Yes, please!', 'Not now'],
      presentation: 'inline',
      probability_pct: 100,
      max_per_session: 3,
      cooldown_seconds: 300,
      is_active: true
    });
  };

  const handleSaveFollowUp = async (followUp: AIFollowUp) => {
    if (editingFollowUp) {
      await updateFollowUp(followUp.id, editingFollowUp);
      setEditingFollowUp(null);
    }
  };

  const startEditing = (followUp: AIFollowUp) => {
    setEditingFollowUp({ ...followUp });
    setExpandedFollowUp(followUp.id);
  };

  const addChoice = () => {
    if (!newChoice.trim() || !editingFollowUp) return;
    const choices = editingFollowUp.choices || [];
    setEditingFollowUp({
      ...editingFollowUp,
      choices: [...choices, newChoice.trim()]
    });
    setNewChoice('');
  };

  const removeChoice = (index: number) => {
    if (!editingFollowUp) return;
    const choices = editingFollowUp.choices || [];
    setEditingFollowUp({
      ...editingFollowUp,
      choices: choices.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="h-48" /></Card>;
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
              Follow-up Questions
            </CardTitle>
            <CardDescription>
              Configure questions the AI will ask to drive engagement, collect info, or qualify leads
            </CardDescription>
          </div>
          <Button onClick={handleCreateFollowUp} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Follow-up
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {followUps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No follow-up questions configured yet</p>
            <p className="text-sm">Add follow-up questions to engage visitors and collect information</p>
          </div>
        ) : (
          followUps.map((followUp) => {
            const isEditing = editingFollowUp?.id === followUp.id;
            const displayFollowUp = isEditing ? editingFollowUp as AIFollowUp : followUp;
            const linkedTopic = topics.find(t => t.id === followUp.topic_id);
            
            return (
              <Collapsible
                key={followUp.id}
                open={expandedFollowUp === followUp.id}
                onOpenChange={(open) => setExpandedFollowUp(open ? followUp.id : null)}
              >
                <Card className="border">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{followUp.question_text}</span>
                          <Badge variant={followUp.is_active ? 'default' : 'secondary'}>
                            {followUp.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {QUESTION_TYPES.find(t => t.value === followUp.question_type)?.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {followUp.probability_pct}% probability
                          </Badge>
                          {linkedTopic && (
                            <Badge variant="secondary" className="text-xs">
                              Topic: {linkedTopic.topic_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(followUp);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {expandedFollowUp === followUp.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t p-4 space-y-4">
                      {/* Question Text */}
                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                          value={displayFollowUp.question_text}
                          onChange={(e) => isEditing && setEditingFollowUp({
                            ...editingFollowUp!,
                            question_text: e.target.value
                          })}
                          disabled={!isEditing}
                          rows={2}
                        />
                      </div>

                      {/* Question Type & Presentation */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Select
                            value={displayFollowUp.question_type}
                            onValueChange={(value) => isEditing && setEditingFollowUp({
                              ...editingFollowUp!,
                              question_type: value as AIFollowUp['question_type']
                            })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QUESTION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-muted-foreground">{type.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Presentation</Label>
                          <Select
                            value={displayFollowUp.presentation}
                            onValueChange={(value) => isEditing && setEditingFollowUp({
                              ...editingFollowUp!,
                              presentation: value as AIFollowUp['presentation']
                            })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRESENTATION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-muted-foreground">{type.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Choices (for choice type) */}
                      {displayFollowUp.question_type === 'choice' && (
                        <div className="space-y-2">
                          <Label>Quick Reply Choices (max 4)</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(displayFollowUp.choices || []).map((choice, i) => (
                              <Badge key={i} variant="secondary" className="gap-1 py-1 px-2">
                                {choice}
                                {isEditing && (
                                  <button onClick={() => removeChoice(i)}>
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                          {isEditing && (displayFollowUp.choices || []).length < 4 && (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add choice..."
                                value={newChoice}
                                onChange={(e) => setNewChoice(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addChoice()}
                              />
                              <Button variant="outline" size="sm" onClick={addChoice}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Topic Link */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Linked Topic (Optional)
                        </Label>
                        <Select
                          value={displayFollowUp.topic_id || 'none'}
                          onValueChange={(value) => isEditing && setEditingFollowUp({
                            ...editingFollowUp!,
                            topic_id: value === 'none' ? null : value
                          })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No specific topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No specific topic</SelectItem>
                            {topics.map((topic) => (
                              <SelectItem key={topic.id} value={topic.id}>
                                {topic.topic_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Probability & Throttling */}
                      <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="flex items-center gap-2">
                              <Percent className="w-4 h-4" />
                              Probability
                            </Label>
                            <Badge variant="outline">{displayFollowUp.probability_pct}%</Badge>
                          </div>
                          <Slider
                            value={[displayFollowUp.probability_pct]}
                            onValueChange={([value]) => isEditing && setEditingFollowUp({
                              ...editingFollowUp!,
                              probability_pct: value
                            })}
                            max={100}
                            step={5}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              Max per Session
                            </Label>
                            <Input
                              type="number"
                              value={displayFollowUp.max_per_session}
                              onChange={(e) => isEditing && setEditingFollowUp({
                                ...editingFollowUp!,
                                max_per_session: parseInt(e.target.value) || 1
                              })}
                              disabled={!isEditing}
                              min={1}
                              max={10}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Cooldown (seconds)
                            </Label>
                            <Input
                              type="number"
                              value={displayFollowUp.cooldown_seconds}
                              onChange={(e) => isEditing && setEditingFollowUp({
                                ...editingFollowUp!,
                                cooldown_seconds: parseInt(e.target.value) || 60
                              })}
                              disabled={!isEditing}
                              min={0}
                              step={30}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Active & Always Ask */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={displayFollowUp.is_active}
                              onCheckedChange={(checked) => isEditing && setEditingFollowUp({
                                ...editingFollowUp!,
                                is_active: checked
                              })}
                              disabled={!isEditing}
                            />
                            <Label>Active</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={displayFollowUp.always_ask}
                              onCheckedChange={(checked) => isEditing && setEditingFollowUp({
                                ...editingFollowUp!,
                                always_ask: checked
                              })}
                              disabled={!isEditing}
                            />
                            <Label>Always Ask</Label>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button variant="outline" onClick={() => setEditingFollowUp(null)}>
                                Cancel
                              </Button>
                              <Button onClick={() => handleSaveFollowUp(followUp)}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteFollowUp(followUp.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
