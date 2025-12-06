import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Save, 
  Shield, AlertTriangle, CheckCircle, GripVertical 
} from 'lucide-react';
import { useAITopics, AITopic } from '@/hooks/useAITopics';

export const TopicRulesPanel: React.FC = () => {
  const { topics, loading, createTopic, updateTopic, deleteTopic } = useAITopics();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<Partial<AITopic> | null>(null);
  const [newRule, setNewRule] = useState({ do: '', avoid: '', keyword: '', prompt: '' });

  const handleCreateTopic = async () => {
    await createTopic({
      topic_name: 'New Topic',
      authority: 'neutral',
      topic_priority: 0,
      is_active: true,
      keywords: [],
      do_rules: [],
      avoid_rules: [],
      sample_prompts: []
    });
  };

  const handleSaveTopic = async (topic: AITopic) => {
    if (editingTopic) {
      await updateTopic(topic.id, editingTopic);
      setEditingTopic(null);
    }
  };

  const startEditing = (topic: AITopic) => {
    setEditingTopic({ ...topic });
    setExpandedTopic(topic.id);
  };

  const addArrayItem = (field: 'do_rules' | 'avoid_rules' | 'keywords' | 'sample_prompts', value: string) => {
    if (!value.trim() || !editingTopic) return;
    const current = editingTopic[field] || [];
    setEditingTopic({
      ...editingTopic,
      [field]: [...current, value.trim()]
    });
    setNewRule({ do: '', avoid: '', keyword: '', prompt: '' });
  };

  const removeArrayItem = (field: 'do_rules' | 'avoid_rules' | 'keywords' | 'sample_prompts', index: number) => {
    if (!editingTopic) return;
    const current = editingTopic[field] || [];
    setEditingTopic({
      ...editingTopic,
      [field]: current.filter((_, i) => i !== index)
    });
  };

  const getAuthorityIcon = (authority: string) => {
    switch (authority) {
      case 'authoritative':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'deflect':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
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
              <BookOpen className="w-5 h-5 text-primary" />
              Topic Rules
            </CardTitle>
            <CardDescription>
              Define how the AI should respond to specific topics
            </CardDescription>
          </div>
          <Button onClick={handleCreateTopic} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Topic
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No topics configured yet</p>
            <p className="text-sm">Add topics to customize how your AI responds to different subjects</p>
          </div>
        ) : (
          topics.map((topic) => {
            const isEditing = editingTopic?.id === topic.id;
            const displayTopic = isEditing ? editingTopic as AITopic : topic;
            
            return (
              <Collapsible
                key={topic.id}
                open={expandedTopic === topic.id}
                onOpenChange={(open) => setExpandedTopic(open ? topic.id : null)}
              >
                <Card className="border">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        {getAuthorityIcon(topic.authority || 'neutral')}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{topic.topic_name}</span>
                            <Badge variant={topic.is_active ? 'default' : 'secondary'}>
                              {topic.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">Priority: {topic.topic_priority}</Badge>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {(topic.keywords || []).slice(0, 3).map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                            ))}
                            {(topic.keywords || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">+{topic.keywords.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(topic);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {expandedTopic === topic.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t p-4 space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Topic Name</Label>
                          <Input
                            value={displayTopic.topic_name}
                            onChange={(e) => isEditing && setEditingTopic({
                              ...editingTopic!,
                              topic_name: e.target.value
                            })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Authority Level</Label>
                          <Select
                            value={displayTopic.authority || 'neutral'}
                            onValueChange={(value) => isEditing && setEditingTopic({
                              ...editingTopic!,
                              authority: value as AITopic['authority']
                            })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="authoritative">Authoritative - Speak with confidence</SelectItem>
                              <SelectItem value="neutral">Neutral - Balanced response</SelectItem>
                              <SelectItem value="deflect">Deflect - Redirect to other resources</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Keywords */}
                      <div className="space-y-2">
                        <Label>Keywords (triggers this topic)</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(displayTopic.keywords || []).map((kw, i) => (
                            <Badge key={i} variant="secondary" className="gap-1">
                              {kw}
                              {isEditing && (
                                <button onClick={() => removeArrayItem('keywords', i)}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add keyword..."
                              value={newRule.keyword}
                              onChange={(e) => setNewRule({ ...newRule, keyword: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && addArrayItem('keywords', newRule.keyword)}
                            />
                            <Button variant="outline" size="sm" onClick={() => addArrayItem('keywords', newRule.keyword)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Do Rules */}
                      <div className="space-y-2">
                        <Label className="text-green-600">✓ DO (What the AI should do)</Label>
                        <div className="space-y-1">
                          {(displayTopic.do_rules || []).map((rule, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="flex-1 text-sm">{rule}</span>
                              {isEditing && (
                                <Button variant="ghost" size="sm" onClick={() => removeArrayItem('do_rules', i)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a 'do' rule..."
                              value={newRule.do}
                              onChange={(e) => setNewRule({ ...newRule, do: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && addArrayItem('do_rules', newRule.do)}
                            />
                            <Button variant="outline" size="sm" onClick={() => addArrayItem('do_rules', newRule.do)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Avoid Rules */}
                      <div className="space-y-2">
                        <Label className="text-red-600">✗ AVOID (What the AI should NOT do)</Label>
                        <div className="space-y-1">
                          {(displayTopic.avoid_rules || []).map((rule, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded">
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="flex-1 text-sm">{rule}</span>
                              {isEditing && (
                                <Button variant="ghost" size="sm" onClick={() => removeArrayItem('avoid_rules', i)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add an 'avoid' rule..."
                              value={newRule.avoid}
                              onChange={(e) => setNewRule({ ...newRule, avoid: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && addArrayItem('avoid_rules', newRule.avoid)}
                            />
                            <Button variant="outline" size="sm" onClick={() => addArrayItem('avoid_rules', newRule.avoid)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Sample Prompts */}
                      <div className="space-y-2">
                        <Label>Sample Prompts (Training examples)</Label>
                        <div className="space-y-1">
                          {(displayTopic.sample_prompts || []).map((prompt, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <span className="flex-1 text-sm italic">"{prompt}"</span>
                              {isEditing && (
                                <Button variant="ghost" size="sm" onClick={() => removeArrayItem('sample_prompts', i)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add sample prompt..."
                              value={newRule.prompt}
                              onChange={(e) => setNewRule({ ...newRule, prompt: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && addArrayItem('sample_prompts', newRule.prompt)}
                            />
                            <Button variant="outline" size="sm" onClick={() => addArrayItem('sample_prompts', newRule.prompt)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Active Toggle & Priority */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={displayTopic.is_active}
                              onCheckedChange={(checked) => isEditing && setEditingTopic({
                                ...editingTopic!,
                                is_active: checked
                              })}
                              disabled={!isEditing}
                            />
                            <Label>Active</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>Priority:</Label>
                            <Input
                              type="number"
                              value={displayTopic.topic_priority}
                              onChange={(e) => isEditing && setEditingTopic({
                                ...editingTopic!,
                                topic_priority: parseInt(e.target.value) || 0
                              })}
                              disabled={!isEditing}
                              className="w-20"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button variant="outline" onClick={() => setEditingTopic(null)}>
                                Cancel
                              </Button>
                              <Button onClick={() => handleSaveTopic(topic)}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTopic(topic.id)}
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
