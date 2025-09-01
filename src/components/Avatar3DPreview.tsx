
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Avatar3DPreviewProps {
  config: {
    body: {
      gender: string;
      age: number;
      ethnicity: string;
      height: number;
      weight: number;
      muscle: number;
      fat: number;
    };
    face: {
      eyeColor: string;
      skinTone: string;
      hairStyle: string;
      hairColor: string;
    };
    clothing: {
      outfit: string;
      accessories: string[];
    };
    pose: string;
    expression: string;
  };
}

const Avatar3DPreview: React.FC<Avatar3DPreviewProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Generate body geometry based on config
  const getBodyGeometry = () => {
    const heightScale = config.body.height / 170; // Base height 170cm
    const widthScale = (config.body.weight / 65) * 0.8 + 0.2; // Base weight 65kg
    return new THREE.CapsuleGeometry(0.8 * widthScale, 3 * heightScale, 4, 8);
  };

  // Generate head geometry based on config
  const getHeadGeometry = () => {
    const ageScale = 1 - (config.body.age - 25) * 0.002; // Slight scaling with age
    return new THREE.SphereGeometry(0.6 * ageScale, 32, 32);
  };

  // Get skin material based on ethnicity and skin tone
  const getSkinMaterial = () => {
    return new THREE.MeshStandardMaterial({
      color: config.face.skinTone,
      roughness: 0.6,
      metalness: 0.1,
    });
  };

  // Get hair geometry based on style
  const getHairGeometry = () => {
    switch (config.face.hairStyle) {
      case 'short':
        return new THREE.SphereGeometry(0.65, 16, 16);
      case 'long':
        return new THREE.CylinderGeometry(0.4, 0.6, 1.2, 8);
      case 'curly':
        return new THREE.TorusKnotGeometry(0.3, 0.15, 64, 8);
      default:
        return new THREE.SphereGeometry(0.65, 16, 16);
    }
  };

  // Get clothing geometry
  const getClothingGeometry = () => {
    switch (config.clothing.outfit) {
      case 'business':
        return new THREE.CylinderGeometry(0.9, 1.1, 2.5, 8);
      case 'casual':
        return new THREE.CylinderGeometry(1.0, 1.0, 2.2, 8);
      case 'formal':
        return new THREE.CylinderGeometry(0.85, 1.05, 2.8, 8);
      default:
        return new THREE.CylinderGeometry(0.9, 1.0, 2.5, 8);
    }
  };

  // Apply pose transformations
  const getPoseRotation = (): [number, number, number] => {
    switch (config.pose) {
      case 'sitting':
        return [0.5, 0, 0];
      case 'running':
        return [-0.2, 0.3, 0.1];
      case 'dancing':
        return [0.1, 0.5, 0.2];
      case 'fighting':
        return [-0.3, -0.2, 0.1];
      default:
        return [0, 0, 0];
    }
  };

  return (
    <group ref={groupRef} rotation={getPoseRotation()}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]} geometry={getBodyGeometry()}>
        <meshStandardMaterial color={config.face.skinTone} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Clothing */}
      <mesh position={[0, 0.2, 0]} geometry={getClothingGeometry()}>
        <meshStandardMaterial 
          color={config.clothing.outfit === 'business' ? '#2D3748' : '#4A5568'}
          roughness={0.8}
        />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 2.2, 0]} geometry={getHeadGeometry()}>
        <meshStandardMaterial color={config.face.skinTone} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Hair */}
      <mesh 
        ref={hairRef} 
        position={[0, 2.6, 0]} 
        geometry={getHairGeometry()}
      >
        <meshStandardMaterial 
          color={config.face.hairColor}
          roughness={0.9}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 2.3, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={config.face.eyeColor} />
      </mesh>
      <mesh position={[0.2, 2.3, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={config.face.eyeColor} />
      </mesh>

      {/* Expression-based mouth */}
      <mesh position={[0, 2.0, 0.5]} 
            scale={config.expression === 'smiling' ? [1.2, 0.8, 1] : [1, 1, 1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color={config.expression === 'smiling' ? '#FF6B6B' : '#8B4513'} 
        />
      </mesh>
    </group>
  );
};

export default Avatar3DPreview;
