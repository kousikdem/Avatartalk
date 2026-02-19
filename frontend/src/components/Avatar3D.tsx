
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface Avatar3DProps {
  isLarge?: boolean;
  isTalking?: boolean;
  avatarStyle?: 'realistic' | 'cartoon' | 'anime' | 'minimal';
  mood?: 'professional' | 'friendly' | 'mysterious';
  onInteraction?: () => void;
}

const AvatarMesh = ({ isTalking, avatarStyle, mood }: { isTalking: boolean; avatarStyle: string; mood: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      
      // Talking animation
      if (isTalking) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.05;
      }
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.setScalar(1.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getAvatarColor = () => {
    switch (mood) {
      case 'professional': return '#3B82F6';
      case 'friendly': return '#10B981';
      case 'mysterious': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  const getAvatarGeometry = () => {
    switch (avatarStyle) {
      case 'cartoon': return <sphereGeometry args={[1, 16, 16]} />;
      case 'anime': return <coneGeometry args={[0.8, 2, 8]} />;
      case 'minimal': return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      default: return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getAvatarGeometry()}
      <meshStandardMaterial 
        color={getAvatarColor()} 
        metalness={0.3} 
        roughness={0.4}
        emissive={hovered ? getAvatarColor() : '#000000'}
        emissiveIntensity={hovered ? 0.2 : 0}
      />
      
      {/* Eyes */}
      <mesh position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Pupils */}
      <mesh position={[-0.3, 0.2, 0.85]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.85]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Mouth - animated when talking */}
      <mesh position={[0, -0.3, 0.8]} scale={isTalking ? [1.2, 0.5, 1] : [1, 1, 1]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
    </mesh>
  );
};

const Avatar3D: React.FC<Avatar3DProps> = ({ 
  isLarge = false, 
  isTalking = false, 
  avatarStyle = 'realistic',
  mood = 'friendly',
  onInteraction 
}) => {
  return (
    <motion.div 
      className={`${isLarge ? 'h-96 w-full' : 'h-64 w-64'} rounded-2xl overflow-hidden neo-glass`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onClick={onInteraction}
    >
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls enableZoom={false} enablePan={false} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={0.8} />
          
          {/* Avatar */}
          <AvatarMesh isTalking={isTalking} avatarStyle={avatarStyle} mood={mood} />
          
          {/* Talking indicator rings */}
          {isTalking && (
            <>
              <mesh position={[0, 0, 0]} scale={2}>
                <ringGeometry args={[1.8, 2, 32]} />
                <meshBasicMaterial color="#3B82F6" transparent opacity={0.3} />
              </mesh>
              <mesh position={[0, 0, 0]} scale={1.5}>
                <ringGeometry args={[1.8, 2, 32]} />
                <meshBasicMaterial color="#10B981" transparent opacity={0.2} />
              </mesh>
            </>
          )}
        </Suspense>
      </Canvas>
      
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${isTalking ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
      </div>
    </motion.div>
  );
};

export default Avatar3D;
