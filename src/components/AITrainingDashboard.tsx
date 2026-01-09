import React, { useState, useCallback, useEffect } from 'react';
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
  BookOpen, HelpCircle, Sparkles, ExternalLink, Settings, Database
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

const AITrainingDashboard = () => {
  const { toast } = useToast();
  const [mainSection, setMainSection] = useState<'training' | 'settings'>('training');
  
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
    tags: '' as string,
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
      // Convert comma-separated tags string to array
      const tagsArray = newQA.tags
        ? newQA.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];
      
      await addQAPair({
        ...newQA,
        tags: tagsArray
      });
      setNewQA({
        question: '',
        answer: '',
        category: '',
        tags: '',
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
                      <Label htmlFor="tags">Keywords/Tags (Optional)</Label>
                      <Input
                        id="tags"
                        value={newQA.tags}
                        onChange={(e) => setNewQA({...newQA, tags: e.target.value})}
                        placeholder="e.g., pricing, support, features (comma separated)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        When visitors ask questions containing these keywords, this Q&A will be used to respond.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="link-url">Link URL (Optional)</Label>
                        <Input
                          id="link-url"
                          value={newQA.custom_link_url}
                          onChange={(e) => setNewQA({...newQA, custom_link_url: e.target.value})}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="link-button">Link Button Name</Label>
                        <Input
                          id="link-button-2"
                          value={newQA.custom_link_button_name}
                          onChange={(e) => setNewQA({...newQA, custom_link_button_name: e.target.value})}
                          placeholder="e.g., Learn More"
                        />
                      </div>
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
            <TabsContent value="documents">
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
            <TabsContent value="web">
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
            <TabsContent value="voice">
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
              <TabsTrigger value="topics">
                <BookOpen className="w-4 h-4 mr-2" />
                Topics
              </TabsTrigger>
              <TabsTrigger value="followups">
                <HelpCircle className="w-4 h-4 mr-2" />
                Follow-ups
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
              <TopicRulesPanel
                topics={topics}
                onAdd={addTopic}
                onUpdate={updateTopic}
                onDelete={deleteTopic}
                isLoading={isSettingsLoading}
              />
            </TabsContent>

            {/* Follow-ups Tab */}
            <TabsContent value="followups" className="space-y-4">
              <FollowUpQuestionsPanel
                followUps={followUps}
                topics={topics}
                onAdd={addFollowUp}
                onUpdate={updateFollowUp}
                onDelete={deleteFollowUp}
                isLoading={isSettingsLoading}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AITrainingDashboard;
