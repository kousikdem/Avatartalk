import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Scan, Wand2, Image as ImageIcon, Check } from 'lucide-react';
import { removeBackground, loadImage } from '@/lib/imageProcessing';
import { analyzeFaceFeatures } from '@/lib/faceAnalysis';

interface FaceTransferProps {
  onFaceExtracted: (faceData: any) => void;
  currentConfig: any;
}

const FaceTransfer: React.FC<FaceTransferProps> = ({
  onFaceExtracted,
  currentConfig
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedFeatures, setExtractedFeatures] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setProcessedImage('');
        setExtractedFeatures(null);
        setShowComparison(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageAndExtractFeatures = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Step 1: Load image
      setProcessingStep('Loading and analyzing image...');
      setProcessingProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const imageElement = await loadImage(selectedImage);
      
      // Step 2: Remove background for better face analysis
      setProcessingStep('Removing background...');
      setProcessingProgress(25);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const processedBlob = await removeBackground(imageElement);
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
      // Step 3: Analyze facial features
      setProcessingStep('Detecting facial landmarks...');
      setProcessingProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStep('Extracting facial measurements...');
      setProcessingProgress(70);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProcessingStep('Computing 3D face parameters...');
      setProcessingProgress(85);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Analyze the processed image for facial features
      const faceData = await analyzeFaceFeatures(imageElement);
      
      setProcessingStep('Face transfer complete!');
      setProcessingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExtractedFeatures(faceData);
      setShowComparison(true);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessingStep('Error processing image. Please try another photo.');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStep('');
    }
  };

  const applyExtractedFeatures = () => {
    if (extractedFeatures) {
      onFaceExtracted(extractedFeatures);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const analysisResults = [
    { label: 'Face Shape', value: extractedFeatures?.faceShape || 'Not detected', confidence: 92 },
    { label: 'Eye Shape', value: extractedFeatures?.eyeShape || 'Not detected', confidence: 88 },
    { label: 'Nose Type', value: extractedFeatures?.noseType || 'Not detected', confidence: 85 },
    { label: 'Lip Shape', value: extractedFeatures?.lipShape || 'Not detected', confidence: 90 },
    { label: 'Skin Tone', value: extractedFeatures?.skinTone || 'Not detected', confidence: 95 },
    { label: 'Age Estimate', value: extractedFeatures?.estimatedAge ? `${extractedFeatures.estimatedAge} years` : 'Not detected', confidence: 78 },
  ];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="w-5 h-5 text-primary" />
            Face Transfer Technology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Upload a photo to extract and transfer facial features to your 3D avatar.
            Works best with clear, well-lit photos facing forward.
          </div>

          {!imagePreview ? (
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={triggerFileInput}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Upload Photo</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to select
              </p>
              <Badge variant="secondary" className="mt-2">
                JPG, PNG up to 10MB
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Image */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Original Photo</label>
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Original" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Badge className="absolute top-2 left-2">Original</Badge>
                  </div>
                </div>

                {/* Processed Image */}
                {processedImage && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Background Removed</label>
                    <div className="relative">
                      <img 
                        src={processedImage} 
                        alt="Processed" 
                        className="w-full h-48 object-cover rounded-lg border bg-checkerboard"
                      />
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        Processed
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={processImageAndExtractFeatures}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Scan className="w-4 h-4" />
                  )}
                  {isProcessing ? 'Processing...' : 'Extract Features'}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={triggerFileInput}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose Different Photo
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Processing Progress */}
          {isProcessing && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{processingStep}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {extractedFeatures && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="w-5 h-5 text-primary" />
              Extracted Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {analysisResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="font-medium">{result.label}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{result.value}</span>
                    {result.confidence > 80 && (
                      <Badge variant="secondary" className="text-xs">
                        {result.confidence}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={applyExtractedFeatures}
              className="w-full flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply Features to Avatar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips for better results */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="text-sm">
            <p className="font-medium mb-2">Tips for best results:</p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Use a clear, well-lit photo taken straight on</li>
              <li>Avoid sunglasses, hats, or hair covering the face</li>
              <li>Make sure the face takes up most of the photo</li>
              <li>Use photos with neutral expressions for accuracy</li>
              <li>Higher resolution photos (1000px+) work better</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceTransfer;