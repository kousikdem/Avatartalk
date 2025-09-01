
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageToAvatarProps {
  onImageProcessed: (faceData: { skinTone: string; eyeColor: string; hairColor: string }) => void;
}

const ImageToAvatar: React.FC<ImageToAvatarProps> = ({ onImageProcessed }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setProcessed(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!uploadedImage) return;

    setProcessing(true);
    
    // Simulate AI face analysis (in real implementation, this would use AI services)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock face analysis results
    const faceData = {
      skinTone: '#DEB887', // Detected skin tone
      eyeColor: 'brown',   // Detected eye color
      hairColor: '#8B4513' // Detected hair color
    };

    onImageProcessed(faceData);
    setProcessed(true);
    setProcessing(false);

    toast({
      title: "Face Analysis Complete",
      description: "Avatar features have been updated based on your image.",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Camera className="w-4 h-4" />
          Image to Avatar
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

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {uploadedImage ? (
            <div className="space-y-4">
              <img 
                src={uploadedImage} 
                alt="Uploaded face" 
                className="max-w-full h-32 object-cover rounded-lg mx-auto"
              />
              {processed ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Face analysis complete!</span>
                </div>
              ) : (
                <Button 
                  onClick={processImage} 
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Face
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Camera className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 text-sm">Upload a photo to generate an avatar</p>
                <p className="text-gray-400 text-xs mt-1">JPG, PNG up to 10MB</p>
              </div>
              <Button onClick={triggerFileInput} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Upload a clear front-facing photo</p>
          <p>• Good lighting improves accuracy</p>
          <p>• Face should be clearly visible</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageToAvatar;
