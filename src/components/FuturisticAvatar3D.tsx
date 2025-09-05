import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface FuturisticAvatar3DProps {
  isLarge?: boolean;
  isTalking?: boolean;
  avatarStyle?: 'realistic' | 'holographic' | 'neon' | 'crystalline';
  mood?: 'professional' | 'friendly' | 'mysterious' | 'energetic';
  onInteraction?: () => void;
  className?: string;
}

const AvatarMesh: React.FC<{
  isTalking: boolean;
  avatarStyle: string;
  mood: string;
}> = ({ isTalking, avatarStyle, mood }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      
      // Rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      // Talking animation - subtle scale pulsing
      if (isTalking) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.02;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getAvatarColor = () => {
    switch (avatarStyle) {
      case 'holographic':
        return '#00ffff';
      case 'neon':
        return '#ff00ff';
      case 'crystalline':
        return '#ffffff';
      default:
        return '#4f46e5';
    }
  };

  const getEmissiveIntensity = () => {
    return avatarStyle === 'realistic' ? 0.1 : 0.3;
  };

  return (
    <group>
      {/* Main Head */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color={getAvatarColor()}
          transparent
          opacity={avatarStyle === 'holographic' ? 0.8 : 1}
          wireframe={avatarStyle === 'holographic'}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.25, 0.15, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.25, 0.15, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.25, 0.15, 0.76]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.25, 0.15, 0.76]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Mouth - animated when talking */}
      <mesh position={[0, -0.15, 0.7]} scale={isTalking ? [1.2, 0.8, 1] : [1, 1, 1]}>
        <ringGeometry args={[0.05, 0.12, 16]} />
        <meshBasicMaterial color={getAvatarColor()} />
      </mesh>

      {/* Futuristic aura/glow effect */}
      {avatarStyle !== 'realistic' && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial
            color={getAvatarColor()}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  );
};

const FuturisticAvatar3D: React.FC<FuturisticAvatar3DProps> = ({
  isLarge = false,
  isTalking = false,
  avatarStyle = 'holographic',
  mood = 'friendly',
  onInteraction,
  className
}) => {
  return (
    <motion.div
      className={`${className} overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ 
        height: isLarge ? '400px' : '300px',
        boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        onClick={onInteraction}
        style={{ cursor: onInteraction ? 'pointer' : 'default' }}
      >
        {/* Simplified lighting setup */}
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 2]} intensity={0.8} />
        
        {/* Avatar */}
        <AvatarMesh
          isTalking={isTalking}
          avatarStyle={avatarStyle}
          mood={mood}
        />
        
        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Status Indicator */}
      {isTalking && (
        <motion.div
          className="absolute top-4 right-4 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-6 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                animate={{
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-cyan-400 font-medium">AI Active</span>
        </motion.div>
      )}

      {/* Futuristic border glow */}
      <div className="absolute inset-0 rounded-2xl border border-purple-500/50 pointer-events-none animate-pulse" />
    </motion.div>
  );
};

export default FuturisticAvatar3D;