import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarBoothIntegrationProps {
  onAvatarGenerated: (config: any) => void;
}

const AvatarBoothIntegration: React.FC<AvatarBoothIntegrationProps> = ({ 
  onAvatarGenerated 
}) => {
  const [processing, setProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setProcessing(true);
    toast.info('Processing image with AvatarBooth...');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate AvatarBooth AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate avatar config based on image analysis
      // In production, this would call the actual AvatarBooth API
      const generatedConfig = {
        gender: Math.random() > 0.5 ? 'male' : 'female',
        age: 20 + Math.floor(Math.random() * 30),
        skinTone: ['#FFE0BD', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'][Math.floor(Math.random() * 5)],
        eyeColor: ['#8B4513', '#4169E1', '#228B22', '#808080'][Math.floor(Math.random() * 4)],
        hairStyle: ['short', 'medium', 'long', 'curly'][Math.floor(Math.random() * 4)],
        hairColor: ['#1A1A1A', '#8B4513', '#F5DEB3', '#B22222'][Math.floor(Math.random() * 4)],
        faceWidth: 45 + Math.floor(Math.random() * 20),
        eyeSize: 45 + Math.floor(Math.random() * 20),
        noseSize: 45 + Math.floor(Math.random() * 20),
        mouthWidth: 45 + Math.floor(Math.random() * 20),
        avatarName: 'Photo-Generated Avatar',
      };

      onAvatarGenerated(generatedConfig);
      toast.success('Avatar generated from image!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          AvatarBooth Image-to-Avatar
          <Badge variant="secondary" className="ml-auto">
            AI Vision
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your photo to generate a personalized 3D avatar
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {previewImage && (
          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="w-full"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing with AI...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-2">
          <p className="font-semibold">Best Results:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use a front-facing portrait photo</li>
            <li>Good lighting with clear facial features</li>
            <li>Neutral expression recommended</li>
            <li>Max file size: 10MB</li>
          </ul>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Privacy:</strong> Images are processed securely and not stored permanently
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarBoothIntegration;
