import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Realistic3DHeadProps {
  config: {
    // Basic structure
    faceWidth: number;
    faceHeight: number;
    jawWidth: number;
    jawHeight: number;
    chinHeight: number;
    chinWidth: number;
    cheekboneHeight: number;
    cheekboneWidth: number;
    
    // Eyes
    eyeSize: number;
    eyeDistance: number;
    eyeHeight: number;
    eyeAngle: number;
    eyebrowHeight: number;
    eyebrowThickness: number;
    eyebrowAngle: number;
    
    // Nose
    noseWidth: number;
    noseHeight: number;
    noseBridge: number;
    nostrilWidth: number;
    nostrilHeight: number;
    
    // Mouth
    mouthWidth: number;
    mouthHeight: number;
    lipThickness: number;
    upperLipHeight: number;
    lowerLipHeight: number;
    
    // Ears
    earSize: number;
    earPosition: number;
    earAngle: number;
    
    // Colors
    skinTone: string;
    eyeColor: string;
    hairColor: string;
    eyebrowColor: string;
    
    // Hair
    hairStyle: string;
    hairLength?: number;
    hairVolume?: number;
    
    // Demographics
    ageSlider?: number;
    genderSlider?: number;
    ethnicityBlend?: {
      european: number;
      african: number;
      asian: number;
      hispanic: number;
    };
  };
}

// Enhanced head scene with realistic proportions
const RealisticHeadScene: React.FC<{ config: Realistic3DHeadProps['config'] }> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const noseRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing-like movement
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
    
    // Eye movement simulation
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeMovement = Math.sin(state.clock.elapsedTime * 2) * 0.01;
      leftEyeRef.current.rotation.y = eyeMovement;
      rightEyeRef.current.rotation.y = eyeMovement;
    }
  });

  // Create realistic head geometry with morphing
  const createHeadGeometry = () => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const positions = geometry.attributes.position;
    
    // Apply face measurements to vertices
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, i);
      
      // Face width scaling (X axis)
      vertex.x *= 0.7 + (config.faceWidth - 50) * 0.008;
      
      // Face height scaling (Y axis) 
      vertex.y *= 0.8 + (config.faceHeight - 50) * 0.006;
      
      // Jaw modifications
      if (vertex.y < -0.2) {
        const jawInfluence = Math.max(0, -vertex.y - 0.2) * 2;
        vertex.x *= 1 + (config.jawWidth - 50) * 0.004 * jawInfluence;
        vertex.z *= 1 + (config.jawHeight - 50) * 0.003 * jawInfluence;
      }
      
      // Cheekbone area
      if (vertex.y > -0.1 && vertex.y < 0.3 && Math.abs(vertex.x) > 0.3) {
        const cheekInfluence = (0.6 - Math.abs(vertex.x)) * 2;
        vertex.x *= 1 + (config.cheekboneWidth - 50) * 0.004 * cheekInfluence;
        vertex.y += (config.cheekboneHeight - 50) * 0.002 * cheekInfluence;
      }
      
      // Chin modifications
      if (vertex.y < -0.4) {
        const chinInfluence = Math.max(0, -vertex.y - 0.4) * 3;
        vertex.x *= 1 + (config.chinWidth - 50) * 0.003 * chinInfluence;
        vertex.y += (config.chinHeight - 50) * 0.002 * chinInfluence;
      }
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  // Enhanced skin material with realistic properties
  const getSkinMaterial = () => {
    const age = config.ageSlider || 25;
    const roughness = 0.3 + (age - 25) * 0.008; // Older skin is rougher
    
    return new THREE.MeshStandardMaterial({
      color: config.skinTone,
      roughness: Math.min(0.8, Math.max(0.2, roughness)),
      metalness: 0.0,
      transparent: true,
      opacity: 0.98,
    });
  };

  // Create detailed eye geometry
  const createEyeGeometry = (isLeft: boolean) => {
    const eyeSize = 0.08 * (0.8 + (config.eyeSize - 50) * 0.006);
    const geometry = new THREE.SphereGeometry(eyeSize, 16, 16);
    return geometry;
  };

  // Create realistic nose geometry
  const createNoseGeometry = () => {
    const width = 0.06 * (0.8 + (config.noseWidth - 50) * 0.008);
    const height = 0.15 * (0.8 + (config.noseHeight - 50) * 0.008);
    const bridge = 0.8 + (config.noseBridge - 50) * 0.006;
    
    const geometry = new THREE.ConeGeometry(width, height, 6);
    
    // Modify for bridge height
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, i);
      
      if (vertex.y > 0) {
        vertex.z += bridge * 0.1;
      }
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    positions.needsUpdate = true;
    return geometry;
  };

  // Create mouth geometry
  const createMouthGeometry = () => {
    const width = 0.12 * (0.8 + (config.mouthWidth - 50) * 0.008);
    const height = 0.04 * (0.8 + (config.mouthHeight - 50) * 0.008);
    const thickness = 1 + (config.lipThickness - 50) * 0.01;
    
    const geometry = new THREE.RingGeometry(width * 0.3, width, 0, Math.PI * 2, 8);
    
    // Apply lip thickness
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, i);
      vertex.z = thickness * 0.02;
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    return geometry;
  };

  // Create hair geometry based on style
  const createHairGeometry = () => {
    const volume = 1 + (config.hairVolume || 50 - 50) * 0.01;
    const length = 1 + (config.hairLength || 50 - 50) * 0.01;
    
    switch (config.hairStyle) {
      case 'bald':
        return null;
      case 'buzz':
        return new THREE.SphereGeometry(1.02 * volume, 16, 16);
      case 'short':
        return new THREE.SphereGeometry(1.08 * volume, 20, 20);
      case 'medium':
        return new THREE.CylinderGeometry(0.7 * volume, 1.1 * volume, 0.8 * length, 16);
      case 'long':
        return new THREE.CylinderGeometry(0.6 * volume, 1.2 * volume, 1.4 * length, 12);
      case 'curly':
        const curlyGeometry = new THREE.SphereGeometry(1.15 * volume, 12, 12);
        // Add some irregularity for curly effect
        const positions = curlyGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positions, i);
          vertex.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          ));
          positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        return curlyGeometry;
      case 'ponytail':
        // Create a compound geometry for ponytail
        return new THREE.SphereGeometry(1.05 * volume, 16, 16);
      case 'braids':
        return new THREE.CylinderGeometry(0.6 * volume, 1.0 * volume, 1.2 * length, 8);
      case 'afro':
        return new THREE.SphereGeometry(1.3 * volume, 16, 16);
      case 'dreadlocks':
        return new THREE.CylinderGeometry(0.8 * volume, 1.1 * volume, 1.4 * length, 12);
      default:
        return new THREE.SphereGeometry(1.08 * volume, 20, 20);
    }
  };

  // Create ear geometry
  const createEarGeometry = () => {
    const size = 0.12 * (0.8 + (config.earSize - 50) * 0.006);
    const geometry = new THREE.CapsuleGeometry(size * 0.6, size, 4, 8);
    return geometry;
  };

  const headGeometry = useMemo(() => createHeadGeometry(), [config]);
  const skinMaterial = useMemo(() => getSkinMaterial(), [config.skinTone, config.ageSlider]);
  const hairGeometry = useMemo(() => createHairGeometry(), [config.hairStyle, config.hairVolume, config.hairLength]);

  return (
    <group ref={groupRef}>
      {/* Main Head */}
      <mesh ref={headRef} geometry={headGeometry} material={skinMaterial} />

      {/* Eyes */}
      <mesh 
        ref={leftEyeRef}
        position={[
          -0.25 * (1 + (config.eyeDistance - 50) * 0.004), 
          0.15 + (config.eyeHeight - 50) * 0.004, 
          0.45
        ]}
        geometry={createEyeGeometry(true)}
      >
        <meshStandardMaterial color="white" />
      </mesh>
      
      <mesh 
        ref={rightEyeRef}
        position={[
          0.25 * (1 + (config.eyeDistance - 50) * 0.004), 
          0.15 + (config.eyeHeight - 50) * 0.004, 
          0.45
        ]}
        geometry={createEyeGeometry(false)}
      >
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Pupils */}
      <mesh 
        position={[
          -0.25 * (1 + (config.eyeDistance - 50) * 0.004), 
          0.15 + (config.eyeHeight - 50) * 0.004, 
          0.5
        ]}
      >
        <sphereGeometry args={[0.04 * (0.8 + (config.eyeSize - 50) * 0.006), 16, 16]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>
      
      <mesh 
        position={[
          0.25 * (1 + (config.eyeDistance - 50) * 0.004), 
          0.15 + (config.eyeHeight - 50) * 0.004, 
          0.5
        ]}
      >
        <sphereGeometry args={[0.04 * (0.8 + (config.eyeSize - 50) * 0.006), 16, 16]} />
        <meshStandardMaterial color={config.eyeColor} />
      </mesh>

      {/* Eyebrows */}
      <mesh 
        position={[
          -0.25 * (1 + (config.eyeDistance - 50) * 0.004), 
          0.25 + (config.eyebrowHeight - 50) * 0.004, 
          0.4
        ]}
        rotation={[0, 0, (config.eyebrowAngle - 50) * 0.01]}
      >
        <boxGeometry args={[
          0.15, 
          0.02 * (0.8 + (config.eyebrowThickness - 50) * 0.008), 
          0.02
        ]} />
        <meshStandardMaterial color={config.eyebrowColor} />
      </mesh>
      
      <mesh 
        position={[
          0.25 * (1 + (config.eyeDistance - 50) * 0.004), 
          0.25 + (config.eyebrowHeight - 50) * 0.004, 
          0.4
        ]}
        rotation={[0, 0, -(config.eyebrowAngle - 50) * 0.01]}
      >
        <boxGeometry args={[
          0.15, 
          0.02 * (0.8 + (config.eyebrowThickness - 50) * 0.008), 
          0.02
        ]} />
        <meshStandardMaterial color={config.eyebrowColor} />
      </mesh>

      {/* Nose */}
      <mesh 
        ref={noseRef}
        position={[0, -0.05, 0.4]}
        rotation={[Math.PI, 0, 0]}
        geometry={createNoseGeometry()}
        material={skinMaterial}
      />

      {/* Nostrils */}
      <mesh position={[-0.02 * (0.8 + (config.nostrilWidth - 50) * 0.004), -0.15, 0.45]}>
        <sphereGeometry args={[0.015 * (0.8 + (config.nostrilHeight - 50) * 0.004), 8, 8]} />
        <meshStandardMaterial color="#2F1B14" />
      </mesh>
      <mesh position={[0.02 * (0.8 + (config.nostrilWidth - 50) * 0.004), -0.15, 0.45]}>
        <sphereGeometry args={[0.015 * (0.8 + (config.nostrilHeight - 50) * 0.004), 8, 8]} />
        <meshStandardMaterial color="#2F1B14" />
      </mesh>

      {/* Mouth */}
      <mesh 
        ref={mouthRef}
        position={[0, -0.35, 0.35]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={createMouthGeometry()}
      >
        <meshStandardMaterial 
          color="#CD853F" 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Upper Lip */}
      <mesh position={[0, -0.32, 0.38]}>
        <boxGeometry args={[
          0.12 * (0.8 + (config.mouthWidth - 50) * 0.008),
          0.02 * (0.8 + (config.upperLipHeight - 50) * 0.008),
          0.04 * (0.8 + (config.lipThickness - 50) * 0.008)
        ]} />
        <meshStandardMaterial color="#E6B887" />
      </mesh>

      {/* Lower Lip */}
      <mesh position={[0, -0.38, 0.36]}>
        <boxGeometry args={[
          0.12 * (0.8 + (config.mouthWidth - 50) * 0.008),
          0.03 * (0.8 + (config.lowerLipHeight - 50) * 0.008),
          0.05 * (0.8 + (config.lipThickness - 50) * 0.008)
        ]} />
        <meshStandardMaterial color="#E6B887" />
      </mesh>

      {/* Ears */}
      <mesh 
        position={[
          -0.9, 
          0.1 + (config.earPosition - 50) * 0.004, 
          0
        ]}
        rotation={[0, 0, Math.PI / 2 + (config.earAngle - 50) * 0.02]}
        geometry={createEarGeometry()}
        material={skinMaterial}
      />
      
      <mesh 
        position={[
          0.9, 
          0.1 + (config.earPosition - 50) * 0.004, 
          0
        ]}
        rotation={[0, 0, -Math.PI / 2 - (config.earAngle - 50) * 0.02]}
        geometry={createEarGeometry()}
        material={skinMaterial}
      />

      {/* Hair */}
      {hairGeometry && config.hairStyle !== 'bald' && (
        <mesh 
          ref={hairRef}
          position={[0, 0.3, 0]}
          geometry={hairGeometry}
        >
          <meshStandardMaterial 
            color={config.hairColor}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      )}
    </group>
  );
};

const Realistic3DHead: React.FC<Realistic3DHeadProps> = ({ config }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 2, 2]} intensity={0.3} color="#FFE4B5" />
        <pointLight position={[5, -2, -2]} intensity={0.2} color="#E6F3FF" />
        <spotLight 
          position={[0, 8, 0]} 
          intensity={0.4}
          angle={Math.PI / 4}
          penumbra={0.3}
        />
        
        <RealisticHeadScene config={config} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxDistance={6}
          minDistance={1.5}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default Realistic3DHead;