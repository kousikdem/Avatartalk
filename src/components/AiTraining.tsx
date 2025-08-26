import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, MessageSquare, Code, Brain, Save, Play, Mic } from 'lucide-react';
import { usePersonalizedAI } from '@/hooks/usePersonalizedAI';
import { useTrainingDocuments } from '@/hooks/useTrainingDocuments';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useApiTraining } from '@/hooks/useApiTraining';
import { useVoiceCloning } from '@/hooks/useVoiceCloning';
import { useVoiceRecordings } from '@/hooks/useVoiceRecordings';

interface PersonalitySettings {
  formality: number;
  verbosity: number;
  friendliness: number;
  mode: 'human' | 'robot' | 'adaptive';
  behavior_learning: boolean;
}

interface TrainingData {
  name: string;
  qaPairs?: any[];
  documents?: any[];
  voiceRecordings?: any[];
  apiData?: any[];
  behaviorData?: any[];
}

const AiTraining = () => {
  const [trainingName, setTrainingName] = useState('');
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({
    formality: 50,
    verbosity: 50,
    friendliness: 80,
    mode: 'adaptive',
    behavior_learning: true
  });

  const { toast } = useToast();
  const { 
    trainings, 
    isLoading, 
    isTraining,
    currentTraining,
    fetchTrainings,
    saveDraft,
    trainModel,
    processDocuments,
    processQAPairs,
    llamaFineTune
  } = usePersonalizedAI();

  const { documents, fetchDocuments } = useTrainingDocuments();
  const { qaPairs, fetchQAPairs } = useQAPairs();
  const { apiData, fetchApiData } = useApiTraining();
  const { startVoiceCloning } = useVoiceCloning();
  const { recordings, fetchRecordings } = useVoiceRecordings();

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (trainingName.trim() || documents.length > 0 || qaPairs.length > 0 || apiData.length > 0) {
        handleSaveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [trainingName, documents, qaPairs, apiData]);

  useEffect(() => {
    fetchTrainings();
    fetchDocuments();
    fetchQAPairs();
    fetchApiData();
    fetchRecordings();
  }, []);

  const handleSaveDraft = useCallback(async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Training Name Required",
        description: "Please enter a name for your AI training",
        variant: "destructive"
      });
      return;
    }

    const trainingData: TrainingData = {
      name: trainingName,
      qaPairs,
      documents,
      voiceRecordings: recordings,
      apiData,
      behaviorData: []
    };

    try {
      await saveDraft(trainingData, personalitySettings);
    } catch (error) {
      console.error('Save draft error:', error);
    }
  }, [trainingName, personalitySettings, qaPairs, documents, recordings, apiData, saveDraft, toast]);

  const handleTrainAI = async () => {
    if (!currentTraining && !trainingName.trim()) {
      toast({
        title: "Training Required",
        description: "Please save a draft first or select an existing training",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, save current data if needed
      if (!currentTraining) {
        await handleSaveDraft();
      }

      const trainingId = currentTraining?.id;
      if (!trainingId) {
        throw new Error('No training selected');
      }

      console.log('Starting AI training with LlamaIndex integration...');
      
      // Step 1: Process documents with LlamaIndex
      if (documents.length > 0) {
        console.log('Processing documents with LlamaIndex...');
        await processDocuments(documents);
      }

      // Step 2: Process Q&A pairs
      if (qaPairs.length > 0) {
        console.log('Processing Q&A pairs for LLaMA 3 training...');
        await processQAPairs(qaPairs);
      }

      // Step 3: Start LLaMA 3 fine-tuning with QLoRA
      console.log('Initializing LLaMA 3 + QLoRA fine-tuning...');
      await trainModel(trainingId);

      toast({
        title: "AI Training Started",
        description: "Your personalized AI model is now training with LlamaIndex and LLaMA 3",
      });

    } catch (error) {
      console.error('AI training error:', error);
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "Failed to start AI training",
        variant: "destructive"
      });
    }
  };

  const handleCloneVoice = async () => {
    if (recordings.length === 0) {
      toast({
        title: "No Voice Recordings",
        description: "Please upload voice recordings first",
        variant: "destructive"
      });
      return;
    }

    try {
      const latestRecording = recordings[0];
      await startVoiceCloning(latestRecording.file_path);
      
      toast({
        title: "Voice Cloning Started",
        description: "Your voice is being processed for cloning",
      });
    } catch (error) {
      console.error('Voice cloning error:', error);
      toast({
        title: "Voice Cloning Failed", 
        description: error instanceof Error ? error.message : "Failed to start voice cloning",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Training Studio</h1>
        <p className="text-muted-foreground">
          Create your personalized AI with LlamaIndex → LLaMA 3 integration
        </p>
      </div>

      {/* Training Name */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Training Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="training-name">Training Name</Label>
              <Input
                id="training-name"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
                placeholder="Enter a name for your AI training..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Tabs */}
      <Tabs defaultValue="documents" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Q&A ({qaPairs.length})
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API ({apiData.length})
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice ({recordings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Training Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload documents that will be processed through LlamaIndex for knowledge extraction
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm truncate">{doc.filename}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(doc.file_size / 1024).toFixed(1)} KB • {doc.processing_status}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Q&A Training Pairs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Question-Answer pairs for fine-tuning LLaMA 3 responses
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qaPairs.map((qa) => (
                  <div key={qa.id} className="p-4 border rounded-lg">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-blue-600">Q:</span>
                      <p className="text-sm ml-4">{qa.question}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-green-600">A:</span>
                      <p className="text-sm ml-4">{qa.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Training Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                API responses for training contextual understanding
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiData.map((api) => (
                  <div key={api.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-sm">{api.api_method}</span>
                      <span className="text-xs text-muted-foreground">{api.api_endpoint}</span>
                    </div>
                    {api.training_context && (
                      <p className="text-xs text-muted-foreground mt-2">{api.training_context}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Training Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                Voice recordings for AI voice synthesis training
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recordings.map((recording) => (
                  <div key={recording.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-sm">{recording.filename}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {recording.duration}s • {recording.processing_status}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Personality Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>AI Personality Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how your LLaMA 3 model will behave and respond
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Formality Level: {personalitySettings.formality}</Label>
              <Slider
                value={[personalitySettings.formality]}
                onValueChange={([value]) => setPersonalitySettings({...personalitySettings, formality: value})}
                max={100}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = Very casual, 100 = Very formal
              </p>
            </div>
            <div>
              <Label>Verbosity Level: {personalitySettings.verbosity}</Label>
              <Slider
                value={[personalitySettings.verbosity]}
                onValueChange={([value]) => setPersonalitySettings({...personalitySettings, verbosity: value})}
                max={100}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = Concise, 100 = Detailed
              </p>
            </div>
            <div>
              <Label>Friendliness Level: {personalitySettings.friendliness}</Label>
              <Slider
                value={[personalitySettings.friendliness]}
                onValueChange={([value]) => setPersonalitySettings({...personalitySettings, friendliness: value})}
                max={100}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = Professional, 100 = Very friendly
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={personalitySettings.behavior_learning}
              onCheckedChange={(checked) => setPersonalitySettings({...personalitySettings, behavior_learning: checked})}
            />
            <Label>Enable Behavior Learning</Label>
          </div>
        </CardContent>
      </Card>

      {/* Training Progress */}
      {isTraining && currentTraining && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={currentTraining.training_progress} className="w-full" />
              <div className="flex justify-between text-sm">
                <span>LlamaIndex → LLaMA 3 Training</span>
                <span>{currentTraining.training_progress}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Status: {currentTraining.model_status}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-lg border rounded-full px-6 py-3 shadow-lg">
          <Button
            onClick={handleSaveDraft}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-full"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>

          <Button
            onClick={handleTrainAI}
            disabled={isLoading || isTraining || !trainingName.trim()}
            size="sm"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Play className="h-4 w-4" />
            {isTraining ? 'Training...' : 'Train AI'}
          </Button>

          <Button
            onClick={handleCloneVoice}
            disabled={isLoading || recordings.length === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-full"
          >
            <Mic className="h-4 w-4" />
            Clone Voice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiTraining;
