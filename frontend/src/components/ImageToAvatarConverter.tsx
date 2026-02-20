import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground, loadImage } from '@/lib/imageProcessing';
import { analyzeImageForAvatar } from '@/lib/faceAnalysis';

interface ImageToAvatarConverterProps {
  onConfigGenerated: (config: any) => void;
}

const ImageToAvatarConverter: React.FC<ImageToAvatarConverterProps> = ({ onConfigGenerated }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [detectedFeatures, setDetectedFeatures] = useState<any>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setProcessedImage(null);
        setDetectedFeatures(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processImageToAvatar = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setProcessingStep('Analyzing image...');

    try {
      // Convert data URL to blob
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      
      // Load image element
      const imageElement = await loadImage(blob);
      
      setProcessingStep('Removing background...');
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
      setProcessingStep('Analyzing facial features...');
      
      // Analyze image for avatar generation
      const analysis = await analyzeImageForAvatar(imageElement);
      setDetectedFeatures(analysis);
      
      setProcessingStep('Generating avatar configuration...');
      
      // Generate avatar configuration based on analysis
      const avatarConfig = generateAvatarConfig(analysis);
      
      setProcessingStep('Complete!');
      
      // Apply the generated configuration
      onConfigGenerated(avatarConfig);
      
      toast.success('Avatar generated from image successfully!');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try a different photo.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const generateAvatarConfig = (analysis: any) => {
    // Generate avatar configuration based on image analysis
    return {
      // Basic demographics from analysis
      gender: analysis.gender || 'male',
      age: analysis.estimatedAge || 25,
      ethnicity: analysis.ethnicity || 'caucasian',
      
      // Body proportions (estimated)
      height: analysis.bodyType?.height || 170,
      weight: analysis.bodyType?.weight || 70,
      muscle: analysis.bodyType?.muscle || 50,
      fat: analysis.bodyType?.fat || 20,
      
      // Facial structure
      headSize: analysis.faceStructure?.headSize || 50,
      headShape: analysis.faceStructure?.headShape || 'oval',
      faceWidth: analysis.faceStructure?.faceWidth || 50,
      jawline: analysis.faceStructure?.jawline || 50,
      cheekbones: analysis.faceStructure?.cheekbones || 50,
      
      // Eyes
      eyeSize: analysis.eyes?.size || 50,
      eyeDistance: analysis.eyes?.distance || 50,
      eyeShape: analysis.eyes?.shape || 'almond',
      eyeColor: analysis.eyes?.color || '#8B4513',
      
      // Nose
      noseSize: analysis.nose?.size || 50,
      noseWidth: analysis.nose?.width || 50,
      noseShape: analysis.nose?.shape || 'straight',
      
      // Mouth
      mouthWidth: analysis.mouth?.width || 50,
      lipThickness: analysis.mouth?.lipThickness || 50,
      lipShape: analysis.mouth?.shape || 'normal',
      
      // Ears
      earSize: analysis.ears?.size || 50,
      earPosition: analysis.ears?.position || 50,
      earShape: analysis.ears?.shape || 'normal',
      
      // Skin and hair
      skinTone: analysis.skin?.tone || '#F1C27D',
      skinTexture: analysis.skin?.texture || 'smooth',
      hairStyle: analysis.hair?.style || 'medium',
      hairColor: analysis.hair?.color || '#8B4513',
      hairLength: analysis.hair?.length || 50,
      
      // Facial hair
      facialHair: analysis.facialHair?.type || 'none',
      facialHairColor: analysis.facialHair?.color || '#8B4513',
      
      // Expression detected
      currentExpression: analysis.expression || 'neutral',
      currentPose: 'standing',
      
      // Clothing (basic estimation)
      clothingTop: analysis.clothing?.top || 'tshirt',
      clothingBottom: analysis.clothing?.bottom || 'jeans',
      shoes: analysis.clothing?.shoes || 'sneakers',
      
      // Meta
      avatarName: 'Generated from Photo',
      generatedFromPhoto: true
    };
  };

  return (
    <div className="space-y-4">
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Photo to Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedImage ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-image-upload"
              />
              <label 
                htmlFor="avatar-image-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm font-medium">Upload a photo</div>
                <div className="text-xs text-muted-foreground">
                  Best results with clear face photos
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Original Image */}
                <div>
                  <div className="text-xs font-medium mb-2">Original Photo</div>
                  <img 
                    src={uploadedImage} 
                    alt="Original" 
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
                
                {/* Processed Image */}
                {processedImage && (
                  <div>
                    <div className="text-xs font-medium mb-2">Processed</div>
                    <img 
                      src={processedImage} 
                      alt="Processed" 
                      className="w-full h-32 object-cover rounded border bg-checkerboard"
                    />
                  </div>
                )}
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {processingStep}
                </div>
              )}

              {/* Detected Features */}
              {detectedFeatures && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Detected Features</div>
                  <div className="flex flex-wrap gap-1">
                    {detectedFeatures.gender && (
                      <Badge variant="secondary" className="text-xs">
                        {detectedFeatures.gender}
                      </Badge>
                    )}
                    {detectedFeatures.estimatedAge && (
                      <Badge variant="secondary" className="text-xs">
                        Age: {detectedFeatures.estimatedAge}
                      </Badge>
                    )}
                    {detectedFeatures.hair?.style && (
                      <Badge variant="secondary" className="text-xs">
                        {detectedFeatures.hair.style} hair
                      </Badge>
                    )}
                    {detectedFeatures.eyes?.color && (
                      <Badge variant="secondary" className="text-xs">
                        {detectedFeatures.eyes.color} eyes
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={processImageToAvatar}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Avatar
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedImage(null);
                    setProcessedImage(null);
                    setDetectedFeatures(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="avatar-control-panel">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Photo Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use well-lit, front-facing photos</li>
            <li>• Avoid sunglasses or face obstructions</li>
            <li>• Higher resolution images work better</li>
            <li>• Neutral expressions are recommended</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageToAvatarConverter;