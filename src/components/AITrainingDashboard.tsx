import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, Brain, Mic, FileText, Globe, Bot, Loader2, Plus, Trash2, 
  CheckCircle, AlertCircle, Link as LinkIcon, Play, Download, MessageCircle,
  BookOpen, HelpCircle, Sparkles, ExternalLink, Settings, Database, Lock, Crown
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
import TokenDisplay from "@/components/TokenDisplay";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

const AITrainingDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mainSection, setMainSection] = useState<'training' | 'settings'>('training');
  
  // Plan features
  const {
    effectivePlanKey,
    limits,
    canAddQAPair,
    canAddDocument,
    canAddWebScraper,
    getRemainingQAPairs,
    getRemainingDocuments,
    getRemainingWebScrapers,
    canUseAITopics,
    canUseAIFollowups,
    canUseAIVoiceTraining,
    canUseWebScraper,
    getRequiredPlanForFeature
  } = usePlanFeatures();
  
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
    tags: [] as string[],
    tagInput: '',
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
      await addQAPair({
        question: newQA.question,
        answer: newQA.answer,
        category: newQA.category,
        tags: newQA.tags,
        custom_link_url: newQA.custom_link_url,
        custom_link_button_name: newQA.custom_link_button_name
      });
      setNewQA({
        question: '',
        answer: '',
        category: '',
        tags: [],
        tagInput: '',
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

  // Keyword/Tag handlers
  const handleAddTag = useCallback(() => {
    const tag = newQA.tagInput.trim();
    if (tag && !newQA.tags.includes(tag)) {
      setNewQA(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  }, [newQA.tagInput, newQA.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setNewQA(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              AI Training Dashboard
            </h1>
            <p className="text-muted-foreground">
              Train your personalized AI with Q&A, documents, web data, and voice
            </p>
          </div>
          <TokenDisplay compact />
        </div>

        {/* Training Controls */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Model Training
            </CardTitle>
            <CardDescription>
              Configure and train your personalized AI model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="training-name">Training Name</Label>
              <Input
                id="training-name"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
                placeholder="e.g., My Custom AI v1"
              />
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

            <Button
              onClick={handleTrainAI}
              disabled={isTraining || !trainingName.trim()}
              className="w-full"
              size="lg"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Training AI...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Train AI Model
                </>
              )}
            </Button>

            {trainingStatus === 'completed' && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Training completed successfully!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Section Toggle */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={mainSection === 'training' ? 'default' : 'outline'}
            onClick={() => setMainSection('training')}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            AI Training Data
          </Button>
          <Button
            variant={mainSection === 'settings' ? 'default' : 'outline'}
            onClick={() => setMainSection('settings')}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            AI Settings & Performance
          </Button>
        </div>

        {/* AI Training Data Section */}
        {mainSection === 'training' && (
          <Tabs defaultValue="qa" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="qa">
                <FileText className="w-4 h-4 mr-2" />
                Q&A
              </TabsTrigger>
              <TabsTrigger value="documents">
                <Upload className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="web">
                <Globe className="w-4 h-4 mr-2" />
                Web Scraper
              </TabsTrigger>
              <TabsTrigger value="voice">
                <Mic className="w-4 h-4 mr-2" />
                Voice
              </TabsTrigger>
            </TabsList>

            {/* Q&A Tab */}
            <TabsContent value="qa" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Question & Answer Pairs</CardTitle>
                      <CardDescription>
                        Add Q&A pairs with keywords and custom link buttons for automated responses
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {qaPairs?.length || 0} / {limits.qa_pairs === -1 ? '∞' : limits.qa_pairs}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canAddQAPair(qaPairs?.length || 0) && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">Q&A limit reached</span>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                        Upgrade your plan to add more Q&A pairs.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/pricing')}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        value={newQA.question}
                        onChange={(e) => setNewQA({...newQA, question: e.target.value})}
                        placeholder="What is your question?"
                        disabled={!canAddQAPair(qaPairs?.length || 0)}
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
                        disabled={!canAddQAPair(qaPairs?.length || 0)}
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
                          disabled={!canAddQAPair(qaPairs?.length || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Keywords/Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newQA.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="flex items-center gap-1 px-2 py-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:text-destructive"
                                disabled={!canAddQAPair(qaPairs?.length || 0)}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="tags"
                            value={newQA.tagInput}
                            onChange={(e) => setNewQA({...newQA, tagInput: e.target.value})}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Type keyword and press Enter"
                            disabled={!canAddQAPair(qaPairs?.length || 0)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddTag}
                            disabled={!newQA.tagInput.trim() || !canAddQAPair(qaPairs?.length || 0)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2">
                      Add multiple keywords to help match visitor questions to this Q&A for automatic responses.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="link-url">Link URL (Optional)</Label>
                        <Input
                          id="link-url"
                          value={newQA.custom_link_url}
                          onChange={(e) => setNewQA({...newQA, custom_link_url: e.target.value})}
                          placeholder="https://example.com"
                          disabled={!canAddQAPair(qaPairs?.length || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="link-button">Button Text</Label>
                        <Input
                          id="link-button"
                          value={newQA.custom_link_button_name}
                          onChange={(e) => setNewQA({...newQA, custom_link_button_name: e.target.value})}
                          placeholder="e.g., Learn More"
                          disabled={!canAddQAPair(qaPairs?.length || 0)}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddQA} 
                      disabled={isQALoading || !canAddQAPair(qaPairs?.length || 0)}
                    >
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
                            <div className="flex flex-wrap gap-1 mt-2">
                              {qa.category && (
                                <Badge variant="outline">{qa.category}</Badge>
                              )}
                              {qa.tags && qa.tags.length > 0 && qa.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {qa.custom_link_url && (
                              <Button
                                variant="default"
                                size="sm"
                                className="mt-2 gap-2"
                                onClick={() => window.open(qa.custom_link_url!, '_blank', 'noopener,noreferrer')}
                              >
                                {qa.custom_link_button_name || 'Learn More'}
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
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Training Documents</CardTitle>
                      <CardDescription>
                        Upload documents (PDF, TXT, DOC, etc.) to train your AI
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {documents?.length || 0} / {limits.documents === -1 ? '∞' : limits.documents}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canAddDocument(documents?.length || 0) && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">Document limit reached</span>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                        Upgrade your plan to upload more documents.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/pricing')}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.doc,.docx,.md,.csv"
                      onChange={(e) => handleDocumentUpload(e.target.files)}
                      className="flex-1"
                      disabled={!canAddDocument(documents?.length || 0)}
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
            <TabsContent value="web">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Web Data Scraper
                        {!canUseWebScraper && (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Pro+
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Extract content from web pages to train your AI
                      </CardDescription>
                    </div>
                    {canUseWebScraper && (
                      <Badge variant="outline" className="text-sm">
                        {webData?.length || 0} / {limits.web_scraper === -1 ? '∞' : limits.web_scraper}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canUseWebScraper ? (
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg text-center">
                      <Lock className="w-8 h-8 mx-auto text-purple-500 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Web Scraper - Pro Feature</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upgrade to Pro to scrape web content for AI training.
                      </p>
                      <Button onClick={() => navigate('/pricing')}>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  ) : (
                    <>
                      {!canAddWebScraper(webData?.length || 0) && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <Lock className="w-4 h-4" />
                            <span className="font-medium">Web scraper limit reached</span>
                          </div>
                          <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                            Upgrade to Business for more web scraping capacity.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => navigate('/pricing')}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade Plan
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        <Input
                          value={urlToScrape}
                          onChange={(e) => setUrlToScrape(e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1"
                          disabled={!canAddWebScraper(webData?.length || 0)}
                        />
                        <Button 
                          onClick={handleWebScrape} 
                          disabled={isScraping || !canAddWebScraper(webData?.length || 0)}
                        >
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
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Tab */}
            <TabsContent value="voice">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Voice Training
                    {!canUseAIVoiceTraining && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Pro+
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Upload voice recordings to train custom voice responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canUseAIVoiceTraining ? (
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg text-center">
                      <Mic className="w-8 h-8 mx-auto text-purple-500 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Voice Training - Pro Feature</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upgrade to Pro to train your AI with custom voice responses.
                      </p>
                      <Button onClick={() => navigate('/pricing')}>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* AI Settings & Performance Section */}
        {mainSection === 'settings' && (
          <Tabs defaultValue="perspective" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="perspective">
                <Sparkles className="w-4 h-4 mr-2" />
                Perspective
              </TabsTrigger>
              <TabsTrigger value="welcome">
                <MessageCircle className="w-4 h-4 mr-2" />
                Welcome
              </TabsTrigger>
              <TabsTrigger value="topics" className="relative">
                <BookOpen className="w-4 h-4 mr-2" />
                Topics
                {!canUseAITopics && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
              </TabsTrigger>
              <TabsTrigger value="followups" className="relative">
                <HelpCircle className="w-4 h-4 mr-2" />
                Follow-ups
                {!canUseAIFollowups && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
              </TabsTrigger>
            </TabsList>

            {/* AI Response Perspective Tab */}
            <TabsContent value="perspective" className="space-y-4">
              {aiSettings && (
                <AIResponsePerspective
                  settings={aiSettings}
                  onSave={saveSettings}
                  isSaving={isSettingsSaving}
                />
              )}
            </TabsContent>

            {/* Welcome Message Tab */}
            <TabsContent value="welcome" className="space-y-4">
              {aiSettings && (
                <WelcomeMessageSettingsComponent
                  settings={aiSettings.welcomeMessage}
                  onSave={(welcomeMessage) => saveSettings({ welcomeMessage })}
                  isSaving={isSettingsSaving}
                />
              )}
            </TabsContent>

            {/* Topics Tab */}
            <TabsContent value="topics" className="space-y-4">
              {!canUseAITopics ? (
                <Card className="p-6 text-center">
                  <BookOpen className="w-10 h-10 mx-auto text-purple-500 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">AI Topics - Creator Feature</h3>
                  <p className="text-muted-foreground mb-4">
                    Create custom topic rules to guide your AI's responses.
                  </p>
                  <Badge variant="secondary" className="mb-4 gap-1">
                    <Lock className="w-3 h-3" />
                    Available from Creator plan
                  </Badge>
                  <div>
                    <Button onClick={() => navigate('/pricing')}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Creator
                    </Button>
                  </div>
                </Card>
              ) : (
                <TopicRulesPanel
                  topics={topics}
                  onAdd={addTopic}
                  onUpdate={updateTopic}
                  onDelete={deleteTopic}
                  isLoading={isSettingsLoading}
                />
              )}
            </TabsContent>

            {/* Follow-ups Tab */}
            <TabsContent value="followups" className="space-y-4">
              {!canUseAIFollowups ? (
                <Card className="p-6 text-center">
                  <HelpCircle className="w-10 h-10 mx-auto text-purple-500 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">Follow-up Questions - Pro Feature</h3>
                  <p className="text-muted-foreground mb-4">
                    Create intelligent follow-up questions to engage your visitors.
                  </p>
                  <Badge variant="secondary" className="mb-4 gap-1">
                    <Lock className="w-3 h-3" />
                    Available from Pro plan
                  </Badge>
                  <div>
                    <Button onClick={() => navigate('/pricing')}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                </Card>
              ) : (
                <FollowUpQuestionsPanel
                  followUps={followUps}
                  topics={topics}
                  onAdd={addFollowUp}
                  onUpdate={updateFollowUp}
                  onDelete={deleteFollowUp}
                  isLoading={isSettingsLoading}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AITrainingDashboard;
