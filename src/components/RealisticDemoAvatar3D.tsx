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
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Realistic skin tones and colors
  const skinColor = useMemo(() => new THREE.Color('#DEB896'), []);
  const skinDarkColor = useMemo(() => new THREE.Color('#C9A882'), []);
  const hairColor = useMemo(() => new THREE.Color('#1a0f0a'), []);
  const shirtColor = useMemo(() => new THREE.Color('#1E40AF'), []);
  const eyeColor = useMemo(() => new THREE.Color('#2E5A4C'), []);
  const lipColor = useMemo(() => new THREE.Color('#C07070'), []);
  const eyebrowColor = useMemo(() => new THREE.Color('#3D2817'), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle breathing and body sway
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.04;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.02;
    }

    // Realistic head movement - natural nodding and subtle tilting
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.06 + Math.sin(t * 0.5) * 0.03;
      headRef.current.rotation.z = Math.sin(t * 0.6) * 0.04;
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.05;
    }

    // Blinking animation
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(t * 0.3) > 0.95;
      const blinkScale = blinkCycle ? 0.1 : 1;
      leftEyeRef.current.scale.y = blinkScale;
      rightEyeRef.current.scale.y = blinkScale;
    }

    // Mouth animation when talking - more natural lip movement
    if (mouthRef.current && isTalking) {
      const mouthOpen = 0.6 + Math.sin(t * 10) * 0.25 + Math.sin(t * 7) * 0.15;
      mouthRef.current.scale.y = Math.max(0.2, mouthOpen);
      mouthRef.current.scale.x = 1 + Math.sin(t * 6) * 0.1;
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 0.3;
      mouthRef.current.scale.x = 1;
    }

    // Natural arm gestures during conversation
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -0.25 + Math.sin(t * 1.0) * 0.12;
      leftArmRef.current.rotation.z = 0.35 + Math.sin(t * 0.7 + 1) * 0.08;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -0.2 + Math.sin(t * 1.2 + 0.5) * 0.15;
      rightArmRef.current.rotation.z = -0.35 + Math.sin(t * 0.9) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Torso - more anatomical shape */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.85, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} metalness={0.1} />
      </mesh>
      
      {/* Collar detail */}
      <mesh position={[0, 0.38, 0.08]}>
        <boxGeometry args={[0.25, 0.08, 0.12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* Neck - more realistic proportions */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.18, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.92, 0]}>
        {/* Main Head - oval shape */}
        <mesh>
          <sphereGeometry args={[0.28, 48, 48]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
        
        {/* Jaw structure */}
        <mesh position={[0, -0.12, 0.05]} scale={[1, 0.8, 0.9]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>

        {/* Forehead */}
        <mesh position={[0, 0.1, 0.08]}>
          <sphereGeometry args={[0.22, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>

        {/* Hair - more realistic style */}
        <mesh position={[0, 0.12, -0.02]}>
          <sphereGeometry args={[0.3, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} roughness={0.85} />
        </mesh>
        
        {/* Side hair */}
        <mesh position={[-0.22, 0.05, -0.05]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.85} />
        </mesh>
        <mesh position={[0.22, 0.05, -0.05]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.85} />
        </mesh>
        
        {/* Back hair */}
        <mesh position={[0, 0, -0.15]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color={hairColor} roughness={0.85} />
        </mesh>
        
        {/* Left Eye socket area */}
        <mesh position={[-0.09, 0.04, 0.22]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color={skinDarkColor} roughness={0.7} />
        </mesh>
        
        {/* Right Eye socket area */}
        <mesh position={[0.09, 0.04, 0.22]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color={skinDarkColor} roughness={0.7} />
        </mesh>

        {/* Left Eye */}
        <group position={[-0.09, 0.04, 0.25]}>
          <mesh ref={leftEyeRef}>
            <sphereGeometry args={[0.04, 24, 24]} />
            <meshStandardMaterial color="white" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <sphereGeometry args={[0.022, 24, 24]} />
            <meshStandardMaterial color={eyeColor} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          </mesh>
          <mesh position={[0.005, 0.005, 0.04]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.09, 0.04, 0.25]}>
          <mesh ref={rightEyeRef}>
            <sphereGeometry args={[0.04, 24, 24]} />
            <meshStandardMaterial color="white" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <sphereGeometry args={[0.022, 24, 24]} />
            <meshStandardMaterial color={eyeColor} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          </mesh>
          <mesh position={[0.005, 0.005, 0.04]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Eyebrows - more natural */}
        <mesh position={[-0.09, 0.1, 0.25]} rotation={[0.1, 0, 0.08]}>
          <capsuleGeometry args={[0.008, 0.06, 4, 8]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.09, 0.1, 0.25]} rotation={[0.1, 0, -0.08]}>
          <capsuleGeometry args={[0.008, 0.06, 4, 8]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
        </mesh>

        {/* Nose - more detailed */}
        <group position={[0, -0.02, 0.26]}>
          <mesh>
            <coneGeometry args={[0.022, 0.06, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.02, 0.01]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color={skinColor} roughness={0.65} />
          </mesh>
          {/* Nostrils */}
          <mesh position={[-0.012, -0.025, 0.015]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color={skinDarkColor} roughness={0.8} />
          </mesh>
          <mesh position={[0.012, -0.025, 0.015]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color={skinDarkColor} roughness={0.8} />
          </mesh>
        </group>

        {/* Lips and Mouth */}
        <group position={[0, -0.12, 0.24]}>
          {/* Upper lip */}
          <mesh position={[0, 0.015, 0]}>
            <capsuleGeometry args={[0.015, 0.05, 4, 8]} />
            <meshStandardMaterial color={lipColor} roughness={0.5} />
          </mesh>
          {/* Lower lip */}
          <mesh position={[0, -0.01, 0.005]}>
            <capsuleGeometry args={[0.018, 0.045, 4, 8]} />
            <meshStandardMaterial color={lipColor} roughness={0.5} />
          </mesh>
          {/* Mouth opening */}
          <mesh ref={mouthRef} position={[0, 0, 0.01]}>
            <capsuleGeometry args={[0.012, 0.04, 4, 8]} />
            <meshStandardMaterial color="#4a2020" roughness={0.8} />
          </mesh>
        </group>

        {/* Cheeks - subtle */}
        <mesh position={[-0.18, -0.05, 0.12]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0.18, -0.05, 0.12]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} transparent opacity={0.9} />
        </mesh>

        {/* Ears */}
        <group position={[-0.27, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.01, 0, 0]}>
            <torusGeometry args={[0.025, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color={skinDarkColor} roughness={0.7} />
          </mesh>
        </group>
        <group position={[0.27, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
          <mesh position={[-0.01, 0, 0]} rotation={[0, Math.PI, 0]}>
            <torusGeometry args={[0.025, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color={skinDarkColor} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Shoulders - rounded */}
      <mesh position={[-0.35, 0.32, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.35, 0.32, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* Left Arm Group */}
      <group ref={leftArmRef} position={[-0.42, 0.22, 0]}>
        {/* Upper Arm */}
        <mesh position={[-0.06, -0.14, 0]} rotation={[0, 0, 0.25]}>
          <capsuleGeometry args={[0.055, 0.22, 4, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        {/* Elbow */}
        <mesh position={[-0.15, -0.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-0.18, -0.45, 0.04]} rotation={[0.25, 0, 0.15]}>
          <capsuleGeometry args={[0.045, 0.2, 4, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Wrist */}
        <mesh position={[-0.22, -0.62, 0.08]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[-0.24, -0.68, 0.1]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Right Arm Group */}
      <group ref={rightArmRef} position={[0.42, 0.22, 0]}>
        {/* Upper Arm */}
        <mesh position={[0.06, -0.14, 0]} rotation={[0, 0, -0.25]}>
          <capsuleGeometry args={[0.055, 0.22, 4, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0.15, -0.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0.18, -0.45, 0.04]} rotation={[0.25, 0, -0.15]}>
          <capsuleGeometry args={[0.045, 0.2, 4, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Wrist */}
        <mesh position={[0.22, -0.62, 0.08]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0.24, -0.68, 0.1]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
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
        camera={{ position: [0, 0.3, 2.0], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Enhanced Lighting for realistic look */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 3]} intensity={1.2} castShadow color="#fff5f0" />
        <directionalLight position={[-2, 2, -1]} intensity={0.4} color="#e0e8ff" />
        <pointLight position={[0, 2, 4]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-2, 0, 2]} intensity={0.3} color="#ffd4b8" />

        {/* Avatar */}
        <AvatarBody isTalking={isTalking} />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl" />
      </div>
    </div>
  );
};

export default RealisticDemoAvatar3D;