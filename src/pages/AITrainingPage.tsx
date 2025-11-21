import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, Brain, Mic, FileText, Database, Bot, Loader2, 
  Plus, Trash2, Link as LinkIcon, Globe, CheckCircle, 
  AlertCircle, X, Save
} from "lucide-react";

import { usePersonalizedAI } from "@/hooks/usePersonalizedAI";
import { useVoiceCloning } from "@/hooks/useVoiceCloning";
import { useTrainingDocuments } from "@/hooks/useTrainingDocuments";
import { useQAPairs } from "@/hooks/useQAPairs";
import { useVoiceRecordings } from "@/hooks/useVoiceRecordings";
import { useWebScraper } from "@/hooks/useWebScraper";

const AITrainingPage = () => {
  const { toast } = useToast();
  
  const {
    trainings,
    isLoading: isAiLoading,
    isTraining,
    createTraining,
    trainModel,
    fetchTrainings,
    saveDraft
  } = usePersonalizedAI();

  const {
    clonings,
    isLoading: isVoiceLoading,
    isCloning,
    startVoiceCloning,
    fetchClonedVoices
  } = useVoiceCloning();

  const { 
    documents, 
    isLoading: isDocumentsLoading,
    uploadProgress: documentUploadProgress,
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
    uploadVoiceFile, 
    deleteRecording,
    fetchRecordings
  } = useVoiceRecordings();
  
  const {
    scrapedData,
    isLoading: isScraperLoading,
    fetchScrapedData,
    scrapeUrl,
    deleteScrapedData
  } = useWebScraper();

  // State
  const [trainingName, setTrainingName] = useState('');
  const [personalitySettings, setPersonalitySettings] = useState({
    formality: 50,
    verbosity: 50,
    friendliness: 80,
    mode: 'adaptive' as 'human' | 'robot' | 'adaptive',
    behavior_learning: true
  });

  const [newQAPair, setNewQAPair] = useState({
    question: '',
    answer: '',
    category: '',
    tags: [] as string[],
    customLink: '',
    customLinkButtonName: '',
    keywords: [] as string[]
  });
  
  const [newKeyword, setNewKeyword] = useState('');
  const [newTag, setNewTag] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [selectedVoiceFile, setSelectedVoiceFile] = useState<File | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<FileList | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchQAPairs();
    fetchRecordings();
    fetchScrapedData();
    fetchTrainings();
    fetchClonedVoices();
  }, []);

  const handleAddQAPair = async () => {
    if (!newQAPair.question || !newQAPair.answer) {
      toast({
        title: "Error",
        description: "Question and answer are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await addQAPair({
        question: newQAPair.question,
        answer: newQAPair.answer,
        category: newQAPair.category || 'general',
        tags: newQAPair.tags,
        custom_link_url: newQAPair.customLink,
        custom_link_button_name: newQAPair.customLinkButtonName
      });
      
      setNewQAPair({
        question: '',
        answer: '',
        category: '',
        tags: [],
        customLink: '',
        customLinkButtonName: '',
        keywords: []
      });
      
      toast({
        title: "Success",
        description: "Q&A pair added successfully",
      });
    } catch (error) {
      console.error('Error adding Q&A pair:', error);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setNewQAPair(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setNewQAPair(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      try {
        await uploadDocument(files[i]);
      } catch (error) {
        console.error(`Error uploading ${files[i].name}:`, error);
      }
    }
  };

  const handleScrapeUrl = async () => {
    if (!webUrl) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    try {
      await scrapeUrl(webUrl);
      setWebUrl('');
    } catch (error) {
      console.error('Error scraping URL:', error);
    }
  };

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadVoiceFile(file);
    } catch (error) {
      console.error('Error uploading voice file:', error);
    }
  };

  const handleStartTraining = async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a training name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTraining({
        name: trainingName,
        documents: documents.map(d => d.id),
        qaPairs: qaPairs.map(q => q.id),
        voiceRecordings: recordings.map(r => r.id)
      }, personalitySettings);
      
      toast({
        title: "Success",
        description: "AI training started successfully with Mixtral 8x7B",
      });
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Training Dashboard</h1>
          <p className="text-muted-foreground">
            Train your personalized AI using Mixtral 8x7B, Scikit-learn ML, and Large Language Models
          </p>
        </div>
        <Button onClick={handleStartTraining} disabled={isTraining || isAiLoading}>
          {isTraining ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Training...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Start Training
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training Configuration</CardTitle>
          <CardDescription>Configure your AI's personality and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="trainingName">Training Name</Label>
            <Input
              id="trainingName"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              placeholder="e.g., Customer Support Bot"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Formality Level: {personalitySettings.formality}%</Label>
              <Slider
                value={[personalitySettings.formality]}
                onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, formality: value }))}
                max={100}
                step={1}
              />
            </div>

            <div>
              <Label>Response Length: {personalitySettings.verbosity}%</Label>
              <Slider
                value={[personalitySettings.verbosity]}
                onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, verbosity: value }))}
                max={100}
                step={1}
              />
            </div>

            <div>
              <Label>Friendliness: {personalitySettings.friendliness}%</Label>
              <Slider
                value={[personalitySettings.friendliness]}
                onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, friendliness: value }))}
                max={100}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Continuous Learning</Label>
              <Switch
                checked={personalitySettings.behavior_learning}
                onCheckedChange={(checked) => setPersonalitySettings(prev => ({ ...prev, behavior_learning: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="qa" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="qa">
            <FileText className="w-4 h-4 mr-2" />
            Q&A Training
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
            Voice Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Q&A Pair</CardTitle>
              <CardDescription>Train your AI with question-answer pairs and keywords for automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={newQAPair.question}
                  onChange={(e) => setNewQAPair(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="What is your question?"
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={newQAPair.answer}
                  onChange={(e) => setNewQAPair(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Provide the answer..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="customLink">Custom Link (Optional)</Label>
                <Input
                  id="customLink"
                  value={newQAPair.customLink}
                  onChange={(e) => setNewQAPair(prev => ({ ...prev, customLink: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="customLinkButtonName">Custom Button Name (Optional)</Label>
                <Input
                  id="customLinkButtonName"
                  value={newQAPair.customLinkButtonName}
                  onChange={(e) => setNewQAPair(prev => ({ ...prev, customLinkButtonName: e.target.value }))}
                  placeholder="e.g., Learn More, Visit Website"
                />
              </div>

              <div>
                <Label>Keywords for Auto-Reply</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  />
                  <Button onClick={handleAddKeyword} type="button" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newQAPair.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary">
                      {keyword}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => setNewQAPair(prev => ({
                          ...prev,
                          keywords: prev.keywords.filter((_, idx) => idx !== i)
                        }))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Category & Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newQAPair.category}
                    onChange={(e) => setNewQAPair(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Category"
                    className="flex-1"
                  />
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1"
                  />
                  <Button onClick={handleAddTag} type="button" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newQAPair.tags.map((tag, i) => (
                    <Badge key={i}>
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => setNewQAPair(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, idx) => idx !== i)
                        }))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddQAPair} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Q&A Pair
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Q&A Pairs ({qaPairs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isQALoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : qaPairs.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">No Q&A pairs yet</p>
                ) : (
                  qaPairs.map((qa) => (
                    <div key={qa.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{qa.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">{qa.answer}</p>
                          {qa.category && (
                            <Badge variant="outline" className="mt-2">{qa.category}</Badge>
                          )}
                          {qa.tags && qa.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {qa.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                           {qa.custom_link_url && (
                            <div className="mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(qa.custom_link_url, '_blank')}
                                className="gap-1"
                              >
                                <LinkIcon className="w-3 h-3" />
                                {qa.custom_link_button_name || 'Visit Link'}
                              </Button>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQAPair(qa.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Training Documents</CardTitle>
              <CardDescription>Upload PDF, DOCX, TXT, or any document type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="documents">Select Documents</Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                />
              </div>
              {documentUploadProgress > 0 && documentUploadProgress < 100 && (
                <Progress value={documentUploadProgress} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isDocumentsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">No documents uploaded yet</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {(doc.file_size / 1024).toFixed(2)} KB • {doc.processing_status}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(doc.id, doc.file_path)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Data Scraper</CardTitle>
              <CardDescription>Scrape content from any URL to train your AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyPress={(e) => e.key === 'Enter' && handleScrapeUrl()}
                />
                <Button onClick={handleScrapeUrl} disabled={isScraperLoading}>
                  {isScraperLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scraped URLs ({scrapedData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isScraperLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : scrapedData.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">No URLs scraped yet</p>
                ) : (
                  scrapedData.map((data) => (
                    <div key={data.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{data.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{data.url}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteScrapedData(data.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Training</CardTitle>
              <CardDescription>Upload audio files to train your personalized voice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="voiceFile">Upload Audio File</Label>
                <Input
                  id="voiceFile"
                  type="file"
                  onChange={handleVoiceUpload}
                  accept="audio/*"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Recordings ({recordings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isRecordingsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : recordings.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">No voice recordings yet</p>
                ) : (
                  recordings.map((recording) => (
                    <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mic className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{recording.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {recording.duration ? `${recording.duration}s` : 'Unknown duration'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecording(recording.id, recording.file_path)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {trainings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trainings.map((training) => (
                <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{training.training_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {training.model_status} • Progress: {training.training_progress}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={training.model_status === 'completed' ? 'default' : 'secondary'}>
                    {training.model_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AITrainingPage;
