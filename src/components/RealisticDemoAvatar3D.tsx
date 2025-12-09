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
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  // Skin color
  const skinColor = useMemo(() => new THREE.Color('#E8B89D'), []);
  const hairColor = useMemo(() => new THREE.Color('#2D1B0E'), []);
  const shirtColor = useMemo(() => new THREE.Color('#3B82F6'), []);
  const eyeColor = useMemo(() => new THREE.Color('#1E293B'), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle body sway
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.03;
    }

    // Head movement - nodding and tilting while talking
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 1.5) * 0.08;
      headRef.current.rotation.z = Math.sin(t * 0.7) * 0.05;
    }

    // Mouth animation when talking
    if (mouthRef.current && isTalking) {
      const mouthScale = 0.8 + Math.sin(t * 12) * 0.3 + Math.sin(t * 8) * 0.2;
      mouthRef.current.scale.y = Math.max(0.3, mouthScale);
    }

    // Arm gestures - natural speaking gestures
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.3 + Math.sin(t * 1.2) * 0.15;
      leftArmRef.current.rotation.z = 0.4 + Math.sin(t * 0.9 + 1) * 0.1;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.2 + Math.sin(t * 1.4 + 0.5) * 0.2;
      rightArmRef.current.rotation.z = -0.4 + Math.sin(t * 1.1) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Torso */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.9, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.2, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.95, 0]}>
        {/* Head */}
        <mesh>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.34, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        
        {/* Left Eye */}
        <group position={[-0.1, 0.05, 0.28]}>
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
          <mesh position={[0.01, 0.01, 0.045]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.1, 0.05, 0.28]}>
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
          <mesh position={[0.01, 0.01, 0.045]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh position={[-0.1, 0.12, 0.29]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.08, 0.015, 0.01]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.1, 0.12, 0.29]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.08, 0.015, 0.01]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.3]}>
          <coneGeometry args={[0.025, 0.06, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.12, 0.28]}>
          <capsuleGeometry args={[0.02, 0.06, 4, 8]} />
          <meshStandardMaterial color="#8B4557" roughness={0.6} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.32, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh position={[0.32, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Shoulders */}
      <mesh position={[-0.38, 0.35, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.38, 0.35, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* Left Arm Group - connected to shoulder */}
      <group ref={leftArmRef} position={[-0.45, 0.25, 0]}>
        {/* Upper Arm */}
        <mesh position={[-0.08, -0.15, 0]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.06, 0.25, 4, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
        {/* Elbow */}
        <mesh position={[-0.18, -0.32, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-0.22, -0.48, 0.05]} rotation={[0.3, 0, 0.2]}>
          <capsuleGeometry args={[0.05, 0.22, 4, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[-0.26, -0.68, 0.1]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Fingers */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.28 - i * 0.015, -0.75 - i * 0.01, 0.1 + i * 0.02]} rotation={[0.2, 0, 0.1]}>
            <capsuleGeometry args={[0.012, 0.04, 4, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Right Arm Group - connected to shoulder */}
      <group ref={rightArmRef} position={[0.45, 0.25, 0]}>
        {/* Upper Arm */}
        <mesh position={[0.08, -0.15, 0]} rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.06, 0.25, 4, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0.18, -0.32, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0.22, -0.48, 0.05]} rotation={[0.3, 0, -0.2]}>
          <capsuleGeometry args={[0.05, 0.22, 4, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0.26, -0.68, 0.1]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Fingers */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.28 + i * 0.015, -0.75 - i * 0.01, 0.1 + i * 0.02]} rotation={[0.2, 0, -0.1]}>
            <capsuleGeometry args={[0.012, 0.04, 4, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
        ))}
      </group>
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
        camera={{ position: [0, 0.3, 2.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1} castShadow />
        <directionalLight position={[-2, 2, -1]} intensity={0.4} color="#b0c4ff" />
        <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffffff" />

        {/* Avatar */}
        <AvatarBody isTalking={isTalking} />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl" />
      </div>
    </div>
  );
};

export default RealisticDemoAvatar3D;