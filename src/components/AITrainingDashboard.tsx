import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, Brain, Mic, FileText, Globe, Bot, Loader2, Plus, Trash2, 
  CheckCircle, AlertCircle, Link as LinkIcon, Play, Download, MessageCircle,
  BookOpen, HelpCircle, Sparkles, ExternalLink, Settings, ChevronRight
} from "lucide-react";

import { usePersonalizedAI } from "@/hooks/usePersonalizedAI";
import { useTrainingDocuments } from "@/hooks/useTrainingDocuments";
import { useQAPairs } from "@/hooks/useQAPairs";
import { useVoiceRecordings } from "@/hooks/useVoiceRecordings";
import { useWebTraining } from "@/hooks/useWebTraining";
import { useAITrainingSettings } from "@/hooks/useAITrainingSettings";
import { WelcomeMessageSettingsComponent } from "@/components/ai-training/WelcomeMessageSettings";
import { TopicRulesPanel } from "@/components/ai-training/TopicRulesPanel";
import { FollowUpQuestionsPanel } from "@/components/ai-training/FollowUpQuestionsPanel";
import { AIResponsePerspective } from "@/components/ai-training/AIResponsePerspective";
import { cn } from "@/lib/utils";

type SettingsTab = 'perspective' | 'welcome' | 'topics' | 'followups';

const AITrainingDashboard = () => {
  const { toast } = useToast();
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('perspective');
  
  const {
    trainings,
    isLoading: isAiLoading,
    isTraining,
    createTraining,
    trainModel,
    fetchTrainings
  } = usePersonalizedAI();

  const { 
    documents, 
    isLoading: isDocumentsLoading,
    uploadProgress,
    fetchDocuments, 
    uploadDocument, 
    deleteDocument 
  } = useTrainingDocuments();
  
  const { 
    qaPairs, 
    isLoading: isQALoading,
    fetchQAPairs, 
    addQAPair, 
    updateQAPair, 
    deleteQAPair 
  } = useQAPairs();
  
  const { 
    recordings, 
    isLoading: isRecordingsLoading,
    fetchRecordings, 
    uploadVoiceFile, 
    deleteRecording
  } = useVoiceRecordings();

  const {
    webData,
    isLoading: isWebLoading,
    isScraping,
    fetchWebData,
    scrapeUrl,
    deleteWebData
  } = useWebTraining();

  const {
    settings: aiSettings,
    topics,
    followUps,
    isLoading: isSettingsLoading,
    isSaving: isSettingsSaving,
    saveSettings,
    addTopic,
    updateTopic,
    deleteTopic,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp
  } = useAITrainingSettings();

  // Local state
  const [trainingName, setTrainingName] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  
  // Q&A state
  const [newQA, setNewQA] = useState({
    question: '',
    answer: '',
    category: '',
    custom_link_url: '',
    custom_link_button_name: ''
  });

  // Web scraping state
  const [urlToScrape, setUrlToScrape] = useState('');

  // Load data on mount
  useEffect(() => {
    fetchDocuments();
    fetchQAPairs();
    fetchRecordings();
    fetchWebData();
    fetchTrainings();
  }, []);

  // Train AI Model
  const handleTrainAI = useCallback(async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Training Name Required",
        description: "Please enter a name for your AI training",
        variant: "destructive"
      });
      return;
    }

    try {
      setTrainingStatus('processing');
      setTrainingProgress(0);

      const trainingData = {
        name: trainingName,
        qaPairs: qaPairs || [],
        documents: documents || [],
        webData: webData || [],
        voiceRecordings: recordings || []
      };

      setTrainingProgress(20);
      const training = await createTraining(trainingData, {
        formality: 50,
        verbosity: 70,
        friendliness: 80,
        mode: 'adaptive' as 'human' | 'robot' | 'adaptive',
        behavior_learning: true
      });

      setTrainingProgress(50);
      await trainModel(training.id);

      setTrainingProgress(100);
      setTrainingStatus('completed');

      toast({
        title: "AI Training Completed",
        description: "Your personalized AI has been trained successfully!",
      });

    } catch (error: any) {
      console.error('AI Training failed:', error);
      setTrainingStatus('error');
      toast({
        title: "Training Failed",
        description: error?.message || "Failed to train AI model",
        variant: "destructive"
      });
    }
  }, [trainingName, qaPairs, documents, webData, recordings, createTraining, trainModel, toast]);

  // Q&A handlers
  const handleAddQA = useCallback(async () => {
    if (!newQA.question.trim() || !newQA.answer.trim()) {
      toast({
        title: "Invalid Q&A",
        description: "Both question and answer are required",
        variant: "destructive"
      });
      return;
    }

    try {
      await addQAPair(newQA);
      setNewQA({
        question: '',
        answer: '',
        category: '',
        custom_link_url: '',
        custom_link_button_name: ''
      });
      toast({
        title: "Q&A Added",
        description: "Question and answer pair added successfully",
      });
    } catch (error) {
      console.error('Failed to add Q&A:', error);
    }
  }, [newQA, addQAPair, toast]);

  // Document upload
  const handleDocumentUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(file => uploadDocument(file));
      await Promise.all(uploadPromises);
      
      toast({
        title: "Documents Uploaded",
        description: `Successfully uploaded ${files.length} document(s)`,
      });
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  }, [uploadDocument, toast]);

  // Voice file upload
  const handleVoiceUpload = useCallback(async (file: File) => {
    try {
      await uploadVoiceFile(file);
      toast({
        title: "Voice File Uploaded",
        description: "Voice file uploaded successfully for training",
      });
    } catch (error) {
      console.error('Voice upload failed:', error);
    }
  }, [uploadVoiceFile, toast]);

  // Web scraping
  const handleWebScrape = useCallback(async () => {
    if (!urlToScrape.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scrape",
        variant: "destructive"
      });
      return;
    }

    try {
      await scrapeUrl(urlToScrape);
      setUrlToScrape('');
      toast({
        title: "Web Scraping Started",
        description: "Content is being extracted from the URL",
      });
    } catch (error) {
      console.error('Web scraping failed:', error);
    }
  }, [urlToScrape, scrapeUrl, toast]);

  const settingsMenuItems = [
    { id: 'perspective' as SettingsTab, label: 'Perspective', icon: Sparkles, description: 'How AI speaks' },
    { id: 'welcome' as SettingsTab, label: 'Welcome', icon: MessageCircle, description: 'Greeting message' },
    { id: 'topics' as SettingsTab, label: 'Topics', icon: BookOpen, description: 'Topic rules' },
    { id: 'followups' as SettingsTab, label: 'Follow-ups', icon: HelpCircle, description: 'Engagement questions' },
  ];

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'perspective':
        return aiSettings && (
          <AIResponsePerspective
            settings={aiSettings}
            onSave={saveSettings}
            isSaving={isSettingsSaving}
          />
        );
      case 'welcome':
        return aiSettings && (
          <WelcomeMessageSettingsComponent
            settings={aiSettings.welcomeMessage}
            onSave={(welcomeMessage) => saveSettings({ welcomeMessage })}
            isSaving={isSettingsSaving}
          />
        );
      case 'topics':
        return (
          <TopicRulesPanel
            topics={topics}
            onAdd={addTopic}
            onUpdate={updateTopic}
            onDelete={deleteTopic}
            isLoading={isSettingsLoading}
          />
        );
      case 'followups':
        return (
          <FollowUpQuestionsPanel
            followUps={followUps}
            topics={topics}
            onAdd={addFollowUp}
            onUpdate={updateFollowUp}
            onDelete={deleteFollowUp}
            isLoading={isSettingsLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - AI Settings */}
        <div className="w-72 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              AI Settings
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure how your AI responds
            </p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {settingsMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSettingsTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    activeSettingsTab === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs opacity-70 truncate">{item.description}</p>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 shrink-0 transition-transform",
                    activeSettingsTab === item.id && "rotate-90"
                  )} />
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Settings Content */}
          <div className="flex-1 border-t border-border overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {renderSettingsContent()}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Content - Training Data */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card/30">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Training Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Train your personalized AI with Q&A, documents, web data, and voice
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Training Controls */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Model Training
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        value={trainingName}
                        onChange={(e) => setTrainingName(e.target.value)}
                        placeholder="Training name (e.g., My Custom AI v1)"
                      />
                    </div>
                    <Button
                      onClick={handleTrainAI}
                      disabled={isTraining || !trainingName.trim()}
                    >
                      {isTraining ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Training...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Train AI
                        </>
                      )}
                    </Button>
                  </div>

                  {trainingProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Training Progress</span>
                        <span>{trainingProgress}%</span>
                      </div>
                      <Progress value={trainingProgress} />
                    </div>
                  )}

                  {trainingStatus === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Training completed successfully!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Training Data Tabs */}
              <Tabs defaultValue="qa" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="qa" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Q&A
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="web" className="gap-2">
                    <Globe className="w-4 h-4" />
                    Web Scraper
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="gap-2">
                    <Mic className="w-4 h-4" />
                    Voice
                  </TabsTrigger>
                </TabsList>

                {/* Q&A Tab */}
                <TabsContent value="qa" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Question & Answer Pairs</CardTitle>
                      <CardDescription>
                        Add Q&A pairs with optional custom link buttons for automated responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="question">Question</Label>
                          <Input
                            id="question"
                            value={newQA.question}
                            onChange={(e) => setNewQA({...newQA, question: e.target.value})}
                            placeholder="What is your question?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="answer">Answer</Label>
                          <Textarea
                            id="answer"
                            value={newQA.answer}
                            onChange={(e) => setNewQA({...newQA, answer: e.target.value})}
                            placeholder="Provide the answer..."
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category (Optional)</Label>
                            <Input
                              id="category"
                              value={newQA.category}
                              onChange={(e) => setNewQA({...newQA, category: e.target.value})}
                              placeholder="e.g., General, Support"
                            />
                          </div>
                          <div>
                            <Label htmlFor="link-button">Link Button Name (Optional)</Label>
                            <Input
                              id="link-button"
                              value={newQA.custom_link_button_name}
                              onChange={(e) => setNewQA({...newQA, custom_link_button_name: e.target.value})}
                              placeholder="e.g., Learn More, Sign Up"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="link-url">Link URL (Optional)</Label>
                          <Input
                            id="link-url"
                            value={newQA.custom_link_url}
                            onChange={(e) => setNewQA({...newQA, custom_link_url: e.target.value})}
                            placeholder="https://example.com"
                          />
                        </div>
                        <Button onClick={handleAddQA} disabled={isQALoading}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Q&A Pair
                        </Button>
                      </div>

                      {/* Q&A List */}
                      <div className="space-y-2 mt-4">
                        {qaPairs?.map((qa) => (
                          <Card key={qa.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{qa.question}</p>
                                <p className="text-sm text-muted-foreground mt-1">{qa.answer}</p>
                                {qa.category && (
                                  <Badge variant="outline" className="mt-2">{qa.category}</Badge>
                                )}
                                {qa.custom_link_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 gap-2"
                                    onClick={() => window.open(qa.custom_link_url!, '_blank', 'noopener,noreferrer')}
                                  >
                                    {qa.custom_link_button_name || 'View Link'}
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteQAPair(qa.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Training Documents</CardTitle>
                      <CardDescription>
                        Upload documents (PDF, TXT, DOC, etc.) to train your AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.txt,.doc,.docx,.md,.csv"
                          onChange={(e) => handleDocumentUpload(e.target.files)}
                          className="flex-1"
                        />
                      </div>

                      {uploadProgress > 0 && (
                        <Progress value={uploadProgress} />
                      )}

                      <div className="grid gap-2">
                        {documents?.map((doc) => (
                          <Card key={doc.id} className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">{doc.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.file_size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocument(doc.id, doc.file_path)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Web Scraper Tab */}
                <TabsContent value="web" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Web Data Scraper</CardTitle>
                      <CardDescription>
                        Extract content from web pages to train your AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <Input
                          value={urlToScrape}
                          onChange={(e) => setUrlToScrape(e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1"
                        />
                        <Button onClick={handleWebScrape} disabled={isScraping}>
                          {isScraping ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="grid gap-2">
                        {webData?.map((data) => (
                          <Card key={data.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm truncate">{data.url}</p>
                                <Badge variant={
                                  data.scraping_status === 'completed' ? 'default' :
                                  data.scraping_status === 'processing' ? 'secondary' : 'destructive'
                                } className="mt-1">
                                  {data.scraping_status}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteWebData(data.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Voice Tab */}
                <TabsContent value="voice" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Voice Training</CardTitle>
                      <CardDescription>
                        Upload voice recordings to train custom voice responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => e.target.files?.[0] && handleVoiceUpload(e.target.files[0])}
                        />
                      </div>

                      <div className="grid gap-2">
                        {recordings?.map((recording) => (
                          <Card key={recording.id} className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">{recording.filename}</p>
                                {recording.transcription && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {recording.transcription.substring(0, 100)}...
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRecording(recording.id, recording.file_path)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AITrainingDashboard;
