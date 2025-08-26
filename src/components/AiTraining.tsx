
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, MessageSquare, Bot, Zap, Play, AlertCircle } from 'lucide-react';
import { usePersonalizedAI } from '@/hooks/usePersonalizedAI';
import { useTrainingDocuments } from '@/hooks/useTrainingDocuments';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useVoiceCloning } from '@/hooks/useVoiceCloning';
import { useVoiceRecordings } from '@/hooks/useVoiceRecordings';
import { useToast } from '@/hooks/use-toast';

const AiTraining = () => {
  const { toast } = useToast();
  const { 
    trainings, 
    isLoading, 
    isTraining, 
    currentTraining, 
    createTraining, 
    trainModel, 
    fetchTrainings,
    saveDraft 
  } = usePersonalizedAI();

  const { documents, fetchDocuments, uploadDocument } = useTrainingDocuments();
  const { qaPairs, fetchQAPairs, addQAPair } = useQAPairs();
  const { clonings } = useVoiceCloning();
  const { recordings, fetchRecordings } = useVoiceRecordings();

  // Training state
  const [trainingName, setTrainingName] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'preparing' | 'processing' | 'training' | 'completed'>('idle');

  // Personality settings
  const [personalitySettings, setPersonalitySettings] = useState({
    formality: 50,
    verbosity: 70,
    friendliness: 80,
    mode: 'adaptive' as 'human' | 'robot' | 'adaptive',
    behavior_learning: true
  });

  // Q&A form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    fetchTrainings();
    fetchDocuments();
    fetchQAPairs();
    fetchRecordings();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadDocument(file);
      await fetchDocuments();
      toast({
        title: "Document uploaded",
        description: "Document uploaded and ready for LlamaIndex processing"
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleAddQAPair = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      await addQAPair({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        category: 'general'
      });
      setNewQuestion('');
      setNewAnswer('');
      await fetchQAPairs();
      toast({
        title: "Q&A pair added",
        description: "Question and answer pair ready for training"
      });
    } catch (error) {
      console.error('Add Q&A error:', error);
    }
  };

  const handleStartTraining = async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Training name required",
        description: "Please enter a name for your AI training",
        variant: "destructive"
      });
      return;
    }

    try {
      setTrainingStatus('preparing');
      setTrainingProgress(0);

      console.log('🚀 Starting AI training with LlamaIndex integration...');
      
      // Prepare training data with LlamaIndex integration
      const trainingData = {
        name: trainingName,
        qaPairs: qaPairs.map(qa => ({
          id: qa.id,
          question: qa.question,
          answer: qa.answer,
          category: qa.category,
          context: `Training context for ${qa.category || 'general'} question`
        })),
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.filename,
          content: doc.extracted_content || '',
          metadata: {
            filename: doc.filename,
            file_type: doc.file_type,
            file_size: doc.file_size,
            processing_status: doc.processing_status
          }
        })),
        voiceRecordings: recordings.map(rec => ({
          id: rec.id,
          filename: rec.filename,
          duration: rec.duration,
          transcription: rec.transcription,
          file_path: rec.file_path
        })),
        apiData: [], // API training data if available
        behaviorData: [] // Behavior learning data if available
      };

      console.log('📊 Training data prepared:', {
        qaPairs: trainingData.qaPairs.length,
        documents: trainingData.documents.length,
        voiceRecordings: trainingData.voiceRecordings.length
      });

      setTrainingStatus('processing');
      setTrainingProgress(10);

      // Create or update training
      let training;
      if (currentTraining) {
        training = await saveDraft(trainingData, personalitySettings);
      } else {
        training = await createTraining(trainingData, personalitySettings);
      }

      console.log('✅ Training created/updated:', training.id);

      setTrainingStatus('training');
      setTrainingProgress(25);

      // Start the actual training process with LlamaIndex
      console.log('🔥 Starting LLaMA 3 training with LlamaIndex...');
      const result = await trainModel(training.id);

      setTrainingProgress(100);
      setTrainingStatus('completed');

      console.log('🎉 Training completed successfully:', result);

      toast({
        title: "AI Training Completed!",
        description: `LLaMA 3 model trained successfully with ${trainingData.qaPairs.length} Q&A pairs, ${trainingData.documents.length} documents, and ${trainingData.voiceRecordings.length} voice recordings via LlamaIndex`,
      });

      // Refresh trainings
      await fetchTrainings();

    } catch (error) {
      console.error('❌ Training failed:', error);
      setTrainingStatus('idle');
      setTrainingProgress(0);
      
      toast({
        title: "Training Failed",
        description: "Failed to complete AI training. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTrainingStatusColor = () => {
    switch (trainingStatus) {
      case 'preparing': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'training': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrainingStatusText = () => {
    switch (trainingStatus) {
      case 'preparing': return 'Preparing data...';
      case 'processing': return 'Processing with LlamaIndex...';
      case 'training': return 'Training LLaMA 3 model...';
      case 'completed': return 'Training completed!';
      default: return 'Ready to train';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Training Studio
          </h1>
          <p className="text-gray-600 text-lg">
            Train your personalized AI with LlamaIndex → LLaMA 3 integration
          </p>
        </div>

        {/* Training Control Panel */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-600" />
              AI Training Control
            </CardTitle>
            <CardDescription>
              Data Flow: Q&A / Docs / API / Behavior Data → LlamaIndex → LLaMA 3 → AI Model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="training-name">Training Name</Label>
                <Input
                  id="training-name"
                  placeholder="Enter training name..."
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  disabled={trainingStatus !== 'idle'}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleStartTraining}
                  disabled={isTraining || trainingStatus !== 'idle' || !trainingName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isTraining ? 'Training...' : 'Run AI Training'}
                </Button>
              </div>
            </div>

            {/* Training Progress */}
            {trainingStatus !== 'idle' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getTrainingStatusText()}</span>
                  <Badge className={`${getTrainingStatusColor()} text-white`}>
                    {trainingProgress}%
                  </Badge>
                </div>
                <Progress value={trainingProgress} className="h-3" />
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• LlamaIndex processing: {documents.length} docs, {qaPairs.length} Q&A pairs</div>
                  <div>• LLaMA 3 model training with QLoRA fine-tuning</div>
                  <div>• Personality adaptation and validation</div>
                </div>
              </div>
            )}

            {/* Data Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <div className="text-lg font-semibold text-blue-700">{documents.length}</div>
                <div className="text-xs text-blue-600">Documents</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <MessageSquare className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <div className="text-lg font-semibold text-green-700">{qaPairs.length}</div>
                <div className="text-xs text-green-600">Q&A Pairs</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Zap className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                <div className="text-lg font-semibold text-purple-700">{recordings.length}</div>
                <div className="text-xs text-purple-600">Voice Records</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Bot className="w-6 h-6 mx-auto text-orange-600 mb-1" />
                <div className="text-lg font-semibold text-orange-700">{trainings.length}</div>
                <div className="text-xs text-orange-600">AI Models</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Configuration Tabs */}
        <Tabs defaultValue="personality" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="qa">Q&A Training</TabsTrigger>
            <TabsTrigger value="voice">Voice Data</TabsTrigger>
          </TabsList>

          {/* Personality Settings */}
          <TabsContent value="personality">
            <Card>
              <CardHeader>
                <CardTitle>Personality Configuration</CardTitle>
                <CardDescription>
                  Configure how your AI will behave and respond
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Formality Level: {personalitySettings.formality}</Label>
                    <Slider
                      value={[personalitySettings.formality]}
                      onValueChange={(value) => 
                        setPersonalitySettings(prev => ({ ...prev, formality: value[0] }))
                      }
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Verbosity Level: {personalitySettings.verbosity}</Label>
                    <Slider
                      value={[personalitySettings.verbosity]}
                      onValueChange={(value) => 
                        setPersonalitySettings(prev => ({ ...prev, verbosity: value[0] }))
                      }
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Friendliness Level: {personalitySettings.friendliness}</Label>
                    <Slider
                      value={[personalitySettings.friendliness]}
                      onValueChange={(value) => 
                        setPersonalitySettings(prev => ({ ...prev, friendliness: value[0] }))
                      }
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={personalitySettings.behavior_learning}
                      onCheckedChange={(checked) =>
                        setPersonalitySettings(prev => ({ ...prev, behavior_learning: checked }))
                      }
                    />
                    <Label>Enable Behavior Learning</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Training Documents
                </CardTitle>
                <CardDescription>
                  Upload documents for LlamaIndex processing and LLaMA 3 training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">Upload documents</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.txt,.docx"
                  />
                </div>
                
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{doc.filename}</span>
                      </div>
                      <Badge variant={doc.processing_status === 'completed' ? 'default' : 'secondary'}>
                        {doc.processing_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q&A Training Tab */}
          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Q&A Training Data
                </CardTitle>
                <CardDescription>
                  Add question and answer pairs for targeted AI training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      placeholder="Enter a question..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      placeholder="Enter the answer..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddQAPair} disabled={!newQuestion.trim() || !newAnswer.trim()}>
                    Add Q&A Pair
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  {qaPairs.map((qa) => (
                    <div key={qa.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">Q: {qa.question}</div>
                      <div className="text-sm text-gray-600 mt-1">A: {qa.answer}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Data Tab */}
          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Voice Training Data
                </CardTitle>
                <CardDescription>
                  Voice recordings for personality and speech pattern training
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recordings.map((recording) => (
                    <div key={recording.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">{recording.filename}</span>
                        <span className="text-xs text-gray-500">{recording.duration}s</span>
                      </div>
                      <Badge variant="outline">
                        {recording.transcription ? 'Processed' : 'Processing'}
                      </Badge>
                    </div>
                  ))}
                  {recordings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      No voice recordings available. Record some audio in the Voice section.
                    </div>
                  )}
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
