import React, { useState, useEffect } from 'react';
import { Brain, FileText, Globe, Mic, Plus, Upload, HelpCircle, Trash2, Check, Link2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AITrainingStepProps {
  onComplete: () => void;
}

const AITrainingStep: React.FC<AITrainingStepProps> = ({ onComplete }) => {
  const { hasFeature, limits, getRemainingQAPairs, getRemainingDocuments, canAddQAPair } = usePlanFeatures();
  const { toast } = useToast();
  const { qaPairs: existingPairs, addQAPair: saveQAPair, deleteQAPair, isLoading: qaLoading } = useQAPairs();
  const [activeTab, setActiveTab] = useState('qa');
  const [trained, setTrained] = useState(false);

  // AI name
  const [aiName, setAiName] = useState('');

  // Q&A state with link and keywords
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLink, setQaLink] = useState('');
  const [qaLinkLabel, setQaLinkLabel] = useState('');
  const [qaKeywords, setQaKeywords] = useState('');

  const currentQACount = existingPairs?.length || 0;
  const remainingQA = getRemainingQAPairs(currentQACount);
  const remainingDocs = getRemainingDocuments(0);

  const handleAddQAPair = async () => {
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;
    if (!canAddQAPair(currentQACount)) {
      toast({ title: 'Q&A limit reached', description: 'Upgrade your plan to add more.', variant: 'destructive' });
      return;
    }
    try {
      const tags = qaKeywords.split(',').map(k => k.trim()).filter(Boolean);
      await saveQAPair({
        question: qaQuestion,
        answer: qaAnswer,
        custom_link_url: qaLink || undefined,
        custom_link_button_name: qaLinkLabel || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      setQaQuestion('');
      setQaAnswer('');
      setQaLink('');
      setQaLinkLabel('');
      setQaKeywords('');
      toast({ title: 'Q&A pair added!' });
    } catch {
      toast({ title: 'Failed to add Q&A', variant: 'destructive' });
    }
  };

  const handleStartTraining = () => {
    setTrained(true);
    toast({ title: 'AI Training started!', description: 'Your AI is learning from your data.' });
  };

  const trainingTabs = [
    { id: 'qa', label: 'Q&A', icon: HelpCircle, available: true },
    { id: 'documents', label: 'Docs', icon: FileText, available: true },
    { id: 'web', label: 'Web', icon: Globe, available: hasFeature('ai_webscraper_enabled'), plan: 'pro' },
    { id: 'voice', label: 'Voice', icon: Mic, available: hasFeature('ai_voice_training_enabled'), plan: 'pro' },
  ];

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* AI Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            AI Assistant Name
          </Label>
          <Input
            placeholder="e.g., Alex's AI, My Virtual Assistant"
            value={aiName}
            onChange={(e) => setAiName(e.target.value)}
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground">This name will appear when your AI responds to visitors</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            {trainingTabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!tab.available}
                className="relative text-xs"
              >
                <tab.icon className="w-3 h-3 mr-1" />
                {tab.label}
                {!tab.available && tab.plan && (
                  <span className="absolute -top-1 -right-1">
                    <PlanBadge planKey={tab.plan} size="sm" showIcon={false} />
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Q&A Tab - Main form with link and keywords */}
          <TabsContent value="qa" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {currentQACount} / {limits.qa_pairs === -1 ? '∞' : limits.qa_pairs} Q&A pairs
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {remainingQA === 'unlimited' ? 'Unlimited' : `${remainingQA} remaining`}
              </span>
            </div>

            <div className="space-y-2.5 bg-slate-50/80 rounded-xl p-3 border border-slate-200">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Question *</Label>
                <Input
                  placeholder="e.g., What services do you offer?"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Answer *</Label>
                <Textarea
                  placeholder="Your answer..."
                  value={qaAnswer}
                  onChange={(e) => setQaAnswer(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              {/* Link option */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Link2 className="w-3 h-3 text-blue-500" /> Link URL
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={qaLink}
                    onChange={(e) => setQaLink(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Button Label</Label>
                  <Input
                    placeholder="Learn More"
                    value={qaLinkLabel}
                    onChange={(e) => setQaLinkLabel(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3 text-orange-500" /> Keywords
                </Label>
                <Input
                  placeholder="pricing, services, contact (comma-separated)"
                  value={qaKeywords}
                  onChange={(e) => setQaKeywords(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>

              <Button
                type="button"
                onClick={handleAddQAPair}
                disabled={!qaQuestion.trim() || !qaAnswer.trim() || qaLoading}
                className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Q&A Pair
              </Button>
            </div>

            {/* Existing Q&A Pairs */}
            {existingPairs && existingPairs.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {existingPairs.map((pair: any) => (
                  <div key={pair.id} className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">Q: {pair.question}</p>
                      <p className="text-xs text-slate-600 truncate">A: {pair.answer}</p>
                      {pair.tags && pair.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {pair.tags.map((tag: string) => (
                            <span key={tag} className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-slate-400 hover:text-red-500" onClick={() => deleteQAPair(pair.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                0 / {limits.documents === -1 ? '∞' : limits.documents} documents
              </Badge>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">Upload training documents</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX supported</p>
              <Button variant="outline" size="sm" className="mt-2">Choose Files</Button>
            </div>
          </TabsContent>

          <TabsContent value="web" className="space-y-3 mt-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Website URL</Label>
              <Input placeholder="https://yourblog.com" />
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Globe className="w-4 h-4 mr-2" /> Scrape Website Content
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-3 mt-3">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <Mic className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">Voice Training</p>
              <p className="text-xs text-muted-foreground mt-1">Record your voice for AI responses</p>
              <Button variant="outline" size="sm" className="mt-2">Start Recording</Button>
            </div>
          </TabsContent>
        </Tabs>

        {!trained ? (
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
            onClick={() => { handleStartTraining(); onComplete(); }}
          >
            <Brain className="w-4 h-4 mr-2" />
            Start Training & Continue
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="w-full border-green-200 text-green-700 hover:bg-green-50"
            onClick={onComplete}
          >
            <Check className="w-4 h-4 mr-2" /> Training Started — Continue
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AITrainingStep;