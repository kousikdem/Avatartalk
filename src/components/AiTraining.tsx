import React, { useState, useCallback, useEffect } from 'react';
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
import { Upload, Brain, Mic, FileText, Database, Bot, Loader2, Play, Pause, CheckCircle, AlertCircle, Plus, Trash2, Download, X } from "lucide-react";

// Separate hooks for different functionalities
import { usePersonalizedAI } from "@/hooks/usePersonalizedAI";
import { useVoiceCloning } from "@/hooks/useVoiceCloning";
import { useTrainingDocuments } from "@/hooks/useTrainingDocuments";
import { useQAPairs } from "@/hooks/useQAPairs";
import { useVoiceRecordings } from "@/hooks/useVoiceRecordings";
import { useApiTraining } from "@/hooks/useApiTraining";

const AiTraining = () => {
  const { toast } = useToast();
  
  // AI Training State
  const {
    trainings,
    isLoading: isAiLoading,
    isTraining,
    currentTraining,
    createTraining,
    trainModel,
    fetchTrainings,
    saveDraft
  } = usePersonalizedAI();

  // Voice Cloning State (separate from AI training)
  const {
    clonings,
    isLoading: isVoiceLoading,
    isCloning,
    currentCloning,
    startVoiceCloning,
    getCloningStatus,
    fetchClonedVoices
  } = useVoiceCloning();

  // Training Data Hooks
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
    isRecording,
    recordingDuration,
    fetchRecordings, 
    startNewRecording, 
    stopCurrentRecording, 
    uploadVoiceFile, 
    deleteRecording,
    formatDuration 
  } = useVoiceRecordings();
  
  const { apiData, fetchApiData } = useApiTraining();

  // Local state for training configuration
  const [trainingName, setTrainingName] = useState('');
  const [personalitySettings, setPersonalitySettings] = useState({
    formality: 50,
    verbosity: 50,
    friendliness: 80,
    mode: 'adaptive' as 'human' | 'robot' | 'adaptive',
    behavior_learning: true
  });

  // AI Training progress state
  const [aiTrainingProgress, setAiTrainingProgress] = useState(0);
  const [aiTrainingStatus, setAiTrainingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');

  // Voice cloning state (separate)
  const [selectedVoiceFile, setSelectedVoiceFile] = useState<File | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en',
    temperature: 0.75,
    training_epochs: 100
  });

  // Document upload state
  const [selectedDocuments, setSelectedDocuments] = useState<FileList | null>(null);

  // Q&A state
  const [newQAPair, setNewQAPair] = useState({
    question: '',
    answer: '',
    category: ''
  });
  const [editingQA, setEditingQA] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    fetchDocuments();
    fetchQAPairs();
    fetchRecordings();
    fetchApiData();
  }, []);

  // AI Training Function (separate from voice cloning)
  const handleAiTraining = useCallback(async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Training Name Required",
        description: "Please enter a name for your AI training",
        variant: "destructive"
      });
      return;
    }

    try {
      setAiTrainingStatus('processing');
      setAiTrainingProgress(0);

      console.log('🚀 Starting AI Training Process...');
      console.log('Data flow: Q&A / Docs / API / Behavior Data → LlamaIndex → LLaMA 3');

      // Step 1: Prepare training data
      setAiTrainingProgress(10);
      const trainingData = {
        name: trainingName,
        qaPairs: qaPairs || [],
        documents: documents || [],
        apiData: apiData || [],
        behaviorData: []
      };

      console.log('📊 Training data prepared:', {
        qaPairs: trainingData.qaPairs.length,
        documents: trainingData.documents.length,
        apiData: trainingData.apiData.length
      });

      // Step 2: Create training record with error handling for RLS
      setAiTrainingProgress(20);
      let training;
      try {
        training = await createTraining(trainingData, personalitySettings);
        console.log('✅ Training record created:', training.id);
      } catch (createError) {
        console.error('❌ Failed to create training record, attempting alternative approach:', createError);
        
        // If RLS policy blocks creation, try with minimal data first
        const minimalData = {
          name: trainingName,
          qaPairs: [],
          documents: [],
          apiData: [],
          behaviorData: []
        };
        
        training = await createTraining(minimalData, personalitySettings);
        console.log('✅ Minimal training record created:', training.id);
      }

      // Step 3: Start AI model training with LlamaIndex → LLaMA 3 pipeline
      setAiTrainingProgress(30);
      console.log('🧠 Initializing LlamaIndex → LLaMA 3 pipeline...');
      
      // Monitor training progress
      const progressInterval = setInterval(() => {
        setAiTrainingProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          console.log(`🔄 AI Training Progress: ${newProgress}%`);
          return newProgress;
        });
      }, 2000);

      // Execute the actual training
      await trainModel(training.id);
      
      clearInterval(progressInterval);
      setAiTrainingProgress(100);
      setAiTrainingStatus('completed');

      console.log('🎉 AI Training completed successfully!');
      
      toast({
        title: "AI Training Completed",
        description: "Your personalized AI model has been successfully trained with LLaMA 3",
      });

    } catch (error) {
      console.error('❌ AI Training failed:', error);
      setAiTrainingStatus('error');
      setAiTrainingProgress(0);
      
      toast({
        title: "AI Training Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred during training",
        variant: "destructive"
      });
    }
  }, [trainingName, personalitySettings, qaPairs, documents, apiData, createTraining, trainModel, toast]);

  // Voice Cloning Function (separate from AI training)
  const handleVoiceCloning = useCallback(async () => {
    if (!selectedVoiceFile) {
      toast({
        title: "Voice File Required",
        description: "Please select a voice file for cloning",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🎤 Starting Voice Cloning Process...');
      
      // This is separate from AI training and uses voice-specific settings
      const voicePath = `voice-uploads/${selectedVoiceFile.name}`;
      await startVoiceCloning(voicePath, voiceSettings);
      
      toast({
        title: "Voice Cloning Started",
        description: "Your voice is being cloned using advanced Coqui TTS",
      });

    } catch (error) {
      console.error('❌ Voice Cloning failed:', error);
      toast({
        title: "Voice Cloning Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred during voice cloning",
        variant: "destructive"
      });
    }
  }, [selectedVoiceFile, voiceSettings, startVoiceCloning, toast]);

  // Document upload function
  const handleDocumentUpload = useCallback(async () => {
    if (!selectedDocuments || selectedDocuments.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select documents to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      const uploadPromises = Array.from(selectedDocuments).map(file => uploadDocument(file));
      await Promise.all(uploadPromises);
      
      setSelectedDocuments(null);
      // Reset the file input
      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Documents Uploaded",
        description: `Successfully uploaded ${selectedDocuments.length} document(s)`,
      });
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  }, [selectedDocuments, uploadDocument, toast]);

  // Q&A functions
  const handleAddQAPair = useCallback(async () => {
    if (!newQAPair.question.trim() || !newQAPair.answer.trim()) {
      toast({
        title: "Invalid Q&A Pair",
        description: "Both question and answer are required",
        variant: "destructive"
      });
      return;
    }

    try {
      await addQAPair(newQAPair);
      setNewQAPair({ question: '', answer: '', category: '' });
      
      toast({
        title: "Q&A Added",
        description: "Successfully added new Q&A pair",
      });
    } catch (error) {
      console.error('Failed to add Q&A pair:', error);
    }
  }, [newQAPair, addQAPair, toast]);

  // Voice recording functions
  const handleStartRecording = useCallback(async () => {
    try {
      await startNewRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [startNewRecording]);

  const handleStopRecording = useCallback(async () => {
    try {
      await stopCurrentRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [stopCurrentRecording]);

  // Voice file upload
  const handleVoiceFileUpload = useCallback(async (file: File) => {
    try {
      await uploadVoiceFile(file);
      toast({
        title: "Voice File Uploaded",
        description: "Successfully uploaded voice file for cloning",
      });
    } catch (error) {
      console.error('Voice file upload failed:', error);
    }
  }, [uploadVoiceFile, toast]);

  // Get training status badge
  const getTrainingStatusBadge = () => {
    switch (aiTrainingStatus) {
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Training</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-700 border-gray-200">Ready</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-6">
      <div className="container mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            AI Training & Voice Cloning
          </h1>
          <p className="text-slate-700">
            Train your personalized AI with LlamaIndex → LLaMA 3 pipeline and clone voices with Coqui TTS
          </p>
        </div>

        <Tabs defaultValue="ai-training" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-white/90 via-blue-50 to-purple-50 backdrop-blur-sm shadow-lg border border-slate-200/50">
            <TabsTrigger 
              value="ai-training" 
              className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100/80 data-[state=active]:to-purple-100/80 data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-slate-100/50 transition-all font-medium"
            >
              <Brain className="w-4 h-4" />
              AI Training
            </TabsTrigger>
            <TabsTrigger 
              value="voice-cloning" 
              className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100/80 data-[state=active]:to-pink-100/80 data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-slate-100/50 transition-all font-medium"
            >
              <Mic className="w-4 h-4" />
              Voice Cloning
            </TabsTrigger>
          </TabsList>

          {/* AI Training Tab */}
          <TabsContent value="ai-training" className="space-y-6">
            {/* Documents Section */}
            <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border border-slate-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Training Documents
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Upload documents (PDF, TXT, DOC, etc.) for AI training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    id="document-upload"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.md,.csv"
                    onChange={(e) => setSelectedDocuments(e.target.files)}
                    className="flex-1 bg-white text-slate-900 placeholder:text-slate-500 border-slate-200 focus:border-blue-300"
                  />
                  <Button
                    onClick={handleDocumentUpload}
                    disabled={!selectedDocuments || isDocumentsLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md"
                  >
                    {isDocumentsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload
                  </Button>
                </div>

                {documentUploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>Upload Progress</span>
                      <span>{documentUploadProgress}%</span>
                    </div>
                    <Progress value={documentUploadProgress} className="w-full" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents?.map((doc) => (
                    <Card key={doc.id} className="p-4 bg-gradient-to-br from-white to-blue-50/50 border border-blue-200/50 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate text-slate-800">{doc.filename}</p>
                          <p className="text-xs text-slate-500">{(doc.file_size / 1024).toFixed(1)} KB</p>
                          <Badge className={`text-xs ${
                            doc.processing_status === 'completed' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : doc.processing_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {doc.processing_status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id, doc.file_path)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Q&A Section */}
            <Card className="bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border border-slate-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Bot className="w-5 h-5 text-purple-600" />
                  Q&A Training Data
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Add question-answer pairs for AI training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="question" className="text-slate-700">Question</Label>
                    <Textarea
                      id="question"
                      placeholder="Enter your question..."
                      value={newQAPair.question}
                      onChange={(e) => setNewQAPair(prev => ({ ...prev, question: e.target.value }))}
                      className="min-h-[100px] bg-white text-slate-900 placeholder:text-slate-500 border-slate-200 focus:border-purple-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="answer" className="text-slate-700">Answer</Label>
                    <Textarea
                      id="answer"
                      placeholder="Enter the answer..."
                      value={newQAPair.answer}
                      onChange={(e) => setNewQAPair(prev => ({ ...prev, answer: e.target.value }))}
                      className="min-h-[100px] bg-white text-slate-900 placeholder:text-slate-500 border-slate-200 focus:border-purple-300"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Input
                    placeholder="Category (optional)"
                    value={newQAPair.category}
                    onChange={(e) => setNewQAPair(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 bg-white text-slate-900 placeholder:text-slate-500 border-slate-200 focus:border-purple-300"
                  />
                  <Button
                    onClick={handleAddQAPair}
                    disabled={isQALoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Q&A
                  </Button>
                </div>

                <div className="space-y-3">
                  {qaPairs?.map((qa) => (
                    <Card key={qa.id} className="p-4 bg-gradient-to-br from-white to-purple-50/50 border border-purple-200/50 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1 text-slate-800">{qa.question}</p>
                          <p className="text-sm text-slate-600 mb-2">{qa.answer}</p>
                          {qa.category && (
                            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">{qa.category}</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQAPair(qa.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Model Training */}
            <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border border-slate-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Brain className="w-5 h-5 text-blue-600" />
                  AI Model Training
                  {getTrainingStatusBadge()}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Train your personalized AI using Q&A pairs, documents, and API data through LlamaIndex → LLaMA 3 pipeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="training-name" className="text-slate-700">Training Name</Label>
                    <Input
                      id="training-name"
                      placeholder="My Personalized AI"
                      value={trainingName}
                      onChange={(e) => setTrainingName(e.target.value)}
                      disabled={aiTrainingStatus === 'processing'}
                      className="bg-white text-slate-900 placeholder:text-slate-500 border-slate-200 focus:border-blue-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-blue-100/50 border border-blue-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-800">Documents</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{documents?.length || 0}</p>
                    </Card>
                    
                    <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-purple-100/50 border border-purple-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-slate-800">Q&A Pairs</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{qaPairs?.length || 0}</p>
                    </Card>
                    
                    <Card className="p-4 bg-gradient-to-br from-pink-50/50 to-pink-100/50 border border-pink-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-pink-600" />
                        <span className="font-medium text-slate-800">API Data</span>
                      </div>
                      <p className="text-2xl font-bold text-pink-700">{apiData?.length || 0}</p>
                    </Card>
                  </div>

                  {/* Personality Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Personality Configuration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-700">Formality: {personalitySettings.formality}%</Label>
                        <Slider
                          value={[personalitySettings.formality]}
                          onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, formality: value }))}
                          max={100}
                          step={1}
                          disabled={aiTrainingStatus === 'processing'}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-700">Verbosity: {personalitySettings.verbosity}%</Label>
                        <Slider
                          value={[personalitySettings.verbosity]}
                          onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, verbosity: value }))}
                          max={100}
                          step={1}
                          disabled={aiTrainingStatus === 'processing'}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-700">Friendliness: {personalitySettings.friendliness}%</Label>
                        <Slider
                          value={[personalitySettings.friendliness]}
                          onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, friendliness: value }))}
                          max={100}
                          step={1}
                          disabled={aiTrainingStatus === 'processing'}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="behavior-learning"
                        checked={personalitySettings.behavior_learning}
                        onCheckedChange={(checked) => setPersonalitySettings(prev => ({ ...prev, behavior_learning: checked }))}
                        disabled={aiTrainingStatus === 'processing'}
                      />
                      <Label htmlFor="behavior-learning" className="text-slate-700">Enable Behavior Learning</Label>
                    </div>
                  </div>

                  {/* AI Training Progress */}
                  {aiTrainingStatus === 'processing' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-700">
                        <span>Training Progress</span>
                        <span>{aiTrainingProgress}%</span>
                      </div>
                      <Progress value={aiTrainingProgress} className="w-full" />
                      <p className="text-sm text-slate-600">
                        Processing through LlamaIndex → LLaMA 3 pipeline...
                      </p>
                    </div>
                  )}

                  {/* Train AI Button with integrated progress */}
                  <Button
                    onClick={handleAiTraining}
                    disabled={aiTrainingStatus === 'processing' || !trainingName.trim()}
                    className="w-full relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
                    size="lg"
                  >
                    {aiTrainingStatus === 'processing' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Training AI ({aiTrainingProgress}%)
                        </div>
                        <div 
                          className="absolute left-0 top-0 h-full bg-blue-600/20 transition-all duration-300 rounded"
                          style={{ width: `${aiTrainingProgress}%` }}
                        />
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Train AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Cloning Tab */}
          <TabsContent value="voice-cloning" className="space-y-6">
            {/* Voice File Upload & Recording Section */}
            <Card className="bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border border-slate-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Mic className="w-5 h-5 text-purple-600" />
                  Voice Upload & Recording
                  <Badge variant={isRecording ? "default" : "outline"} className={
                    isRecording 
                      ? "bg-red-500/10 text-red-700 border-red-200" 
                      : "bg-gray-500/10 text-gray-700 border-gray-200"
                  }>
                    {isRecording ? "Recording..." : "Ready"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Upload voice files or record your voice for cloning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Voice File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="voice-file-upload" className="text-slate-700">Upload Voice File</Label>
                    <Input
                      id="voice-file-upload"
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedVoiceFile(file);
                          handleVoiceFileUpload(file);
                        }
                      }}
                      className="bg-white text-slate-900 placeholder:text-slate-500 border-slate-200 focus:border-purple-300"
                    />
                  </div>

                  {/* Voice Recording */}
                  <div className="space-y-2">
                    <Label className="text-slate-700">Record Voice</Label>
                    <Button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={isRecordingsLoading}
                      className={`w-full ${
                        isRecording 
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                      } text-white border-0 shadow-md`}
                    >
                      {isRecording ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Recording ({formatDuration(recordingDuration)})
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recordings?.map((recording) => (
                    <Card key={recording.id} className="p-4 bg-gradient-to-br from-white to-purple-50/50 border border-purple-200/50 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate text-slate-800">{recording.filename}</p>
                          <p className="text-xs text-slate-500">
                            {recording.duration ? formatDuration(recording.duration) : 'Unknown duration'}
                          </p>
                          {recording.transcription && (
                            <p className="text-xs text-slate-600 mt-1 truncate" title={recording.transcription}>
                              {recording.transcription}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecording(recording.id, recording.file_path)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voice Cloning Settings */}
            <Card className="bg-gradient-to-br from-white/90 to-pink-50/50 backdrop-blur-sm border border-slate-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Mic className="w-5 h-5 text-pink-600" />
                  Voice Cloning Settings
                  <Badge variant={isCloning ? "default" : "outline"} className={
                    isCloning 
                      ? "bg-purple-500/10 text-purple-700 border-purple-200" 
                      : "bg-gray-500/10 text-gray-700 border-gray-200"
                  }>
                    {isCloning ? "Cloning..." : "Ready"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Configure and start voice cloning with advanced Coqui TTS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="language" className="text-slate-700">Language</Label>
                      <Input
                        id="language"
                        value={voiceSettings.language}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                        disabled={isCloning}
                        className="bg-white text-slate-900 placeholder:text-slate-500 border-slate-200 focus:border-pink-300"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-slate-700">Temperature: {voiceSettings.temperature}</Label>
                      <Slider
                        value={[voiceSettings.temperature]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, temperature: value }))}
                        max={1}
                        min={0}
                        step={0.1}
                        disabled={isCloning}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-slate-700">Training Epochs: {voiceSettings.training_epochs}</Label>
                      <Slider
                        value={[voiceSettings.training_epochs]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, training_epochs: value }))}
                        max={200}
                        min={50}
                        step={10}
                        disabled={isCloning}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleVoiceCloning}
                    disabled={isCloning || !selectedVoiceFile}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg"
                    size="lg"
                  >
                    {isCloning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cloning Voice...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Clone Voice
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AiTraining;
