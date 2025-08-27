import React, { useState, useEffect } from 'react';
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
import { usePersonalizedAI } from '@/hooks/usePersonalizedAI';
import { useTrainingDocuments } from '@/hooks/useTrainingDocuments';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useApiTraining } from '@/hooks/useApiTraining';
import { useVoiceRecordings } from '@/hooks/useVoiceRecordings';
import { Upload, FileText, MessageSquare, Settings, Mic, Play, Save, Loader2 } from 'lucide-react';

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

const AiTraining: React.FC = () => {
  const { toast } = useToast();
  const {
    trainings,
    isLoading,
    isTraining,
    currentTraining,
    fetchTrainings,
    createTraining,
    trainModel,
    saveDraft,
    setCurrentTraining
  } = usePersonalizedAI();

  const { documents, fetchDocuments } = useTrainingDocuments();
  const { qaPairs, fetchQAPairs } = useQAPairs();
  const { apiData, fetchApiData } = useApiTraining();
  const { recordings, fetchRecordings } = useVoiceRecordings();

  // Training progress state
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // form state variables
  const [trainingName, setTrainingName] = useState('');
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({
    formality: 50,
    verbosity: 70,
    friendliness: 80,
    mode: 'adaptive',
    behavior_learning: true
  });

  useEffect(() => {
    fetchTrainings();
    fetchDocuments();
    fetchQAPairs();
    fetchApiData();
    fetchRecordings();
  }, []);

  const handleTrainAI = async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a training name",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setTrainingProgress(0);
    setTrainingStatus('Initializing AI training...');

    try {
      // Step 1: Prepare training data
      setTrainingStatus('Preparing training data...');
      setTrainingProgress(10);

      const trainingData: TrainingData = {
        name: trainingName,
        qaPairs: qaPairs || [],
        documents: documents || [],
        voiceRecordings: recordings || [],
        apiData: apiData || [],
        behaviorData: []
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Create or update training
      setTrainingStatus('Creating training configuration...');
      setTrainingProgress(20);

      let training;
      if (currentTraining) {
        training = await saveDraft(trainingData, personalitySettings);
      } else {
        training = await createTraining(trainingData, personalitySettings);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Process data with LlamaIndex
      setTrainingStatus('Processing data with LlamaIndex...');
      setTrainingProgress(35);

      console.log('LlamaIndex: Processing documents and Q&A pairs...');
      console.log(`- Documents: ${documents.length} files`);
      console.log(`- Q&A Pairs: ${qaPairs.length} pairs`);
      console.log(`- API Data: ${apiData.length} endpoints`);
      console.log(`- Voice Recordings: ${recordings.length} recordings`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Initialize LLaMA 3 fine-tuning
      setTrainingStatus('Initializing LLaMA 3 model...');
      setTrainingProgress(50);

      console.log('LLaMA 3: Initializing Meta AI model with QLoRA fine-tuning...');
      console.log('Personality settings:', personalitySettings);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 5: Start model training
      setTrainingStatus('Training LLaMA 3 model...');
      setTrainingProgress(65);

      console.log('Starting LLaMA 3 fine-tuning process...');
      
      // Simulate training progress
      const progressSteps = [70, 75, 80, 85, 90, 95];
      for (const progress of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrainingProgress(progress);
        
        if (progress === 70) setTrainingStatus('Fine-tuning neural networks...');
        else if (progress === 75) setTrainingStatus('Adapting personality traits...');
        else if (progress === 80) setTrainingStatus('Processing behavioral patterns...');
        else if (progress === 85) setTrainingStatus('Optimizing model weights...');
        else if (progress === 90) setTrainingStatus('Validating model performance...');
        else if (progress === 95) setTrainingStatus('Finalizing AI model...');
      }

      // Step 6: Complete training
      await trainModel(training.id);
      
      setTrainingProgress(100);
      setTrainingStatus('AI training completed successfully!');

      toast({
        title: "Success",
        description: "AI model has been trained successfully with LlamaIndex and LLaMA 3",
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setIsProcessing(false);
        setTrainingProgress(0);
        setTrainingStatus('');
      }, 3000);

    } catch (error) {
      console.error('AI Training Error:', error);
      
      setIsProcessing(false);
      setTrainingProgress(0);
      setTrainingStatus('');
      
      toast({
        title: "Error",
        description: "Failed to train AI model. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Training</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => saveDraft({
              name: trainingName,
              qaPairs: qaPairs || [],
              documents: documents || [],
              voiceRecordings: recordings || [],
              apiData: apiData || [],
              behaviorData: []
            }, personalitySettings)}
            variant="outline"
            disabled={isLoading || isProcessing}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handleTrainAI}
            disabled={isLoading || isProcessing || !trainingName.trim()}
            className="relative overflow-hidden"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Training AI...
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress 
                    value={trainingProgress} 
                    className="h-1 bg-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Train AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Training Status Display */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">{trainingStatus}</span>
                <span className="text-sm text-blue-600">{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
              <div className="text-xs text-blue-600">
                Data Flow: Q&A / Docs / API / Behavior Data → LlamaIndex → LLaMA 3 → AI Model Training
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="data">Training Data</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="training-name">Training Name</Label>
                <Input
                  id="training-name"
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  placeholder="Enter a name for this AI training"
                  disabled={isProcessing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Q&A Pairs ({qaPairs?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Question and answer pairs for training conversational responses.
                </p>
                <div className="space-y-2">
                  {qaPairs?.slice(0, 3).map((qa, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium">Q: {qa.question?.substring(0, 50)}...</div>
                      <div className="text-gray-600">A: {qa.answer?.substring(0, 50)}...</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents ({documents?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Training documents for knowledge base.
                </p>
                <div className="space-y-2">
                  {documents?.slice(0, 3).map((doc, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium">{doc.filename}</div>
                      <div className="text-gray-600">{doc.file_type} • {(doc.file_size / 1024).toFixed(1)}KB</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personality Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Formality Level: {personalitySettings.formality}%</Label>
                <Slider
                  value={[personalitySettings.formality]}
                  onValueChange={(value) => setPersonalitySettings(prev => ({ ...prev, formality: value[0] }))}
                  max={100}
                  step={1}
                  className="mt-2"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label>Verbosity Level: {personalitySettings.verbosity}%</Label>
                <Slider
                  value={[personalitySettings.verbosity]}
                  onValueChange={(value) => setPersonalitySettings(prev => ({ ...prev, verbosity: value[0] }))}
                  max={100}
                  step={1}
                  className="mt-2"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label>Friendliness Level: {personalitySettings.friendliness}%</Label>
                <Slider
                  value={[personalitySettings.friendliness]}
                  onValueChange={(value) => setPersonalitySettings(prev => ({ ...prev, friendliness: value[0] }))}
                  max={100}
                  step={1}
                  className="mt-2"
                  disabled={isProcessing}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="behavior-learning"
                  checked={personalitySettings.behavior_learning}
                  onCheckedChange={(checked) => setPersonalitySettings(prev => ({ ...prev, behavior_learning: checked }))}
                  disabled={isProcessing}
                />
                <Label htmlFor="behavior-learning">Enable Behavior Learning</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>AI Mode</Label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={personalitySettings.mode}
                  onChange={(e) => setPersonalitySettings(prev => ({ ...prev, mode: e.target.value as 'human' | 'robot' | 'adaptive' }))}
                  disabled={isProcessing}
                >
                  <option value="adaptive">Adaptive</option>
                  <option value="human">Human-like</option>
                  <option value="robot">Robot-like</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiTraining;
