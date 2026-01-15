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

  // Realistic skin tone - medium warm South Asian complexion
  const skinColor = useMemo(() => new THREE.Color('#D4A574'), []);
  const skinColorLight = useMemo(() => new THREE.Color('#E5B88A'), []);
  const skinColorDark = useMemo(() => new THREE.Color('#B8895A'), []);
  
  // Dark brown/black hair
  const hairColor = useMemo(() => new THREE.Color('#1A1209'), []);
  const hairHighlight = useMemo(() => new THREE.Color('#2C1E12'), []);
  
  // Brown eyes
  const eyeWhiteColor = useMemo(() => new THREE.Color('#FAFAFA'), []);
  const eyeIrisColor = useMemo(() => new THREE.Color('#3D2314'), []);
  const eyePupilColor = useMemo(() => new THREE.Color('#0A0705'), []);
  
  // Natural lip color
  const lipColor = useMemo(() => new THREE.Color('#A86B60'), []);
  const lipColorDark = useMemo(() => new THREE.Color('#6B4540'), []);
  
  // Blue collared shirt
  const shirtColor = useMemo(() => new THREE.Color('#3A6B99'), []);
  const shirtColorDark = useMemo(() => new THREE.Color('#2E5680'), []);
  
  // Facial hair - light stubble/goatee
  const beardColor = useMemo(() => new THREE.Color('#1A1008'), []);
  
  const eyebrowColor = useMemo(() => new THREE.Color('#1A0A05'), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Gentle breathing motion
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.005;
    }

    // Subtle head movement - natural micro-movements
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.7) * 0.015;
      headRef.current.rotation.z = Math.sin(t * 0.4) * 0.01;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.018;
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
      const mouthOpen = 0.25 + Math.sin(t * 9) * 0.12 + Math.sin(t * 6) * 0.08;
      mouthRef.current.scale.y = Math.max(0.15, mouthOpen);
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head Group - centered */}
      <group ref={headRef} position={[0, 0.35, 0]}>
        
        {/* ===== SKULL STRUCTURE ===== */}
        
        {/* Main Cranium - realistic oval head shape */}
        <mesh position={[0, 0.05, -0.02]}>
          <sphereGeometry args={[0.38, 64, 64]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Forehead - prominent */}
        <mesh position={[0, 0.24, 0.16]}>
          <sphereGeometry args={[0.28, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Temple - Left */}
        <mesh position={[-0.32, 0.08, 0.04]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Temple - Right */}
        <mesh position={[0.32, 0.08, 0.04]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* ===== FACE STRUCTURE ===== */}

        {/* Mid-face base */}
        <mesh position={[0, -0.06, 0.24]}>
          <sphereGeometry args={[0.26, 48, 48]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Cheekbone - Left - prominent */}
        <mesh position={[-0.19, -0.03, 0.24]}>
          <sphereGeometry args={[0.11, 32, 32]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Cheekbone - Right - prominent */}
        <mesh position={[0.19, -0.03, 0.24]}>
          <sphereGeometry args={[0.11, 32, 32]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Cheek flesh - Left */}
        <mesh position={[-0.15, -0.11, 0.22]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Cheek flesh - Right */}
        <mesh position={[0.15, -0.11, 0.22]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* ===== NOSE - Defined bridge ===== */}

        {/* Nose bridge - defined */}
        <mesh position={[0, 0.04, 0.34]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.045, 0.14, 0.06]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Nose dorsum */}
        <mesh position={[0, -0.03, 0.38]}>
          <sphereGeometry args={[0.032, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Nose tip - rounded */}
        <mesh position={[0, -0.1, 0.4]}>
          <sphereGeometry args={[0.045, 32, 32]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Nose ball */}
        <mesh position={[0, -0.11, 0.38]}>
          <sphereGeometry args={[0.038, 24, 24]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Nostril wing - Left */}
        <mesh position={[-0.035, -0.12, 0.34]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* Nostril wing - Right */}
        <mesh position={[0.035, -0.12, 0.34]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* ===== EYES - Deep brown, expressive ===== */}

        {/* Left Eye Socket */}
        <mesh position={[-0.1, 0.05, 0.26]}>
          <sphereGeometry args={[0.055, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} metalness={0} />
        </mesh>

        {/* Left Iris - Brown */}
        <mesh position={[-0.1, 0.05, 0.305]}>
          <sphereGeometry args={[0.03, 24, 24]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.15} metalness={0.05} />
        </mesh>

        {/* Left Pupil */}
        <mesh position={[-0.1, 0.05, 0.325]}>
          <sphereGeometry args={[0.015, 20, 20]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.1} />
        </mesh>

        {/* Left Eye highlight */}
        <mesh position={[-0.09, 0.065, 0.335]}>
          <sphereGeometry args={[0.005, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0} metalness={0} emissive="#ffffff" emissiveIntensity={0.4} />
        </mesh>

        {/* Left Upper Eyelid */}
        <mesh ref={leftEyelidRef} position={[-0.1, 0.075, 0.29]} scale={[1, 0, 1]}>
          <sphereGeometry args={[0.045, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Left Lower Eyelid */}
        <mesh position={[-0.1, 0.032, 0.29]}>
          <sphereGeometry args={[0.038, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Right Eye Socket */}
        <mesh position={[0.1, 0.05, 0.26]}>
          <sphereGeometry args={[0.055, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} metalness={0} />
        </mesh>

        {/* Right Iris - Brown */}
        <mesh position={[0.1, 0.05, 0.305]}>
          <sphereGeometry args={[0.03, 24, 24]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.15} metalness={0.05} />
        </mesh>

        {/* Right Pupil */}
        <mesh position={[0.1, 0.05, 0.325]}>
          <sphereGeometry args={[0.015, 20, 20]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.1} />
        </mesh>

        {/* Right Eye highlight */}
        <mesh position={[0.11, 0.065, 0.335]}>
          <sphereGeometry args={[0.005, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0} metalness={0} emissive="#ffffff" emissiveIntensity={0.4} />
        </mesh>

        {/* Right Upper Eyelid */}
        <mesh ref={rightEyelidRef} position={[0.1, 0.075, 0.29]} scale={[1, 0, 1]}>
          <sphereGeometry args={[0.045, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Right Lower Eyelid */}
        <mesh position={[0.1, 0.032, 0.29]}>
          <sphereGeometry args={[0.038, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* ===== EYEBROWS - Thick, natural arch ===== */}

        {/* Left Eyebrow - Main */}
        <mesh position={[-0.1, 0.125, 0.3]} rotation={[0.1, 0, 0.06]}>
          <boxGeometry args={[0.08, 0.016, 0.022]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* Left Eyebrow inner */}
        <mesh position={[-0.055, 0.12, 0.31]} rotation={[0.1, 0, 0.12]}>
          <boxGeometry args={[0.035, 0.014, 0.02]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* Right Eyebrow - Main */}
        <mesh position={[0.1, 0.125, 0.3]} rotation={[0.1, 0, -0.06]}>
          <boxGeometry args={[0.08, 0.016, 0.022]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* Right Eyebrow inner */}
        <mesh position={[0.055, 0.12, 0.31]} rotation={[0.1, 0, -0.12]}>
          <boxGeometry args={[0.035, 0.014, 0.02]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* ===== LIPS & MOUTH ===== */}

        {/* Philtrum */}
        <mesh position={[0, -0.16, 0.32]}>
          <boxGeometry args={[0.025, 0.035, 0.015]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Upper Lip */}
        <mesh position={[0, -0.19, 0.32]}>
          <sphereGeometry args={[0.045, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} metalness={0.03} />
        </mesh>

        {/* Upper Lip - Cupid's bow left */}
        <mesh position={[-0.02, -0.18, 0.34]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} metalness={0.03} />
        </mesh>

        {/* Upper Lip - Cupid's bow right */}
        <mesh position={[0.02, -0.18, 0.34]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} metalness={0.03} />
        </mesh>

        {/* Lower Lip / Mouth opening */}
        <mesh ref={mouthRef} position={[0, -0.22, 0.3]} scale={[1, 0.12, 1]}>
          <sphereGeometry args={[0.04, 24, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color={lipColorDark} roughness={0.45} metalness={0.02} />
        </mesh>

        {/* Lower Lip - fuller */}
        <mesh position={[0, -0.23, 0.31]}>
          <sphereGeometry args={[0.04, 24, 24, 0, Math.PI * 2, Math.PI / 3, Math.PI / 2]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} metalness={0.03} />
        </mesh>

        {/* ===== FACIAL HAIR - Light Mustache & Goatee ===== */}

        {/* Mustache - Left */}
        <mesh position={[-0.025, -0.16, 0.33]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.04, 0.012, 0.015]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.7} />
        </mesh>

        {/* Mustache - Right */}
        <mesh position={[0.025, -0.16, 0.33]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.04, 0.012, 0.015]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.7} />
        </mesh>

        {/* Goatee - Chin patch */}
        <mesh position={[0, -0.28, 0.24]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.5} />
        </mesh>

        {/* Chin stubble - left */}
        <mesh position={[-0.02, -0.26, 0.26]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.4} />
        </mesh>

        {/* Chin stubble - right */}
        <mesh position={[0.02, -0.26, 0.26]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.4} />
        </mesh>

        {/* Soul patch */}
        <mesh position={[0, -0.25, 0.28]}>
          <boxGeometry args={[0.015, 0.025, 0.01]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.6} />
        </mesh>

        {/* Jaw stubble - Left */}
        <mesh position={[-0.14, -0.22, 0.16]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.35} />
        </mesh>

        {/* Jaw stubble - Right */}
        <mesh position={[0.14, -0.22, 0.16]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.35} />
        </mesh>

        {/* ===== CHIN & JAW ===== */}

        {/* Chin - defined */}
        <mesh position={[0, -0.3, 0.18]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Chin point */}
        <mesh position={[0, -0.33, 0.14]}>
          <sphereGeometry args={[0.05, 24, 24]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Jaw - Left */}
        <mesh position={[-0.17, -0.24, 0.1]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Jaw - Right */}
        <mesh position={[0.17, -0.24, 0.1]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Jawline - Left */}
        <mesh position={[-0.24, -0.18, -0.02]}>
          <sphereGeometry args={[0.065, 20, 20]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* Jawline - Right */}
        <mesh position={[0.24, -0.18, -0.02]}>
          <sphereGeometry args={[0.065, 20, 20]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
        </mesh>

        {/* ===== EARS ===== */}

        {/* Left Ear - outer helix */}
        <mesh position={[-0.35, 0.02, -0.02]} rotation={[0, -0.2, 0.05]}>
          <torusGeometry args={[0.045, 0.014, 12, 24, Math.PI * 1.3]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* Left Ear - inner */}
        <mesh position={[-0.33, 0.02, 0]}>
          <sphereGeometry args={[0.032, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* Left Ear - lobe */}
        <mesh position={[-0.33, -0.04, 0.01]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* Right Ear - outer helix */}
        <mesh position={[0.35, 0.02, -0.02]} rotation={[0, 0.2, -0.05]}>
          <torusGeometry args={[0.045, 0.014, 12, 24, Math.PI * 1.3]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* Right Ear - inner */}
        <mesh position={[0.33, 0.02, 0]}>
          <sphereGeometry args={[0.032, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* Right Ear - lobe */}
        <mesh position={[0.33, -0.04, 0.01]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.65} metalness={0.02} />
        </mesh>

        {/* ===== HAIR - Dark, wavy, styled upward ===== */}

        {/* Hair - Top volume - styled up */}
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.34, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Front quiff - pushed up */}
        <mesh position={[0, 0.34, 0.12]}>
          <sphereGeometry args={[0.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Front left wave */}
        <mesh position={[-0.1, 0.35, 0.14]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial color={hairHighlight} roughness={0.85} metalness={0} />
        </mesh>

        {/* Hair - Front right wave */}
        <mesh position={[0.08, 0.34, 0.15]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={hairHighlight} roughness={0.85} metalness={0} />
        </mesh>

        {/* Hair - Center top wave */}
        <mesh position={[0, 0.38, 0.05]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Back of head */}
        <mesh position={[0, 0.08, -0.24]}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Left side */}
        <mesh position={[-0.3, 0.1, -0.06]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Right side */}
        <mesh position={[0.3, 0.1, -0.06]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Left temple */}
        <mesh position={[-0.28, 0.16, 0.06]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair - Right temple */}
        <mesh position={[0.28, 0.16, 0.06]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

        {/* Hair texture waves - top */}
        <mesh position={[-0.06, 0.36, 0.08]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={hairHighlight} roughness={0.85} metalness={0} />
        </mesh>

        <mesh position={[0.05, 0.37, 0.06]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0} />
        </mesh>

      </group>

      {/* ===== NECK ===== */}
      <mesh position={[0, -0.05, -0.02]}>
        <cylinderGeometry args={[0.075, 0.095, 0.16, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
      </mesh>

      {/* Neck - Adam's apple */}
      <mesh position={[0, -0.06, 0.05]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.02} />
      </mesh>

      {/* ===== UPPER BODY - Blue Collared Shirt ===== */}
      
      {/* Shoulders base */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.22, 0.19, 0.1, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.55} metalness={0.06} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.18, 0.21, 0.26, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.55} metalness={0.06} />
      </mesh>

      {/* Collar - Left */}
      <mesh position={[-0.05, -0.1, 0.08]} rotation={[0.5, -0.15, -0.2]}>
        <boxGeometry args={[0.08, 0.055, 0.015]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.06} />
      </mesh>

      {/* Collar - Right */}
      <mesh position={[0.05, -0.1, 0.08]} rotation={[0.5, 0.15, 0.2]}>
        <boxGeometry args={[0.08, 0.055, 0.015]} />
        <meshStandardMaterial color={shirtColor} roughness={0.5} metalness={0.06} />
      </mesh>

      {/* Collar base */}
      <mesh position={[0, -0.12, 0.06]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.55} metalness={0.06} />
      </mesh>

      {/* Shirt buttons */}
      <mesh position={[0, -0.2, 0.18]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.4} metalness={0.1} />
      </mesh>

      <mesh position={[0, -0.28, 0.19]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.4} metalness={0.1} />
      </mesh>

      <mesh position={[0, -0.36, 0.2]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-0.24, -0.14, 0]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.55} metalness={0.06} />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[0.24, -0.14, 0]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.55} metalness={0.06} />
      </mesh>

      {/* Left Upper Arm */}
      <mesh position={[-0.31, -0.24, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.045, 0.04, 0.15, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.55} metalness={0.06} />
      </mesh>

      {/* Right Upper Arm */}
      <mesh position={[0.31, -0.24, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.045, 0.04, 0.15, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.55} metalness={0.06} />
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
    <div className={`w-full h-56 relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0.12, 2], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Studio lighting for realistic skin rendering */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 4]} intensity={1.1} color="#ffffff" />
        <directionalLight position={[-2, 1, 2]} intensity={0.4} color="#e8f0ff" />
        <pointLight position={[0, 1, 3]} intensity={0.55} color="#fff5ee" />
        <pointLight position={[-1.5, -0.5, 2]} intensity={0.25} color="#ffe4d4" />
        <hemisphereLight args={['#ffeedd', '#aabbcc', 0.3]} />

        {/* Avatar - centered and properly scaled */}
        <React.Suspense fallback={null}>
          <group scale={0.9} position={[0, -0.08, 0]}>
            <AvatarBody isTalking={isTalking} />
          </group>
        </React.Suspense>

        {/* Subtle auto-rotation for 3D effect */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.85}
          minPolarAngle={Math.PI / 2.4}
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
