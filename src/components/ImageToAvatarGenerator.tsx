import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ImageToAvatarGeneratorProps {
  onAvatarGenerated: (config: any) => void;
}

const ImageToAvatarGenerator: React.FC<ImageToAvatarGeneratorProps> = ({ onAvatarGenerated }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (file: File) => {
    // Simulate AI analysis of uploaded image
    // In production, this would call AvatarBooth API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          gender: Math.random() > 0.5 ? 'male' : 'female',
          age: Math.floor(Math.random() * 30) + 20,
          ethnicity: ['caucasian', 'asian', 'african', 'hispanic'][Math.floor(Math.random() * 4)],
          skinTone: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          eyeColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          hairColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          hairStyle: ['short', 'medium', 'long', 'curly'][Math.floor(Math.random() * 4)],
          height: Math.floor(Math.random() * 30) + 160,
          weight: Math.floor(Math.random() * 30) + 60,
          faceWidth: Math.floor(Math.random() * 20) + 45,
          jawline: Math.floor(Math.random() * 20) + 45,
          eyeSize: Math.floor(Math.random() * 20) + 45,
          noseSize: Math.floor(Math.random() * 20) + 45,
          lipThickness: Math.floor(Math.random() * 20) + 45,
        });
      }, 2000);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const analyzedFeatures: any = await analyzeImage(file);
      const avatarConfig = {
        ...analyzedFeatures,
        muscle: 50,
        fat: 20,
        currentExpression: 'neutral',
        currentPose: 'standing',
        clothingTop: 'tshirt',
        clothingBottom: 'jeans',
        shoes: 'sneakers',
        accessories: [],
        avatarName: 'Generated Avatar',
      };
      
      onAvatarGenerated(avatarConfig);
      toast.success('Avatar generated from your image!');
    } catch (error) {
      toast.error('Failed to analyze image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Image to Avatar Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Upload a front-facing portrait or full body image to automatically generate a 3D avatar.</p>
          <p className="font-semibold">Tips for best results:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use clear, well-lit photos</li>
            <li>Face should be directly facing camera</li>
            <li>Avoid sunglasses or face coverings</li>
            <li>Higher resolution = better accuracy</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {preview ? (
            <div className="space-y-4">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-64 mx-auto rounded-lg"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Upload Different Image'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mb-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, or WebP (Max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {uploading && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-semibold">AI Processing Your Image...</p>
                <p className="text-sm text-muted-foreground">
                  Extracting facial features, body structure, and textures
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageToAvatarGenerator;
