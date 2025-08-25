import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useTrainingDocuments } from '@/hooks/useTrainingDocuments';
import { useVoiceRecordings } from '@/hooks/useVoiceRecordings';
import { useApiTraining } from '@/hooks/useApiTraining';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { 
  MessageCircle, 
  FileText, 
  Mic, 
  Edit3, 
  Plus, 
  Trash2, 
  Upload, 
  Download,
  Brain,
  Settings,
  Play,
  Pause,
  Volume2,
  Globe,
  BarChart,
  Users,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

const AiTraining = () => {
  const [formality, setFormality] = useState([50]);
  const [verbosity, setVerbosity] = useState([70]);
  const [friendliness, setFriendliness] = useState([80]);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([
    { 
      id: '1', 
      question: 'What services do you offer?',
      answer: 'I specialize in digital marketing, content creation, and brand strategy for small businesses. My packages start at $1,200 for a complete marketing audit.'
    },
    { 
      id: '2', 
      question: 'How can I book a consultation with you?',
      answer: 'You can book a 30-minute consultation through my Calendly link. Just click on "Book a Consultation" in my profile links and select a time that works for you. Initial consultations are $150, which can be applied to your package if you decide to work with me.'
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [personalityMode, setPersonalityMode] = useState('adaptive');
  const [behaviorLearning, setBehaviorLearning] = useState(true);
  const [trainingProgress, setTrainingProgress] = useState(45);

  const addQAPair = () => {
    const newPair: QAPair = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setQaPairs([...qaPairs, newPair]);
  };

  const removeQAPair = (id: string) => {
    if (qaPairs.length > 1) {
      setQaPairs(qaPairs.filter(pair => pair.id !== id));
    }
  };

  const updateQAPair = (id: string, field: 'question' | 'answer', value: string) => {
    setQaPairs(qaPairs.map(pair => 
      pair.id === id ? { ...pair, [field]: value } : pair
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const trainingMethods = [
    {
      id: 'qa',
      title: 'Q&A Format',
      icon: MessageCircle,
      description: 'Train with question-answer pairs',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'document',
      title: 'Document Upload',
      icon: FileText,
      description: 'Upload PDF, DOCX, TXT files',
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      id: 'api',
      title: 'API Data Training',
      icon: Globe,
      description: 'Connect external APIs for real-time data',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 border-indigo-200'
    },
    {
      id: 'voice',
      title: 'Voice Training',
      icon: Mic,
      description: 'Train with voice samples',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'behavior',
      title: 'Behavior Learning',
      icon: Brain,
      description: 'AI learns from user interactions',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'scenario',
      title: 'Scenario Templates',
      icon: Users,
      description: 'Pre-built role templates',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 border-teal-200'
    }
  ];

  const personalityModes = [
    { id: 'human', title: 'Human-Like', description: 'Empathetic and natural' },
    { id: 'robot', title: 'Robot-Like', description: 'Precise and technical' },
    { id: 'adaptive', title: 'Adaptive', description: 'Auto-adjusts tone' }
  ];

  const scenarioTemplates = [
    { id: 'support', title: 'Customer Support', description: 'Help desk and troubleshooting' },
    { id: 'sales', title: 'Sales Assistant', description: 'Lead qualification and conversion' },
    { id: 'tech', title: 'Technical Assistant', description: 'Development and programming help' },
    { id: 'marketing', title: 'Marketing Expert', description: 'Campaign strategy and content' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Train your AI assistant in minutes
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Teaching your AI is as simple as having a conversation
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Training Progress</span>
              <span className="text-sm font-medium text-blue-600">{trainingProgress}%</span>
            </div>
            <Progress value={trainingProgress} className="h-2" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Training Methods & Personality */}
          <motion.div 
            className="xl:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Training Methods */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  Training Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trainingMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    className={`p-3 rounded-lg border ${method.bgColor} hover:shadow-md cursor-pointer transition-all duration-200`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className={`w-4 h-4 ${method.color}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm">{method.title}</h4>
                        <p className="text-xs text-gray-600 truncate">{method.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* AI Personality */}
            <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-500" />
                  AI Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Personality Mode */}
                <div>
                  <Label className="text-gray-700 mb-2 block text-sm">Personality Mode</Label>
                  <div className="space-y-2">
                    {personalityModes.map((mode) => (
                      <label key={mode.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="personality"
                          value={mode.id}
                          checked={personalityMode === mode.id}
                          onChange={(e) => setPersonalityMode(e.target.value)}
                          className="text-purple-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{mode.title}</div>
                          <div className="text-xs text-gray-600">{mode.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 block text-sm">
                    Formality: {formality[0]}%
                  </Label>
                  <Slider
                    value={formality}
                    onValueChange={setFormality}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-700 mb-2 block text-sm">
                    Verbosity: {verbosity[0]}%
                  </Label>
                  <Slider
                    value={verbosity}
                    onValueChange={setVerbosity}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-700 mb-2 block text-sm">
                    Friendliness: {friendliness[0]}%
                  </Label>
                  <Slider
                    value={friendliness}
                    onValueChange={setFriendliness}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Behavior Learning Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <Label className="text-gray-700 text-sm">Behavior Learning</Label>
                  <button
                    onClick={() => setBehaviorLearning(!behaviorLearning)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      behaviorLearning ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        behaviorLearning ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-blue-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Q&A Pairs</span>
                  <span className="text-sm font-medium text-gray-800">{qaPairs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents</span>
                  <span className="text-sm font-medium text-gray-800">{uploadedFiles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Accuracy Score</span>
                  <span className="text-sm font-medium text-green-600">94%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Training Area */}
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Tabs defaultValue="qa" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg">
                <TabsTrigger value="qa" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs lg:text-sm">
                  Q&A
                </TabsTrigger>
                <TabsTrigger value="document" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white text-xs lg:text-sm">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-xs lg:text-sm">
                  API Data
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-xs lg:text-sm">
                  Voice
                </TabsTrigger>
                <TabsTrigger value="scenario" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-green-500 data-[state=active]:text-white text-xs lg:text-sm">
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="test" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-xs lg:text-sm">
                  Test Chat
                </TabsTrigger>
              </TabsList>

              {/* Q&A Training */}
              <TabsContent value="qa" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-800">Teach Your AI with Q&A Pairs</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Q&A
                      </Button>
                      <Button 
                        onClick={addQAPair}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Q&A Pair
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {qaPairs.map((pair, index) => (
                      <motion.div
                        key={pair.id}
                        className="p-4 border border-gray-200 rounded-lg space-y-4 bg-white/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="border-blue-400 text-blue-600">
                            Q&A Pair #{index + 1}
                          </Badge>
                          {qaPairs.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQAPair(pair.id)}
                              className="text-red-500 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-gray-700 text-sm">Question</Label>
                          <Input
                            value={pair.question}
                            onChange={(e) => updateQAPair(pair.id, 'question', e.target.value)}
                            placeholder="What services do you offer?"
                            className="bg-white border-gray-300 text-gray-800 mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-700 text-sm">Answer</Label>
                          <Textarea
                            value={pair.answer}
                            onChange={(e) => updateQAPair(pair.id, 'answer', e.target.value)}
                            placeholder="I specialize in digital marketing, content creation, and brand strategy..."
                            className="bg-white border-gray-300 text-gray-800 mt-1"
                            rows={3}
                          />
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="flex space-x-4 pt-4">
                      <Button 
                        variant="outline" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Q&A
                      </Button>
                      <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white flex-1">
                        <Zap className="w-4 h-4 mr-2" />
                        Save & Train AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Document Upload */}
              <TabsContent value="document" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-green-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center justify-between">
                      <span>Document Upload Training</span>
                      <Badge variant="outline" className="border-green-400 text-green-600">
                        {uploadedFiles.length} files uploaded
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white/50">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 font-medium">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supported formats: PDF, DOCX, TXT (Max 10MB per file)
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload">
                        <Button 
                          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                          asChild
                        >
                          <span>
                            <FileText className="w-4 h-4 mr-2" />
                            Choose Files
                          </span>
                        </Button>
                      </Label>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-800 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Uploaded Files:
                        </h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-green-500" />
                              <div>
                                <span className="text-gray-800 font-medium">{file.name}</span>
                                <div className="text-xs text-gray-600">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-500 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                          <Zap className="w-4 h-4 mr-2" />
                          Process Documents & Train AI
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Data Training */}
              <TabsContent value="api" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-indigo-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                      API Data Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="text-gray-700">API Endpoint</Label>
                        <Input
                          placeholder="https://api.example.com/data"
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-gray-700">Authentication Method</Label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800">
                          <option>API Key</option>
                          <option>Bearer Token</option>
                          <option>Basic Auth</option>
                          <option>OAuth 2.0</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-gray-700">API Key / Token</Label>
                      <Input
                        type="password"
                        placeholder="Enter your API key..."
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white">
                      <Globe className="w-4 h-4 mr-2" />
                      Connect & Test API
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Training */}
              <TabsContent value="voice" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center">
                        <Mic className="w-5 h-5 mr-2 text-purple-500" />
                        Voice Input Recording
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center p-6 border border-gray-200 rounded-lg bg-white/50">
                        <Mic className={`w-16 h-16 mx-auto mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-purple-500'}`} />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {isRecording ? 'Recording...' : 'Record Your Voice'}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          Speak clearly to train your AI assistant's voice responses
                        </p>
                        <Button
                          onClick={() => setIsRecording(!isRecording)}
                          className={`${isRecording 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                            : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                          } text-white`}
                        >
                          {isRecording ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Recording
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-800">Voice Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Volume Level</span>
                            <Volume2 className="w-4 h-4 text-gray-500" />
                          </div>
                          <Progress value={75} className="h-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Quality</span>
                            <Badge variant="outline" className="border-purple-400 text-purple-600">High</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Duration</span>
                            <span className="text-gray-800 text-sm">0:00 / 5:00</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-pink-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-800">Voice Library</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                          <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Professional</div>
                          <div className="text-xs text-gray-600">Business tone</div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                          <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Casual</div>
                          <div className="text-xs text-gray-600">Friendly tone</div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                          <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Technical</div>
                          <div className="text-xs text-gray-600">Expert tone</div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                          <Plus className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Custom</div>
                          <div className="text-xs text-gray-600">Upload voice</div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-800 mb-3">Training Progress</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Voice Samples</span>
                            <span className="text-gray-800">0/10</span>
                          </div>
                          <Progress value={0} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Processing Time</span>
                            <span className="text-gray-800">~2 minutes</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Scenario Templates */}
              <TabsContent value="scenario" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-teal-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-teal-500" />
                      Scenario-Based Role Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scenarioTemplates.map((template) => (
                        <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white/50">
                          <h4 className="font-medium text-gray-800 mb-2">{template.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <Button 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white"
                          >
                            Apply Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Live Chat Testing */}
              <TabsContent value="test" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-orange-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-orange-500" />
                      Live Chat Testing Window
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 h-96 mb-4 overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex">
                          <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-xs">
                            Hello! How can I help you today?
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-gray-200 text-gray-800 rounded-lg px-3 py-2 max-w-xs">
                            What services do you offer?
                          </div>
                        </div>
                        <div className="flex">
                          <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-xs">
                            I specialize in digital marketing, content creation, and brand strategy for small businesses. My packages start at $1,200 for a complete marketing audit.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your test message..."
                        className="flex-1 bg-white border-gray-300"
                      />
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Bottom Action Bar */}
        <motion.div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 shadow-lg px-6 py-3 flex items-center space-x-4">
            <Button
              size="sm"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Clock className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Save & Train AI
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AiTraining;