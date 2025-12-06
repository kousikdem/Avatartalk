import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Hash, Save, Trash2, ChevronDown, Plus, X, History, 
  CheckCircle, XCircle, AlertTriangle, MessageSquare 
} from 'lucide-react';

interface TopicCardProps {
  topic: {
    id: string;
    topic_name: string;
    topic_priority: number;
    authority: 'authoritative' | 'adaptive' | 'conversational';
    describe_text: string | null;
    describe_priority: boolean;
    do_rules: string[];
    avoid_rules: string[];
    sample_prompts: string[];
    keywords: string[];
    describe_history: Array<{ text: string; timestamp: string; version: number }>;
    is_active: boolean;
  };
  onUpdate: (id: string, updates: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddFollowUp: (topicId: string) => void;
  followUpCount: number;
  isSaving: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onUpdate,
  onDelete,
  onAddFollowUp,
  followUpCount,
  isSaving
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [localTopic, setLocalTopic] = useState(topic);
  const [newKeyword, setNewKeyword] = useState('');
  const [newDoRule, setNewDoRule] = useState('');
  const [newAvoidRule, setNewAvoidRule] = useState('');

  const charCount = localTopic.describe_text?.length || 0;
  const maxChars = 1500;

  const handleSave = () => {
    onUpdate(topic.id, localTopic);
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setLocalTopic(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), newKeyword.trim().toLowerCase()]
    }));
    setNewKeyword('');
  };

  const removeKeyword = (index: number) => {
    setLocalTopic(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const addDoRule = () => {
    if (!newDoRule.trim()) return;
    setLocalTopic(prev => ({
      ...prev,
      do_rules: [...(prev.do_rules || []), newDoRule.trim()]
    }));
    setNewDoRule('');
  };

  const addAvoidRule = () => {
    if (!newAvoidRule.trim()) return;
    setLocalTopic(prev => ({
      ...prev,
      avoid_rules: [...(prev.avoid_rules || []), newAvoidRule.trim()]
    }));
    setNewAvoidRule('');
  };

  const restoreVersion = (text: string) => {
    setLocalTopic(prev => ({ ...prev, describe_text: text }));
    setShowHistory(false);
  };

  return (
    <Card className={`border-2 ${localTopic.is_active ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <Input
              value={localTopic.topic_name}
              onChange={(e) => setLocalTopic(prev => ({ ...prev, topic_name: e.target.value }))}
              className="font-semibold text-lg border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Topic Name"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={localTopic.is_active ? 'default' : 'secondary'}>
              {localTopic.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Switch
              checked={localTopic.is_active}
              onCheckedChange={(checked) => setLocalTopic(prev => ({ ...prev, is_active: checked }))}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Settings Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Priority</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={localTopic.topic_priority}
              onChange={(e) => setLocalTopic(prev => ({ ...prev, topic_priority: parseInt(e.target.value) || 10 }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Authority</Label>
            <Select
              value={localTopic.authority}
              onValueChange={(value: 'authoritative' | 'adaptive' | 'conversational') => 
                setLocalTopic(prev => ({ ...prev, authority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="authoritative">Authoritative</SelectItem>
                <SelectItem value="adaptive">Adaptive</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Follow-ups</Label>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onAddFollowUp(topic.id)}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {followUpCount} Questions
            </Button>
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label className="text-xs">Keywords (for topic detection)</Label>
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword..."
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button size="sm" variant="outline" onClick={addKeyword}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {localTopic.keywords?.map((kw, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {kw}
                <X className="w-3 h-3 cursor-pointer" onClick={() => removeKeyword(i)} />
              </Badge>
            ))}
          </div>
        </div>

        {/* Expandable Describe Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2">
              <span className="text-sm font-medium">Describe & Rules</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {/* Describe Priority Toggle */}
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <Label className="text-xs">Override global persona for this topic</Label>
              <Switch
                checked={localTopic.describe_priority}
                onCheckedChange={(checked) => setLocalTopic(prev => ({ ...prev, describe_priority: checked }))}
              />
            </div>

            {/* Describe Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Describe how AI should interact on this topic</Label>
                <div className="flex items-center gap-2">
                  {topic.describe_history?.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => setShowHistory(!showHistory)}>
                      <History className="w-3 h-3 mr-1" />
                      History
                    </Button>
                  )}
                  <span className={`text-xs ${charCount > maxChars ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {charCount}/{maxChars}
                  </span>
                </div>
              </div>
              <Textarea
                value={localTopic.describe_text || ''}
                onChange={(e) => setLocalTopic(prev => ({ ...prev, describe_text: e.target.value }))}
                placeholder="Example: For 'pricing' — be transparent, show 3 tier options, always mention trial, avoid promising discounts not set, sample reply: 'Our Pro plan starts at…'"
                rows={5}
                className="font-mono text-sm"
              />
            </div>

            {/* Version History */}
            {showHistory && topic.describe_history?.length > 0 && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <Label className="text-xs">Previous Versions</Label>
                {topic.describe_history.slice(0, 5).map((h, i) => (
                  <div key={i} className="p-2 bg-background rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">v{h.version}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => restoreVersion(h.text)}>
                        Restore
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{h.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Do Rules */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" /> DO (instructions to follow)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newDoRule}
                  onChange={(e) => setNewDoRule(e.target.value)}
                  placeholder="Add 'do' rule..."
                  onKeyPress={(e) => e.key === 'Enter' && addDoRule()}
                />
                <Button size="sm" variant="outline" onClick={addDoRule}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {localTopic.do_rules?.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="flex-1">{rule}</span>
                    <X 
                      className="w-3 h-3 cursor-pointer text-muted-foreground"
                      onClick={() => setLocalTopic(prev => ({
                        ...prev,
                        do_rules: prev.do_rules.filter((_, idx) => idx !== i)
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid Rules */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-red-600">
                <XCircle className="w-3 h-3" /> AVOID (things to never do)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newAvoidRule}
                  onChange={(e) => setNewAvoidRule(e.target.value)}
                  placeholder="Add 'avoid' rule..."
                  onKeyPress={(e) => e.key === 'Enter' && addAvoidRule()}
                />
                <Button size="sm" variant="outline" onClick={addAvoidRule}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {localTopic.avoid_rules?.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span className="flex-1">{rule}</span>
                    <X 
                      className="w-3 h-3 cursor-pointer text-muted-foreground"
                      onClick={() => setLocalTopic(prev => ({
                        ...prev,
                        avoid_rules: prev.avoid_rules.filter((_, idx) => idx !== i)
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-1" />
            Save Topic
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => onDelete(topic.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicCard;
