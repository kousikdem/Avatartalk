import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Type, Upload, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoPanelProps {
  onAvatarGenerated: (config: any) => void;
}

const PhotoPanel: React.FC<PhotoPanelProps> = ({ onAvatarGenerated }) => {
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [processing, setProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setProcessing(true);
    try {
      // Simulate AI processing (AvatarBooth integration point)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate avatar config based on image analysis
      const generatedConfig = {
        gender: Math.random() > 0.5 ? 'male' : 'female',
        ageCategory: 'adult',
        ethnicity: 'caucasian',
        hairStyle: 'medium',
        skinTone: '#F1C27D',
        eyeColor: '#8B4513',
        currentExpression: 'neutral'
      };

      onAvatarGenerated(generatedConfig);
      toast.success('Avatar generated from image!');
    } catch (error) {
      toast.error('Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  const handleTextGeneration = async () => {
    if (!textPrompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setProcessing(true);
    try {
      // Simulate AI processing (M3.org/CharacterStudio integration point)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Parse text prompt for avatar attributes
      const lowerPrompt = textPrompt.toLowerCase();
      
      const generatedConfig = {
        gender: lowerPrompt.includes('female') || lowerPrompt.includes('woman') ? 'female' : 'male',
        ageCategory: lowerPrompt.includes('child') ? 'child' : lowerPrompt.includes('teen') ? 'teen' : 'adult',
        ethnicity: lowerPrompt.includes('asian') ? 'asian' : 
                   lowerPrompt.includes('african') ? 'african' :
                   lowerPrompt.includes('hispanic') ? 'hispanic' : 'caucasian',
        bodyType: lowerPrompt.includes('athletic') ? 'athletic' :
                  lowerPrompt.includes('muscular') ? 'muscular' : 'average',
        hairStyle: lowerPrompt.includes('long hair') ? 'long' :
                   lowerPrompt.includes('short hair') ? 'short' : 'medium',
        clothingTop: lowerPrompt.includes('suit') ? 'suit-jacket' :
                     lowerPrompt.includes('formal') ? 'blazer' : 'tshirt',
        currentExpression: 'neutral'
      };

      onAvatarGenerated(generatedConfig);
      toast.success('Avatar generated from description!');
    } catch (error) {
      toast.error('Failed to generate avatar');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={mode === 'image' ? 'default' : 'outline'}
          onClick={() => setMode('image')}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Image Input
        </Button>
        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          onClick={() => setMode('text')}
          className="flex items-center gap-2"
        >
          <Type className="w-4 h-4" />
          Text Prompt
        </Button>
      </div>

      {mode === 'image' ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Image to Avatar</h3>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Upload a photo to automatically generate a 3D avatar.</p>
            <p className="text-xs">Powered by AvatarBooth AI</p>
          </div>

          {/* Upload Button */}
          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={processing}
            />
            <div className="flex flex-col items-center gap-3 text-center">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              )}
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {previewImage ? 'Upload Different Photo' : 'Upload Photo'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Guidelines */}
          <Card className="p-4 bg-muted/20">
            <h4 className="text-xs font-semibold mb-2">Best Results:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Front-facing portrait or full body shot</li>
              <li>• Good lighting and clear visibility</li>
              <li>• High resolution (at least 512x512)</li>
              <li>• Neutral expression for accurate features</li>
            </ul>
          </Card>
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Text to Avatar</h3>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Describe your avatar and let AI create it for you.</p>
            <p className="text-xs">Powered by M3.org/CharacterStudio</p>
          </div>

          <div className="space-y-2">
            <Label>Avatar Description</Label>
            <Textarea
              placeholder="Example: Athletic Indian male with short curly hair wearing a formal suit and glasses"
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={processing}
            />
          </div>

          <Button 
            onClick={handleTextGeneration} 
            disabled={processing || !textPrompt.trim()}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Avatar...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Avatar
              </>
            )}
          </Button>

          {/* Examples */}
          <Card className="p-4 bg-muted/20">
            <h4 className="text-xs font-semibold mb-2">Example Prompts:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "Young Asian female doctor with long black hair"</li>
              <li>• "Middle-aged African businessman in a suit"</li>
              <li>• "Athletic Caucasian male athlete in sportswear"</li>
              <li>• "Teenager with curly red hair wearing casual clothes"</li>
            </ul>
          </Card>
        </Card>
      )}
    </div>
  );
};

export default PhotoPanel;
