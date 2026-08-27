import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LOGO_PATH =
  'M145 191 L367 511 L145 832 L394 832 L512 664 L629 832 L878 832 ' +
  'L656 513 L878 191 L629 191 L512 359 L394 191 Z ' +
  'M218 229 L373 228 L512 425 L650 228 L804 228 L610 512 ' +
  'L805 794 L650 795 L511 598 L373 795 L219 795 L413 511 Z';

function hasWebGlSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

function createLogoTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size * 0.49
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0.10)');
    gradient.addColorStop(0.62, 'rgba(201,216,122,0.04)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const path = new Path2D(LOGO_PATH);
    const centerX = (145 + 878) / 2;
    const centerY = (191 + 832) / 2;
    const scale = Math.min(
      (size * 0.72) / (878 - 145),
      (size * 0.72) / (832 - 191)
    );

    context.save();
    context.translate(size / 2, size / 2);
    context.scale(scale, scale);
    context.translate(-centerX, -centerY);
    context.fillStyle = '#ffffff';
    context.shadowColor = 'rgba(201,216,122,0.38)';
    context.shadowBlur = 28;
    context.fill(path, 'evenodd');
    context.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createOrbGeometry(count: number): THREE.BufferGeometry {
  const random = seededRandom(861213);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const warmWhite = new THREE.Color('#f7f5ef');
  const citron = new THREE.Color('#c9d87a');
  const color = new THREE.Color();
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / Math.max(count - 1, 1)) * 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index + (random() - 0.5) * 0.09;
    const radius = 4.25 + (random() - 0.5) * 0.38;
    const offset = index * 3;

    positions[offset] = Math.cos(theta) * radial * radius;
    positions[offset + 1] = y * radius;
    positions[offset + 2] = Math.sin(theta) * radial * radius;

    color.copy(warmWhite).lerp(citron, random() > 0.78 ? 0.72 : 0.08);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function createStarGeometry(count: number): THREE.BufferGeometry {
  const random = seededRandom(20260828);
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * 46;
    positions[offset + 1] = (random() - 0.5) * 28;
    positions[offset + 2] = -4 - random() * 28;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function LogoScene({ reducedMotion }: { reducedMotion: boolean }): ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const logoRef = useRef<THREE.Sprite>(null);
  const orbGeometry = useMemo(() => createOrbGeometry(920), []);
  const starGeometry = useMemo(() => createStarGeometry(620), []);
  const logoTexture = useMemo(() => createLogoTexture(), []);

  useEffect(
    () => () => {
      orbGeometry.dispose();
      starGeometry.dispose();
      logoTexture.dispose();
    },
    [logoTexture, orbGeometry, starGeometry]
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || reducedMotion) return;

    group.rotation.y += delta * 0.105;
    group.rotation.z = THREE.MathUtils.damp(
      group.rotation.z,
      state.pointer.x * 0.085,
      2.8,
      delta
    );
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      state.pointer.y * 0.11,
      2.8,
      delta
    );

    if (logoRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.15) * 0.018;
      logoRef.current.scale.set(2.55 * pulse, 2.55 * pulse, 1);
    }
  });

  return (
    <>
      <fog attach="fog" args={['#050707', 16, 39]} />
      <ambientLight intensity={0.35} />
      <points geometry={starGeometry}>
        <pointsMaterial
          color="#f7f5ef"
          size={0.055}
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <group ref={groupRef} position={[1.65, 0, 0]}>
        <points geometry={orbGeometry}>
          <pointsMaterial
            size={0.09}
            vertexColors
            transparent
            opacity={0.92}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.46, 0.012, 6, 220]} />
          <meshBasicMaterial
            color="#c9d87a"
            transparent
            opacity={0.24}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 5, Math.PI / 4, 0]}>
          <torusGeometry args={[4.62, 0.01, 6, 220]} />
          <meshBasicMaterial
            color="#f7f5ef"
            transparent
            opacity={0.13}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, 0, -0.18]}>
          <circleGeometry args={[2.22, 72]} />
          <meshBasicMaterial color="#111817" transparent opacity={0.78} />
        </mesh>
        <sprite ref={logoRef} position={[0, 0, 0.05]} scale={[2.55, 2.55, 1]}>
          <spriteMaterial
            map={logoTexture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      </group>
    </>
  );
}

function StaticFinale(): ReactElement {
  return (
    <div className="rp-logo-finale__fallback" aria-hidden="true">
      <span />
      <img src="/assets/images/logo/logo-light.png" alt="" />
    </div>
  );
}

export default function ContactLogoFinale(): ReactElement {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [nearViewport, setNearViewport] = useState(false);
  const [webGl, setWebGl] = useState(true);

  useEffect(() => {
    setWebGl(hasWebGlSupport());
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(Boolean(entry?.isIntersecting)),
      { rootMargin: '320px 0px', threshold: 0.01 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const showCanvas = webGl && nearViewport && !reducedMotion;

  return (
    <section
      ref={containerRef}
      className="rp-logo-finale"
      aria-labelledby="rp-logo-finale-title"
    >
      <div className="rp-logo-finale__canvas" aria-hidden="true">
        {showCanvas ? (
          <Suspense fallback={<StaticFinale />}>
            <Canvas
              camera={{ position: [0, 0, 13.5], fov: 46, near: 0.1, far: 80 }}
              dpr={[1, 1.5]}
              gl={{
                antialias: false,
                alpha: false,
                powerPreference: 'high-performance',
              }}
              onCreated={({ gl }) => {
                gl.setClearColor('#050707', 1);
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 0.88;
              }}
            >
              <LogoScene reducedMotion={false} />
            </Canvas>
          </Suspense>
        ) : (
          <StaticFinale />
        )}
      </div>
      <div className="rp-logo-finale__veil" aria-hidden="true" />
      <div className="rp-logo-finale__copy">
        <p>EXPLAINABLE INTELLIGENCE FOR WORK</p>
        <h2 id="rp-logo-finale-title">
          근거를 연결해,
          <br />
          더 나은 결정을 만듭니다.
        </h2>
        <span>XAIKOREA</span>
      </div>
      <div className="rp-logo-finale__index" aria-hidden="true">
        <span>KNOWLEDGE</span>
        <i />
        <span>TRUST</span>
      </div>
    </section>
  );
}
