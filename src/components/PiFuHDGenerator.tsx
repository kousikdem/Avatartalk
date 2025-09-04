import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Zap, 
  Download, 
  Eye, 
  User, 
  Layers, 
  Brain,
  Sparkles,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';

interface PiFuHDGeneratorProps {
  onAvatarGenerated?: (avatarData: any) => void;
}

const PiFuHDGenerator: React.FC<PiFuHDGeneratorProps> = ({ onAvatarGenerated }) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [generated3DModel, setGenerated3DModel] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generatePiFuHDAvatar = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate PiFuHD processing pipeline
      const stages = [
        { name: 'Preprocessing image...', progress: 15 },
        { name: 'Depth estimation...', progress: 30 },
        { name: 'Silhouette extraction...', progress: 45 },
        { name: 'PIFu network inference...', progress: 65 },
        { name: 'High-resolution refinement...', progress: 80 },
        { name: 'Mesh optimization...', progress: 95 },
        { name: 'Avatar generation complete!', progress: 100 }
      ];

      for (const stage of stages) {
        setGenerationStage(stage.name);
        setGenerationProgress(stage.progress);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      }

      // Generate mock 3D avatar data
      const avatarData = {
        meshUrl: '/mock-generated-avatar.glb',
        textureUrl: '/mock-generated-texture.jpg',
        normalMapUrl: '/mock-generated-normal.jpg',
        displacementMapUrl: '/mock-generated-displacement.jpg',
        metadata: {
          vertices: 15420,
          faces: 30840,
          textures: 4,
          animations: 12,
          generationTime: Date.now(),
          source: 'PiFuHD',
          quality: 'high-resolution'
        }
      };

      setGenerated3DModel(avatarData.meshUrl);
      onAvatarGenerated?.(avatarData);
      toast.success('3D avatar generated successfully!');

    } catch (error) {
      console.error('PiFuHD generation failed:', error);
      toast.error('Failed to generate 3D avatar');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* PiFuHD Information */}
      <Alert>
        <Brain className="w-4 h-4" />
        <AlertDescription>
          <strong>PiFuHD Technology:</strong> Advanced neural rendering for high-resolution 3D human digitization from a single image.
          Upload a front-facing photo for best results.
        </AlertDescription>
      </Alert>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Image Upload for PiFuHD Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="pifu-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="pifu-image-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="max-w-48 max-h-48 object-contain rounded-lg"
                  />
                  <Badge className="absolute -top-2 -right-2">Ready</Badge>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Upload Full Body Photo</p>
                    <p className="text-sm text-muted-foreground">
                      For best results, use a front-facing full-body photo with clear visibility
                    </p>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Generation Button */}
          <Button
            onClick={generatePiFuHDAvatar}
            disabled={!uploadedImage || isGenerating}
            className="w-full h-12"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Cpu className="w-5 h-5 mr-2 animate-spin" />
                Generating 3D Avatar...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate with PiFuHD
              </>
            )}
          </Button>

          {/* Progress Section */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">{generationStage}</span>
              </div>
              <Progress value={generationProgress} className="w-full h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {generationProgress}% Complete
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Model Preview */}
      {generated3DModel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Generated 3D Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium">High-Resolution 3D Avatar Generated!</p>
              <p className="text-sm text-muted-foreground">
                Your avatar has been processed with PiFuHD technology
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">Mesh Quality</Badge>
                <p className="text-sm">High Resolution</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">Processing Time</Badge>
                <p className="text-sm">~8 seconds</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download GLB
              </Button>
              <Button variant="outline" className="flex-1">
                <Layers className="w-4 h-4 mr-2" />
                View Textures
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">PiFuHD Technical Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Neural</Badge>
              <span>PIFu Network</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Quality</Badge>
              <span>1024x1024 Resolution</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Geometry</Badge>
              <span>High-poly Mesh</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Textures</Badge>
              <span>4K Diffuse Maps</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiFuHDGenerator;