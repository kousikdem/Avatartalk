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
  const leftEyelidRef = useRef<THREE.Mesh>(null);
  const rightEyelidRef = useRef<THREE.Mesh>(null);

  // Realistic skin tone colors - warmer, more natural
  const skinColor = useMemo(() => new THREE.Color('#E8B89D'), []);
  const skinColorLight = useMemo(() => new THREE.Color('#F5CDB4'), []);
  const skinColorDark = useMemo(() => new THREE.Color('#C99B7C'), []);
  const hairColor = useMemo(() => new THREE.Color('#1C1008'), []);
  const eyeWhiteColor = useMemo(() => new THREE.Color('#FAFAFA'), []);
  const eyeIrisColor = useMemo(() => new THREE.Color('#4A3728'), []);
  const eyePupilColor = useMemo(() => new THREE.Color('#0D0D0D'), []);
  const lipColor = useMemo(() => new THREE.Color('#C27070'), []);
  const lipColorDark = useMemo(() => new THREE.Color('#8B4545'), []);
  const shirtColor = useMemo(() => new THREE.Color('#1E3A5F'), []);
  const eyebrowColor = useMemo(() => new THREE.Color('#1A0A05'), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Gentle breathing motion
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.008;
    }

    // Subtle head movement - natural micro-movements
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.7) * 0.02;
      headRef.current.rotation.z = Math.sin(t * 0.4) * 0.015;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.025;
    }

    // Realistic blinking
    if (leftEyelidRef.current && rightEyelidRef.current) {
      const blinkPhase = t % 4;
      let blinkScale = 0;
      if (blinkPhase > 3.85 && blinkPhase < 4) {
        blinkScale = Math.sin((blinkPhase - 3.85) * Math.PI / 0.15);
      }
      leftEyelidRef.current.scale.y = blinkScale;
      rightEyelidRef.current.scale.y = blinkScale;
    }

    // Mouth animation when talking
    if (mouthRef.current && isTalking) {
      const mouthOpen = 0.3 + Math.sin(t * 9) * 0.15 + Math.sin(t * 6) * 0.1;
      mouthRef.current.scale.y = Math.max(0.2, mouthOpen);
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head Group - centered */}
      <group ref={headRef} position={[0, 0.4, 0]}>
        
        {/* ===== SKULL STRUCTURE ===== */}
        
        {/* Main Cranium - oval shaped for realistic head */}
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.42, 64, 64]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Forehead - slightly protruding */}
        <mesh position={[0, 0.28, 0.18]}>
          <sphereGeometry args={[0.32, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Temple - Left */}
        <mesh position={[-0.35, 0.1, 0.05]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Temple - Right */}
        <mesh position={[0.35, 0.1, 0.05]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* ===== FACE STRUCTURE ===== */}

        {/* Mid-face base */}
        <mesh position={[0, -0.05, 0.28]}>
          <sphereGeometry args={[0.3, 48, 48]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Cheekbone - Left */}
        <mesh position={[-0.22, -0.02, 0.28]}>
          <sphereGeometry args={[0.14, 32, 32]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.45} metalness={0.02} />
        </mesh>

        {/* Cheekbone - Right */}
        <mesh position={[0.22, -0.02, 0.28]}>
          <sphereGeometry args={[0.14, 32, 32]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.45} metalness={0.02} />
        </mesh>

        {/* Cheek flesh - Left */}
        <mesh position={[-0.18, -0.12, 0.26]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Cheek flesh - Right */}
        <mesh position={[0.18, -0.12, 0.26]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* ===== NOSE - Anatomically detailed ===== */}

        {/* Nose bridge */}
        <mesh position={[0, 0.05, 0.38]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.055, 0.16, 0.08]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Nose dorsum (ridge) */}
        <mesh position={[0, -0.02, 0.42]}>
          <sphereGeometry args={[0.04, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Nose tip - rounded */}
        <mesh position={[0, -0.1, 0.44]}>
          <sphereGeometry args={[0.055, 32, 32]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Nose ball */}
        <mesh position={[0, -0.12, 0.42]}>
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Nostril wing - Left */}
        <mesh position={[-0.04, -0.13, 0.38]}>
          <sphereGeometry args={[0.032, 16, 16]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Nostril wing - Right */}
        <mesh position={[0.04, -0.13, 0.38]}>
          <sphereGeometry args={[0.032, 16, 16]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* ===== EYES - Realistic with depth ===== */}

        {/* Left Eye Socket/Orbital */}
        <mesh position={[-0.12, 0.06, 0.3]}>
          <sphereGeometry args={[0.065, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} metalness={0} />
        </mesh>

        {/* Left Iris */}
        <mesh position={[-0.12, 0.06, 0.355]}>
          <sphereGeometry args={[0.035, 24, 24]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.15} metalness={0.05} />
        </mesh>

        {/* Left Pupil */}
        <mesh position={[-0.12, 0.06, 0.375]}>
          <sphereGeometry args={[0.018, 20, 20]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.1} />
        </mesh>

        {/* Left Eye highlight */}
        <mesh position={[-0.105, 0.075, 0.38]}>
          <sphereGeometry args={[0.006, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0} metalness={0} emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>

        {/* Left Upper Eyelid */}
        <mesh ref={leftEyelidRef} position={[-0.12, 0.085, 0.34]} scale={[1, 0, 1]}>
          <sphereGeometry args={[0.055, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Left Lower Eyelid */}
        <mesh position={[-0.12, 0.04, 0.34]}>
          <sphereGeometry args={[0.045, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Right Eye Socket/Orbital */}
        <mesh position={[0.12, 0.06, 0.3]}>
          <sphereGeometry args={[0.065, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} metalness={0} />
        </mesh>

        {/* Right Iris */}
        <mesh position={[0.12, 0.06, 0.355]}>
          <sphereGeometry args={[0.035, 24, 24]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.15} metalness={0.05} />
        </mesh>

        {/* Right Pupil */}
        <mesh position={[0.12, 0.06, 0.375]}>
          <sphereGeometry args={[0.018, 20, 20]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.1} />
        </mesh>

        {/* Right Eye highlight */}
        <mesh position={[0.135, 0.075, 0.38]}>
          <sphereGeometry args={[0.006, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0} metalness={0} emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>

        {/* Right Upper Eyelid */}
        <mesh ref={rightEyelidRef} position={[0.12, 0.085, 0.34]} scale={[1, 0, 1]}>
          <sphereGeometry args={[0.055, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Right Lower Eyelid */}
        <mesh position={[0.12, 0.04, 0.34]}>
          <sphereGeometry args={[0.045, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* ===== EYEBROWS - Natural arch ===== */}

        {/* Left Eyebrow */}
        <mesh position={[-0.12, 0.15, 0.35]} rotation={[0.15, 0, 0.08]}>
          <boxGeometry args={[0.09, 0.018, 0.025]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
        </mesh>

        {/* Left Eyebrow inner */}
        <mesh position={[-0.07, 0.145, 0.36]} rotation={[0.15, 0, 0.15]}>
          <boxGeometry args={[0.04, 0.016, 0.022]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
        </mesh>

        {/* Right Eyebrow */}
        <mesh position={[0.12, 0.15, 0.35]} rotation={[0.15, 0, -0.08]}>
          <boxGeometry args={[0.09, 0.018, 0.025]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
        </mesh>

        {/* Right Eyebrow inner */}
        <mesh position={[0.07, 0.145, 0.36]} rotation={[0.15, 0, -0.15]}>
          <boxGeometry args={[0.04, 0.016, 0.022]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
        </mesh>

        {/* ===== LIPS & MOUTH ===== */}

        {/* Philtrum (area between nose and upper lip) */}
        <mesh position={[0, -0.17, 0.36]}>
          <boxGeometry args={[0.03, 0.04, 0.02]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Upper Lip */}
        <mesh position={[0, -0.21, 0.36]}>
          <sphereGeometry args={[0.055, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* Upper Lip - Cupid's bow left */}
        <mesh position={[-0.025, -0.2, 0.38]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* Upper Lip - Cupid's bow right */}
        <mesh position={[0.025, -0.2, 0.38]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* Lower Lip / Mouth opening */}
        <mesh ref={mouthRef} position={[0, -0.25, 0.34]} scale={[1, 0.15, 1]}>
          <sphereGeometry args={[0.05, 24, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color={lipColorDark} roughness={0.4} metalness={0.02} />
        </mesh>

        {/* Lower Lip - fuller */}
        <mesh position={[0, -0.26, 0.35]}>
          <sphereGeometry args={[0.05, 24, 24, 0, Math.PI * 2, Math.PI / 3, Math.PI / 2]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* ===== CHIN & JAW ===== */}

        {/* Chin - rounded */}
        <mesh position={[0, -0.35, 0.22]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Chin point */}
        <mesh position={[0, -0.38, 0.18]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Jaw - Left */}
        <mesh position={[-0.2, -0.28, 0.12]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Jaw - Right */}
        <mesh position={[0.2, -0.28, 0.12]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Jawline - Left */}
        <mesh position={[-0.28, -0.22, 0]}>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Jawline - Right */}
        <mesh position={[0.28, -0.22, 0]}>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* ===== EARS ===== */}

        {/* Left Ear - outer helix */}
        <mesh position={[-0.4, 0.02, -0.02]} rotation={[0, -0.25, 0.05]}>
          <torusGeometry args={[0.055, 0.018, 12, 24, Math.PI * 1.3]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Left Ear - inner */}
        <mesh position={[-0.38, 0.02, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Left Ear - lobe */}
        <mesh position={[-0.38, -0.05, 0.01]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Right Ear - outer helix */}
        <mesh position={[0.4, 0.02, -0.02]} rotation={[0, 0.25, -0.05]}>
          <torusGeometry args={[0.055, 0.018, 12, 24, Math.PI * 1.3]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Right Ear - inner */}
        <mesh position={[0.38, 0.02, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Right Ear - lobe */}
        <mesh position={[0.38, -0.05, 0.01]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* ===== HAIR ===== */}

        {/* Hair - Top crown */}
        <mesh position={[0, 0.32, -0.02]}>
          <sphereGeometry args={[0.38, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} metalness={0} />
        </mesh>

        {/* Hair - Front hairline */}
        <mesh position={[0, 0.28, 0.22]}>
          <sphereGeometry args={[0.28, 32, 32, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} metalness={0} />
        </mesh>

        {/* Hair - Back of head */}
        <mesh position={[0, 0.1, -0.28]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} metalness={0} />
        </mesh>

        {/* Hair - Left side */}
        <mesh position={[-0.34, 0.12, -0.08]}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} metalness={0} />
        </mesh>

        {/* Hair - Right side */}
        <mesh position={[0.34, 0.12, -0.08]}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} metalness={0} />
        </mesh>

        {/* Hair - Left temple area */}
        <mesh position={[-0.32, 0.18, 0.08]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} metalness={0} />
        </mesh>

        {/* Hair - Right temple area */}
        <mesh position={[0.32, 0.18, 0.08]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} metalness={0} />
        </mesh>

      </group>

      {/* ===== NECK ===== */}
      <mesh position={[0, -0.02, -0.02]}>
        <cylinderGeometry args={[0.09, 0.11, 0.18, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
      </mesh>

      {/* Neck - Adam's apple area */}
      <mesh position={[0, -0.05, 0.06]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
      </mesh>

      {/* ===== UPPER BODY ===== */}
      
      {/* Shoulders base */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.25, 0.22, 0.12, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.08} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.32, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.08} />
      </mesh>

      {/* Collar V-neck */}
      <mesh position={[0, -0.08, 0.08]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.04]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.08} />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-0.28, -0.15, 0]} rotation={[0, 0, 0.25]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.08} />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[0.28, -0.15, 0]} rotation={[0, 0, -0.25]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.08} />
      </mesh>

      {/* Left Upper Arm */}
      <mesh position={[-0.36, -0.28, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.055, 0.05, 0.18, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.08} />
      </mesh>

      {/* Right Upper Arm */}
      <mesh position={[0.36, -0.28, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.055, 0.05, 0.18, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.08} />
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
    <div className={`w-full h-52 relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0.15, 2.2], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Studio lighting for realistic skin rendering */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-2, 1, 2]} intensity={0.35} color="#e8f0ff" />
        <pointLight position={[0, 1, 3]} intensity={0.5} color="#fff5ee" />
        <pointLight position={[-1.5, -0.5, 2]} intensity={0.2} color="#ffe4d4" />
        <hemisphereLight args={['#ffeedd', '#aabbcc', 0.25]} />

        {/* Avatar - centered and properly scaled */}
        <React.Suspense fallback={null}>
          <group scale={0.85} position={[0, -0.1, 0]}>
            <AvatarBody isTalking={isTalking} />
          </group>
        </React.Suspense>

        {/* Subtle auto-rotation for 3D effect */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>

      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-purple-500/5 rounded-3xl" />
      </div>
    </div>
  );
};

export default RealisticDemoAvatar3D;
