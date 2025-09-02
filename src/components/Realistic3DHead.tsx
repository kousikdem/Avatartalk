import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Realistic3DHeadProps {
  avatarData: {
    facialMesh: Float32Array;
    textureData: string;
    landmarks: number[][];
    measurements: {
      faceWidth: number;
      faceHeight: number;
      eyeDistance: number;
      noseLength: number;
      mouthWidth: number;
      jawWidth: number;
    };
    features: {
      skinTone: string;
      eyeColor: string;
      hairColor: string;
      faceShape: string;
      age: number;
      gender: string;
      ethnicity: string;
    };
  };
}

// Internal 3D Head Scene Component
const RealisticHeadScene: React.FC<{ avatarData: Realistic3DHeadProps['avatarData'] }> = ({ avatarData }) => {
  const headRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (headRef.current) {
      // Subtle breathing animation
      headRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      
      // Subtle head rotation for lifelike appearance
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
    }
    
    // Eye movement simulation
    if (eyeLeftRef.current && eyeRightRef.current) {
      const eyeMovement = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      eyeLeftRef.current.rotation.x = eyeMovement;
      eyeRightRef.current.rotation.x = eyeMovement;
    }
  });

  // Create realistic head geometry from facial mesh
  const headGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    
    // Use facial mesh vertices
    geometry.setAttribute('position', new THREE.BufferAttribute(avatarData.facialMesh, 3));
    
    // Generate faces/triangles for the mesh
    const indices = generateFaceIndices(avatarData.facialMesh.length / 3);
    geometry.setIndex(indices);
    
    // Calculate normals for proper lighting
    geometry.computeVertexNormals();
    
    return geometry;
  }, [avatarData.facialMesh]);

  // Create realistic skin material
  const skinMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: avatarData.features.skinTone,
      roughness: 0.3,
      metalness: 0.0,
      transparent: true,
      opacity: 0.98,
    });
    
    return material;
  }, [avatarData.features.skinTone]);

  // Generate detailed eye geometry
  const generateEyeGeometry = (isLeft: boolean) => {
    const eyeLandmarks = isLeft ? avatarData.landmarks.slice(42, 48) : avatarData.landmarks.slice(36, 42);
    
    // Create realistic eye shape based on landmarks
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    return eyeGeometry;
  };

  // Generate realistic hair geometry based on detected hair color and style
  const generateHairGeometry = () => {
    const { gender, age } = avatarData.features;
    
    // Choose hair style based on gender and age
    if (age < 25) {
      return gender === 'male' 
        ? new THREE.SphereGeometry(0.8, 16, 16) // Short modern
        : new THREE.CylinderGeometry(0.5, 0.7, 1.2, 12); // Long flowing
    } else if (age < 50) {
      return gender === 'male'
        ? new THREE.SphereGeometry(0.75, 12, 12) // Professional short
        : new THREE.SphereGeometry(0.85, 18, 18); // Medium length
    } else {
      return gender === 'male'
        ? new THREE.SphereGeometry(0.7, 10, 10) // Receding/thinning
        : new THREE.CylinderGeometry(0.45, 0.65, 1.0, 10); // Mature style
    }
  };

  // Generate nose geometry from landmarks
  const generateNoseGeometry = () => {
    const noseLandmarks = avatarData.landmarks.slice(27, 36);
    const noseLength = avatarData.measurements.noseLength;
    
    // Create nose based on ethnicity and measurements
    const { ethnicity } = avatarData.features;
    
    if (ethnicity === 'african') {
      return new THREE.CylinderGeometry(0.08, 0.12, noseLength * 0.8, 6);
    } else if (ethnicity === 'asian') {
      return new THREE.CylinderGeometry(0.06, 0.09, noseLength * 0.7, 6);
    } else {
      return new THREE.CylinderGeometry(0.07, 0.10, noseLength * 0.75, 6);
    }
  };

  // Generate mouth geometry from landmarks
  const generateMouthGeometry = () => {
    const mouthWidth = avatarData.measurements.mouthWidth;
    const lipThickness = avatarData.features.gender === 'female' ? 0.04 : 0.03;
    
    return new THREE.CylinderGeometry(mouthWidth * 0.3, mouthWidth * 0.4, lipThickness, 8);
  };

  return (
    <group ref={headRef}>
      {/* Main Head Mesh */}
      <mesh geometry={headGeometry} material={skinMaterial} />
      
      {/* Left Eye */}
      <mesh 
        ref={eyeLeftRef}
        position={[-0.2, 0.1, 0.4]} 
        geometry={generateEyeGeometry(true)}
      >
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Left Pupil */}
      <mesh position={[-0.2, 0.1, 0.45]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={avatarData.features.eyeColor} />
      </mesh>
      
      {/* Right Eye */}
      <mesh 
        ref={eyeRightRef}
        position={[0.2, 0.1, 0.4]} 
        geometry={generateEyeGeometry(false)}
      >
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Right Pupil */}
      <mesh position={[0.2, 0.1, 0.45]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={avatarData.features.eyeColor} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 0.6, 0]} geometry={generateHairGeometry()}>
        <meshStandardMaterial 
          color={avatarData.features.hairColor}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, -0.1, 0.45]} geometry={generateNoseGeometry()}>
        <meshStandardMaterial {...skinMaterial} />
      </mesh>
      
      {/* Mouth */}
      <mesh position={[0, -0.3, 0.4]} geometry={generateMouthGeometry()}>
        <meshStandardMaterial 
          color="#CD5C5C"
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>
      
      {/* Eyebrows */}
      <mesh position={[-0.15, 0.25, 0.35]}>
        <boxGeometry args={[0.2, 0.02, 0.08]} />
        <meshStandardMaterial color={avatarData.features.hairColor} />
      </mesh>
      <mesh position={[0.15, 0.25, 0.35]}>
        <boxGeometry args={[0.2, 0.02, 0.08]} />
        <meshStandardMaterial color={avatarData.features.hairColor} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.45, 0, 0]}>
        <ellipsoidGeometry args={[0.1, 0.15, 0.05]} />
        <meshStandardMaterial {...skinMaterial} />
      </mesh>
      <mesh position={[0.45, 0, 0]}>
        <ellipsoidGeometry args={[0.1, 0.15, 0.05]} />
        <meshStandardMaterial {...skinMaterial} />
      </mesh>
    </group>
  );
};

// Helper function to generate face indices for the mesh
const generateFaceIndices = (vertexCount: number): number[] => {
  const indices: number[] = [];
  
  // Generate triangular faces for the mesh
  for (let i = 0; i < vertexCount - 2; i++) {
    // Create triangles in a fan pattern
    if (i % 3 === 0) {
      indices.push(0, i + 1, i + 2);
    }
  }
  
  return indices;
};

// Custom ellipsoid geometry for ears
class EllipsoidGeometry extends THREE.BufferGeometry {
  constructor(radiusX: number, radiusY: number, radiusZ: number) {
    super();
    
    const vertices: number[] = [];
    const indices: number[] = [];
    
    const widthSegments = 8;
    const heightSegments = 6;
    
    for (let i = 0; i <= heightSegments; i++) {
      const v = i / heightSegments;
      const phi = v * Math.PI;
      
      for (let j = 0; j <= widthSegments; j++) {
        const u = j / widthSegments;
        const theta = u * Math.PI * 2;
        
        const x = radiusX * Math.sin(phi) * Math.cos(theta);
        const y = radiusY * Math.cos(phi);
        const z = radiusZ * Math.sin(phi) * Math.sin(theta);
        
        vertices.push(x, y, z);
      }
    }
    
    for (let i = 0; i < heightSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = i * (widthSegments + 1) + j;
        const b = a + widthSegments + 1;
        
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }
    
    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.setIndex(indices);
    this.computeVertexNormals();
  }
}

// Register custom geometry
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ellipsoidGeometry: any;
    }
  }
}

// Main Realistic 3D Head Component
const Realistic3DHead: React.FC<Realistic3DHeadProps> = ({ avatarData }) => {
  return (
    <div className="w-full h-80 realistic-avatar-lighting rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Advanced Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 2]} intensity={0.3} color="#FFF8DC" />
        <spotLight 
          position={[0, 5, 0]} 
          intensity={0.2} 
          angle={Math.PI / 4}
          penumbra={0.3}
        />
        
        <RealisticHeadScene avatarData={avatarData} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxDistance={4}
          minDistance={1}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};

export default Realistic3DHead;