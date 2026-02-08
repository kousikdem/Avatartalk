import React, { useState, useEffect } from 'react';
import { Brain, FileText, Globe, Mic, Plus, Upload, HelpCircle, Trash2, Save, Check } from 'lucide-react';
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

  // Q&A state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');

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
      await saveQAPair({ question: qaQuestion, answer: qaAnswer });
      setQaQuestion('');
      setQaAnswer('');
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
    { id: 'documents', label: 'Documents', icon: FileText, available: true },
    { id: 'web', label: 'Web Scraper', icon: Globe, available: hasFeature('ai_webscraper_enabled'), plan: 'pro' },
    { id: 'voice', label: 'Voice', icon: Mic, available: hasFeature('ai_voice_training_enabled'), plan: 'pro' },
  ];

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            Train your AI with knowledge so it can accurately represent you to visitors
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            {trainingTabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!tab.available}
                className="relative text-xs sm:text-sm"
              >
                <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                {tab.label}
                {!tab.available && tab.plan && (
                  <span className="absolute -top-1 -right-1">
                    <PlanBadge planKey={tab.plan} size="sm" showIcon={false} />
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="space-y-4 mt-4">
            {/* Limit badge */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {currentQACount} / {limits.qa_pairs === -1 ? '∞' : limits.qa_pairs} Q&A pairs
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {remainingQA === 'unlimited' ? 'Unlimited' : `${remainingQA} remaining`}
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Question</Label>
                <Input
                  placeholder="e.g., What services do you offer?"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Answer</Label>
                <Textarea
                  placeholder="Your answer..."
                  value={qaAnswer}
                  onChange={(e) => setQaAnswer(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddQAPair}
                disabled={!qaQuestion.trim() || !qaAnswer.trim() || qaLoading}
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Q&A Pair
              </Button>
            </div>

            {/* Existing Q&A Pairs */}
            {existingPairs && existingPairs.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {existingPairs.map((pair: any) => (
                  <div key={pair.id} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">Q: {pair.question}</p>
                      <p className="text-sm text-slate-600 mt-1 truncate">A: {pair.answer}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-500"
                      onClick={() => deleteQAPair(pair.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                0 / {limits.documents === -1 ? '∞' : limits.documents} documents
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {remainingDocs === 'unlimited' ? 'Unlimited' : `${remainingDocs} remaining`}
              </span>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Upload training documents</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX files supported</p>
              <Button variant="outline" size="sm" className="mt-3">
                Choose Files
              </Button>
            </div>
          </TabsContent>

          {/* Web Scraper Tab */}
          <TabsContent value="web" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Website URL</Label>
                <Input placeholder="https://yourblog.com" />
              </div>
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Globe className="w-4 h-4 mr-2" />
                Scrape Website Content
              </Button>
            </div>
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Mic className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Voice Training</p>
              <p className="text-xs text-muted-foreground mt-1">
                Record your voice to personalize AI responses
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Start Recording
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-muted-foreground text-center">
            You can add more training data anytime from the AI Training dashboard
          </p>
        </div>

        {!trained ? (
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
            onClick={handleStartTraining}
          >
            <Brain className="w-4 h-4 mr-2" />
            Start Training AI
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="w-full border-green-200 text-green-700 hover:bg-green-50"
            onClick={onComplete}
          >
            <Check className="w-4 h-4 mr-2" />
            Training Started — Continue
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AITrainingStep;
