import React, { useState } from 'react';
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
  const { building, progress, buildAndExport, exportAllFormats } = useAvatarBuilder();
  const { saveConfiguration, saving } = useAvatarConfigurations();

  const exportFormats = [
    { 
      name: 'JSON', 
      extension: 'json',
      icon: <FileJson className="w-5 h-5" />, 
      description: 'Configuration data with all morph and material properties',
      fileSize: '< 1 MB'
    },
    { 
      name: 'GIF Animation', 
      extension: 'gif',
      icon: <FileImage className="w-5 h-5" />, 
      description: 'Animated avatar preview for social media and websites',
      fileSize: '1-3 MB'
    },
    { 
      name: 'GLB', 
      extension: 'glb',
      icon: <Box className="w-5 h-5" />, 
      description: 'Binary GLTF - Web-optimized 3D format',
      fileSize: '2-5 MB'
    },
    { 
      name: 'GLTF', 
      extension: 'gltf',
      icon: <Box className="w-5 h-5" />, 
      description: 'GLTF with separate textures and materials',
      fileSize: '3-6 MB'
    },
    { 
      name: 'FBX', 
      extension: 'fbx',
      icon: <Package className="w-5 h-5" />, 
      description: 'Industry standard for Unity, Unreal Engine',
      fileSize: '5-10 MB'
    }
  ];

  const handleExport = async (format: string) => {
    if (!config) {
      toast({ title: "Error", description: "No avatar configuration to export", variant: "destructive" });
      return;
    }

    try {
      await buildAndExport(config, {
        format: format as 'json' | 'gif' | 'glb' | 'gltf' | 'fbx',
        compress: compressionEnabled,
        quality: 0.8,
      }, canvasRef?.current || undefined);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportAll = async () => {
    if (!config) {
      toast({ title: "Error", description: "No avatar configuration to export", variant: "destructive" });
      return;
    }

    try {
      toast({ title: "Starting batch export..." });
      await exportAllFormats(config, compressionEnabled);
    } catch (error) {
      console.error('Batch export failed:', error);
      toast({ title: "Error", description: "Batch export failed", variant: "destructive" });
    }
  };

  const getExportStatus = (format: string) => {
    const urlField = `${format}_export_url`;
    return config?.[urlField as keyof typeof config];
  };

  const handleSaveToProfile = async () => {
    try {
      await saveConfiguration(config);
      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {building && (
        <Card>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compression">Enable Compression</Label>
              <p className="text-xs text-muted-foreground">Reduce file size without quality loss</p>
            </div>
            <Switch id="compression" checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Save className="w-5 h-5" />
            Save to Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button onClick={handleSaveToProfile} className="w-full" disabled={building || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save to Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={handleExportAll} disabled={building} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export All Formats
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => {
              const exportUrl = getExportStatus(format.extension);
              const isExported = !!exportUrl;
              
              return (
                <div key={format.name} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {format.icon}
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {format.name}
                          {isExported && <span className="text-green-500">✓</span>}
                        </h3>
                        <p className="text-sm text-muted-foreground">{format.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">~{format.fileSize}</span>
                    <Button size="sm" onClick={() => handleExport(format.extension)} disabled={building} variant={isExported ? "outline" : "default"}>
                      <Download className="w-4 h-4 mr-2" />
                      {isExported ? 'Re-export' : 'Export'}
                    </Button>
                  </div>
                  {isExported && exportUrl && (
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                      Exported: {new Date().toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarExporter;
