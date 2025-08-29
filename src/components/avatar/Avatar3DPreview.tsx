
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AvatarConfig } from '@/pages/AvatarPage';

interface Avatar3DPreviewProps {
  config: AvatarConfig;
  modelUrl?: string | null;
  isGenerating?: boolean;
  generationProgress?: number;
  generationStep?: string;
  onExport?: (format: 'glb' | 'fbx' | 'obj') => void;
}

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="bg-white/90 rounded-lg p-4 shadow-xl text-center min-w-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-800 font-medium text-sm">Loading Model</p>
        <Progress value={progress} className="w-full mt-2" />
      </div>
    </Html>
  );
};

const AvatarModel = ({ config, modelUrl }: { config: AvatarConfig; modelUrl?: string | null }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      // Gentle rotation when not being controlled
      if (!hovered) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      }
    }
  });

  // Load GLTF model if available
  const gltf = modelUrl ? useGLTF(modelUrl) : null;

  if (gltf) {
    return (
      <primitive 
        ref={meshRef}
        object={gltf.scene.clone()}
        scale={1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    );
  }

  // Fallback procedural avatar
  const getAvatarMesh = () => {
    const geometry = new THREE.CapsuleGeometry(0.4, 1.6, 4, 8);
    const material = new THREE.MeshStandardMaterial({
      color: config.skinTone,
      roughness: 0.8,
      metalness: 0.1,
    });
    return { geometry, material };
  };

  const { geometry, material } = getAvatarMesh();

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {/* Main body */}
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      
      {/* Head */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={config.skinTone} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.08, 1.25, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>
      <mesh position={[0.08, 1.25, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>
      
      {/* Hair */}
      {config.hairStyle !== 'bald' && (
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.27, 16, 16]} />
          <meshStandardMaterial color={config.hairColor} roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};

const Avatar3DPreview: React.FC<Avatar3DPreviewProps> = ({ 
  config, 
  modelUrl, 
  isGenerating = false,
  generationProgress = 0,
  generationStep = '',
  onExport
}) => {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 1, 3]);
  const [showWireframe, setShowWireframe] = useState(false);
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    setCameraPosition(prev => [prev[0], prev[1], Math.max(prev[2] - 0.5, 1)]);
  };

  const zoomOut = () => {
    setCameraPosition(prev => [prev[0], prev[1], Math.min(prev[2] + 0.5, 8)]);
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: cameraPosition, fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <PerspectiveCamera makeDefault position={cameraPosition} />
          <OrbitControls 
            ref={controlsRef}
            enableZoom={true} 
            enablePan={true}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={8}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            target={[0, 0.8, 0]}
          />
          
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.3} />
          <spotLight 
            position={[0, 8, 0]} 
            intensity={0.5} 
            angle={0.6} 
            penumbra={1} 
            castShadow
          />
          
          {/* HDR Environment */}
          <Environment preset="studio" />
          
          {/* Avatar Model */}
          {!isGenerating && (
            <AvatarModel config={config} modelUrl={modelUrl} />
          )}
          
          {/* Ground plane with shadow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <circleGeometry args={[5, 32]} />
            <meshStandardMaterial 
              color="#f8fafc" 
              transparent 
              opacity={0.8}
              roughness={0.8}
            />
          </mesh>
          
          {/* Background sphere */}
          <mesh>
            <sphereGeometry args={[50, 32, 32]} />
            <meshBasicMaterial 
              color="#f1f5f9" 
              side={THREE.BackSide}
              transparent
              opacity={0.3}
            />
          </mesh>
        </Suspense>
      </Canvas>

      {/* Generation Progress Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            className="bg-white/95 rounded-2xl p-8 shadow-2xl text-center min-w-80"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Avatar</h3>
            <p className="text-gray-600 mb-4">{generationStep}</p>
            <Progress value={generationProgress} className="w-full mb-2" />
            <p className="text-sm text-gray-500">{generationProgress}% complete</p>
          </motion.div>
        </div>
      )}

      {/* Control Panel */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20">
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={resetCamera}
              className="hover:bg-gray-100"
              title="Reset Camera"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={zoomIn}
              className="hover:bg-gray-100"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={zoomOut}
              className="hover:bg-gray-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowWireframe(!showWireframe)}
              className="hover:bg-gray-100"
              title="Toggle Wireframe"
            >
              {showWireframe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Export Menu */}
        {modelUrl && onExport && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20">
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onExport('glb')}
                className="hover:bg-gray-100 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                GLB
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onExport('fbx')}
                className="hover:bg-gray-100 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                FBX
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onExport('obj')}
                className="hover:bg-gray-100 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                OBJ
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-700 shadow-lg border border-white/20">
          <p className="font-medium">Controls:</p>
          <p>Left Click + Drag: Rotate</p>
          <p>Right Click + Drag: Pan</p>
          <p>Scroll: Zoom</p>
        </div>
      </div>

      {/* Model Info */}
      {modelUrl && (
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 shadow-lg border border-white/20">
            <p className="font-medium">Ready for Export</p>
            <p>Optimized for Web & Mobile</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar3DPreview;
