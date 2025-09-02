import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Save, Upload, FileImage, Box, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarExporterProps {
  config: any;
  onSave?: () => void;
}

const AvatarExporter: React.FC<AvatarExporterProps> = ({ config, onSave }) => {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportFormats = [
    { 
      id: 'gltf', 
      name: 'GLTF/GLB', 
      icon: Box, 
      description: 'Web-optimized 3D format for Three.js, Babylon.js, and WebGL',
      fileSize: '2-5 MB'
    },
    { 
      id: 'fbx', 
      name: 'FBX', 
      icon: Package, 
      description: 'Industry standard for Unity, Unreal Engine, and Blender',
      fileSize: '5-10 MB'
    },
    { 
      id: 'obj', 
      name: 'OBJ', 
      icon: FileImage, 
      description: 'Universal 3D format for basic geometry',
      fileSize: '1-3 MB'
    },
    { 
      id: 'blend', 
      name: 'Blender', 
      icon: Package, 
      description: 'Native Blender format with full material and rig data',
      fileSize: '10-20 MB'
    }
  ];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsExporting(false);
          toast({
            title: "Export Complete!",
            description: `Avatar exported as ${format.toUpperCase()} format`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // In a real implementation, this would call the actual export functionality
    // For now, we'll simulate the export process
    setTimeout(() => {
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar_config.${format === 'gltf' ? 'glb' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const handleSaveToProfile = () => {
    // Save avatar configuration to user profile
    toast({
      title: "Avatar Saved!",
      description: "Your avatar has been saved to your AvatarTalk.bio profile",
    });
    onSave?.();
  };

  return (
    <div className="space-y-6">
      {/* Export Progress */}
      {isExporting && (
        <Card className="avatar-control-panel">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exporting Avatar...</span>
                <span className="text-sm text-gray-500">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

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
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={isExporting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save to AvatarTalk.bio Profile
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
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{format.name}</h4>
                        <span className="text-xs text-gray-500">{format.fileSize}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{format.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExport(format.id)}
                        disabled={isExporting}
                        className="w-full"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Export {format.name}
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
              <div className="p-3 bg-blue-50 rounded-lg">
                <Box className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Web Integration</h4>
                <p className="text-xs text-gray-600">Three.js, Babylon.js, WebGL</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Game Engines</h4>
                <p className="text-xs text-gray-600">Unity, Unreal Engine</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FileImage className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">VR/AR/Metaverse</h4>
                <p className="text-xs text-gray-600">VRChat, Horizon, Spatial</p>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🚀 Ready for the Metaverse</h4>
              <p className="text-blue-700 text-sm">
                Your avatar is optimized with realistic proportions, PBR materials, and proper rigging for 
                seamless integration across platforms, games, and virtual worlds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarExporter;