
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarConfig } from '@/pages/AvatarPage';

interface Avatar3DPreviewProps {
  config: AvatarConfig;
  modelUrl?: string | null;
  isGenerating?: boolean;
}

const AvatarModel = ({ config, modelUrl }: { config: AvatarConfig; modelUrl?: string | null }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Gentle rotation when not being controlled
      if (!hovered) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      }
    }
  });

  // Load GLTF model if available (placeholder for now)
  const getAvatarMesh = () => {
    const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
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
      <mesh geometry={geometry} material={material} />
      
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={config.skinTone} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.1, 1.25, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>
      <mesh position={[0.1, 1.25, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={config.hairColor} roughness={0.9} />
      </mesh>
    </group>
  );
};

const Avatar3DPreview: React.FC<Avatar3DPreviewProps> = ({ 
  config, 
  modelUrl, 
  isGenerating = false 
}) => {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 1, 4]);
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
    <div className="relative w-full h-96 bg-gradient-to-b from-slate-100 to-slate-200 rounded-xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={cameraPosition} />
          <OrbitControls 
            ref={controlsRef}
            enableZoom={true} 
            enablePan={false}
            minDistance={1}
            maxDistance={8}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Avatar Model */}
          {!isGenerating && <AvatarModel config={config} modelUrl={modelUrl} />}
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#f0f0f0" transparent opacity={0.5} />
          </mesh>
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            className="bg-white/90 rounded-lg p-6 shadow-xl text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium">Generating Avatar...</p>
            <p className="text-gray-600 text-sm mt-1">This may take a few moments</p>
          </motion.div>
        </div>
      )}

      {/* Camera Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={resetCamera}
          className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={zoomIn}
          className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={zoomOut}
          className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-700">
          <p className="font-medium">Click & Drag: Rotate</p>
          <p>Scroll: Zoom</p>
        </div>
      </div>
    </div>
  );
};

export default Avatar3DPreview;
