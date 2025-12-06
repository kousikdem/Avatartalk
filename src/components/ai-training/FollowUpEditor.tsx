import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, Plus, Trash2, Save, Settings, 
  HelpCircle, CheckSquare, Star, MessageCircle, X 
} from 'lucide-react';

interface FollowUp {
  id: string;
  topic_id: string | null;
  question_text: string;
  question_type: 'choice' | 'open' | 'boolean' | 'rating';
  choices: string[];
  presentation: 'inline' | 'modal' | 'suggestion';
  conditions: Record<string, any>;
  probability_pct: number;
  max_per_session: number;
  cooldown_seconds: number;
  always_ask: boolean;
  is_active: boolean;
}

interface FollowUpEditorProps {
  followUps: FollowUp[];
  topicId?: string;
  topicName?: string;
  onCreate: (followUp: Partial<FollowUp>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<FollowUp>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving: boolean;
}

const FollowUpEditor: React.FC<FollowUpEditorProps> = ({
  followUps,
  topicId,
  topicName,
  onCreate,
  onUpdate,
  onDelete,
  isSaving
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [newChoice, setNewChoice] = useState('');

  const filteredFollowUps = topicId 
    ? followUps.filter(f => f.topic_id === topicId)
    : followUps;

  const defaultFollowUp: Partial<FollowUp> = {
    topic_id: topicId || null,
    question_text: '',
    question_type: 'choice',
    choices: ['Yes', 'No'],
    presentation: 'inline',
    conditions: {},
    probability_pct: 100,
    max_per_session: 3,
    cooldown_seconds: 300,
    always_ask: false,
    is_active: true
  };

  const handleCreate = async () => {
    await onCreate(defaultFollowUp);
  };

  const handleSave = async (followUp: FollowUp) => {
    await onUpdate(followUp.id, followUp);
    setEditingFollowUp(null);
  };

  const addChoice = () => {
    if (!newChoice.trim() || !editingFollowUp) return;
    setEditingFollowUp(prev => prev ? {
      ...prev,
      choices: [...(prev.choices || []), newChoice.trim()]
    } : null);
    setNewChoice('');
  };

  const removeChoice = (index: number) => {
    if (!editingFollowUp) return;
    setEditingFollowUp(prev => prev ? {
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    } : null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'choice': return <CheckSquare className="w-4 h-4" />;
      case 'open': return <MessageCircle className="w-4 h-4" />;
      case 'boolean': return <HelpCircle className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Follow-up Questions
            {topicName && <Badge variant="outline">{topicName}</Badge>}
          </div>
          <Button size="sm" onClick={handleCreate} disabled={isSaving}>
            <Plus className="w-4 h-4 mr-1" />
            Add Follow-up
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredFollowUps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No follow-up questions yet</p>
            <p className="text-sm">Add questions to boost engagement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFollowUps.map((followUp) => (
              <div 
                key={followUp.id} 
                className={`p-4 border rounded-lg ${followUp.is_active ? 'bg-white' : 'bg-muted opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(followUp.question_type)}
                      <Badge variant="secondary">{followUp.question_type}</Badge>
                      <Badge variant="outline">{followUp.presentation}</Badge>
                      <Badge variant={followUp.is_active ? 'default' : 'secondary'}>
                        {followUp.probability_pct}% chance
                      </Badge>
                    </div>
                    <p className="font-medium">{followUp.question_text || 'No question set'}</p>
                    {followUp.choices?.length > 0 && followUp.question_type === 'choice' && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {followUp.choices.map((choice, i) => (
                          <Badge key={i} variant="outline">{choice}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingFollowUp(followUp)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Follow-up Question</DialogTitle>
                        </DialogHeader>
                        {editingFollowUp && (
                          <div className="space-y-4 pt-4">
                            {/* Question Text */}
                            <div className="space-y-2">
                              <Label>Question Text</Label>
                              <Textarea
                                value={editingFollowUp.question_text}
                                onChange={(e) => setEditingFollowUp(prev => prev ? {
                                  ...prev,
                                  question_text: e.target.value
                                } : null)}
                                placeholder="Would you like to see more options?"
                                rows={2}
                              />
                            </div>

                            {/* Type and Presentation */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                  value={editingFollowUp.question_type}
                                  onValueChange={(value: 'choice' | 'open' | 'boolean' | 'rating') => 
                                    setEditingFollowUp(prev => prev ? { ...prev, question_type: value } : null)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="choice">Choice (buttons)</SelectItem>
                                    <SelectItem value="open">Open (text input)</SelectItem>
                                    <SelectItem value="boolean">Yes/No</SelectItem>
                                    <SelectItem value="rating">Rating (stars)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Presentation</Label>
                                <Select
                                  value={editingFollowUp.presentation}
                                  onValueChange={(value: 'inline' | 'modal' | 'suggestion') => 
                                    setEditingFollowUp(prev => prev ? { ...prev, presentation: value } : null)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="inline">Inline (in chat)</SelectItem>
                                    <SelectItem value="modal">Modal popup</SelectItem>
                                    <SelectItem value="suggestion">Suggestion chip</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Choices (for choice type) */}
                            {editingFollowUp.question_type === 'choice' && (
                              <div className="space-y-2">
                                <Label>Choices (up to 4)</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={newChoice}
                                    onChange={(e) => setNewChoice(e.target.value)}
                                    placeholder="Add choice..."
                                    onKeyPress={(e) => e.key === 'Enter' && addChoice()}
                                    disabled={(editingFollowUp.choices?.length || 0) >= 4}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={addChoice}
                                    disabled={(editingFollowUp.choices?.length || 0) >= 4}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {editingFollowUp.choices?.map((choice, i) => (
                                    <Badge key={i} variant="secondary" className="gap-1">
                                      {choice}
                                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeChoice(i)} />
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Probability */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Probability ({editingFollowUp.probability_pct}%)</Label>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Always ask</Label>
                                  <Switch
                                    checked={editingFollowUp.always_ask}
                                    onCheckedChange={(checked) => 
                                      setEditingFollowUp(prev => prev ? { ...prev, always_ask: checked } : null)
                                    }
                                  />
                                </div>
                              </div>
                              <Slider
                                value={[editingFollowUp.probability_pct]}
                                onValueChange={([value]) => 
                                  setEditingFollowUp(prev => prev ? { ...prev, probability_pct: value } : null)
                                }
                                min={0}
                                max={100}
                                step={5}
                                disabled={editingFollowUp.always_ask}
                              />
                            </div>

                            {/* Limits */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Max per session</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={editingFollowUp.max_per_session}
                                  onChange={(e) => setEditingFollowUp(prev => prev ? {
                                    ...prev,
                                    max_per_session: parseInt(e.target.value) || 3
                                  } : null)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Cooldown (seconds)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={editingFollowUp.cooldown_seconds}
                                  onChange={(e) => setEditingFollowUp(prev => prev ? {
                                    ...prev,
                                    cooldown_seconds: parseInt(e.target.value) || 0
                                  } : null)}
                                />
                              </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-3 bg-muted rounded">
                              <Label>Active</Label>
                              <Switch
                                checked={editingFollowUp.is_active}
                                onCheckedChange={(checked) => 
                                  setEditingFollowUp(prev => prev ? { ...prev, is_active: checked } : null)
                                }
                              />
                            </div>

                            <Button 
                              onClick={() => handleSave(editingFollowUp)} 
                              disabled={isSaving}
                              className="w-full"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Follow-up
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onDelete(followUp.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowUpEditor;
