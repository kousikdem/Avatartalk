import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Tag, Check, X,
  AlertTriangle, Lightbulb, Loader2
} from "lucide-react";
import { TopicRule } from "@/hooks/useAITrainingSettings";

interface TopicRulesPanelProps {
  topics: TopicRule[];
  onAdd: (topic: Omit<TopicRule, 'id'>) => Promise<TopicRule>;
  onUpdate: (id: string, updates: Partial<TopicRule>) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const DEFAULT_TOPIC: Omit<TopicRule, 'id'> = {
  topicName: '',
  priority: 10,
  authority: 'neutral',
  doRules: [],
  avoidRules: [],
  samplePrompts: [],
  keywords: [],
  isActive: true
};

export const TopicRulesPanel: React.FC<TopicRulesPanelProps> = ({
  topics,
  onAdd,
  onUpdate,
  onDelete,
  isLoading
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTopic, setNewTopic] = useState<Omit<TopicRule, 'id'>>(DEFAULT_TOPIC);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [newRule, setNewRule] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddTopic = async () => {
    if (!newTopic.topicName.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(newTopic);
      setNewTopic(DEFAULT_TOPIC);
      setIsAddingNew(false);
    } finally {
      setIsSaving(false);
    }
  };

  const addRule = (type: 'do' | 'avoid', topicId?: string) => {
    if (!newRule.trim()) return;
    
    if (topicId) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        const key = type === 'do' ? 'doRules' : 'avoidRules';
        onUpdate(topicId, { [key]: [...topic[key], newRule] });
      }
    } else {
      const key = type === 'do' ? 'doRules' : 'avoidRules';
      setNewTopic(prev => ({ ...prev, [key]: [...prev[key], newRule] }));
    }
    setNewRule('');
  };

  const removeRule = (type: 'do' | 'avoid', index: number, topicId?: string) => {
    if (topicId) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        const key = type === 'do' ? 'doRules' : 'avoidRules';
        onUpdate(topicId, { [key]: topic[key].filter((_, i) => i !== index) });
      }
    } else {
      const key = type === 'do' ? 'doRules' : 'avoidRules';
      setNewTopic(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    }
  };

  const addKeyword = (topicId?: string) => {
    if (!newKeyword.trim()) return;
    
    if (topicId) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        onUpdate(topicId, { keywords: [...topic.keywords, newKeyword] });
      }
    } else {
      setNewTopic(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword] }));
    }
    setNewKeyword('');
  };

  const removeKeyword = (index: number, topicId?: string) => {
    if (topicId) {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        onUpdate(topicId, { keywords: topic.keywords.filter((_, i) => i !== index) });
      }
    } else {
      setNewTopic(prev => ({ ...prev, keywords: prev.keywords.filter((_, i) => i !== index) }));
    }
  };

  const renderTopicForm = (topic: Omit<TopicRule, 'id'> | TopicRule, isNew: boolean = false) => {
    const topicId = 'id' in topic ? topic.id : undefined;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Topic Name</Label>
            <Input
              value={topic.topicName}
              onChange={(e) => {
                if (isNew) {
                  setNewTopic(prev => ({ ...prev, topicName: e.target.value }));
                } else if (topicId) {
                  onUpdate(topicId, { topicName: e.target.value });
                }
              }}
              placeholder="e.g., Products, Services, Support"
            />
          </div>
          <div>
            <Label>Authority Level</Label>
            <Select
              value={topic.authority}
              onValueChange={(value: 'authoritative' | 'neutral' | 'deflect') => {
                if (isNew) {
                  setNewTopic(prev => ({ ...prev, authority: value }));
                } else if (topicId) {
                  onUpdate(topicId, { authority: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="authoritative">Authoritative (Expert)</SelectItem>
                <SelectItem value="neutral">Neutral (Balanced)</SelectItem>
                <SelectItem value="deflect">Deflect (Redirect)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Priority (1-100)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[topic.priority]}
              onValueChange={([value]) => {
                if (isNew) {
                  setNewTopic(prev => ({ ...prev, priority: value }));
                } else if (topicId) {
                  onUpdate(topicId, { priority: value });
                }
              }}
              min={1}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12 text-right">{topic.priority}</span>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <Label className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Keywords (for topic detection)
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {topic.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="secondary" className="gap-1">
                {keyword}
                <button onClick={() => removeKeyword(idx, topicId)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addKeyword(topicId)}
            />
            <Button onClick={() => addKeyword(topicId)} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Do Rules */}
        <div>
          <Label className="flex items-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            Do Rules (What to say)
          </Label>
          <div className="space-y-2 mt-2">
            {topic.doRules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <Lightbulb className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="flex-1 text-sm">{rule}</span>
                <button onClick={() => removeRule('do', idx, topicId)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Add a 'do' rule"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addRule('do', topicId)}
            />
            <Button onClick={() => addRule('do', topicId)} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Avoid Rules */}
        <div>
          <Label className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            Avoid Rules (What not to say)
          </Label>
          <div className="space-y-2 mt-2">
            {topic.avoidRules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="flex-1 text-sm">{rule}</span>
                <button onClick={() => removeRule('avoid', idx, topicId)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Add an 'avoid' rule"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addRule('avoid', topicId)}
            />
            <Button onClick={() => addRule('avoid', topicId)} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between">
          <Label>Active</Label>
          <Switch
            checked={topic.isActive}
            onCheckedChange={(checked) => {
              if (isNew) {
                setNewTopic(prev => ({ ...prev, isActive: checked }));
              } else if (topicId) {
                onUpdate(topicId, { isActive: checked });
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Topic Rules
        </CardTitle>
        <CardDescription>
          Define how the AI should respond to different topics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Topics */}
        {topics.map((topic) => (
          <Collapsible key={topic.id} open={expandedTopics.has(topic.id)}>
            <Card className={`${topic.isActive ? 'border-primary/30' : 'border-muted opacity-60'}`}>
              <CollapsibleTrigger asChild>
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(topic.id)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={topic.isActive ? "default" : "secondary"}>
                      Priority: {topic.priority}
                    </Badge>
                    <span className="font-medium">{topic.topicName}</span>
                    <Badge variant="outline" className="text-xs">
                      {topic.authority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(topic.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    {expandedTopics.has(topic.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 border-t">
                  {renderTopicForm(topic)}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}

        {/* Add New Topic */}
        {isAddingNew ? (
          <Card className="border-dashed border-2 border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">New Topic Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderTopicForm(newTopic, true)}
              <div className="flex gap-2">
                <Button onClick={handleAddTopic} disabled={isSaving || !newTopic.topicName.trim()}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Topic'
                  )}
                </Button>
                <Button variant="outline" onClick={() => { setIsAddingNew(false); setNewTopic(DEFAULT_TOPIC); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Topic Rule
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
