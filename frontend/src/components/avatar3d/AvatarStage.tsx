import React, { forwardRef, Suspense, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import {
  AvatarConfig, BACKGROUNDS, CharacterConfig, loadImage, renderAdjustedCanvas, canvasToBlob,
} from '@/lib/avatar/avatarConfig';

export interface AvatarStageHandle {
  snapshot: () => Promise<Blob | null>;
}

interface Props {
  config: AvatarConfig;
  angle?: number;      // degrees, rotates the avatar
  zoom?: number;       // 0.6..1.8
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
}

/* ───────────────────────── Photo → turnable 3D card ───────────────────────── */
const PhotoCard: React.FC<{ config: AvatarConfig }> = ({ config }) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState(1);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    let alive = true;
    if (!config.imageUrl) { setTex(null); return; }
    loadImage(config.imageUrl)
      .then((img) => {
        if (!alive) return;
        const full = renderAdjustedCanvas(img, config.photo, 1024);
        // crop to a 4:5 portrait card (cover, biased to the top where the face is)
        const ratio = 5 / 4;
        let cw = full.width, chh = full.height;
        if (chh / cw < ratio) cw = Math.round(chh / ratio); else chh = Math.round(cw * ratio);
        const c = document.createElement('canvas');
        c.width = cw; c.height = chh;
        c.getContext('2d')!.drawImage(full, Math.round((full.width - cw) / 2), Math.round((full.height - chh) * 0.15), cw, chh, 0, 0, cw, chh);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setAspect(c.height / c.width);
        setTex((old) => { old?.dispose(); return t; });
      })
      .catch(() => alive && setTex(null));
    return () => { alive = false; };
  }, [config.imageUrl, config.photo]);

  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = 1.15 + Math.sin(clock.elapsedTime * 1.2) * 0.02;
  });

  const w = 1.3;
  const h = w * aspect;
  return (
    <group ref={group} position={[0, 1.15, 0]}>
      <RoundedBox args={[w + 0.06, h + 0.06, 0.07]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
      </RoundedBox>
      {tex && (
        <mesh position={[0, 0, 0.0365]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={0.6} />
        </mesh>
      )}
      {tex && (
        <mesh position={[0, 0, -0.0365]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} color="#9a94c8" roughness={0.8} />
        </mesh>
      )}
    </group>
  );
};

/* ───────────────────────── Procedural 3D character ───────────────────────── */
const mat = (color: string, rough = 0.65) => <meshStandardMaterial color={color} roughness={rough} />;

const Hair: React.FC<{ c: CharacterConfig }> = ({ c }) => {
  const col = c.hairColor;
  if (c.hairStyle === 'bald') return null;
  const capTheta = c.hairStyle === 'buzz' ? Math.PI * 0.4 : Math.PI * 0.47;
  const capR = c.hairStyle === 'buzz' ? 0.205 : 0.218;
  return (
    <group>
      <mesh position={[0, 0.015, -0.01]} rotation={[-0.25, 0, 0]}>
        <sphereGeometry args={[capR, 32, 16, 0, Math.PI * 2, 0, capTheta]} />
        {mat(col, 0.8)}
      </mesh>
      {(c.hairStyle === 'long' || c.hairStyle === 'ponytail') && (
        <mesh position={[0, c.hairStyle === 'long' ? -0.17 : -0.05, -0.1]} scale={[1, 1, 0.55]}>
          <capsuleGeometry args={[c.hairStyle === 'long' ? 0.2 : 0.07, c.hairStyle === 'long' ? 0.28 : 0.3, 8, 16]} />
          {mat(col, 0.8)}
        </mesh>
      )}
      {c.hairStyle === 'bun' && (
        <mesh position={[0, 0.2, -0.1]}>
          <sphereGeometry args={[0.085, 20, 16]} />
          {mat(col, 0.8)}
        </mesh>
      )}
      {c.hairStyle === 'curly' &&
        Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.17, 0.1 + Math.sin(i) * 0.03, Math.sin(a) * 0.15 - 0.02]}>
              <sphereGeometry args={[0.075, 12, 10]} />
              {mat(col, 0.9)}
            </mesh>
          );
        })}
    </group>
  );
};

const Mouth: React.FC<{ expr: CharacterConfig['expression'] }> = ({ expr }) => {
  if (expr === 'neutral') {
    return <mesh position={[0, -0.085, 0.18]}><boxGeometry args={[0.07, 0.01, 0.01]} />{mat('#8a3b3b')}</mesh>;
  }
  if (expr === 'happy') {
    return (
      <mesh position={[0, -0.075, 0.175]} rotation={[0, 0, Math.PI]}>
        <circleGeometry args={[0.045, 24, 0, Math.PI]} />
        <meshStandardMaterial color="#6b1f2a" side={THREE.DoubleSide} />
      </mesh>
    );
  }
  const frown = expr === 'serious';
  return (
    <mesh position={[0, frown ? -0.1 : -0.07, 0.178]} rotation={[0, 0, frown ? 0 : Math.PI]}>
      <torusGeometry args={[0.04, 0.008, 8, 24, Math.PI]} />
      {mat('#8a3b3b')}
    </mesh>
  );
};

const Head: React.FC<{ c: CharacterConfig }> = ({ c }) => {
  const female = c.gender === 'female';
  return (
    <group position={[0, 1.72, 0]} scale={1.18}>
      <mesh scale={[0.92, 1.1, 0.96]}>
        <sphereGeometry args={[0.2, 40, 32]} />
        {mat(c.skinTone, 0.55)}
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.185, 0, 0]} scale={[0.5, 1, 0.8]}><sphereGeometry args={[0.045, 16, 12]} />{mat(c.skinTone, 0.55)}</mesh>
          <mesh position={[s * 0.07, 0.03, 0.165]}><sphereGeometry args={[0.032, 20, 16]} />{mat('#ffffff', 0.3)}</mesh>
          <mesh position={[s * 0.07, 0.03, 0.192]}><sphereGeometry args={[0.018, 16, 12]} />{mat(c.eyeColor, 0.3)}</mesh>
          <mesh position={[s * 0.07, 0.03, 0.205]}><sphereGeometry args={[0.008, 10, 8]} />{mat('#050505', 0.2)}</mesh>
          <mesh position={[s * 0.072, 0.085, 0.178]} rotation={[0, 0, s * (c.expression === 'serious' ? 0.25 : -0.08)]}>
            <boxGeometry args={[0.065, female ? 0.009 : 0.014, 0.012]} />{mat(c.hairColor)}
          </mesh>
          {c.earrings && <mesh position={[s * 0.19, -0.06, 0.01]}><sphereGeometry args={[0.014, 12, 10]} /><meshStandardMaterial color="#f5c542" metalness={0.9} roughness={0.2} /></mesh>}
          {c.glasses && (
            <mesh position={[s * 0.07, 0.03, 0.205]}><torusGeometry args={[0.045, 0.007, 8, 28]} /><meshStandardMaterial color="#111827" metalness={0.4} roughness={0.3} /></mesh>
          )}
        </group>
      ))}
      {c.glasses && <mesh position={[0, 0.035, 0.21]}><boxGeometry args={[0.05, 0.008, 0.008]} />{mat('#111827')}</mesh>}
      <mesh position={[0, -0.015, 0.2]} scale={[0.8, 1.1, 1]}><sphereGeometry args={[0.026, 16, 12]} />{mat(c.skinTone, 0.5)}</mesh>
      <Mouth expr={c.expression} />
      {c.beard && (
        <mesh position={[0, -0.06, 0.02]} rotation={[0.2, 0, 0]} scale={[0.95, 1.05, 1]}>
          <sphereGeometry args={[0.2, 32, 16, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.4]} />
          {mat(c.hairColor, 0.95)}
        </mesh>
      )}
      <Hair c={c} />
      {c.hat && (
        <group position={[0, 0.17, -0.01]}>
          <mesh><cylinderGeometry args={[0.2, 0.21, 0.12, 32]} />{mat('#1f2937')}</mesh>
          <mesh position={[0, -0.055, 0.08]}><cylinderGeometry args={[0.24, 0.24, 0.015, 32, 1, false, -Math.PI / 2, Math.PI]} />{mat('#1f2937')}</mesh>
        </group>
      )}
    </group>
  );
};

const Character: React.FC<{ c: CharacterConfig }> = ({ c }) => {
  const torso = useRef<THREE.Mesh>(null);
  const w = { slim: 0.86, average: 1, athletic: 1.14, heavy: 1.28 }[c.bodyType];
  const shoulder = c.bodyType === 'athletic' ? 1.12 : 1;
  const female = c.gender === 'female';
  const top = c.topStyle === 'suit' ? c.topColor : c.topColor;
  useFrame(({ clock }) => {
    if (torso.current) torso.current.scale.y = 1 + Math.sin(clock.elapsedTime * 1.6) * 0.012;
  });
  return (
    <group scale={[1, c.height, 1]}>
      {/* legs + shoes */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.12 * w, 0.45, 0]}><capsuleGeometry args={[0.1 * w, 0.62, 8, 16]} />{mat(c.bottomColor)}</mesh>
          <mesh position={[s * 0.12 * w, 0.05, 0.04]}><boxGeometry args={[0.15, 0.08, 0.26]} />{mat('#1a1a1a', 0.4)}</mesh>
        </group>
      ))}
      {/* torso */}
      <mesh ref={torso} position={[0, 1.13, 0]} scale={[w * shoulder * (female ? 0.92 : 1), 1, 0.68 * w]}>
        <capsuleGeometry args={[0.22, 0.4, 10, 24]} />
        {mat(top, 0.75)}
      </mesh>
      {/* shirt / suit details */}
      {(c.topStyle === 'suit' || c.topStyle === 'shirt') && (
        <mesh position={[0, 1.27, 0.17 * w]} rotation={[0.12, 0, 0]}>
          <coneGeometry args={[0.09, 0.26, 3]} />
          {mat('#f8fafc', 0.5)}
        </mesh>
      )}
      {c.topStyle === 'suit' && (
        <mesh position={[0, 1.2, 0.188 * w]} rotation={[0.1, 0, Math.PI]}>
          <coneGeometry args={[0.028, 0.24, 4]} />
          {mat(c.tieColor, 0.5)}
        </mesh>
      )}
      {c.topStyle === 'hoodie' && (
        <mesh position={[0, 1.42, -0.09]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.15, 0.06, 12, 24]} />
          {mat(top, 0.85)}
        </mesh>
      )}
      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.29 * w * shoulder, 1.12, 0]} rotation={[0, 0, s * 0.12]}>
          <mesh><capsuleGeometry args={[0.058 * w, 0.46, 8, 16]} />{mat(c.topStyle === 'tshirt' ? c.skinTone : top, 0.75)}</mesh>
          {c.topStyle === 'tshirt' && <mesh position={[0, 0.2, 0]}><capsuleGeometry args={[0.082 * w, 0.12, 8, 16]} />{mat(top, 0.75)}</mesh>}
          <mesh position={[0, -0.33, 0]}><sphereGeometry args={[0.055, 16, 12]} />{mat(c.skinTone, 0.55)}</mesh>
        </group>
      ))}
      {/* neck */}
      <mesh position={[0, 1.46, 0]}><cylinderGeometry args={[0.065, 0.075, 0.12, 20]} />{mat(c.skinTone, 0.55)}</mesh>
      <Head c={c} />
    </group>
  );
};

/* ───────────────────────── Scene plumbing ───────────────────────── */
const Rig: React.FC<{ angle: number; zoom: number; children: React.ReactNode; mode: string }> = ({ angle, zoom, children, mode }) => {
  const g = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useFrame(() => {
    if (g.current) g.current.rotation.y += ((angle * Math.PI) / 180 - g.current.rotation.y) * 0.12;
    const targetZ = (mode === 'photo' ? 3.1 : 4.1) / zoom;
    camera.position.z += (targetZ - camera.position.z) * 0.12;
  });
  return <group ref={g}>{children}</group>;
};

const AvatarStage = forwardRef<AvatarStageHandle, Props>(
  ({ config, angle = 0, zoom = 1, autoRotate = false, interactive = true, className = '' }, ref) => {
    const glRef = useRef<THREE.WebGLRenderer | null>(null);
    const bg = BACKGROUNDS[config.background] || BACKGROUNDS.studio;

    useImperativeHandle(ref, () => ({
      snapshot: async () => {
        const gl = glRef.current;
        if (!gl) return null;
        const src = gl.domElement;
        const out = document.createElement('canvas');
        out.width = src.width; out.height = src.height;
        const ctx = out.getContext('2d')!;
        const grad = ctx.createLinearGradient(0, 0, out.width * 0.4, out.height);
        grad.addColorStop(0, bg.stops[0]); grad.addColorStop(1, bg.stops[1]);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(src, 0, 0);
        return canvasToBlob(out, 'image/png');
      },
    }), [bg]);

    const target = useMemo(() => new THREE.Vector3(0, config.mode === 'photo' ? 1.15 : 1.05, 0), [config.mode]);

    return (
      <div className={`relative w-full h-full ${className}`} style={{ background: bg.css }} data-testid="avatar-3d-stage">
        <Canvas
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          camera={{ position: [0, 1.3, 3.2], fov: 35 }}
          onCreated={({ gl }) => { glRef.current = gl; gl.setClearColor(0x000000, 0); }}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[2.5, 4, 3]} intensity={1.4} />
          <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#c7bfff" />
          <Suspense fallback={null}>
            <Rig angle={angle} zoom={zoom} mode={config.mode}>
              {config.mode === 'photo' ? <PhotoCard config={config} /> : <Character c={config.character} />}
            </Rig>
            <ContactShadows position={[0, 0.005, 0]} opacity={0.35} scale={4} blur={2.4} far={2} />
          </Suspense>
          <OrbitControls
            enabled={interactive}
            enablePan={false}
            enableZoom={false}
            target={target}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.85}
          />
        </Canvas>
        {config.mode === 'photo' && !config.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">Pick an avatar to preview in 3D</div>
        )}
      </div>
    );
  },
);
AvatarStage.displayName = 'AvatarStage';

export default AvatarStage;
