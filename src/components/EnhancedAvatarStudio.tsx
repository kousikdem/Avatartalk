import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Layers, 
  Palette, 
  Camera, 
  Brain,
  Settings,
  Download
} from 'lucide-react';
import RealisticAvatarBuilder from './RealisticAvatarBuilder';
import PiFuHDGenerator from './PiFuHDGenerator';
import MakeHumanAssetLibrary from './MakeHumanAssetLibrary';
import BlenderIntegration from './BlenderIntegration';

interface EnhancedAvatarStudioProps {
  showInDashboard?: boolean;
}

const EnhancedAvatarStudio: React.FC<EnhancedAvatarStudioProps> = ({ showInDashboard = false }) => {
  const [activeWorkflow, setActiveWorkflow] = useState('builder');
  const [avatarData, setAvatarData] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);

  if (showInDashboard) {
    return <RealisticAvatarBuilder showInDashboard={true} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Enhanced Avatar Studio
        </h1>
        <p className="text-lg text-muted-foreground">
          Professional 3D Avatar Creation with PiFuHD, MakeHuman & Blender Integration
        </p>
        <div className="flex justify-center gap-2">
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">PiFuHD Neural Rendering</Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">MakeHuman Assets</Badge>
          <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">Blender Pipeline</Badge>
        </div>
      </div>

      {/* Main Workflow Tabs */}
      <Tabs value={activeWorkflow} onValueChange={setActiveWorkflow} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:mx-auto">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Builder</span>
          </TabsTrigger>
          <TabsTrigger value="pifu" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">PiFuHD</span>
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Assets</span>
          </TabsTrigger>
          <TabsTrigger value="blender" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Blender</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        {/* Avatar Builder */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Avatar Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RealisticAvatarBuilder 
                onConfigChange={setAvatarData}
                showInDashboard={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PiFuHD Generator */}
        <TabsContent value="pifu" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                PiFuHD Neural 3D Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PiFuHDGenerator onAvatarGenerated={setAvatarData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Library */}
        <TabsContent value="assets" className="space-y-6">
          <MakeHumanAssetLibrary 
            onAssetSelect={(asset) => {
              console.log('Selected asset:', asset);
              // Integrate selected asset into avatar configuration
            }}
          />
        </TabsContent>

        {/* Blender Integration */}
        <TabsContent value="blender" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Blender Processing Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BlenderIntegration 
                avatarData={avatarData}
                onProcessingComplete={setProcessingResult}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export & Download */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export & Download
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-12 h-12 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Export your completed avatar in multiple formats for different platforms
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  <Badge variant="outline" className="p-3 flex flex-col items-center gap-2">
                    <span className="font-medium">GLTF/GLB</span>
                    <span className="text-xs text-muted-foreground">Web & AR</span>
                  </Badge>
                  <Badge variant="outline" className="p-3 flex flex-col items-center gap-2">
                    <span className="font-medium">FBX</span>
                    <span className="text-xs text-muted-foreground">Unity & Unreal</span>
                  </Badge>
                  <Badge variant="outline" className="p-3 flex flex-col items-center gap-2">
                    <span className="font-medium">OBJ</span>
                    <span className="text-xs text-muted-foreground">Universal 3D</span>
                  </Badge>
                  <Badge variant="outline" className="p-3 flex flex-col items-center gap-2">
                    <span className="font-medium">USD</span>
                    <span className="text-xs text-muted-foreground">USD Pipeline</span>
                  </Badge>
                  <Badge variant="outline" className="p-3 flex flex-col items-center gap-2">
                    <span className="font-medium">Blender</span>
                    <span className="text-xs text-muted-foreground">.blend File</span>
                  </Badge>
                  <Badge variant="outline" className="p-3 flex flex-col items-center gap-2">
                    <span className="font-medium">VRM</span>
                    <span className="text-xs text-muted-foreground">VR Ready</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Status */}
      {processingResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Processing completed: {processingResult.pipelineName}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAvatarStudio;