import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import demoAvatarImage from '@/assets/demo-avatar.png';

interface AvatarBodyProps {
  isTalking?: boolean;
}

const AvatarBody: React.FC<AvatarBodyProps> = ({ isTalking = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  // Load the avatar face texture
  const faceTexture = useLoader(TextureLoader, demoAvatarImage);

  // Configure texture for better quality - circular crop effect
  useMemo(() => {
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.minFilter = THREE.LinearMipMapLinearFilter;
    faceTexture.magFilter = THREE.LinearFilter;
    faceTexture.wrapS = THREE.ClampToEdgeWrapping;
    faceTexture.wrapT = THREE.ClampToEdgeWrapping;
    faceTexture.center.set(0.5, 0.5);
  }, [faceTexture]);

  // Realistic colors
  const skinColor = useMemo(() => new THREE.Color('#D4A574'), []);
  const hairColor = useMemo(() => new THREE.Color('#1a1a1a'), []);
  const shirtColor = useMemo(() => new THREE.Color('#1e3a5f'), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Gentle floating and breathing
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.03;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.015;
    }

    // Subtle head movement
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.8) * 0.04;
      headRef.current.rotation.z = Math.sin(t * 0.5) * 0.025;
      headRef.current.rotation.y = Math.sin(t * 0.6) * 0.03;
    }

    // Mouth animation when talking
    if (mouthRef.current && isTalking) {
      const mouthOpen = 0.5 + Math.sin(t * 8) * 0.3 + Math.sin(t * 5) * 0.2;
      mouthRef.current.scale.y = Math.max(0.2, mouthOpen);
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 0.25;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {/* Head Group - Main focus with face texture */}
      <group ref={headRef} position={[0, 0, 0]}>
        {/* 3D Head sphere with face texture mapped to front */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.85, 64, 64]} />
          <meshStandardMaterial 
            map={faceTexture} 
            roughness={0.4}
            metalness={0.05}
            envMapIntensity={0.3}
          />
        </mesh>

        {/* Subtle glow ring around the avatar */}
        <mesh position={[0, 0, -0.1]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.9, 1.0, 64]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>

        {/* Animated mouth overlay for talking */}
        <mesh ref={mouthRef} position={[0, -0.25, 0.78]} scale={[0.15, 0.04, 0.02]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#8B4B5A" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Neck - subtle connection */}
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.25, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Shoulders/Collar hint */}
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.45, 0.35, 0.3, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.1} />
      </mesh>
      
      {/* Shirt collar V-shape */}
      <mesh position={[0, -0.88, 0.18]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.2, 0.12, 0.08]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

interface RealisticDemoAvatar3DProps {
  className?: string;
  isTalking?: boolean;
}

const RealisticDemoAvatar3D: React.FC<RealisticDemoAvatar3DProps> = ({ 
  className = '',
  isTalking = true 
}) => {
  return (
    <div className={`w-full h-80 relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Soft, natural lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 4]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-2, 1, 2]} intensity={0.4} color="#e8f0ff" />
        <pointLight position={[0, 1, 3]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-1.5, -0.5, 2]} intensity={0.25} color="#ffe8d4" />

        {/* Avatar */}
        <React.Suspense fallback={null}>
          <AvatarBody isTalking={isTalking} />
        </React.Suspense>

        {/* Subtle auto-rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-purple-500/5 rounded-3xl" />
      </div>
    </div>
  );
};

export default RealisticDemoAvatar3D;