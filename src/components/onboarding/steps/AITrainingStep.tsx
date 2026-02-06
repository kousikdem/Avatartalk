import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Globe, Mic, Plus, ArrowRight, Upload, HelpCircle } from 'lucide-react';
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

interface AITrainingStepProps {
  onComplete: () => void;
}

const AITrainingStep: React.FC<AITrainingStepProps> = ({ onComplete }) => {
  const { hasFeature } = usePlanFeatures();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('qa');

  // Q&A state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaPairs, setQaPairs] = useState<{ question: string; answer: string }[]>([]);

  const addQAPair = () => {
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;
    setQaPairs([...qaPairs, { question: qaQuestion, answer: qaAnswer }]);
    setQaQuestion('');
    setQaAnswer('');
    toast({ title: 'Q&A pair added', description: 'You can add more or continue.' });
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
                onClick={addQAPair}
                disabled={!qaQuestion.trim() || !qaAnswer.trim()}
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Q&A Pair
              </Button>
            </div>

            {qaPairs.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {qaPairs.map((pair, i) => (
                  <div key={i} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-slate-800">Q: {pair.question}</p>
                    <p className="text-sm text-slate-600 mt-1">A: {pair.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Upload training documents</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX files supported</p>
              <Button variant="outline" size="sm" className="mt-3">
                Choose Files
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Documents help your AI understand your expertise in depth
            </p>
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
              <p className="text-xs text-muted-foreground text-center">
                Extract content from your website to train your AI
              </p>
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

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={onComplete}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AITrainingStep;
