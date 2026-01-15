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
  const lowerJawRef = useRef<THREE.Group>(null);
  const upperLipRef = useRef<THREE.Mesh>(null);
  const lowerLipRef = useRef<THREE.Mesh>(null);
  const leftEyelidRef = useRef<THREE.Mesh>(null);
  const rightEyelidRef = useRef<THREE.Mesh>(null);
  const teethRef = useRef<THREE.Mesh>(null);
  const tongueRef = useRef<THREE.Mesh>(null);

  // Realistic skin tones
  const skinColor = useMemo(() => new THREE.Color('#D4A574'), []);
  const skinColorLight = useMemo(() => new THREE.Color('#E5B88A'), []);
  const skinColorDark = useMemo(() => new THREE.Color('#B8895A'), []);
  const skinColorPink = useMemo(() => new THREE.Color('#D9A090'), []);
  
  // Hair colors
  const hairColor = useMemo(() => new THREE.Color('#1A1209'), []);
  const hairHighlight = useMemo(() => new THREE.Color('#2C1E12'), []);
  
  // Eye colors
  const eyeWhiteColor = useMemo(() => new THREE.Color('#FAFAFA'), []);
  const eyeIrisColor = useMemo(() => new THREE.Color('#3D2314'), []);
  const eyePupilColor = useMemo(() => new THREE.Color('#0A0705'), []);
  
  // Lip/mouth colors
  const lipColor = useMemo(() => new THREE.Color('#C87E70'), []);
  const lipColorDark = useMemo(() => new THREE.Color('#8B5A50'), []);
  const mouthInsideColor = useMemo(() => new THREE.Color('#4A2020'), []);
  const teethColor = useMemo(() => new THREE.Color('#F5F0E8'), []);
  const tongueColor = useMemo(() => new THREE.Color('#C46B6B'), []);
  const gumColor = useMemo(() => new THREE.Color('#D4838B'), []);
  
  // Shirt color
  const shirtColor = useMemo(() => new THREE.Color('#3A6B99'), []);
  const shirtColorDark = useMemo(() => new THREE.Color('#2E5680'), []);
  
  // Facial hair
  const beardColor = useMemo(() => new THREE.Color('#1A1008'), []);
  const eyebrowColor = useMemo(() => new THREE.Color('#1A0A05'), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Gentle breathing motion
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.004;
    }

    // Natural head movement with more expression
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.7) * 0.02;
      headRef.current.rotation.z = Math.sin(t * 0.4) * 0.008;
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.025;
    }

    // Realistic blinking with occasional double blink
    if (leftEyelidRef.current && rightEyelidRef.current) {
      const blinkCycle = t % 3.5;
      let blinkScale = 0;
      
      // Main blink
      if (blinkCycle > 3.3 && blinkCycle < 3.5) {
        blinkScale = Math.sin((blinkCycle - 3.3) * Math.PI / 0.2);
      }
      // Occasional quick double blink
      if (blinkCycle > 2.8 && blinkCycle < 2.95 && Math.sin(t * 0.1) > 0.8) {
        blinkScale = Math.sin((blinkCycle - 2.8) * Math.PI / 0.15);
      }
      
      leftEyelidRef.current.scale.y = blinkScale;
      rightEyelidRef.current.scale.y = blinkScale;
    }

    // Realistic talking animation with jaw movement
    if (isTalking) {
      // Complex mouth movement with multiple frequencies for natural speech
      const speechPattern1 = Math.sin(t * 8) * 0.5 + 0.5;
      const speechPattern2 = Math.sin(t * 12) * 0.3;
      const speechPattern3 = Math.sin(t * 5) * 0.2;
      const mouthOpenAmount = 0.3 + speechPattern1 * 0.4 + speechPattern2 + speechPattern3;
      
      // Jaw movement
      if (lowerJawRef.current) {
        lowerJawRef.current.rotation.x = Math.max(0, mouthOpenAmount * 0.15);
        lowerJawRef.current.position.y = -mouthOpenAmount * 0.02;
      }
      
      // Upper lip movement
      if (upperLipRef.current) {
        upperLipRef.current.scale.y = 1 + speechPattern1 * 0.1;
      }
      
      // Lower lip follows jaw
      if (lowerLipRef.current) {
        lowerLipRef.current.position.y = -0.235 - mouthOpenAmount * 0.015;
        lowerLipRef.current.scale.y = 1 + speechPattern1 * 0.15;
      }
      
      // Mouth cavity
      if (mouthRef.current) {
        mouthRef.current.scale.y = 0.8 + mouthOpenAmount * 0.6;
      }
      
      // Teeth visibility
      if (teethRef.current) {
        teethRef.current.visible = mouthOpenAmount > 0.4;
        teethRef.current.scale.y = Math.min(1, mouthOpenAmount * 1.2);
      }
      
      // Tongue movement
      if (tongueRef.current) {
        tongueRef.current.visible = mouthOpenAmount > 0.5;
        tongueRef.current.position.z = 0.26 + speechPattern2 * 0.02;
        tongueRef.current.rotation.x = speechPattern3 * 0.1;
      }
    } else {
      // Resting position
      if (lowerJawRef.current) {
        lowerJawRef.current.rotation.x = 0;
        lowerJawRef.current.position.y = 0;
      }
      if (mouthRef.current) {
        mouthRef.current.scale.y = 0.15;
      }
      if (upperLipRef.current) {
        upperLipRef.current.scale.y = 1;
      }
      if (lowerLipRef.current) {
        lowerLipRef.current.position.y = -0.235;
        lowerLipRef.current.scale.y = 1;
      }
      if (teethRef.current) {
        teethRef.current.visible = false;
      }
      if (tongueRef.current) {
        tongueRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head Group */}
      <group ref={headRef} position={[0, 0.35, 0]}>
        
        {/* ===== SKULL & HEAD STRUCTURE ===== */}
        
        {/* Main Cranium */}
        <mesh position={[0, 0.05, -0.02]}>
          <sphereGeometry args={[0.38, 64, 64]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Forehead */}
        <mesh position={[0, 0.26, 0.18]}>
          <sphereGeometry args={[0.26, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.5} metalness={0.02} />
        </mesh>

        {/* Brow ridge - Left */}
        <mesh position={[-0.1, 0.14, 0.3]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Brow ridge - Right */}
        <mesh position={[0.1, 0.14, 0.3]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
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

        {/* ===== MID-FACE ===== */}

        {/* Mid-face base */}
        <mesh position={[0, -0.04, 0.26]}>
          <sphereGeometry args={[0.24, 48, 48]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Cheekbone - Left */}
        <mesh position={[-0.2, -0.02, 0.26]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.48} metalness={0.02} />
        </mesh>

        {/* Cheekbone - Right */}
        <mesh position={[0.2, -0.02, 0.26]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color={skinColorLight} roughness={0.48} metalness={0.02} />
        </mesh>

        {/* Cheek - Left */}
        <mesh position={[-0.16, -0.1, 0.24]}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial color={skinColorPink} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Cheek - Right */}
        <mesh position={[0.16, -0.1, 0.24]}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial color={skinColorPink} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* ===== NOSE ===== */}

        {/* Nose bridge */}
        <mesh position={[0, 0.06, 0.36]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.045, 0.12, 0.055]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Nose dorsum */}
        <mesh position={[0, -0.02, 0.39]}>
          <sphereGeometry args={[0.028, 24, 24]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Nose tip */}
        <mesh position={[0, -0.09, 0.41]}>
          <sphereGeometry args={[0.042, 32, 32]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.58} metalness={0.02} />
        </mesh>

        {/* Nose ball */}
        <mesh position={[0, -0.1, 0.39]}>
          <sphereGeometry args={[0.035, 24, 24]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.58} metalness={0.02} />
        </mesh>

        {/* Nostril - Left */}
        <mesh position={[-0.032, -0.11, 0.35]}>
          <sphereGeometry args={[0.024, 16, 16]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* Nostril - Right */}
        <mesh position={[0.032, -0.11, 0.35]}>
          <sphereGeometry args={[0.024, 16, 16]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* ===== EYES ===== */}

        {/* Left Eye Socket */}
        <mesh position={[-0.1, 0.055, 0.28]}>
          <sphereGeometry args={[0.052, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.08} metalness={0} />
        </mesh>

        {/* Left Iris */}
        <mesh position={[-0.1, 0.055, 0.322]}>
          <sphereGeometry args={[0.028, 32, 32]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.12} metalness={0.05} />
        </mesh>

        {/* Left Pupil */}
        <mesh position={[-0.1, 0.055, 0.34]}>
          <sphereGeometry args={[0.014, 24, 24]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.1} />
        </mesh>

        {/* Left Eye highlight */}
        <mesh position={[-0.088, 0.068, 0.348]}>
          <sphereGeometry args={[0.006, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0} emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* Left Upper Eyelid */}
        <mesh ref={leftEyelidRef} position={[-0.1, 0.078, 0.305]} scale={[1, 0, 1]}>
          <sphereGeometry args={[0.043, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Left Lower Eyelid */}
        <mesh position={[-0.1, 0.035, 0.3]}>
          <sphereGeometry args={[0.035, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Left Eyelid crease */}
        <mesh position={[-0.1, 0.095, 0.29]}>
          <sphereGeometry args={[0.048, 16, 16, 0, Math.PI * 2, 0, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Right Eye Socket */}
        <mesh position={[0.1, 0.055, 0.28]}>
          <sphereGeometry args={[0.052, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.08} metalness={0} />
        </mesh>

        {/* Right Iris */}
        <mesh position={[0.1, 0.055, 0.322]}>
          <sphereGeometry args={[0.028, 32, 32]} />
          <meshStandardMaterial color={eyeIrisColor} roughness={0.12} metalness={0.05} />
        </mesh>

        {/* Right Pupil */}
        <mesh position={[0.1, 0.055, 0.34]}>
          <sphereGeometry args={[0.014, 24, 24]} />
          <meshStandardMaterial color={eyePupilColor} roughness={0} metalness={0.1} />
        </mesh>

        {/* Right Eye highlight */}
        <mesh position={[0.112, 0.068, 0.348]}>
          <sphereGeometry args={[0.006, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0} emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* Right Upper Eyelid */}
        <mesh ref={rightEyelidRef} position={[0.1, 0.078, 0.305]} scale={[1, 0, 1]}>
          <sphereGeometry args={[0.043, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Right Lower Eyelid */}
        <mesh position={[0.1, 0.035, 0.3]}>
          <sphereGeometry args={[0.035, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Right Eyelid crease */}
        <mesh position={[0.1, 0.095, 0.29]}>
          <sphereGeometry args={[0.048, 16, 16, 0, Math.PI * 2, 0, Math.PI / 4]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* ===== EYEBROWS ===== */}

        {/* Left Eyebrow */}
        <mesh position={[-0.1, 0.125, 0.32]} rotation={[0.15, 0, 0.05]}>
          <boxGeometry args={[0.075, 0.014, 0.02]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* Left Eyebrow inner */}
        <mesh position={[-0.055, 0.118, 0.325]} rotation={[0.15, 0, 0.1]}>
          <boxGeometry args={[0.03, 0.012, 0.018]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* Right Eyebrow */}
        <mesh position={[0.1, 0.125, 0.32]} rotation={[0.15, 0, -0.05]}>
          <boxGeometry args={[0.075, 0.014, 0.02]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* Right Eyebrow inner */}
        <mesh position={[0.055, 0.118, 0.325]} rotation={[0.15, 0, -0.1]}>
          <boxGeometry args={[0.03, 0.012, 0.018]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.95} />
        </mesh>

        {/* ===== MOUTH AREA ===== */}

        {/* Philtrum */}
        <mesh position={[0, -0.155, 0.34]}>
          <boxGeometry args={[0.022, 0.032, 0.012]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
        </mesh>

        {/* Mouth cavity (dark inside) */}
        <mesh ref={mouthRef} position={[0, -0.21, 0.3]} scale={[1, 0.15, 1]}>
          <sphereGeometry args={[0.045, 32, 32]} />
          <meshStandardMaterial color={mouthInsideColor} roughness={0.8} metalness={0} />
        </mesh>

        {/* Upper gum */}
        <mesh position={[0, -0.195, 0.31]}>
          <sphereGeometry args={[0.035, 16, 16, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3]} />
          <meshStandardMaterial color={gumColor} roughness={0.6} metalness={0} />
        </mesh>

        {/* Upper Teeth */}
        <mesh ref={teethRef} position={[0, -0.2, 0.32]} visible={false}>
          <boxGeometry args={[0.055, 0.018, 0.012]} />
          <meshStandardMaterial color={teethColor} roughness={0.2} metalness={0.05} />
        </mesh>

        {/* Tongue */}
        <mesh ref={tongueRef} position={[0, -0.22, 0.28]} visible={false}>
          <sphereGeometry args={[0.025, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={tongueColor} roughness={0.6} metalness={0} />
        </mesh>

        {/* Upper Lip */}
        <mesh ref={upperLipRef} position={[0, -0.185, 0.35]}>
          <sphereGeometry args={[0.042, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* Cupid's bow - Left */}
        <mesh position={[-0.018, -0.175, 0.36]}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* Cupid's bow - Right */}
        <mesh position={[0.018, -0.175, 0.36]}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* Lower Lip - fuller */}
        <mesh ref={lowerLipRef} position={[0, -0.235, 0.34]}>
          <sphereGeometry args={[0.038, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 2]} />
          <meshStandardMaterial color={lipColor} roughness={0.35} metalness={0.03} />
        </mesh>

        {/* Lower Lip center fullness */}
        <mesh position={[0, -0.24, 0.33]}>
          <sphereGeometry args={[0.03, 24, 24]} />
          <meshStandardMaterial color={lipColorDark} roughness={0.4} metalness={0.02} />
        </mesh>

        {/* ===== LOWER JAW GROUP ===== */}
        <group ref={lowerJawRef}>
          {/* Chin */}
          <mesh position={[0, -0.3, 0.2]}>
            <sphereGeometry args={[0.075, 32, 32]} />
            <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
          </mesh>

          {/* Chin point */}
          <mesh position={[0, -0.32, 0.16]}>
            <sphereGeometry args={[0.048, 24, 24]} />
            <meshStandardMaterial color={skinColorDark} roughness={0.58} metalness={0.02} />
          </mesh>

          {/* Jaw - Left */}
          <mesh position={[-0.16, -0.24, 0.12]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
          </mesh>

          {/* Jaw - Right */}
          <mesh position={[0.16, -0.24, 0.12]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial color={skinColor} roughness={0.52} metalness={0.02} />
          </mesh>

          {/* Lower gum */}
          <mesh position={[0, -0.23, 0.29]}>
            <sphereGeometry args={[0.03, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 3]} />
            <meshStandardMaterial color={gumColor} roughness={0.6} metalness={0} />
          </mesh>
        </group>

        {/* Jawline - Left */}
        <mesh position={[-0.23, -0.18, 0]}>
          <sphereGeometry args={[0.062, 20, 20]} />
          <meshStandardMaterial color={skinColor} roughness={0.58} metalness={0.02} />
        </mesh>

        {/* Jawline - Right */}
        <mesh position={[0.23, -0.18, 0]}>
          <sphereGeometry args={[0.062, 20, 20]} />
          <meshStandardMaterial color={skinColor} roughness={0.58} metalness={0.02} />
        </mesh>

        {/* ===== FACIAL HAIR ===== */}

        {/* Mustache - Left */}
        <mesh position={[-0.022, -0.155, 0.35]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.038, 0.01, 0.012]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.6} />
        </mesh>

        {/* Mustache - Right */}
        <mesh position={[0.022, -0.155, 0.35]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.038, 0.01, 0.012]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.6} />
        </mesh>

        {/* Goatee */}
        <mesh position={[0, -0.28, 0.25]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.45} />
        </mesh>

        {/* Soul patch */}
        <mesh position={[0, -0.255, 0.3]}>
          <boxGeometry args={[0.012, 0.02, 0.008]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.55} />
        </mesh>

        {/* Jaw stubble - Left */}
        <mesh position={[-0.13, -0.22, 0.17]}>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.3} />
        </mesh>

        {/* Jaw stubble - Right */}
        <mesh position={[0.13, -0.22, 0.17]}>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshStandardMaterial color={beardColor} roughness={1} transparent opacity={0.3} />
        </mesh>

        {/* ===== EARS ===== */}

        {/* Left Ear - helix */}
        <mesh position={[-0.35, 0.02, -0.02]} rotation={[0, -0.2, 0.05]}>
          <torusGeometry args={[0.042, 0.013, 12, 24, Math.PI * 1.3]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* Left Ear - inner */}
        <mesh position={[-0.33, 0.02, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* Left Ear - lobe */}
        <mesh position={[-0.33, -0.035, 0.01]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* Right Ear - helix */}
        <mesh position={[0.35, 0.02, -0.02]} rotation={[0, 0.2, -0.05]}>
          <torusGeometry args={[0.042, 0.013, 12, 24, Math.PI * 1.3]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* Right Ear - inner */}
        <mesh position={[0.33, 0.02, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* Right Ear - lobe */}
        <mesh position={[0.33, -0.035, 0.01]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color={skinColorDark} roughness={0.62} metalness={0.02} />
        </mesh>

        {/* ===== HAIR ===== */}

        {/* Hair - Top volume */}
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.34, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

        {/* Hair - Front quiff */}
        <mesh position={[0, 0.35, 0.12]}>
          <sphereGeometry args={[0.18, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

        {/* Hair - Front wave left */}
        <mesh position={[-0.1, 0.36, 0.14]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial color={hairHighlight} roughness={0.85} metalness={0} />
        </mesh>

        {/* Hair - Front wave right */}
        <mesh position={[0.08, 0.35, 0.15]}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial color={hairHighlight} roughness={0.85} metalness={0} />
        </mesh>

        {/* Hair - Top center */}
        <mesh position={[0, 0.38, 0.05]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

        {/* Hair - Back */}
        <mesh position={[0, 0.08, -0.24]}>
          <sphereGeometry args={[0.27, 32, 32]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

        {/* Hair - Left side */}
        <mesh position={[-0.3, 0.1, -0.06]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

        {/* Hair - Right side */}
        <mesh position={[0.3, 0.1, -0.06]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

        {/* Hair - Left temple */}
        <mesh position={[-0.28, 0.16, 0.06]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

        {/* Hair - Right temple */}
        <mesh position={[0.28, 0.16, 0.06]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} metalness={0} />
        </mesh>

      </group>

      {/* ===== NECK ===== */}
      <mesh position={[0, -0.05, -0.02]}>
        <cylinderGeometry args={[0.072, 0.09, 0.15, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.58} metalness={0.02} />
      </mesh>

      {/* Adam's apple */}
      <mesh position={[0, -0.055, 0.048]}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.58} metalness={0.02} />
      </mesh>

      {/* ===== UPPER BODY ===== */}
      
      {/* Shoulders base */}
      <mesh position={[0, -0.17, 0]}>
        <cylinderGeometry args={[0.21, 0.18, 0.1, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, -0.33, 0]}>
        <cylinderGeometry args={[0.17, 0.2, 0.25, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Collar - Left */}
      <mesh position={[-0.048, -0.1, 0.078]} rotation={[0.5, -0.15, -0.2]}>
        <boxGeometry args={[0.075, 0.052, 0.014]} />
        <meshStandardMaterial color={shirtColor} roughness={0.48} metalness={0.06} />
      </mesh>

      {/* Collar - Right */}
      <mesh position={[0.048, -0.1, 0.078]} rotation={[0.5, 0.15, 0.2]}>
        <boxGeometry args={[0.075, 0.052, 0.014]} />
        <meshStandardMaterial color={shirtColor} roughness={0.48} metalness={0.06} />
      </mesh>

      {/* Collar base */}
      <mesh position={[0, -0.11, 0.058]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.035, 0.038, 0.018]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Buttons */}
      <mesh position={[0, -0.19, 0.175]}>
        <sphereGeometry args={[0.01, 12, 12]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.38} metalness={0.1} />
      </mesh>

      <mesh position={[0, -0.27, 0.185]}>
        <sphereGeometry args={[0.01, 12, 12]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.38} metalness={0.1} />
      </mesh>

      <mesh position={[0, -0.35, 0.195]}>
        <sphereGeometry args={[0.01, 12, 12]} />
        <meshStandardMaterial color={shirtColorDark} roughness={0.38} metalness={0.1} />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-0.23, -0.135, 0]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[0.23, -0.135, 0]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Left Upper Arm */}
      <mesh position={[-0.3, -0.23, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.042, 0.038, 0.14, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Right Upper Arm */}
      <mesh position={[0.3, -0.23, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.042, 0.038, 0.14, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.52} metalness={0.06} />
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
        camera={{ position: [0, 0.1, 2.2], fov: 28 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Professional studio lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-2, 1, 2]} intensity={0.45} color="#e8f4ff" />
        <pointLight position={[0, 1, 3]} intensity={0.6} color="#fff8ee" />
        <pointLight position={[-1.5, -0.5, 2]} intensity={0.3} color="#ffe8d8" />
        <hemisphereLight args={['#fff0e0', '#b8c8d8', 0.35]} />

        {/* Avatar */}
        <React.Suspense fallback={null}>
          <group scale={0.92} position={[0, -0.06, 0]}>
            <AvatarBody isTalking={isTalking} />
          </group>
        </React.Suspense>

        {/* Subtle rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.25}
          maxPolarAngle={Math.PI / 1.85}
          minPolarAngle={Math.PI / 2.4}
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
