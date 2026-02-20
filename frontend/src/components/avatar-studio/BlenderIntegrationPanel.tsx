import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Box, Cpu, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlenderPipeline {
  id: string;
  name: string;
  description: string;
  steps: string[];
  duration: string;
  quality: 'high' | 'ultra' | 'production';
  features: string[];
}

interface BlenderIntegrationPanelProps {
  avatarData?: any;
  onProcessingComplete?: (result: any) => void;
}

const BlenderIntegrationPanel: React.FC<BlenderIntegrationPanelProps> = ({ 
  avatarData, 
  onProcessingComplete 
}) => {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const blenderPipelines: BlenderPipeline[] = [
    {
      id: 'realistic_render',
      name: 'Realistic Rendering',
      description: 'High-quality Blender Cycles render with PBR materials',
      steps: [
        'Import avatar mesh',
        'Apply PBR materials',
        'Setup HDRI lighting',
        'Cycles render (4K)',
        'Post-processing'
      ],
      duration: '~5 minutes',
      quality: 'ultra',
      features: ['PBR Shading', 'Subsurface Scattering', 'Ray Tracing', '4K Output']
    },
    {
      id: 'animation_ready',
      name: 'Animation Rigging',
      description: 'Full Blender rig with inverse kinematics and shape keys',
      steps: [
        'Generate skeleton',
        'Auto-weight painting',
        'Add shape keys',
        'IK constraints',
        'Test animations'
      ],
      duration: '~3 minutes',
      quality: 'high',
      features: ['Full Rig', 'IK Bones', '50+ Shape Keys', 'Mixamo Compatible']
    },
    {
      id: 'game_optimization',
      name: 'Game-Ready Export',
      description: 'Optimized for Unity/Unreal with LOD levels',
      steps: [
        'Mesh decimation',
        'Generate LODs',
        'Texture baking',
        'Export FBX/GLB',
        'Unity/Unreal packages'
      ],
      duration: '~2 minutes',
      quality: 'production',
      features: ['3 LOD Levels', 'Baked Textures', 'Unity Package', 'Unreal Ready']
    }
  ];

  const processWithBlender = async (pipelineId: string) => {
    const pipeline = blenderPipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    setProcessing(true);
    setProgress(0);
    toast.info(`Starting ${pipeline.name}...`);

    try {
      // Simulate Blender processing pipeline
      for (let i = 0; i < pipeline.steps.length; i++) {
        setCurrentStep(pipeline.steps[i]);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setProgress(((i + 1) / pipeline.steps.length) * 100);
      }

      toast.success(`${pipeline.name} completed successfully!`);
      onProcessingComplete?.({
        pipeline: pipelineId,
        output: 'avatar_processed.glb',
        quality: pipeline.quality
      });
    } catch (error) {
      toast.error('Blender processing failed');
    } finally {
      setProcessing(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'ultra': return 'from-purple-500 to-pink-500';
      case 'production': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Box className="w-4 h-4" />
        <AlertDescription>
          <strong>Blender Integration</strong> - Professional-grade avatar processing using Blender 4.x, 
          MakeHuman, and MPFB2 addon for realistic human models.
        </AlertDescription>
      </Alert>

      {!processing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blenderPipelines.map((pipeline) => (
            <Card 
              key={pipeline.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedPipeline === pipeline.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPipeline(pipeline.id)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{pipeline.name}</span>
                  <Badge className={`bg-gradient-to-r ${getQualityColor(pipeline.quality)}`}>
                    {pipeline.quality}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{pipeline.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium">Pipeline Steps:</div>
                  <div className="space-y-1">
                    {pipeline.steps.map((step, i) => (
                      <div key={i} className="text-xs flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {pipeline.features.map((feature, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Duration: {pipeline.duration}</span>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  disabled={!avatarData}
                  onClick={(e) => {
                    e.stopPropagation();
                    processWithBlender(pipeline.id);
                  }}
                >
                  <Cpu className="w-4 h-4 mr-2" />
                  Start Pipeline
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <Cpu className="w-12 h-12 mx-auto animate-pulse text-primary" />
              <h3 className="text-lg font-semibold">Processing with Blender...</h3>
              <p className="text-sm text-muted-foreground">{currentStep}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Alert>
              <Layers className="w-4 h-4" />
              <AlertDescription className="text-xs">
                Using Blender 4.x with MPFB2 addon, Cycles renderer, and automated rigging system
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Integrated Blender Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'MPFB2 (MakeHuman Bridge)',
              'Cycles Ray Tracing',
              'PBR Shader Nodes',
              'Auto-Rigging System',
              'Shape Key Morphs',
              'Cloth Simulation',
              'Hair Particles',
              'Skin Shader SSS',
              'HDRI Lighting'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-xs">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlenderIntegrationPanel;
