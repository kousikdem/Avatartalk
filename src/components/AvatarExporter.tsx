import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Save, FileImage, Box, Package, FileJson, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAvatarBuilder } from '@/hooks/useAvatarBuilder';
import { useAvatarConfigurations } from '@/hooks/useAvatarConfigurations';

interface AvatarExporterProps {
  config: any;
  onSave?: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const AvatarExporter: React.FC<AvatarExporterProps> = ({ config, onSave, canvasRef }) => {
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const { building, progress, buildAndExport, exportAllFormats } = useAvatarBuilder();
  const { saveConfiguration, saving } = useAvatarConfigurations();

  const exportFormats = [
    { 
      id: 'json', 
      name: 'JSON', 
      icon: FileJson, 
      description: 'Configuration data with all morph and material properties',
      size: '< 1 MB'
    },
    { 
      id: 'gif', 
      name: 'GIF Animation', 
      icon: FileImage, 
      description: 'Animated avatar preview for social media and websites',
      size: '1-3 MB'
    },
    { 
      id: 'glb', 
      name: 'GLB', 
      icon: Box, 
      description: 'Binary GLTF - Web-optimized 3D format',
      size: '2-5 MB'
    },
    { 
      id: 'gltf', 
      name: 'GLTF', 
      icon: Box, 
      description: 'GLTF with separate textures and materials',
      size: '3-6 MB'
    },
    { 
      id: 'fbx', 
      name: 'FBX', 
      icon: Package, 
      description: 'Industry standard for Unity, Unreal Engine (note: exports as GLB)',
      size: '5-10 MB'
    },
    { 
      id: 'obj', 
      name: 'OBJ', 
      icon: Package, 
      description: 'Wavefront OBJ with MTL material file',
      size: '3-6 MB'
    }
  ];

  const handleExport = async (format: 'json' | 'gif' | 'glb' | 'gltf' | 'fbx' | 'obj') => {
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
      await saveConfiguration(config);
      if (onSave) {
        onSave();
      }
      toast.success('Avatar configuration saved to your profile');
    } catch (error) {
      toast.error('Failed to save avatar configuration');
    }
  };

  const handleExportAll = async () => {
    try {
      await exportAllFormats(config, compressionEnabled);
      toast.success('All formats exported successfully!');
    } catch (error) {
      toast.error('Batch export failed');
    }
  };

  const handleCopyUrl = (url: string, format: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${format.toUpperCase()} URL copied to clipboard!`);
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
              Save your avatar to your AvatarTalk.bio profile for real-time 3D display and sharing.
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
          <div className="mb-4">
            <Button
              onClick={handleExportAll}
              disabled={building}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Formats
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportFormats.map((format) => {
              const exportUrlKey = `${format.id}_export_url` as keyof typeof config;
              const isExported = !!config[exportUrlKey];
              const exportDate = config.last_export_date && config.last_export_format === format.id 
                ? new Date(config.last_export_date).toLocaleDateString() 
                : null;

              return (
                <Card key={format.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <format.icon className="w-5 h-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{format.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {format.description}
                          </CardDescription>
                        </div>
                      </div>
                      {isExported && <Check className="w-5 h-5 text-green-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        Estimated size: {format.size}
                      </div>
                      {isExported && exportDate && (
                        <div className="text-xs text-green-600">
                          Exported: {exportDate}
                        </div>
                      )}
                      <Button
                        onClick={() => handleExport(format.id as any)}
                        disabled={building}
                        className="w-full"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isExported ? 'Re-export' : 'Export'} {format.name}
                      </Button>
                      {isExported && config[exportUrlKey] && (
                        <Button
                          onClick={() => handleCopyUrl(config[exportUrlKey] as string, format.name)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
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