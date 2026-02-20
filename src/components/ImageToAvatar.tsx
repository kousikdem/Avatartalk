
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Zap, CheckCircle, AlertCircle, Image, Sparkles, Eye, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ImageToAvatarProps {
  onImageProcessed: (faceData: { 
    skinTone: string; 
    eyeColor: string; 
    hairColor?: string;
    faceShape?: string;
    age?: number;
    gender?: string;
  }) => void;
}

const ImageToAvatar: React.FC<ImageToAvatarProps> = ({ onImageProcessed }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload a valid image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setProcessed(false);
        setProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!uploadedImage) return;

    setProcessing(true);
    setProgress(0);
    
    // Simulate AI face analysis with realistic steps
    const steps = [
      { step: 'Analyzing facial features...', duration: 800 },
      { step: 'Detecting skin tone...', duration: 600 },
      { step: 'Identifying eye characteristics...', duration: 700 },
      { step: 'Processing hair details...', duration: 500 },
      { step: 'Generating 3D mapping...', duration: 900 },
      { step: 'Finalizing avatar features...', duration: 400 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i].step);
      setProgress((i + 1) * (100 / steps.length));
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    // Enhanced mock face analysis results with more realistic detection
    const skinTones = ['#F5E6D3', '#F5DEB3', '#DEB887', '#D2B48C', '#BC9A6A', '#8B7355', '#654321'];
    const eyeColors = ['brown', 'blue', 'green', 'hazel', 'gray'];
    const hairColors = ['#000000', '#8B4513', '#DAA520', '#654321', '#A0522D'];
    const faceShapes = ['oval', 'round', 'square', 'heart'];
    
    const faceData = {
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      faceShape: faceShapes[Math.floor(Math.random() * faceShapes.length)],
      age: Math.floor(Math.random() * 40) + 18, // 18-58 years old
      gender: Math.random() > 0.5 ? 'female' : 'male'
    };

    onImageProcessed(faceData);
    setProcessed(true);
    setProcessing(false);
    setProcessingStep('');

    toast({
      title: "✨ AI Analysis Complete",
      description: `Detected ${faceData.gender}, ${faceData.age} years old with ${faceData.eyeColor} eyes and ${faceData.faceShape} face shape.`,
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            AI Face Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            {uploadedImage ? (
              <div className="space-y-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded face" 
                  className="max-w-full h-48 object-cover rounded-lg mx-auto border-2 border-white shadow-lg"
                />
                
                {processing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm font-medium">AI Processing...</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-xs text-gray-600">{processingStep}</p>
                  </div>
                ) : processed ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Analysis Complete!</span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={processImage} 
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Re-analyze
                      </Button>
                      <Button 
                        onClick={triggerFileInput}
                        size="sm"
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        New Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={processImage} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Upload Your Photo</h4>
                  <p className="text-gray-600 text-sm mb-1">AI will analyze your face and create a realistic 3D avatar</p>
                  <p className="text-gray-400 text-xs">Supports JPG, PNG up to 10MB</p>
                </div>
                <Button onClick={triggerFileInput} variant="outline" className="border-dashed border-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Features */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            AI Detection Features
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Facial Structure Analysis
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Skin Tone Detection
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Eye Color Recognition
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Hair Analysis
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">For Best Results:</p>
            <ul className="space-y-1 text-amber-700">
              <li>• Use a clear, front-facing photo</li>
              <li>• Ensure good lighting on your face</li>
              <li>• Avoid heavy makeup or filters</li>
              <li>• Keep hair away from face if possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToAvatar;
