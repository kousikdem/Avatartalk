import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileJson, Film, Box as BoxIcon, FileCode, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';

interface AvatarUploadPreviewProps {
  config: any;
  onRemove: (format: string) => void;
}

const Model3D = ({ url }: { url: string }) => {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
  } catch (error) {
    console.error('Error loading model:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }
};

const AvatarUploadPreview: React.FC<AvatarUploadPreviewProps> = ({ config, onRemove }) => {
  const formats = [
    { key: 'json_export_url', name: 'JSON', icon: FileJson, color: 'blue' },
    { key: 'gif_export_url', name: 'GIF', icon: Film, color: 'purple' },
    { key: 'glb_export_url', name: 'GLB', icon: BoxIcon, color: 'green' },
    { key: 'gltf_export_url', name: 'GLTF', icon: FileCode, color: 'orange' },
    { key: 'fbx_export_url', name: 'FBX', icon: BoxIcon, color: 'red' },
    { key: 'obj_export_url', name: 'OBJ', icon: BoxIcon, color: 'indigo' },
  ];

  const availableFormats = formats.filter(f => config?.[f.key]);
  
  if (availableFormats.length === 0) return null;

  const [activeFormat, setActiveFormat] = React.useState(availableFormats[0].key);
  const activeUrl = config?.[activeFormat];
  const activeFormatInfo = formats.find(f => f.key === activeFormat);

  const is3DFormat = ['glb_export_url', 'gltf_export_url', 'fbx_export_url', 'obj_export_url'].includes(activeFormat);
  const isGif = activeFormat === 'gif_export_url';

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Uploaded Avatar Formats</span>
          <div className="flex gap-2">
            {availableFormats.map(format => (
              <Badge
                key={format.key}
                variant={activeFormat === format.key ? 'default' : 'outline'}
                className={`cursor-pointer ${activeFormat === format.key ? `bg-${format.color}-500` : ''}`}
                onClick={() => setActiveFormat(format.key)}
              >
                <format.icon className="w-3 h-3 mr-1" />
                {format.name}
              </Badge>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview Area */}
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            {is3DFormat && (
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <Stage environment="city" intensity={0.6}>
                  <Model3D url={activeUrl} />
                </Stage>
                <OrbitControls enableZoom={true} />
              </Canvas>
            )}
            {isGif && (
              <img src={activeUrl} alt="Avatar GIF" className="w-full h-full object-contain" />
            )}
            {activeFormat === 'json_export_url' && (
              <div className="flex items-center justify-center h-full">
                <FileJson className="w-16 h-16 text-blue-500" />
                <span className="ml-2 text-gray-600">JSON Configuration</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Format: <strong>{activeFormatInfo?.name}</strong>
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(activeFormat)}
            >
              <X className="w-4 h-4 mr-1" />
              Remove {activeFormatInfo?.name}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarUploadPreview;
