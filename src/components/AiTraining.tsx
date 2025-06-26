
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
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
  Volume2
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
    { id: '1', question: '', answer: '' }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
      color: 'text-blue-500'
    },
    {
      id: 'document',
      title: 'Document Upload',
      icon: FileText,
      description: 'Upload documents for training',
      color: 'text-green-500'
    },
    {
      id: 'voice',
      title: 'Voice Training',
      icon: Mic,
      description: 'Train with voice samples',
      color: 'text-purple-500'
    },
    {
      id: 'manual',
      title: 'Manual Editing',
      icon: Edit3,
      description: 'Fine-tune responses manually',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Train your AI assistant in minutes
          </h1>
          <p className="text-gray-600 text-lg">
            Teaching your AI is as simple as having a conversation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Training Methods */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white border-2 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  Training Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trainingMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className={`w-5 h-5 ${method.color}`} />
                      <div>
                        <h3 className="font-medium text-gray-800">{method.title}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* AI Personality */}
            <Card className="bg-white border-2 border-purple-200 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-500" />
                  AI Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-700 mb-4 block">
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
                  <Label className="text-gray-700 mb-4 block">
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
                  <Label className="text-gray-700 mb-4 block">
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Training Area */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Tabs defaultValue="qa" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 border border-gray-200">
                <TabsTrigger value="qa" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  Q&A Format
                </TabsTrigger>
                <TabsTrigger value="document" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  Voice
                </TabsTrigger>
                <TabsTrigger value="manual" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  Manual
                </TabsTrigger>
              </TabsList>

              {/* Q&A Training */}
              <TabsContent value="qa" className="space-y-6">
                <Card className="bg-white border-2 border-blue-200 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-800">Teach Your AI with Q&A Pairs</CardTitle>
                    <Button 
                      onClick={addQAPair}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Q&A Pair
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {qaPairs.map((pair, index) => (
                      <motion.div
                        key={pair.id}
                        className="p-4 border border-gray-200 rounded-lg space-y-4"
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
                          <Label className="text-gray-700">Question</Label>
                          <Input
                            value={pair.question}
                            onChange={(e) => updateQAPair(pair.id, 'question', e.target.value)}
                            placeholder="Enter your question..."
                            className="bg-white border-gray-300 text-gray-800"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-700">Answer</Label>
                          <Textarea
                            value={pair.answer}
                            onChange={(e) => updateQAPair(pair.id, 'answer', e.target.value)}
                            placeholder="Enter the answer..."
                            className="bg-white border-gray-300 text-gray-800"
                            rows={3}
                          />
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="flex space-x-4 pt-4">
                      <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white flex-1">
                        Import Q&A
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Q&A
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Document Upload */}
              <TabsContent value="document" className="space-y-6">
                <Card className="bg-white border-2 border-green-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Document Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Drag and drop files here, or click to browse
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
                          <span>Choose Files</span>
                        </Button>
                      </Label>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Uploaded Files:</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-green-500" />
                              <span className="text-gray-800">{file.name}</span>
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Training */}
              <TabsContent value="voice" className="space-y-6">
                <Card className="bg-white border-2 border-purple-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Voice Training</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-8 border border-gray-200 rounded-lg">
                      <Mic className={`w-16 h-16 mx-auto mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-purple-500'}`} />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {isRecording ? 'Recording...' : 'Record Your Voice'}
                      </h3>
                      <p className="text-gray-600 mb-4">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Voice Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Volume</span>
                            <Volume2 className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Quality</span>
                            <Badge variant="outline" className="border-purple-400 text-purple-600">High</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Training Progress</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Samples Recorded</span>
                            <span className="text-gray-800">0/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manual Editing */}
              <TabsContent value="manual" className="space-y-6">
                <Card className="bg-white border-2 border-orange-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Manual Editing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Fine-tune your AI's responses and behavior through direct editing and customization.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-800">Response Templates</h4>
                        <div className="space-y-2">
                          {['Greeting', 'Farewell', 'Help Request', 'Error Handling'].map((template) => (
                            <div key={template} className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer">
                              <span className="text-gray-800">{template}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-800">Behavior Rules</h4>
                        <Textarea
                          placeholder="Define custom rules for your AI's behavior..."
                          className="bg-white border-gray-300 text-gray-800"
                          rows={6}
                        />
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                      Save Manual Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AiTraining;
