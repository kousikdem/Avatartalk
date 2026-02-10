import React, { useState, useEffect } from 'react';
import { Brain, FileText, Globe, Mic, Plus, Upload, HelpCircle, Trash2, Check, Link2, Tag, Square, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import PlanBadge from '@/components/PlanBadge';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useTrainingDocuments } from '@/hooks/useTrainingDocuments';
import { useWebTraining } from '@/hooks/useWebTraining';
import { useVoiceRecordings } from '@/hooks/useVoiceRecordings';
import { useVoiceCloning } from '@/hooks/useVoiceCloning';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

interface AITrainingStepProps {
  onComplete: () => void;
}

const AITrainingStep: React.FC<AITrainingStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { hasFeature, limits, getRemainingQAPairs, getRemainingDocuments, canAddQAPair } = usePlanFeatures();
  const { toast } = useToast();
  const { qaPairs: existingPairs, addQAPair: saveQAPair, deleteQAPair, isLoading: qaLoading } = useQAPairs();
  const { documents, fetchDocuments, uploadDocument, deleteDocument, isLoading: docsLoading } = useTrainingDocuments();
  const { webData, fetchWebData, scrapeUrl, deleteWebData, isScraping } = useWebTraining();
  const { recordings, fetchRecordings, startNewRecording, stopCurrentRecording, uploadVoiceFile, deleteRecording, isRecording, recordingDuration, formatDuration } = useVoiceRecordings();
  const { startVoiceCloning, isCloning } = useVoiceCloning();

  const [activeTab, setActiveTab] = useState('qa');
  const [trained, setTrained] = useState(false);
  const [aiName, setAiName] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLink, setQaLink] = useState('');
  const [qaLinkLabel, setQaLinkLabel] = useState('');
  const [qaKeywords, setQaKeywords] = useState('');
  const [webUrl, setWebUrl] = useState('');

  const currentQACount = existingPairs?.length || 0;
  const remainingQA = getRemainingQAPairs(currentQACount);
  const currentDocCount = documents?.length || 0;
  const remainingDocs = getRemainingDocuments(currentDocCount);

  // Load all data on mount
  useEffect(() => {
    fetchDocuments();
    fetchWebData();
    fetchRecordings();
  }, [fetchDocuments, fetchWebData, fetchRecordings]);

  // Load AI name
  useEffect(() => {
    if (!user) return;
    supabase.from('ai_training_settings').select('global_describe_text').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      // AI name could be stored separately or derived
    });
  }, [user]);

  const handleAddQAPair = async () => {
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;
    if (!canAddQAPair(currentQACount)) {
      toast({ title: 'Q&A limit reached', description: 'Upgrade your plan.', variant: 'destructive' });
      return;
    }
    try {
      const tags = qaKeywords.split(',').map(k => k.trim()).filter(Boolean);
      await saveQAPair({
        question: qaQuestion, answer: qaAnswer,
        custom_link_url: qaLink || undefined,
        custom_link_button_name: qaLinkLabel || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      setQaQuestion(''); setQaAnswer(''); setQaLink(''); setQaLinkLabel(''); setQaKeywords('');
    } catch { /* handled by hook */ }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file);
  };

  const handleScrape = async () => {
    if (!webUrl.trim()) return;
    try {
      await scrapeUrl(webUrl);
      setWebUrl('');
    } catch { /* handled by hook */ }
  };

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadVoiceFile(file);
  };

  const handleTrainVoice = async () => {
    if (recordings.length === 0) {
      toast({ title: 'No recordings', description: 'Record or upload voice first.', variant: 'destructive' });
      return;
    }
    try {
      await startVoiceCloning(recordings[0].file_path, {});
      toast({ title: 'Voice training started!' });
    } catch { /* handled by hook */ }
  };

  const handleStartTraining = () => {
    setTrained(true);
    toast({ title: 'AI Training started!', description: 'Your AI is learning from your data.' });
  };

  const canWebScrape = hasFeature('ai_webscraper_enabled');
  const canVoiceTrain = hasFeature('ai_voice_training_enabled');

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* AI Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-500" /> AI Assistant Name
          </Label>
          <Input placeholder="e.g., Alex's AI" value={aiName} onChange={(e) => setAiName(e.target.value)} className="h-9" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            <TabsTrigger value="qa" className="text-xs"><HelpCircle className="w-3 h-3 mr-1" />Q&A</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs"><FileText className="w-3 h-3 mr-1" />Docs</TabsTrigger>
            <TabsTrigger value="web" className="text-xs relative" disabled={!canWebScrape}>
              <Globe className="w-3 h-3 mr-1" />Web
              {!canWebScrape && <span className="absolute -top-1 -right-1"><PlanBadge planKey="pro" size="sm" showIcon={false} /></span>}
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs relative" disabled={!canVoiceTrain}>
              <Mic className="w-3 h-3 mr-1" />Voice
              {!canVoiceTrain && <span className="absolute -top-1 -right-1"><PlanBadge planKey="pro" size="sm" showIcon={false} /></span>}
            </TabsTrigger>
          </TabsList>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">{currentQACount} / {limits.qa_pairs === -1 ? '∞' : limits.qa_pairs} Q&A</Badge>
              <span className="text-[10px] text-muted-foreground">{remainingQA === 'unlimited' ? 'Unlimited' : `${remainingQA} remaining`}</span>
            </div>
            <div className="space-y-2.5 bg-slate-50/80 rounded-xl p-3 border border-slate-200">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Question *</Label>
                <Input placeholder="e.g., What services do you offer?" value={qaQuestion} onChange={(e) => setQaQuestion(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Answer *</Label>
                <Textarea placeholder="Your answer..." value={qaAnswer} onChange={(e) => setQaAnswer(e.target.value)} rows={2} className="resize-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium flex items-center gap-1"><Link2 className="w-3 h-3 text-blue-500" /> Link URL</Label>
                  <Input placeholder="https://..." value={qaLink} onChange={(e) => setQaLink(e.target.value)} className="h-7 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Button Label</Label>
                  <Input placeholder="Learn More" value={qaLinkLabel} onChange={(e) => setQaLinkLabel(e.target.value)} className="h-7 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium flex items-center gap-1"><Tag className="w-3 h-3 text-orange-500" /> Keywords</Label>
                <Input placeholder="pricing, services (comma-separated)" value={qaKeywords} onChange={(e) => setQaKeywords(e.target.value)} className="h-7 text-xs" />
              </div>
              <Button type="button" onClick={handleAddQAPair} disabled={!qaQuestion.trim() || !qaAnswer.trim() || qaLoading}
                className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Q&A Pair
              </Button>
            </div>
            {existingPairs && existingPairs.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {existingPairs.map((pair: any) => (
                  <div key={pair.id} className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">Q: {pair.question}</p>
                      <p className="text-xs text-slate-600 truncate">A: {pair.answer}</p>
                      {pair.custom_link_url && <p className="text-[9px] text-blue-500 truncate">🔗 {pair.custom_link_button_name || pair.custom_link_url}</p>}
                      {pair.tags && pair.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {pair.tags.map((tag: string) => <span key={tag} className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{tag}</span>)}
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
              <Badge variant="outline" className="text-xs">{currentDocCount} / {limits.documents === -1 ? '∞' : limits.documents} docs</Badge>
              <span className="text-[10px] text-muted-foreground">{remainingDocs === 'unlimited' ? 'Unlimited' : `${remainingDocs} remaining`}</span>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors">
              <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">Upload Training Documents</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX supported</p>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="mt-2" disabled={docsLoading} asChild>
                  <span>{docsLoading ? 'Uploading...' : 'Choose Files'}</span>
                </Button>
                <input type="file" accept=".pdf,.txt,.docx,.doc" onChange={handleDocUpload} className="hidden" />
              </label>
            </div>
            {documents.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{doc.filename}</p>
                        <p className="text-[9px] text-muted-foreground">{doc.processing_status}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteDocument(doc.id, doc.file_path)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Web Scraping Tab */}
          <TabsContent value="web" className="space-y-3 mt-3">
            <div className="space-y-2 bg-slate-50/80 rounded-xl p-3 border border-slate-200">
              <Label className="text-xs font-medium">Website URL to Scrape</Label>
              <div className="flex gap-2">
                <Input placeholder="https://yourblog.com" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} className="h-8 text-sm" />
                <Button onClick={handleScrape} disabled={isScraping || !webUrl.trim()} size="sm" className="h-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
                  {isScraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                  <span className="ml-1 text-xs">Scrape</span>
                </Button>
              </div>
            </div>
            {webData.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {webData.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="w-4 h-4 text-green-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{item.url}</p>
                        <p className="text-[9px] text-muted-foreground">{item.scraping_status}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteWebData(item.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Record */}
              <div className="border rounded-xl p-3 text-center bg-slate-50/80">
                <Mic className="w-6 h-6 mx-auto text-red-500 mb-1" />
                <p className="text-xs font-medium">Record Voice</p>
                {isRecording ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-red-500 font-medium animate-pulse">● Recording {formatDuration(recordingDuration)}</p>
                    <Button size="sm" variant="destructive" className="h-7 text-xs w-full" onClick={stopCurrentRecording}>
                      <Square className="w-3 h-3 mr-1" /> Stop
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs w-full" onClick={startNewRecording}>
                    <Circle className="w-3 h-3 mr-1 text-red-500" /> Start
                  </Button>
                )}
              </div>
              {/* Upload */}
              <div className="border rounded-xl p-3 text-center bg-slate-50/80">
                <Upload className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                <p className="text-xs font-medium">Upload Voice</p>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-xs w-full" asChild>
                    <span>Choose File</span>
                  </Button>
                  <input type="file" accept="audio/*" onChange={handleVoiceUpload} className="hidden" />
                </label>
              </div>
            </div>

            {recordings.length > 0 && (
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {recordings.map(rec => (
                  <div key={rec.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mic className="w-3 h-3 text-purple-500 shrink-0" />
                      <p className="text-xs truncate">{rec.filename}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteRecording(rec.id, rec.file_path)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {recordings.length > 0 && (
              <Button onClick={handleTrainVoice} disabled={isCloning} className="w-full h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs">
                {isCloning ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Training Voice...</> : <><Brain className="w-3 h-3 mr-1" /> Train Personalized Voice</>}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        {!trained ? (
          <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
            onClick={() => { handleStartTraining(); onComplete(); }}>
            <Brain className="w-4 h-4 mr-2" /> Start Training & Continue
          </Button>
        ) : (
          <Button size="lg" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" onClick={onComplete}>
            <Check className="w-4 h-4 mr-2" /> Training Started — Continue
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AITrainingStep;
