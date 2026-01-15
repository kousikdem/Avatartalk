import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import demoAvatarPhoto from '@/assets/demo-avatar-photo.png';

interface AvatarWithPhotoProps {
  isTalking?: boolean;
}

const AvatarWithPhoto: React.FC<AvatarWithPhotoProps> = ({ isTalking = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const photoRef = useRef<THREE.Mesh>(null);
  const mouthOverlayRef = useRef<THREE.Mesh>(null);
  
  // Load the photo texture
  const texture = useLoader(THREE.TextureLoader, demoAvatarPhoto);
  
  // Configure texture for transparency
  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle 3D floating/breathing motion
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.008;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.03;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.015;
    }

    // Talking animation - subtle scale pulse on mouth area
    if (isTalking && mouthOverlayRef.current) {
      const speechPattern = Math.sin(t * 8) * 0.5 + 0.5;
      const speechPattern2 = Math.sin(t * 12) * 0.3;
      const mouthOpen = speechPattern * 0.3 + speechPattern2 * 0.2;
      
      mouthOverlayRef.current.scale.y = 0.8 + mouthOpen * 0.4;
      mouthOverlayRef.current.position.y = -0.18 - mouthOpen * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main photo plane with transparency */}
      <mesh ref={photoRef} position={[0, 0.05, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshBasicMaterial 
          map={texture} 
          transparent={true}
          alphaTest={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle 3D depth layers for parallax effect */}
      
      {/* Shadow layer behind */}
      <mesh position={[0.02, 0.03, -0.05]}>
        <planeGeometry args={[1.35, 1.75]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent={true} 
          opacity={0.15}
        />
      </mesh>

      {/* Glow effect for 3D feel */}
      <mesh position={[0, 0.05, -0.02]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshBasicMaterial 
          color="#4f46e5" 
          transparent={true} 
          opacity={0.08}
        />
      </mesh>

      {/* Talking mouth overlay - positioned at mouth area */}
      {isTalking && (
        <mesh ref={mouthOverlayRef} position={[0, -0.18, 0.01]}>
          <ringGeometry args={[0.03, 0.06, 32]} />
          <meshBasicMaterial 
            color="#2a1a1a" 
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Subtle rim light effect */}
      <mesh position={[-0.72, 0.05, -0.01]}>
        <planeGeometry args={[0.03, 1.7]} />
        <meshBasicMaterial 
          color="#a855f7" 
          transparent={true} 
          opacity={0.2}
        />
      </mesh>

      <mesh position={[0.72, 0.05, -0.01]}>
        <planeGeometry args={[0.03, 1.7]} />
        <meshBasicMaterial 
          color="#06b6d4" 
          transparent={true} 
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

interface RealisticDemoAvatar3DProps {
  isTalking?: boolean;
  className?: string;
}

const RealisticDemoAvatar3D: React.FC<RealisticDemoAvatar3DProps> = ({
  isTalking = true,
  className = ''
}) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ 
        height: '100%',
        minHeight: '280px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(88, 28, 135, 0.4) 50%, rgba(15, 23, 42, 0.95) 100%)'
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 animate-pulse" />
      
      <Canvas
        camera={{ position: [0, 0, 2], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={1.2} />
        <pointLight position={[2, 2, 3]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-2, 1, 2]} intensity={0.4} color="#a855f7" />
        <pointLight position={[0, -1, 2]} intensity={0.3} color="#06b6d4" />
        
        {/* Photo-based Avatar */}
        <React.Suspense fallback={null}>
          <AvatarWithPhoto isTalking={isTalking} />
        </React.Suspense>
        
        {/* Subtle camera movement */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          enableRotate={false}
        />
      </Canvas>

      {/* Talking indicator */}
      {isTalking && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-4 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
          <span className="text-xs text-cyan-400 font-medium">Speaking...</span>
        </div>
      )}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-purple-500/30 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30 rounded-br-2xl" />
      
      {/* Subtle scan line effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />
    </div>
  );
};

export default RealisticDemoAvatar3D;
