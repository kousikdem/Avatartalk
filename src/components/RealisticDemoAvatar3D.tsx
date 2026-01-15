import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarBodyProps {
  isTalking?: boolean;
}

const AvatarBody: React.FC<AvatarBodyProps> = ({ isTalking = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Realistic skin tone colors
  const skinColor = useMemo(() => new THREE.Color('#D4A574'), []);
  const skinColorDark = useMemo(() => new THREE.Color('#C49A6C'), []);
  const hairColor = useMemo(() => new THREE.Color('#1a1a1a'), []);
  const eyeWhiteColor = useMemo(() => new THREE.Color('#f5f5f5'), []);
  const eyeIrisColor = useMemo(() => new THREE.Color('#3D2817'), []);
  const eyePupilColor = useMemo(() => new THREE.Color('#0a0a0a'), []);
  const lipColor = useMemo(() => new THREE.Color('#B87070'), []);
  const shirtColor = useMemo(() => new THREE.Color('#1e3a5f'), []);
  const eyebrowColor = useMemo(() => new THREE.Color('#1a0a05'), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Gentle floating and breathing
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.02;
    }

    // Subtle head movement - looking around
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.8) * 0.05;
      headRef.current.rotation.z = Math.sin(t * 0.5) * 0.03;
      headRef.current.rotation.y = Math.sin(t * 0.6) * 0.04;
    }

    // Eye blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(t * 0.3) > 0.95 ? 0.1 : 1;
      leftEyeRef.current.scale.y = blinkCycle;
      rightEyeRef.current.scale.y = blinkCycle;
    }

    // Mouth animation when talking
    if (mouthRef.current && isTalking) {
      const mouthOpen = 0.5 + Math.sin(t * 8) * 0.3 + Math.sin(t * 5) * 0.2;
      mouthRef.current.scale.y = Math.max(0.3, mouthOpen);
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Head Group */}
      <group ref={headRef} position={[0, 0.8, 0]}>
        {/* Main Head - Elongated sphere for realistic head shape */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.55, 64, 64]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Face plane - slightly flatter front */}
        <mesh position={[0, -0.05, 0.35]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Forehead */}
        <mesh position={[0, 0.25, 0.3]}>
          <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Cheekbones - left */}
        <mesh position={[-0.28, -0.05, 0.32]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Cheekbones - right */}
        <mesh position={[0.28, -0.05, 0.32]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Nose bridge */}
        <mesh position={[0, 0.02, 0.48]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.08, 0.2, 0.12]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Nose tip */}
        <mesh position={[0, -0.12, 0.52]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.05} />
        </mesh>

        {/* Nostrils - left */}
        <mesh position={[-0.04, -0.16, 0.48]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.7} metalness={0} />
        </mesh>

        {/* Nostrils - right */}
        <mesh position={[0.04, -0.16, 0.48]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.7} metalness={0} />
        </mesh>

        {/* Left Eye Socket */}
        <mesh position={[-0.15, 0.08, 0.42]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} metalness={0} />
        </mesh>

        {/* Left Iris */}
        <mesh ref={leftEyeRef} position={[-0.15, 0.08, 0.5]}>
          <sphereGeometry args={[0.045, 20, 20]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.2} metalness={0.1} />
        </mesh>

        {/* Left Pupil */}
        <mesh position={[-0.15, 0.08, 0.53]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.2} />
        </mesh>

        {/* Right Eye Socket */}
        <mesh position={[0.15, 0.08, 0.42]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} metalness={0} />
        </mesh>

        {/* Right Iris */}
        <mesh ref={rightEyeRef} position={[0.15, 0.08, 0.5]}>
          <sphereGeometry args={[0.045, 20, 20]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.2} metalness={0.1} />
        </mesh>

        {/* Right Pupil */}
        <mesh position={[0.15, 0.08, 0.53]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.2} />
        </mesh>

        {/* Left Eyebrow */}
        <mesh position={[-0.15, 0.2, 0.45]} rotation={[0.1, 0, 0.1]}>
          <boxGeometry args={[0.12, 0.025, 0.03]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.8} />
        </mesh>

        {/* Right Eyebrow */}
        <mesh position={[0.15, 0.2, 0.45]} rotation={[0.1, 0, -0.1]}>
          <boxGeometry args={[0.12, 0.025, 0.03]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.8} />
        </mesh>

        {/* Upper Lip */}
        <mesh position={[0, -0.25, 0.42]}>
          <boxGeometry args={[0.14, 0.035, 0.06]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} metalness={0.05} />
        </mesh>

        {/* Lower Lip / Mouth */}
        <mesh ref={mouthRef} position={[0, -0.3, 0.4]} scale={[1, 0.3, 1]}>
          <boxGeometry args={[0.12, 0.08, 0.05]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} metalness={0.05} />
        </mesh>

        {/* Chin */}
        <mesh position={[0, -0.4, 0.28]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Jaw - left */}
        <mesh position={[-0.25, -0.25, 0.15]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Jaw - right */}
        <mesh position={[0.25, -0.25, 0.15]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Left Ear */}
        <mesh position={[-0.52, 0, 0]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.06, 0.18, 0.1]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} />
        </mesh>

        {/* Right Ear */}
        <mesh position={[0.52, 0, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.06, 0.18, 0.1]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} />
        </mesh>

        {/* Hair - Top */}
        <mesh position={[0, 0.35, -0.05]}>
          <sphereGeometry args={[0.48, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Back */}
        <mesh position={[0, 0.1, -0.35]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Left Side */}
        <mesh position={[-0.42, 0.15, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Right Side */}
        <mesh position={[0.42, 0.15, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Light stubble texture overlay */}
        <mesh position={[0, -0.3, 0.35]}>
          <sphereGeometry args={[0.25, 24, 24, 0, Math.PI * 2, Math.PI / 4, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            roughness={1} 
            metalness={0} 
            transparent 
            opacity={0.15} 
          />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.25, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Shoulders/Upper Body */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 0.35, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.4, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Collar - V-neck */}
      <mesh position={[0, 0.08, 0.12]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.06]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-0.38, 0, 0]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[0.38, 0, 0]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Left Upper Arm */}
      <mesh position={[-0.48, -0.15, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.08, 0.07, 0.25, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Right Upper Arm */}
      <mesh position={[0.48, -0.15, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.08, 0.07, 0.25, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.1} />
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
        camera={{ position: [0, 0.3, 2.8], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Soft, natural lighting for realistic skin */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-3, 2, 3]} intensity={0.4} color="#e8f0ff" />
        <pointLight position={[0, 2, 4]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-2, -1, 3]} intensity={0.3} color="#ffe8d4" />
        <hemisphereLight args={['#ffeedd', '#aabbcc', 0.3]} />

        {/* Avatar */}
        <React.Suspense fallback={null}>
          <AvatarBody isTalking={isTalking} />
        </React.Suspense>

        {/* Subtle auto-rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.8}
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