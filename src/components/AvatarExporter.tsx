import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Save, FileImage, Box, Package, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAvatarBuilder } from '@/hooks/useAvatarBuilder';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';

interface AvatarExporterProps {
  config: any;
  onSave?: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const AvatarExporter: React.FC<AvatarExporterProps> = ({ config, onSave, canvasRef }) => {
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const { toast } = useToast();
  const { building, progress, buildAndExport } = useAvatarBuilder();
  const { saveConfiguration, saving } = useAvatarConfigurations();

  const exportFormats = [
    { 
      id: 'json', 
      name: 'JSON', 
      icon: FileJson, 
      description: 'Configuration data with all morph and material properties',
      fileSize: '< 1 MB'
    },
    { 
      id: 'gif', 
      name: 'GIF Animation', 
      icon: FileImage, 
      description: 'Animated avatar preview for social media and websites',
      fileSize: '1-3 MB'
    },
    { 
      id: 'glb', 
      name: 'GLB', 
      icon: Box, 
      description: 'Binary GLTF - Web-optimized 3D format',
      fileSize: '2-5 MB'
    },
    { 
      id: 'gltf', 
      name: 'GLTF', 
      icon: Box, 
      description: 'GLTF with separate textures and materials',
      fileSize: '3-6 MB'
    },
    { 
      id: 'fbx', 
      name: 'FBX', 
      icon: Package, 
      description: 'Industry standard for Unity, Unreal Engine',
      fileSize: '5-10 MB'
    }
  ];

  const handleExport = async (format: 'json' | 'gif' | 'glb' | 'gltf' | 'fbx') => {
    try {
      const canvas = canvasRef?.current;
      await buildAndExport(config, {
        format,
        compress: compressionEnabled,
        quality: 85,
      }, canvas || undefined);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleSaveToProfile = async () => {
    try {
      toast({ title: "Building avatar...", description: "Generating 3D model and thumbnail" });
      
      // Build GLB format first to get the model URL
      const canvas = canvasRef?.current;
      const modelUrl = await buildAndExport(config, {
        format: 'glb',
        compress: compressionEnabled,
        quality: 85,
      }, canvas || undefined);

      // Use the same URL as thumbnail for now (can be enhanced with actual thumbnail generation)
      const thumbnailUrl = modelUrl;

      // Save configuration with the generated URLs
      await saveConfiguration({
        ...config,
        model_url: modelUrl,
        thumbnail_url: thumbnailUrl,
      });

      toast({ title: "Success!", description: "Avatar saved to your profile" });
      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: "Error", description: "Failed to save avatar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Progress */}
      {building && (
        <Card className="avatar-control-panel">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Building Avatar...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compression Settings */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-base">Export Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compression">Enable Compression</Label>
              <p className="text-xs text-muted-foreground">
                Reduce file size without quality loss
              </p>
            </div>
            <Switch
              id="compression"
              checked={compressionEnabled}
              onCheckedChange={setCompressionEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save to Profile */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Save className="w-5 h-5 text-primary" />
            Save to Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Save your avatar to your AvatarTalk.Co profile for real-time 3D display and sharing.
            </p>
            <Button 
              onClick={handleSaveToProfile}
              className="w-full"
              variant="default"
              disabled={building || saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save to Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Formats */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="w-5 h-5 text-primary" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exportFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <div 
                  key={format.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{format.name}</h4>
                        <span className="text-xs text-muted-foreground">{format.fileSize}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{format.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExport(format.id as any)}
                        disabled={building}
                        className="w-full"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        {building ? 'Building...' : `Export ${format.name}`}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card className="avatar-control-panel">
        <CardHeader className="avatar-section-header">
          <CardTitle className="text-base">Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-primary/5 rounded-lg">
                <Box className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-sm">Web Integration</h4>
                <p className="text-xs text-muted-foreground">Three.js, Babylon.js, WebGL</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-sm">Game Engines</h4>
                <p className="text-xs text-muted-foreground">Unity, Unreal Engine</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <FileImage className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-sm">VR/AR/Metaverse</h4>
                <p className="text-xs text-muted-foreground">VRChat, Horizon, Spatial</p>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">🚀 Ready for the Metaverse</h4>
              <p className="text-sm text-muted-foreground">
                Your avatar includes all morph and material properties, optimized with realistic proportions, 
                PBR materials, and proper rigging for seamless integration across platforms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarExporter;