
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html, useProgress } from '@react-three/drei';
import { AvatarConfig } from '@/types/avatar';
import * as THREE from 'three';

interface AvatarPreviewPanelProps {
  avatarConfig: AvatarConfig;
  avatarUrl?: string | null;
  isGenerating: boolean;
}

const AvatarMesh = ({ config }: { config: AvatarConfig }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const getBodyGeometry = () => {
    switch (config.bodyType) {
      case 'slim':
        return { scale: [0.8, 1, 0.8] };
      case 'muscular':
        return { scale: [1.2, 1.1, 1.2] };
      case 'custom':
        const heightFactor = config.height / 175;
        const weightFactor = config.weight / 70;
        return { 
          scale: [
            0.8 + (weightFactor * 0.4), 
            0.8 + (heightFactor * 0.4), 
            0.8 + (weightFactor * 0.4)
          ] 
        };
      default:
        return { scale: [1, 1, 1] };
    }
  };

  const bodyStyle = getBodyGeometry();

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]} scale={bodyStyle.scale}>
        <cylinderGeometry args={[0.8, 0.6, 2, 16]} />
        <meshStandardMaterial 
          color={config.skinTone} 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color={config.skinTone} 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 1.3, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, 1.3, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Hair (if not bald) */}
      {config.hairStyle !== 'bald' && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.45, 8, 8]} />
          <meshStandardMaterial 
            color={config.hairColor} 
            metalness={0.2} 
            roughness={0.9}
          />
        </mesh>
      )}

      {/* Arms */}
      <mesh position={[-0.9, 0.5, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.1, 0.12, 1.2, 8]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.1, 0.12, 1.2, 8]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, -1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 1.5, 8]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
      <mesh position={[0.3, -1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 1.5, 8]} />
        <meshStandardMaterial color={config.skinTone} />
      </mesh>
    </group>
  );
};

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm font-medium">Generating Avatar...</p>
        <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
      </div>
    </Html>
  );
};

const AvatarPreviewPanel: React.FC<AvatarPreviewPanelProps> = ({ 
  avatarConfig, 
  isGenerating 
}) => {
  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
      {/* Generation Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Generating Avatar</p>
            <p className="text-sm text-gray-500">This may take a few moments...</p>
          </div>
        </div>
      )}

      <Canvas shadows>
        <Suspense fallback={<Loader />}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            maxPolarAngle={Math.PI}
            minDistance={3}
            maxDistance={8}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.4} />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Avatar */}
          <AvatarMesh config={avatarConfig} />
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial transparent opacity={0.2} />
          </mesh>
        </Suspense>
      </Canvas>

      {/* Controls Hint */}
      <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
        <p className="text-xs text-white">Click & drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default AvatarPreviewPanel;
