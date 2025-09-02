
import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
      faceShape?: string;
      eyeShape?: string;
      noseShape?: string;
      lipShape?: string;
    };
    clothing: {
      outfit: string;
      accessories: string[];
    };
    pose: string;
    expression: string;
  };
}

// Internal 3D Scene Component that uses R3F hooks
const AvatarScene: React.FC<{ config: Avatar3DPreviewProps['config'] }> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
      
      // Subtle head movement for lifelike appearance
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      }
    }
  });

  // Enhanced body geometry based on age, gender, and proportions
  const getBodyGeometry = () => {
    const heightScale = config.body.height / 170;
    const weightScale = (config.body.weight / 65) * 0.8 + 0.2;
    const muscleScale = 1 + (config.body.muscle - 50) * 0.008;
    const fatScale = 1 + (config.body.fat - 30) * 0.006;
    
    // Gender-specific body shapes
    if (config.body.gender === 'female') {
      return new THREE.CapsuleGeometry(
        0.7 * weightScale * fatScale, 
        2.8 * heightScale, 
        4, 8
      );
    } else {
      return new THREE.CapsuleGeometry(
        0.8 * weightScale * muscleScale, 
        3.0 * heightScale, 
        4, 8
      );
    }
  };

  // Realistic head geometry with age and gender considerations
  const getHeadGeometry = () => {
    const ageScale = config.body.age < 18 ? 0.9 : 
                    config.body.age > 50 ? 0.95 : 1.0;
    const genderScale = config.body.gender === 'female' ? 0.95 : 1.0;
    
    return new THREE.SphereGeometry(0.6 * ageScale * genderScale, 32, 32);
  };

  // Realistic skin material based on ethnicity and skin tone
  const getSkinMaterial = () => {
    const roughness = 0.4;
    const subsurface = 0.8;
    const skinTone = config.face?.skinTone || '#F1C27D';
    
    return {
      color: skinTone,
      roughness: roughness,
      metalness: 0.0,
      transparent: true,
      opacity: 0.98,
      // Add realistic skin properties
      clearcoat: 0.1,
      clearcoatRoughness: 0.2,
    };
  };

  // Enhanced hair geometry based on style and gender
  const getHairGeometry = () => {
    const hairStyle = config.face?.hairStyle || 'medium';
    
    switch (hairStyle) {
      case 'bald':
        return null;
      case 'buzz':
        return new THREE.SphereGeometry(0.62, 12, 12);
      case 'short':
        return new THREE.SphereGeometry(0.65, 16, 16);
      case 'medium':
        return new THREE.CylinderGeometry(0.45, 0.65, 0.8, 12);
      case 'long':
        return new THREE.CylinderGeometry(0.4, 0.7, 1.4, 8);
      case 'curly':
        return new THREE.TorusKnotGeometry(0.35, 0.18, 64, 12);
      case 'ponytail':
        return new THREE.ConeGeometry(0.3, 1.2, 8);
      case 'braids':
        return new THREE.CylinderGeometry(0.5, 0.6, 1.0, 8);
      case 'afro':
        return new THREE.SphereGeometry(0.8, 16, 16);
      case 'dreadlocks':
        return new THREE.CylinderGeometry(0.45, 0.65, 1.2, 12);
      default:
        return new THREE.SphereGeometry(0.65, 16, 16);
    }
  };

  // Realistic clothing geometry with proper fit
  const getClothingGeometry = () => {
    const heightScale = config.body.height / 170;
    const bodyScale = (config.body.weight / 65) * 0.8 + 0.2;
    
    switch (config.clothing.outfit) {
      case 'business':
        return new THREE.CylinderGeometry(0.85 * bodyScale, 1.0 * bodyScale, 2.6 * heightScale, 8);
      case 'casual':
        return new THREE.CylinderGeometry(0.9 * bodyScale, 1.1 * bodyScale, 2.4 * heightScale, 8);
      case 'formal':
        return new THREE.CylinderGeometry(0.82 * bodyScale, 0.98 * bodyScale, 2.8 * heightScale, 8);
      case 'sports':
        return new THREE.CylinderGeometry(0.88 * bodyScale, 1.05 * bodyScale, 2.3 * heightScale, 8);
      default:
        return new THREE.CylinderGeometry(0.9 * bodyScale, 1.0 * bodyScale, 2.5 * heightScale, 8);
    }
  };

  // Arm geometry
  const getArmGeometry = () => {
    const muscleScale = 1 + (config.body.muscle - 50) * 0.004;
    return new THREE.CapsuleGeometry(0.12 * muscleScale, 1.2, 4, 8);
  };

  // Leg geometry
  const getLegGeometry = () => {
    const muscleScale = 1 + (config.body.muscle - 50) * 0.005;
    return new THREE.CapsuleGeometry(0.15 * muscleScale, 1.6, 4, 8);
  };

  // Enhanced pose transformations
  const getPoseRotation = (): [number, number, number] => {
    switch (config.pose) {
      case 'standing':
        return [0, 0, 0];
      case 'sitting':
        return [0.3, 0, 0];
      case 'running':
        return [-0.2, 0.3, 0.1];
      case 'dancing':
        return [0.1, 0.5, 0.2];
      case 'fighting':
        return [-0.3, -0.2, 0.1];
      case 'relaxed':
        return [0.05, 0.1, 0.05];
      default:
        return [0, 0, 0];
    }
  };

  // Arm positions based on pose
  const getArmPositions = () => {
    switch (config.pose) {
      case 'standing':
        return {
          left: [-0.8, 0.5, 0] as [number, number, number],
          right: [0.8, 0.5, 0] as [number, number, number],
          leftRotation: [0, 0, 0.2] as [number, number, number],
          rightRotation: [0, 0, -0.2] as [number, number, number]
        };
      case 'running':
        return {
          left: [-0.6, 0.8, 0.3] as [number, number, number],
          right: [0.6, 0.2, -0.3] as [number, number, number],
          leftRotation: [-0.5, 0, 0.3] as [number, number, number],
          rightRotation: [0.5, 0, -0.3] as [number, number, number]
        };
      case 'dancing':
        return {
          left: [-1.0, 1.2, 0] as [number, number, number],
          right: [1.0, 1.2, 0] as [number, number, number],
          leftRotation: [0, 0, 0.8] as [number, number, number],
          rightRotation: [0, 0, -0.8] as [number, number, number]
        };
      default:
        return {
          left: [-0.8, 0.5, 0] as [number, number, number],
          right: [0.8, 0.5, 0] as [number, number, number],
          leftRotation: [0, 0, 0.2] as [number, number, number],
          rightRotation: [0, 0, -0.2] as [number, number, number]
        };
    }
  };

  const armPositions = getArmPositions();

  return (
    <group ref={groupRef} rotation={getPoseRotation()}>
      {/* Main Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]} geometry={getBodyGeometry()}>
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Arms */}
      <mesh 
        ref={leftArmRef} 
        position={armPositions.left} 
        rotation={armPositions.leftRotation}
        geometry={getArmGeometry()}
      >
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>
      
      <mesh 
        ref={rightArmRef} 
        position={armPositions.right} 
        rotation={armPositions.rightRotation}
        geometry={getArmGeometry()}
      >
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Legs */}
      <mesh 
        ref={leftLegRef} 
        position={[-0.3, -1.5, 0]} 
        geometry={getLegGeometry()}
      >
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>
      
      <mesh 
        ref={rightLegRef} 
        position={[0.3, -1.5, 0]} 
        geometry={getLegGeometry()}
      >
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Clothing */}
      <mesh position={[0, 0.2, 0]} geometry={getClothingGeometry()}>
        <meshStandardMaterial 
          color={config.clothing.outfit === 'business' ? '#2D3748' : 
                 config.clothing.outfit === 'formal' ? '#1A202C' :
                 config.clothing.outfit === 'sports' ? '#3182CE' : '#4A5568'}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 2.2, 0]} geometry={getHeadGeometry()}>
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Hair */}
      {config.face?.hairStyle !== 'bald' && getHairGeometry() && (
        <mesh 
          ref={hairRef} 
          position={[0, 2.6, 0]} 
          geometry={getHairGeometry()}
        >
          <meshStandardMaterial 
            color={config.face?.hairColor || '#8B4513'}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Eyes */}
      <mesh position={[-0.2, 2.3, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.2, 2.3, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.2, 2.3, 0.55]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={config.face.eyeColor} />
      </mesh>
      <mesh position={[0.2, 2.3, 0.55]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={config.face.eyeColor} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 2.15, 0.55]}>
        <coneGeometry args={[0.04, 0.15, 4]} />
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Mouth - expression-based */}
      <mesh position={[0, 2.0, 0.5]} 
            scale={config.expression === 'smiling' ? [1.2, 0.8, 1] : 
                   config.expression === 'sad' ? [0.8, 1.2, 1] :
                   config.expression === 'surprised' ? [1.4, 1.4, 1] : [1, 1, 1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={config.expression === 'smiling' ? '#FF6B6B' : 
                 config.expression === 'sad' ? '#8B4513' :
                 config.expression === 'angry' ? '#DC143C' : '#CD853F'} 
        />
      </mesh>

      {/* Hands */}
      <mesh position={[-1.1, 0.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>
      <mesh position={[1.1, 0.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.3, -2.3, 0.1]}>
        <boxGeometry args={[0.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      <mesh position={[0.3, -2.3, 0.1]}>
        <boxGeometry args={[0.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Main Avatar3DPreview Component that provides Canvas context
const Avatar3DPreview: React.FC<Avatar3DPreviewProps> = ({ config }) => {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        
        <AvatarScene config={config} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxDistance={8}
          minDistance={2}
        />
      </Canvas>
    </div>
  );
};

export default Avatar3DPreview;
