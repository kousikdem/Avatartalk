import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AdvancedAvatarPreviewProps {
  config: {
    gender: string;
    age: number;
    ethnicity?: string;
    height: number;
    weight: number;
    muscle: number;
    fat: number;
    headSize: number;
    headShape: string;
    faceWidth: number;
    jawline: number;
    cheekbones: number;
    eyeSize: number;
    eyeDistance: number;
    eyeShape: string;
    eyeColor: string;
    noseSize: number;
    noseWidth: number;
    noseShape: string;
    mouthWidth: number;
    lipThickness: number;
    lipShape: string;
    earSize: number;
    earPosition: number;
    earShape: string;
    skinTone: string;
    skinTexture: string;
    hairStyle: string;
    hairColor: string;
    hairLength: number;
    facialHair?: string;
    facialHairColor?: string;
    clothingTop: string;
    clothingBottom?: string;
    shoes?: string;
    accessories?: string[];
    currentExpression: string;
    currentPose: string;
    torsoLength?: number;
    legLength?: number;
    shoulderWidth?: number;
    handSize?: number;
  };
}

const AdvancedAvatarPreview: React.FC<AdvancedAvatarPreviewProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  // Animation loop with breathing and subtle movements
  useFrame((state) => {
    if (groupRef.current) {
      // Natural breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.015;
      groupRef.current.scale.y = breathingScale;
      
      // Subtle head movement based on expression
      if (headRef.current) {
        const headMovement = Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
        headRef.current.rotation.y = headMovement;
        
        // Expression-based head tilt
        if (config.currentExpression === 'curious') {
          headRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
      }

      // Pose-based animations
      if (config.currentPose === 'dancing' && groupRef.current) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      }
    }
  });

  // Advanced body geometry with realistic proportions
  const getBodyGeometry = () => {
    const heightScale = config.height / 170;
    const weightScale = Math.max(0.6, Math.min(1.4, config.weight / 70));
    const muscleScale = 1 + (config.muscle - 50) * 0.01;
    const fatScale = 1 + (config.fat - 20) * 0.008;
    const torsoScale = config.torsoLength ? 1 + (config.torsoLength - 50) * 0.004 : 1;
    
    // Gender-specific body shapes with realistic proportions
    const baseRadius = config.gender === 'female' ? 0.65 : 0.75;
    const bodyHeight = config.gender === 'female' ? 2.6 : 2.8;
    
    return new THREE.CapsuleGeometry(
      baseRadius * weightScale * fatScale * muscleScale, 
      bodyHeight * heightScale * torsoScale, 
      8, 16
    );
  };

  // Advanced head geometry with facial structure
  const getHeadGeometry = () => {
    const ageScale = config.age < 18 ? 0.9 : config.age > 50 ? 0.95 : 1.0;
    const genderScale = config.gender === 'female' ? 0.92 : 1.0;
    const headSizeScale = 1 + (config.headSize - 50) * 0.004;
    
    // Head shape variations
    let geometry;
    switch (config.headShape) {
      case 'round':
        geometry = new THREE.SphereGeometry(0.65 * ageScale * genderScale * headSizeScale, 32, 32);
        break;
      case 'square':
        geometry = new THREE.BoxGeometry(
          1.2 * ageScale * genderScale * headSizeScale,
          1.3 * ageScale * genderScale * headSizeScale,
          1.1 * ageScale * genderScale * headSizeScale
        );
        break;
      case 'heart':
        geometry = new THREE.ConeGeometry(
          0.7 * ageScale * genderScale * headSizeScale,
          1.4 * ageScale * genderScale * headSizeScale,
          8
        );
        break;
      case 'diamond':
        geometry = new THREE.OctahedronGeometry(0.7 * ageScale * genderScale * headSizeScale);
        break;
      default: // oval
        geometry = new THREE.SphereGeometry(
          0.6 * ageScale * genderScale * headSizeScale,
          32, 32
        );
        geometry.scale(1, 1.1, 0.9);
    }
    
    return geometry;
  };

  // Realistic skin material with subsurface scattering simulation
  const getSkinMaterial = () => {
    const skinColor = new THREE.Color(config.skinTone);
    
    // Age-based skin properties
    const ageRoughness = config.age < 25 ? 0.2 : config.age < 50 ? 0.35 : 0.5;
    const ageTransmission = config.age < 25 ? 0.8 : config.age < 50 ? 0.6 : 0.4;
    
    return {
      color: skinColor,
      roughness: ageRoughness,
      metalness: 0.02,
      transparent: true,
      opacity: 0.95,
      // Simulate subsurface scattering
      transmission: ageTransmission,
      thickness: 0.5,
      // Realistic skin properties
      clearcoat: 0.15,
      clearcoatRoughness: 0.1,
      // Subtle skin texture
      normalScale: config.skinTexture === 'rough' ? new THREE.Vector2(0.3, 0.3) : new THREE.Vector2(0.1, 0.1)
    };
  };

  // Enhanced hair geometry with realistic styles
  const getHairGeometry = () => {
    const hairLengthScale = 1 + (config.hairLength - 50) * 0.02;
    
    switch (config.hairStyle) {
      case 'bald':
        return null;
      case 'buzz':
        return new THREE.SphereGeometry(0.61, 16, 16);
      case 'short':
        return new THREE.SphereGeometry(0.64 * hairLengthScale, 20, 20);
      case 'medium':
        return new THREE.CylinderGeometry(
          0.4, 0.65 * hairLengthScale, 
          0.8 * hairLengthScale, 16
        );
      case 'long':
        return new THREE.CylinderGeometry(
          0.35, 0.7 * hairLengthScale, 
          1.6 * hairLengthScale, 12
        );
      case 'curly':
        // Create curly hair using multiple torus knots
        const curlyGroup = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const torus = new THREE.TorusKnotGeometry(
            0.3 + i * 0.1, 
            0.15 + i * 0.05, 
            64, 12, 
            2 + i, 3 + i
          );
          torus.translate(0, i * 0.2, 0);
          curlyGroup.add(new THREE.Mesh(torus));
        }
        return curlyGroup;
      case 'afro':
        return new THREE.SphereGeometry(0.85 * hairLengthScale, 16, 16);
      case 'ponytail':
        const ponytailGroup = new THREE.Group();
        // Main hair volume
        ponytailGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16)));
        // Ponytail
        ponytailGroup.add(new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.08, 1.2 * hairLengthScale, 8),
          new THREE.MeshStandardMaterial({ color: config.hairColor })
        ));
        return ponytailGroup;
      case 'braids':
        const braidsGroup = new THREE.Group();
        // Left braid
        braidsGroup.add(new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.06, 1.0 * hairLengthScale, 6)
        ));
        // Right braid  
        braidsGroup.add(new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.06, 1.0 * hairLengthScale, 6)
        ));
        return braidsGroup;
      default:
        return new THREE.SphereGeometry(0.65 * hairLengthScale, 20, 20);
    }
  };

  // Advanced clothing geometry
  const getClothingGeometry = () => {
    const heightScale = config.height / 170;
    const bodyScale = Math.max(0.6, Math.min(1.4, config.weight / 70));
    const muscleScale = 1 + (config.muscle - 50) * 0.008;
    
    switch (config.clothingTop) {
      case 'tshirt':
        return new THREE.CylinderGeometry(
          0.85 * bodyScale, 
          1.0 * bodyScale, 
          2.2 * heightScale, 
          12
        );
      case 'shirt':
        return new THREE.CylinderGeometry(
          0.88 * bodyScale, 
          1.02 * bodyScale, 
          2.4 * heightScale, 
          12
        );
      case 'hoodie':
        return new THREE.CylinderGeometry(
          0.95 * bodyScale, 
          1.15 * bodyScale, 
          2.3 * heightScale, 
          12
        );
      case 'suit':
        return new THREE.CylinderGeometry(
          0.82 * bodyScale * muscleScale, 
          0.98 * bodyScale * muscleScale, 
          2.6 * heightScale, 
          16
        );
      case 'dress':
        return new THREE.CylinderGeometry(
          0.75 * bodyScale, 
          1.2 * bodyScale, 
          2.8 * heightScale, 
          16
        );
      default:
        return new THREE.CylinderGeometry(
          0.85 * bodyScale, 
          1.0 * bodyScale, 
          2.3 * heightScale, 
          12
        );
    }
  };

  // Enhanced limb geometry
  const getArmGeometry = () => {
    const muscleScale = 1 + (config.muscle - 50) * 0.006;
    const handScale = config.handSize ? 1 + (config.handSize - 50) * 0.004 : 1;
    return new THREE.CapsuleGeometry(0.11 * muscleScale, 1.3 * handScale, 6, 12);
  };

  const getLegGeometry = () => {
    const muscleScale = 1 + (config.muscle - 50) * 0.008;
    const legScale = config.legLength ? 1 + (config.legLength - 50) * 0.004 : 1;
    return new THREE.CapsuleGeometry(0.14 * muscleScale, 1.7 * legScale, 6, 12);
  };

  // Enhanced pose transformations
  const getPoseTransformation = () => {
    switch (config.currentPose) {
      case 'standing':
        return { rotation: [0, 0, 0], position: [0, 0, 0] };
      case 'sitting':
        return { rotation: [0.2, 0, 0], position: [0, -0.8, 0] };
      case 'running':
        return { rotation: [-0.3, 0.2, 0.1], position: [0, 0.2, 0] };
      case 'dancing':
        return { rotation: [0.1, 0.3, 0.15], position: [0, 0.1, 0] };
      case 'relaxed':
        return { rotation: [0.05, 0.1, 0.05], position: [0, -0.1, 0] };
      case 'confident':
        return { rotation: [-0.1, 0, 0], position: [0, 0.1, 0] };
      default:
        return { rotation: [0, 0, 0], position: [0, 0, 0] };
    }
  };

  // Dynamic arm positioning based on pose
  const getArmPositions = () => {
    const shoulderScale = config.shoulderWidth ? 1 + (config.shoulderWidth - 50) * 0.006 : 1;
    const armSpread = 0.85 * shoulderScale;
    
    switch (config.currentPose) {
      case 'confident':
        return {
          left: [-armSpread, 0.3, 0] as [number, number, number],
          right: [armSpread, 0.3, 0] as [number, number, number],
          leftRotation: [0, 0, 0.4] as [number, number, number],
          rightRotation: [0, 0, -0.4] as [number, number, number]
        };
      case 'running':
        return {
          left: [-armSpread * 0.7, 0.8, 0.4] as [number, number, number],
          right: [armSpread * 0.7, 0.2, -0.4] as [number, number, number],
          leftRotation: [-0.6, 0, 0.3] as [number, number, number],
          rightRotation: [0.6, 0, -0.3] as [number, number, number]
        };
      case 'dancing':
        return {
          left: [-armSpread * 1.2, 1.3, 0] as [number, number, number],
          right: [armSpread * 1.2, 1.3, 0] as [number, number, number],
          leftRotation: [0, 0, 0.9] as [number, number, number],
          rightRotation: [0, 0, -0.9] as [number, number, number]
        };
      case 'relaxed':
        return {
          left: [-armSpread * 0.9, 0.2, 0] as [number, number, number],
          right: [armSpread * 0.9, 0.2, 0] as [number, number, number],
          leftRotation: [0, 0, 0.1] as [number, number, number],
          rightRotation: [0, 0, -0.1] as [number, number, number]
        };
      default:
        return {
          left: [-armSpread, 0.5, 0] as [number, number, number],
          right: [armSpread, 0.5, 0] as [number, number, number],
          leftRotation: [0, 0, 0.2] as [number, number, number],
          rightRotation: [0, 0, -0.2] as [number, number, number]
        };
    }
  };

  // Enhanced eye rendering with realistic details
  const renderEyes = () => {
    const eyeScale = 1 + (config.eyeSize - 50) * 0.004;
    const eyeDistance = 0.2 + (config.eyeDistance - 50) * 0.002;
    
    return (
      <>
        {/* Eye whites */}
        <mesh position={[-eyeDistance, 2.3, 0.5]}>
          <sphereGeometry args={[0.07 * eyeScale, 12, 12]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[eyeDistance, 2.3, 0.5]}>
          <sphereGeometry args={[0.07 * eyeScale, 12, 12]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Irises */}
        <mesh position={[-eyeDistance, 2.3, 0.54]}>
          <sphereGeometry args={[0.04 * eyeScale, 12, 12]} />
          <meshStandardMaterial color={config.eyeColor} />
        </mesh>
        <mesh position={[eyeDistance, 2.3, 0.54]}>
          <sphereGeometry args={[0.04 * eyeScale, 12, 12]} />
          <meshStandardMaterial color={config.eyeColor} />
        </mesh>

        {/* Pupils */}
        <mesh position={[-eyeDistance, 2.3, 0.56]}>
          <sphereGeometry args={[0.015 * eyeScale, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[eyeDistance, 2.3, 0.56]}>
          <sphereGeometry args={[0.015 * eyeScale, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </>
    );
  };

  // Enhanced nose rendering
  const renderNose = () => {
    const noseScale = 1 + (config.noseSize - 50) * 0.003;
    const noseWidth = 1 + (config.noseWidth - 50) * 0.002;
    
    switch (config.noseShape) {
      case 'wide':
        return (
          <mesh position={[0, 2.1, 0.52]}>
            <boxGeometry args={[0.08 * noseWidth, 0.12 * noseScale, 0.06]} />
            <meshStandardMaterial {...getSkinMaterial()} />
          </mesh>
        );
      case 'narrow':
        return (
          <mesh position={[0, 2.1, 0.52]}>
            <coneGeometry args={[0.025 * noseWidth, 0.15 * noseScale, 6]} />
            <meshStandardMaterial {...getSkinMaterial()} />
          </mesh>
        );
      case 'curved':
        return (
          <mesh position={[0, 2.1, 0.52]}>
            <cylinderGeometry args={[0.03 * noseWidth, 0.04 * noseWidth, 0.12 * noseScale, 8]} />
            <meshStandardMaterial {...getSkinMaterial()} />
          </mesh>
        );
      default: // straight
        return (
          <mesh position={[0, 2.1, 0.52]}>
            <coneGeometry args={[0.04 * noseWidth, 0.13 * noseScale, 6]} />
            <meshStandardMaterial {...getSkinMaterial()} />
          </mesh>
        );
    }
  };

  // Enhanced mouth with expression-based deformation
  const renderMouth = () => {
    const mouthScale = 1 + (config.mouthWidth - 50) * 0.003;
    const lipScale = 1 + (config.lipThickness - 50) * 0.002;
    
    // Expression-based mouth transformations
    let mouthGeometry;
    let mouthColor = '#CD853F';
    let mouthTransform = { scale: [1, 1, 1], position: [0, 1.95, 0.48] };
    
    switch (config.currentExpression) {
      case 'smiling':
        mouthTransform.scale = [1.3 * mouthScale, 0.7 * lipScale, 1];
        mouthColor = '#FF6B6B';
        break;
      case 'laughing':
        mouthTransform.scale = [1.5 * mouthScale, 1.2 * lipScale, 1.2];
        mouthColor = '#FF4444';
        break;
      case 'surprised':
        mouthTransform.scale = [0.8 * mouthScale, 1.6 * lipScale, 1.4];
        mouthColor = '#FFB6C1';
        break;
      case 'angry':
        mouthTransform.scale = [0.9 * mouthScale, 0.6 * lipScale, 0.8];
        mouthColor = '#DC143C';
        break;
      case 'sad':
        mouthTransform.scale = [0.8 * mouthScale, 1.1 * lipScale, 0.9];
        mouthColor = '#8B4513';
        break;
      default:
        mouthTransform.scale = [1 * mouthScale, 1 * lipScale, 1];
    }
    
    return (
      <mesh 
        position={mouthTransform.position as [number, number, number]}
        scale={mouthTransform.scale as [number, number, number]}
      >
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={mouthColor} />
      </mesh>
    );
  };

  // Enhanced ear rendering
  const renderEars = () => {
    const earScale = 1 + (config.earSize - 50) * 0.003;
    const earPositionOffset = (config.earPosition - 50) * 0.002;
    
    switch (config.earShape) {
      case 'large':
        return (
          <>
            <mesh position={[-0.55, 2.2 + earPositionOffset, 0]}>
              <sphereGeometry args={[0.08 * earScale, 8, 8]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
            <mesh position={[0.55, 2.2 + earPositionOffset, 0]}>
              <sphereGeometry args={[0.08 * earScale, 8, 8]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
          </>
        );
      case 'small':
        return (
          <>
            <mesh position={[-0.55, 2.2 + earPositionOffset, 0]}>
              <sphereGeometry args={[0.05 * earScale, 8, 8]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
            <mesh position={[0.55, 2.2 + earPositionOffset, 0]}>
              <sphereGeometry args={[0.05 * earScale, 8, 8]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
          </>
        );
      case 'pointed':
        return (
          <>
            <mesh position={[-0.55, 2.2 + earPositionOffset, 0]}>
              <coneGeometry args={[0.06 * earScale, 0.12, 6]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
            <mesh position={[0.55, 2.2 + earPositionOffset, 0]}>
              <coneGeometry args={[0.06 * earScale, 0.12, 6]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
          </>
        );
      default: // normal
        return (
          <>
            <mesh position={[-0.55, 2.2 + earPositionOffset, 0]}>
              <sphereGeometry args={[0.06 * earScale, 8, 8]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
            <mesh position={[0.55, 2.2 + earPositionOffset, 0]}>
              <sphereGeometry args={[0.06 * earScale, 8, 8]} />
              <meshStandardMaterial {...getSkinMaterial()} />
            </mesh>
          </>
        );
    }
  };

  const poseTransform = getPoseTransformation();
  const armPositions = getArmPositions();

  return (
    <group 
      ref={groupRef} 
      rotation={poseTransform.rotation as [number, number, number]}
      position={poseTransform.position as [number, number, number]}
    >
      {/* Main Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]} geometry={getBodyGeometry()}>
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Arms with enhanced positioning */}
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

      {/* Legs with enhanced positioning */}
      <mesh 
        ref={leftLegRef} 
        position={[-0.35, -1.6, 0]} 
        geometry={getLegGeometry()}
      >
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>
      
      <mesh 
        ref={rightLegRef} 
        position={[0.35, -1.6, 0]} 
        geometry={getLegGeometry()}
      >
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Enhanced Clothing */}
      <mesh position={[0, 0.1, 0]} geometry={getClothingGeometry()}>
        <meshStandardMaterial 
          color={
            config.clothingTop === 'suit' ? '#1A202C' : 
            config.clothingTop === 'dress' ? '#8B5CF6' :
            config.clothingTop === 'hoodie' ? '#374151' :
            config.clothingTop === 'shirt' ? '#3B82F6' : '#4A5568'
          }
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Enhanced Head */}
      <mesh ref={headRef} position={[0, 2.3, 0]} geometry={getHeadGeometry()}>
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Enhanced Hair */}
      {config.hairStyle !== 'bald' && (
        <mesh 
          ref={hairRef} 
          position={[0, 2.7, 0]}
        >
          <sphereGeometry args={[0.65, 16, 16]} />
          <meshStandardMaterial 
            color={config.hairColor}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Enhanced facial features */}
      {renderEyes()}
      {renderNose()}
      {renderMouth()}
      {renderEars()}

      {/* Enhanced Hands */}
      <mesh position={[-1.15, 0.1, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>
      <mesh position={[1.15, 0.1, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial {...getSkinMaterial()} />
      </mesh>

      {/* Enhanced Feet/Shoes */}
      <mesh position={[-0.35, -2.4, 0.15]}>
        <boxGeometry args={[0.25, 0.12, 0.45]} />
        <meshStandardMaterial 
          color={config.shoes === 'dress' ? '#2D3748' : '#8B4513'} 
          roughness={0.9} 
        />
      </mesh>
      <mesh position={[0.35, -2.4, 0.15]}>
        <boxGeometry args={[0.25, 0.12, 0.45]} />
        <meshStandardMaterial 
          color={config.shoes === 'dress' ? '#2D3748' : '#8B4513'} 
          roughness={0.9} 
        />
      </mesh>
    </group>
  );
};

export default AdvancedAvatarPreview;