import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { useQAPairs } from '@/hooks/useQAPairs';
import { useTrainingDocuments } from '@/hooks/useTrainingDocuments';
import { useVoiceRecordings } from '@/hooks/useVoiceRecordings';
import { useApiTraining } from '@/hooks/useApiTraining';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { usePersonalizedAI } from '@/hooks/usePersonalizedAI';
import { useVoiceCloning } from '@/hooks/useVoiceCloning';
import { useScenarioTemplates } from '@/hooks/useScenarioTemplates';
import { useToast } from '@/hooks/use-toast';
import EmojiPicker from '@/components/EmojiPicker';
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
  Loader2,
  MessageSquare,
  Database,
  Layout,
  Send,
  Smile,
  RotateCcw,
  FileDown,
  FileUp,
  Sheet,
  FileType
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

const AiTraining = () => {
  const [formality, setFormality] = useState([50]);
  const [verbosity, setVerbosity] = useState([70]);
  const [friendliness, setFriendliness] = useState([80]);
  const [personalityMode, setPersonalityMode] = useState('adaptive');
  const [behaviorLearning, setBehaviorLearning] = useState(true);
  const [trainingProgress, setTrainingProgress] = useState(45);
  const [voiceCloningProgress, setVoiceCloningProgress] = useState(0);
  const [trainingStartTime, setTrainingStartTime] = useState<Date | null>(null);
  const [voiceCloningStartTime, setVoiceCloningStartTime] = useState<Date | null>(null);
  const [backgroundProcessing, setBackgroundProcessing] = useState({
    aiTraining: false,
    voiceCloning: false
  });
  const [activeTab, setActiveTab] = useState('qa');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiHeaders, setApiHeaders] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testMessages, setTestMessages] = useState([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [testLoading, setTestLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Voice input hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isVoiceSupported
  } = useVoiceInput();

  // Custom hooks
  const { qaPairs, isLoading: qaLoading, fetchQAPairs, addQAPair, updateQAPair, deleteQAPair } = useQAPairs();
  const { documents, isLoading: docsLoading, uploadProgress, fetchDocuments, uploadDocument, deleteDocument } = useTrainingDocuments();
  const { recordings, isLoading: voiceLoading, isRecording, recordingDuration, fetchRecordings, startNewRecording, stopCurrentRecording, uploadVoiceFile, deleteRecording, formatDuration } = useVoiceRecordings();
  const { apiData, isLoading: apiLoading, isTestingApi, fetchApiData, testApiEndpoint, saveApiTrainingData, deleteApiData } = useApiTraining();
  const { synthesizeSpeech, isPlaying, isSupported } = useCoquiTTS();
  
  // New personalized AI hooks
  const { 
    trainings, 
    isLoading: aiLoading, 
    isTraining, 
    currentTraining, 
    fetchTrainings, 
    createTraining, 
    updateTraining, 
    trainModel, 
    saveDraft 
  } = usePersonalizedAI();
  
  const { 
    clonings, 
    isCloning, 
    startVoiceCloning, 
    getCloningStatus, 
    synthesizeWithClonedVoice, 
    fetchClonedVoices 
  } = useVoiceCloning();
  
  const { 
    templates, 
    isLoading: templatesLoading, 
    fetchTemplates, 
    applyTemplate 
  } = useScenarioTemplates();

  // Additional state for new features
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [previewText, setPreviewText] = useState('Hello! This is how I would respond based on your personality settings.');
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [trainingName, setTrainingName] = useState('');

  // Enhanced training functions
  const handleTrainAI = async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Training Name Required",
        description: "Please provide a name for your AI training session",
        variant: "destructive"
      });
      return;
    }

    console.log('🔄 Starting AI training process...', { 
      trainingName, 
      qaPairsCount: qaPairs.length,
      documentsCount: documents.length,
      recordingsCount: recordings.length 
    });

    try {
      setTrainingStartTime(new Date());
      setTrainingProgress(0);
      setBackgroundProcessing(prev => ({ ...prev, aiTraining: true }));

      // Create training data
      const trainingData = {
        name: trainingName,
        qaPairs: qaPairs,
        documents: documents,
        voiceRecordings: recordings,
        apiData: apiData,
        behaviorData: []
      };

      const personalitySettings = {
        formality: formality[0],
        verbosity: verbosity[0], 
        friendliness: friendliness[0],
        mode: personalityMode as 'human' | 'robot' | 'adaptive',
        behavior_learning: behaviorLearning
      };

      console.log('📊 Training data prepared:', { trainingData, personalitySettings });

      let training;
      if (currentTraining) {
        console.log('🔄 Updating existing training:', currentTraining.id);
        training = await updateTraining(currentTraining.id, trainingData, personalitySettings);
      } else {
        console.log('🆕 Creating new training session...');
        training = await createTraining(trainingData, personalitySettings);
      }

      console.log('✅ Training session created/updated:', training);

      if (training) {
        const progressInterval = setInterval(() => {
          setTrainingProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            const newProgress = prev + Math.random() * 10;
            console.log(`📈 Training progress: ${Math.round(newProgress)}%`);
            return newProgress;
          });
        }, 1000);

        console.log('🧠 Starting model training...');
        await trainModel(training.id);
        setTrainingProgress(100);
        setBackgroundProcessing(prev => ({ ...prev, aiTraining: false }));
        
        const endTime = new Date();
        const duration = trainingStartTime ? Math.round((endTime.getTime() - trainingStartTime.getTime()) / 1000) : 0;
        
        console.log('🎉 AI training completed successfully in', duration, 'seconds');
        
        toast({
          title: "AI Training Complete",
          description: `Your personalized AI model has been trained successfully in ${duration}s!`
        });
      }
    } catch (error) {
      console.error('❌ AI Training failed:', error);
      setBackgroundProcessing(prev => ({ ...prev, aiTraining: false }));
      toast({
        title: "Training Failed",
        description: `Failed to train AI model: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleVoiceCloning = async () => {
    if (recordings.length === 0) {
      toast({
        title: "No Voice Recordings",
        description: "Please record or upload voice samples for cloning",
        variant: "destructive"
      });
      return;
    }

    console.log('🎤 Starting voice cloning process...', { 
      recordingsCount: recordings.length,
      firstRecording: recordings[0] 
    });

    try {
      setVoiceCloningStartTime(new Date());
      setVoiceCloningProgress(0);
      setBackgroundProcessing(prev => ({ ...prev, voiceCloning: true }));

      const voiceSettings = {
        speed: 1.0,
        pitch: 1.0,
        emotion: 'neutral',
        clarity: 1.0
      };

      console.log('🔧 Voice settings configured:', voiceSettings);

      const progressInterval = setInterval(() => {
        setVoiceCloningProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          const newProgress = prev + Math.random() * 5;
          console.log(`🎵 Voice cloning progress: ${Math.round(newProgress)}%`);
          return newProgress;
        });
      }, 1500);

      console.log('🚀 Starting voice cloning with recording:', recordings[0].file_path);
      const cloning = await startVoiceCloning(recordings[0].file_path, voiceSettings);
      
      console.log('✅ Voice cloning result:', cloning);
      
      if (cloning) {
        setVoiceCloningProgress(100);
        setBackgroundProcessing(prev => ({ ...prev, voiceCloning: false }));
        
        const endTime = new Date();
        const duration = voiceCloningStartTime ? Math.round((endTime.getTime() - voiceCloningStartTime.getTime()) / 1000) : 0;
        
        console.log('🎉 Voice cloning completed successfully in', duration, 'seconds');
        
        toast({
          title: "Voice Cloning Complete",
          description: `Your voice has been cloned successfully in ${duration}s!`
        });
      }
    } catch (error) {
      console.error('❌ Voice cloning failed:', error);
      setBackgroundProcessing(prev => ({ ...prev, voiceCloning: false }));
      toast({
        title: "Voice Cloning Failed",
        description: `Failed to start voice cloning: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Handle page visibility change for background processing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (backgroundProcessing.aiTraining || backgroundProcessing.voiceCloning)) {
        toast({
          title: "Background Processing",
          description: "Training continues in the background. You'll be notified when complete.",
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [backgroundProcessing, toast]);

  // Auto-save functionality
  const handleSaveDraft = useCallback(async () => {
    if (!trainingName.trim()) {
      toast({
        title: "Training Name Required",
        description: "Please provide a name before saving draft",
        variant: "destructive"
      });
      return;
    }

    console.log('💾 Saving draft...', { trainingName });

    const trainingData = {
      name: trainingName,
      qaPairs: qaPairs,
      documents: documents,
      voiceRecordings: recordings,
      apiData: apiData,
      behaviorData: []
    };

    const personalitySettings = {
      formality: formality[0],
      verbosity: verbosity[0],
      friendliness: friendliness[0],
      mode: personalityMode as 'human' | 'robot' | 'adaptive',
      behavior_learning: behaviorLearning
    };

    console.log('📝 Draft data prepared:', { trainingData, personalitySettings });

    try {
      await saveDraft(trainingData, personalitySettings);
      setIsDraftSaved(true);
      console.log('✅ Draft saved successfully');
      toast({
        title: "Draft Saved",
        description: "Your training configuration has been saved as draft."
      });
    } catch (error) {
      console.error('❌ Save draft failed:', error);
      toast({
        title: "Save Failed",
        description: `Failed to save draft: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  }, [trainingName, qaPairs, documents, recordings, apiData, formality, verbosity, friendliness, personalityMode, behaviorLearning, saveDraft, toast]);

  // Auto-save when data changes
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (trainingName.trim() && (qaPairs.length > 0 || documents.length > 0 || recordings.length > 0)) {
        console.log('💾 Auto-saving draft...');
        handleSaveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [trainingName, qaPairs, documents, recordings, handleSaveDraft]);

  // Load data on component mount
  useEffect(() => {
    fetchQAPairs();
    fetchDocuments();
    fetchRecordings();
    fetchApiData();
    fetchTrainings();
    fetchClonedVoices();
    fetchTemplates();
  }, [fetchQAPairs, fetchDocuments, fetchRecordings, fetchApiData, fetchTrainings, fetchClonedVoices, fetchTemplates]);

  // Local Q&A state for immediate UI updates
  const [localQAPairs, setLocalQAPairs] = useState<Array<{id: string, question: string, answer: string}>>([]);

  useEffect(() => {
    setLocalQAPairs(qaPairs);
  }, [qaPairs]);

  const addLocalQAPair = () => {
    const newPair = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setLocalQAPairs([...localQAPairs, newPair]);
  };

  const removeLocalQAPair = async (id: string) => {
    if (localQAPairs.length > 1) {
      const isExistingPair = qaPairs.some(pair => pair.id === id);
      if (isExistingPair) {
        await deleteQAPair(id);
      } else {
        setLocalQAPairs(localQAPairs.filter(pair => pair.id !== id));
      }
    }
  };

  const updateLocalQAPair = async (id: string, field: 'question' | 'answer', value: string) => {
    setLocalQAPairs(localQAPairs.map(pair => 
      pair.id === id ? { ...pair, [field]: value } : pair
    ));
    
    // If this is an existing pair, update in database
    const existingPair = qaPairs.find(pair => pair.id === id);
    if (existingPair && (value.trim() !== existingPair[field])) {
      await updateQAPair(id, { [field]: value });
    }
  };

  const saveQAPairs = async () => {
    for (const pair of localQAPairs) {
      const existingPair = qaPairs.find(existing => existing.id === pair.id);
      if (!existingPair && pair.question.trim() && pair.answer.trim()) {
        await addQAPair({
          question: pair.question,
          answer: pair.answer
        });
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      await uploadDocument(file);
    }
  };

  const handleVoiceFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      await uploadVoiceFile(file);
    }
  };

  const handleApiTest = async () => {
    const headers = { ...apiHeaders };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const result = await testApiEndpoint({
      endpoint: apiEndpoint,
      method: apiMethod,
      headers
    });

    if (result.success && result.data) {
      await saveApiTrainingData(apiEndpoint, apiMethod, headers, result.data);
    }
  };

  const switchToTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Test chat functionality
  const sendTestMessage = async () => {
    if (!testMessage.trim() || testLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: testMessage,
      isBot: false,
      timestamp: new Date()
    };

    setTestMessages(prev => [...prev, userMessage]);
    setTestMessage('');
    setTestLoading(true);

    // Simulate AI response (in production, this would call your AI service)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responses = [
        "That's a great question! Let me help you with that.",
        "I understand what you're looking for. Here's what I think...",
        "Based on my training, I'd recommend...",
        "That's interesting! Let me break that down for you.",
        "I can definitely help with that. Here's my approach...",
        "Great point! From my experience with similar questions..."
      ];
      
      const botResponse = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        isBot: true,
        timestamp: new Date()
      };

      setTestMessages(prev => [...prev, botResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Handle voice input
  useEffect(() => {
    if (transcript && !isListening) {
      setTestMessage(prev => prev + ' ' + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  // Export Q&A functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      localQAPairs.map((pair, index) => ({
        'No.': index + 1,
        'Question': pair.question,
        'Answer': pair.answer
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QA Pairs');
    XLSX.writeFile(workbook, 'qa_pairs.xlsx');
    toast({
      title: "Export Successful",
      description: "Q&A pairs exported to Excel file",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Q&A Training Pairs', 20, 20);
    
    let yPosition = 40;
    localQAPairs.forEach((pair, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. Q: ${pair.question}`, 20, yPosition);
      yPosition += 10;
      
      const answerLines = doc.splitTextToSize(`A: ${pair.answer}`, 170);
      doc.text(answerLines, 20, yPosition);
      yPosition += (answerLines.length * 7) + 10;
    });
    
    doc.save('qa_pairs.pdf');
    toast({
      title: "Export Successful",
      description: "Q&A pairs exported to PDF file",
    });
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(localQAPairs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    saveAs(dataBlob, 'qa_pairs.json');
    toast({
      title: "Export Successful",
      description: "Q&A pairs exported to JSON file",
    });
  };

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedPairs: any[] = [];

        if (file.name.endsWith('.json')) {
          importedPairs = JSON.parse(content);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(content, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          importedPairs = XLSX.utils.sheet_to_json(worksheet);
        }

        const newPairs = importedPairs.map((pair: any, index: number) => ({
          id: `imported_${Date.now()}_${index}`,
          question: pair.Question || pair.question || '',
          answer: pair.Answer || pair.answer || ''
        })).filter(pair => pair.question && pair.answer);

        setLocalQAPairs([...localQAPairs, ...newPairs]);
        toast({
          title: "Import Successful",
          description: `Imported ${newPairs.length} Q&A pairs`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import file. Please check the format.",
          variant: "destructive"
        });
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }

    // Reset the input
    event.target.value = '';
  };

  const trainingMethods = [
    {
      id: 'qa',
      title: 'Q&A Format',
      icon: MessageCircle,
      description: 'Train with question-answer pairs',
      gradient: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
      textColor: 'text-white',
      borderColor: 'border-blue-200 hover:border-blue-300'
    },
    {
      id: 'document',
      title: 'Document Upload',
      icon: FileText,
      description: 'Upload PDF, DOCX, TXT files',
      gradient: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600',
      textColor: 'text-white',
      borderColor: 'border-green-200 hover:border-green-300'
    },
    {
      id: 'api',
      title: 'API Data Training',
      icon: Globe,
      description: 'Connect external APIs for real-time data',
      gradient: 'bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-600',
      textColor: 'text-white',
      borderColor: 'border-indigo-200 hover:border-indigo-300'
    },
    {
      id: 'voice',
      title: 'Voice Training',
      icon: Mic,
      description: 'Train with voice samples',
      gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600',
      textColor: 'text-white',
      borderColor: 'border-purple-200 hover:border-purple-300'
    },
    {
      id: 'behavior',
      title: 'Behavior Learning',
      icon: Brain,
      description: 'AI learns from user interactions',
      gradient: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600',
      textColor: 'text-white',
      borderColor: 'border-orange-200 hover:border-orange-300'
    },
    {
      id: 'scenario',
      title: 'Scenario Templates',
      icon: Users,
      description: 'Pre-built role templates',
      gradient: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600',
      textColor: 'text-white',
      borderColor: 'border-teal-200 hover:border-teal-300'
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
                    className={`p-4 rounded-xl border ${method.borderColor} ${method.gradient} hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-105`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => switchToTab(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className={`w-5 h-5 ${method.textColor}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${method.textColor} text-sm mb-1`}>{method.title}</h4>
                        <p className={`text-xs ${method.textColor} opacity-90 line-clamp-2`}>{method.description}</p>
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
                 <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                   <div>
                     <Label className="text-gray-800 font-medium text-sm">Behavior Learning Mode</Label>
                     <p className="text-xs text-gray-600">AI learns from user interactions</p>
                   </div>
                   <Switch
                     checked={behaviorLearning}
                     onCheckedChange={setBehaviorLearning}
                     className="data-[state=checked]:bg-amber-500"
                   />
                 </div>

                 {/* AI Response Preview */}
                 <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                   <Label className="text-gray-800 font-medium text-sm mb-2 block">Response Preview</Label>
                   <div className="text-sm text-gray-700 italic">
                     "{previewText}"
                   </div>
                   <div className="flex gap-2 mt-2">
                     <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                       Mode: {personalityMode}
                     </div>
                     <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                       Formality: {formality[0]}%
                     </div>
                     <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                       Learning: {behaviorLearning ? 'ON' : 'OFF'}
                     </div>
                   </div>
                 </div>

                 {/* Scenario Templates */}
                 <div className="mt-4">
                   <Label className="text-gray-700 mb-2 block text-sm">Quick Apply Templates</Label>
                   <div className="grid grid-cols-2 gap-2">
                     {templates.slice(0, 4).map((template) => (
                       <Button
                         key={template.id}
                         variant="outline"
                         size="sm"
                         className="text-xs p-2 h-auto flex flex-col items-center gap-1"
                         onClick={() => {
                           const applied = applyTemplate(template);
                           setFormality([applied.personalitySettings.formality]);
                           setVerbosity([applied.personalitySettings.verbosity]);
                           setFriendliness([applied.personalitySettings.friendliness]);
                           setPersonalityMode(applied.personalitySettings.mode);
                           setSelectedTemplate(template.id);
                         }}
                       >
                         <span className="font-medium">{template.template_name}</span>
                         <span className="text-xs text-gray-500">{template.template_type}</span>
                       </Button>
                     ))}
                   </div>
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
                <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-blue-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div 
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => switchToTab('qa')}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-bold text-gray-800">Q&A Pairs</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg px-4 py-2 font-bold">
                    {localQAPairs.length}
                  </Badge>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => switchToTab('document')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-bold text-gray-800">Documents</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg px-4 py-2 font-bold">
                    {documents.length}
                  </Badge>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => switchToTab('voice')}
                >
                  <div className="flex items-center gap-3">
                    <Mic className="w-6 h-6 text-purple-600" />
                    <span className="text-lg font-bold text-gray-800">Voice</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2 font-bold">
                    {recordings.length}
                  </Badge>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => switchToTab('api')}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-bold text-gray-800">API Data</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-lg px-4 py-2 font-bold">
                    {apiData.length}
                  </Badge>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => switchToTab('scenario')}
                >
                  <div className="flex items-center gap-3">
                    <Layout className="w-6 h-6 text-teal-600" />
                    <span className="text-lg font-bold text-gray-800">Templates</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-green-500 text-white text-lg px-4 py-2 font-bold">
                    {scenarioTemplates.length}
                  </Badge>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => switchToTab('test')}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                    <span className="text-lg font-bold text-gray-800">Test Chat</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-4 py-2 font-bold">
                    Pro
                  </Badge>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Training Area */}
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              {/* Fixed Tab Layout with proper spacing - Reordered with API Data at end */}
              <div className="mb-8">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <TabsList className="flex w-max min-w-full h-auto bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl p-3 shadow-lg gap-3">
                    <TabsTrigger 
                      value="qa" 
                      className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-blue-50 data-[state=inactive]:to-purple-50 data-[state=inactive]:text-blue-700 text-lg lg:text-xl font-bold px-8 py-5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center gap-3 min-w-fit whitespace-nowrap"
                    >
                      <MessageSquare className="w-6 h-6" />
                      Q&A Format
                    </TabsTrigger>
                    <TabsTrigger 
                      value="document" 
                      className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-green-50 data-[state=inactive]:to-teal-50 data-[state=inactive]:text-green-700 text-lg lg:text-xl font-bold px-8 py-5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center gap-3 min-w-fit whitespace-nowrap"
                    >
                      <FileText className="w-6 h-6" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger 
                      value="voice" 
                      className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-purple-50 data-[state=inactive]:to-pink-50 data-[state=inactive]:text-purple-700 text-lg lg:text-xl font-bold px-8 py-5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center gap-3 min-w-fit whitespace-nowrap"
                    >
                      <Mic className="w-6 h-6" />
                      Voice
                    </TabsTrigger>
                    <TabsTrigger 
                      value="test" 
                      className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-orange-50 data-[state=inactive]:to-red-50 data-[state=inactive]:text-orange-700 text-lg lg:text-xl font-bold px-8 py-5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center gap-3 min-w-fit whitespace-nowrap"
                    >
                      <MessageCircle className="w-6 h-6" />
                      Test Chat
                    </TabsTrigger>
                    <TabsTrigger 
                      value="scenario" 
                      className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-teal-50 data-[state=inactive]:to-green-50 data-[state=inactive]:text-teal-700 text-lg lg:text-xl font-bold px-8 py-5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center gap-3 min-w-fit whitespace-nowrap"
                    >
                      <Layout className="w-6 h-6" />
                      Templates
                    </TabsTrigger>
                    <TabsTrigger 
                      value="api" 
                      className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-indigo-50 data-[state=inactive]:to-blue-50 data-[state=inactive]:text-indigo-700 text-lg lg:text-xl font-bold px-8 py-5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center gap-3 min-w-fit whitespace-nowrap"
                    >
                      <Database className="w-6 h-6" />
                      API Data
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Q&A Training */}
              <TabsContent value="qa" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Teach Your AI with Q&A Pairs
                    </CardTitle>
                    <div className="flex space-x-2">
                      {/* Import Dropdown */}
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json,.xlsx,.xls"
                          onChange={importFromFile}
                          className="hidden"
                          id="import-qa"
                        />
                        <label htmlFor="import-qa">
                          <Button 
                            variant="outline"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Import Q&A
                            </span>
                          </Button>
                        </label>
                      </div>
                      
                      {/* Export Dropdown */}
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline"
                          onClick={exportToExcel}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Sheet className="w-4 h-4 mr-2" />
                          Excel
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={exportToPDF}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <FileType className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={exportToJSON}
                          className="border-purple-300 text-purple-600 hover:bg-purple-50"
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          JSON
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={addLocalQAPair}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Q&A Pair
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {qaLoading && (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Loading Q&A pairs...</span>
                      </div>
                    )}
                    {localQAPairs.map((pair, index) => (
                      <motion.div
                        key={pair.id}
                        className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gradient-to-r from-white/80 to-blue-50/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex justify-between items-center">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            Q&A Pair #{index + 1}
                          </Badge>
                          {localQAPairs.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeLocalQAPair(pair.id)}
                              className="text-red-500 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-gray-700 font-medium">Question</Label>
                          <Input
                            value={pair.question}
                            onChange={(e) => updateLocalQAPair(pair.id, 'question', e.target.value)}
                            placeholder="What services do you offer?"
                            className="bg-white border-gray-300 text-gray-800 mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-700 font-medium">Answer</Label>
                          <Textarea
                            value={pair.answer}
                            onChange={(e) => updateLocalQAPair(pair.id, 'answer', e.target.value)}
                            placeholder="I specialize in digital marketing, content creation, and brand strategy..."
                            className="bg-white border-gray-300 text-gray-800 mt-1"
                            rows={3}
                          />
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="flex space-x-4 pt-4">
                      <Button 
                        onClick={saveQAPairs}
                        disabled={qaLoading}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white w-full"
                      >
                        {qaLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
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
                    <CardTitle className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-between">
                      <span>Document Upload Training</span>
                      <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                        {documents.length} files uploaded
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {docsLoading && (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                        <span className="ml-2 text-gray-600">Uploading document...</span>
                      </div>
                    )}
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Upload Progress</span>
                          <span className="text-green-600">{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gradient-to-r from-white/80 to-green-50/50">
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
                          disabled={docsLoading}
                        >
                          <span>
                            <FileText className="w-4 h-4 mr-2" />
                            Choose Files
                          </span>
                        </Button>
                      </Label>
                    </div>
                    
                    {documents.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-800 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Uploaded Documents:
                        </h4>
                        {documents.map((doc, index) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-green-500" />
                              <div>
                                <span className="text-gray-800 font-medium">{doc.filename}</span>
                                <div className="text-xs text-gray-600">
                                  {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    {doc.processing_status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDocument(doc.id, doc.file_path)}
                              className="text-red-500 border-red-300 hover:bg-red-50"
                              disabled={docsLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          disabled={docsLoading}
                          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                        >
                          {docsLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4 mr-2" />
                          )}
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
                    <CardTitle className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                      API Data Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {apiLoading && (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="ml-2 text-gray-600">Testing API...</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="text-gray-700 font-medium">API Endpoint</Label>
                        <Input
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                          placeholder="https://api.example.com/data"
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-gray-700 font-medium">HTTP Method</Label>
                        <select 
                          value={apiMethod}
                          onChange={(e) => setApiMethod(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-gray-700 font-medium">API Key / Token</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key..."
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleApiTest}
                        disabled={apiLoading || isTestingApi || !apiEndpoint.trim()}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white relative"
                      >
                        {isTestingApi ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Globe className="w-4 h-4 mr-2" />
                        )}
                        Test API
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs px-1.5 py-0.5 rounded-full text-black font-bold">
                          Coming Soon
                        </span>
                      </Button>
                      <Button 
                        disabled={true}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white relative opacity-60"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Connect API
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs px-1.5 py-0.5 rounded-full text-black font-bold">
                          Coming Soon
                        </span>
                      </Button>
                    </div>
                    
                    {/* API Data List */}
                    {apiData.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 text-indigo-500 mr-2" />
                          Connected APIs:
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {apiData.map((api) => (
                            <div key={api.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                              <div className="flex items-center space-x-3">
                                <Globe className="w-4 h-4 text-indigo-500" />
                                <div>
                                  <div className="text-sm font-medium text-gray-800 truncate max-w-40">{api.api_endpoint}</div>
                                  <div className="text-xs text-gray-600">
                                    {api.api_method} • {new Date(api.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteApiData(api.id)}
                                className="text-red-500 border-red-300 hover:bg-red-50"
                                disabled={apiLoading}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Training */}
              <TabsContent value="voice" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                        <Mic className="w-5 h-5 mr-2 text-purple-500" />
                        Voice Recording & Upload
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {voiceLoading && (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                          <span className="ml-2 text-gray-600">Processing voice...</span>
                        </div>
                      )}
                      
                      {/* Recording Section */}
                      <div className="text-center p-6 border border-gray-200 rounded-lg bg-gradient-to-r from-white/80 to-purple-50/50">
                        <Mic className={`w-16 h-16 mx-auto mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-purple-500'}`} />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {isRecording ? `Recording... ${formatDuration(recordingDuration)}` : 'Record Your Voice'}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          Speak clearly to train your AI assistant's voice responses
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={isRecording ? stopCurrentRecording : startNewRecording}
                            disabled={voiceLoading}
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
                      </div>
                      
                      {/* Voice Upload Section */}
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-gradient-to-r from-white/80 to-pink-50/50">
                        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2 font-medium">
                          Upload Voice Files
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Supported formats: MP3, WAV, M4A (Max 25MB per file)
                        </p>
                        <Input
                          type="file"
                          multiple
                          accept=".mp3,.wav,.m4a,.webm"
                          onChange={handleVoiceFileUpload}
                          className="hidden"
                          id="voice-upload"
                        />
                        <Label htmlFor="voice-upload">
                          <Button 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            asChild
                            disabled={voiceLoading}
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Voice Files
                            </span>
                          </Button>
                        </Label>
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
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">High</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Duration</span>
                            <span className="text-gray-800 text-sm">{formatDuration(recordingDuration)} / 5:00</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-pink-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Voice Library & Recordings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Voice Type Selection */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all">
                          <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Professional</div>
                          <div className="text-xs text-gray-600">Business tone</div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all">
                          <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Casual</div>
                          <div className="text-xs text-gray-600">Friendly tone</div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
                          <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Technical</div>
                          <div className="text-xs text-gray-600">Expert tone</div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg text-center cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all">
                          <Plus className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <div className="text-sm font-medium text-gray-800">Custom</div>
                          <div className="text-xs text-gray-600">Upload voice</div>
                        </div>
                      </div>
                      
                      {/* Voice Recordings List */}
                      {recordings.length > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-800 mb-3">Your Recordings</h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {recordings.map((recording) => (
                              <div key={recording.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded border border-purple-200">
                                <div className="flex items-center space-x-2">
                                  <Mic className="w-4 h-4 text-purple-500" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-800">{recording.filename}</div>
                                    {recording.transcription && (
                                      <div className="text-xs text-gray-600 truncate max-w-32">
                                        {recording.transcription}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteRecording(recording.id, recording.file_path)}
                                  className="text-red-500 border-red-300 hover:bg-red-50"
                                  disabled={voiceLoading}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-800 mb-3">Training Progress</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Voice Samples</span>
                            <span className="text-gray-800">{recordings.length}/10</span>
                          </div>
                          <Progress value={(recordings.length / 10) * 100} className="h-2" />
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
                    <CardTitle className="bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent flex items-center">
                      <Layout className="w-5 h-5 mr-2 text-teal-500" />
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
                            className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white flex items-center justify-center gap-2"
                          >
                            <Layout className="w-4 h-4" />
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
                    <CardTitle className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-orange-500" />
                        Live Chat Testing Window
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestMessages([{
                          id: '1',
                          content: 'Hello! How can I help you today?',
                          isBot: true,
                          timestamp: new Date()
                        }])}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Chat
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 h-96 mb-4 overflow-y-auto border border-gray-200">
                      <div className="space-y-3">
                        {testMessages.map((message) => (
                          <motion.div
                            key={message.id}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isBot 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                                : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800'
                            }`}>
                              {message.content}
                            </div>
                          </motion.div>
                        ))}
                        {testLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-2 max-w-xs">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="flex items-end space-x-2">
                        <div className="flex-1 relative">
                          <Input
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !testLoading && sendTestMessage()}
                            placeholder="Type your test message..."
                            className="bg-white border-gray-300 pr-20"
                            disabled={testLoading}
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className="p-1 h-8 w-8 text-yellow-500 hover:bg-yellow-50"
                            >
                              <Smile className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => isListening ? stopListening() : startListening()}
                              className={`p-1 h-8 w-8 ${isListening ? 'text-red-500 hover:bg-red-50' : 'text-blue-500 hover:bg-blue-50'}`}
                              disabled={!isVoiceSupported}
                            >
                              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          onClick={sendTestMessage}
                          disabled={testLoading || !testMessage.trim()}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                        >
                          {testLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 right-0 z-50">
                          <EmojiPicker
                            isOpen={showEmojiPicker}
                            onEmojiSelect={(emoji) => {
                              setTestMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Voice Input Feedback */}
                    {isListening && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-blue-700">Listening... Speak clearly</span>
                        </div>
                        {transcript && (
                          <p className="text-sm text-gray-700 mt-2 italic">"{transcript}"</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Progress and Action Bar */}
        <motion.div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 space-y-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Progress Indicators */}
          {(backgroundProcessing.aiTraining || backgroundProcessing.voiceCloning) && (
            <Card className="bg-white/95 backdrop-blur-sm border-blue-200 shadow-lg p-4 min-w-[600px]">
              <CardContent className="p-0 space-y-3">
                {backgroundProcessing.aiTraining && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-purple-500" />
                        AI Training Progress
                      </span>
                      <span className="text-xs text-gray-500">
                        {trainingStartTime && `${Math.round((Date.now() - trainingStartTime.getTime()) / 1000)}s`}
                      </span>
                    </div>
                    <Progress value={trainingProgress} className="h-3 bg-gray-200">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${trainingProgress}%` }}
                      />
                    </Progress>
                    <p className="text-xs text-gray-600 mt-1 flex items-center justify-between">
                      <span>{Math.round(trainingProgress)}% complete</span>
                      <span className="text-purple-600 font-medium">
                        {trainingProgress < 30 ? 'Processing documents...' : 
                         trainingProgress < 60 ? 'Training Q&A pairs...' : 
                         trainingProgress < 100 ? 'Fine-tuning model...' : 'Complete!'}
                      </span>
                    </p>
                  </div>
                )}
                
                {backgroundProcessing.voiceCloning && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Volume2 className="w-4 h-4 mr-2 text-green-500" />
                        Voice Cloning Progress
                      </span>
                      <span className="text-xs text-gray-500">
                        {voiceCloningStartTime && `${Math.round((Date.now() - voiceCloningStartTime.getTime()) / 1000)}s`}
                      </span>
                    </div>
                    <Progress value={voiceCloningProgress} className="h-3 bg-gray-200">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-300"
                        style={{ width: `${voiceCloningProgress}%` }}
                      />
                    </Progress>
                    <p className="text-xs text-gray-600 mt-1 flex items-center justify-between">
                      <span>{Math.round(voiceCloningProgress)}% complete</span>
                      <span className="text-green-600 font-medium">
                        {voiceCloningProgress < 50 ? 'Analyzing voice patterns...' : 
                         voiceCloningProgress < 100 ? 'Generating voice model...' : 'Complete!'}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Bars - Enhanced */}
          {(backgroundProcessing.aiTraining || backgroundProcessing.voiceCloning) && (
            <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-500" />
                  Training Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {backgroundProcessing.aiTraining && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">AI Training Progress</span>
                        <Badge variant={trainingProgress === 100 ? "default" : "secondary"} className="text-xs">
                          {trainingProgress === 100 ? 'Complete' : 'Processing'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {trainingStartTime && `${Math.round((Date.now() - trainingStartTime.getTime()) / 1000)}s`}
                      </span>
                    </div>
                    <Progress value={trainingProgress} className="h-4 bg-gray-200">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                        style={{ width: `${trainingProgress}%` }}
                      />
                    </Progress>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-purple-600">{Math.round(trainingProgress)}% complete</span>
                      <span className="text-gray-600 capitalize">
                        {trainingProgress < 30 ? 'Processing documents...' : 
                         trainingProgress < 60 ? 'Training Q&A pairs...' : 
                         trainingProgress < 100 ? 'Fine-tuning model...' : '✅ Training Complete!'}
                      </span>
                    </div>
                  </div>
                )}
                
                {backgroundProcessing.voiceCloning && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Voice Cloning Progress</span>
                        <Badge variant={voiceCloningProgress === 100 ? "default" : "secondary"} className="text-xs">
                          {voiceCloningProgress === 100 ? 'Complete' : 'Processing'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {voiceCloningStartTime && `${Math.round((Date.now() - voiceCloningStartTime.getTime()) / 1000)}s`}
                      </span>
                    </div>
                    <Progress value={voiceCloningProgress} className="h-4 bg-gray-200">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-500 rounded-full"
                        style={{ width: `${voiceCloningProgress}%` }}
                      />
                    </Progress>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-green-600">{Math.round(voiceCloningProgress)}% complete</span>
                      <span className="text-gray-600 capitalize">
                        {voiceCloningProgress < 50 ? 'Analyzing voice patterns...' : 
                         voiceCloningProgress < 100 ? 'Generating voice model...' : '✅ Voice Cloning Complete!'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Floating Action Buttons - Centered */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl p-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handleSaveDraft}
                  disabled={isTraining || !trainingName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px] px-4 py-2 rounded-xl"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isDraftSaved ? 'Saved' : 'Save Draft'}
                </Button>
                
                <Button
                  onClick={handleTrainAI}
                  disabled={isTraining || backgroundProcessing.aiTraining || !trainingName.trim() || (qaPairs.length === 0 && documents.length === 0)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px] px-4 py-2 rounded-xl"
                  size="sm"
                >
                  {isTraining || backgroundProcessing.aiTraining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Training...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Train AI
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleVoiceCloning}
                  disabled={isCloning || backgroundProcessing.voiceCloning || recordings.length === 0}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px] px-4 py-2 rounded-xl"
                  size="sm"
                >
                  {isCloning || backgroundProcessing.voiceCloning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cloning...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Clone Voice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AiTraining;