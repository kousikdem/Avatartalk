
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Brain, Mic, FileText, Database, Bot, Loader2, Play, Pause, CheckCircle, AlertCircle } from "lucide-react";

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
  const { documents, fetchDocuments } = useTrainingDocuments();
  const { qaPairs, fetchQAPairs } = useQAPairs();
  const { recordings, fetchRecordings } = useVoiceRecordings();
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

      // Step 2: Create training record
      setAiTrainingProgress(20);
      const training = await createTraining(trainingData, personalitySettings);
      console.log('✅ Training record created:', training.id);

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

  // Get training status badge
  const getTrainingStatusBadge = () => {
    switch (aiTrainingStatus) {
      case 'processing':
        return <Badge variant="default" className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Training</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Training & Voice Cloning</h1>
        <p className="text-muted-foreground">
          Train your personalized AI with LlamaIndex → LLaMA 3 pipeline and clone voices with Coqui TTS
        </p>
      </div>

      <Tabs defaultValue="ai-training" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-training" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="voice-cloning" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice Cloning
          </TabsTrigger>
        </TabsList>

        {/* AI Training Tab */}
        <TabsContent value="ai-training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Model Training
                {getTrainingStatusBadge()}
              </CardTitle>
              <CardDescription>
                Train your personalized AI using Q&A pairs, documents, and API data through LlamaIndex → LLaMA 3 pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="training-name">Training Name</Label>
                  <Input
                    id="training-name"
                    placeholder="My Personalized AI"
                    value={trainingName}
                    onChange={(e) => setTrainingName(e.target.value)}
                    disabled={aiTrainingStatus === 'processing'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Documents</span>
                    </div>
                    <p className="text-2xl font-bold">{documents?.length || 0}</p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4" />
                      <span className="font-medium">Q&A Pairs</span>
                    </div>
                    <p className="text-2xl font-bold">{qaPairs?.length || 0}</p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4" />
                      <span className="font-medium">API Data</span>
                    </div>
                    <p className="text-2xl font-bold">{apiData?.length || 0}</p>
                  </Card>
                </div>

                {/* Personality Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personality Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Formality: {personalitySettings.formality}%</Label>
                      <Slider
                        value={[personalitySettings.formality]}
                        onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, formality: value }))}
                        max={100}
                        step={1}
                        disabled={aiTrainingStatus === 'processing'}
                      />
                    </div>
                    
                    <div>
                      <Label>Verbosity: {personalitySettings.verbosity}%</Label>
                      <Slider
                        value={[personalitySettings.verbosity]}
                        onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, verbosity: value }))}
                        max={100}
                        step={1}
                        disabled={aiTrainingStatus === 'processing'}
                      />
                    </div>
                    
                    <div>
                      <Label>Friendliness: {personalitySettings.friendliness}%</Label>
                      <Slider
                        value={[personalitySettings.friendliness]}
                        onValueChange={([value]) => setPersonalitySettings(prev => ({ ...prev, friendliness: value }))}
                        max={100}
                        step={1}
                        disabled={aiTrainingStatus === 'processing'}
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
                    <Label htmlFor="behavior-learning">Enable Behavior Learning</Label>
                  </div>
                </div>

                {/* AI Training Progress */}
                {aiTrainingStatus === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{aiTrainingProgress}%</span>
                    </div>
                    <Progress value={aiTrainingProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Processing through LlamaIndex → LLaMA 3 pipeline...
                    </p>
                  </div>
                )}

                {/* Train AI Button with integrated progress */}
                <Button
                  onClick={handleAiTraining}
                  disabled={aiTrainingStatus === 'processing' || !trainingName.trim()}
                  className="w-full relative"
                  size="lg"
                >
                  {aiTrainingStatus === 'processing' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Training AI ({aiTrainingProgress}%)
                      </div>
                      <div 
                        className="absolute left-0 top-0 h-full bg-blue-600/20 transition-all duration-300"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Cloning
                <Badge variant={isCloning ? "default" : "outline"}>
                  {isCloning ? "Cloning..." : "Ready"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Clone voices using advanced Coqui TTS technology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voice-file">Voice File</Label>
                  <Input
                    id="voice-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setSelectedVoiceFile(e.target.files?.[0] || null)}
                    disabled={isCloning}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={voiceSettings.language}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                      disabled={isCloning}
                    />
                  </div>
                  
                  <div>
                    <Label>Temperature: {voiceSettings.temperature}</Label>
                    <Slider
                      value={[voiceSettings.temperature]}
                      onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, temperature: value }))}
                      max={1}
                      min={0}
                      step={0.1}
                      disabled={isCloning}
                    />
                  </div>
                  
                  <div>
                    <Label>Training Epochs: {voiceSettings.training_epochs}</Label>
                    <Slider
                      value={[voiceSettings.training_epochs]}
                      onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, training_epochs: value }))}
                      max={200}
                      min={50}
                      step={10}
                      disabled={isCloning}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleVoiceCloning}
                  disabled={isCloning || !selectedVoiceFile}
                  className="w-full"
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
  );
};

export default AiTraining;
