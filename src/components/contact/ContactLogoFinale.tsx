import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  getLogoRenderProfile,
  LOGO_RENDER_PROFILES,
  type LogoRenderProfile,
} from './ContactLogoFinale.profile';

const LOGO_PATH =
  'M145 191 L367 511 L145 832 L394 832 L512 664 L629 832 L878 832 ' +
  'L656 513 L878 191 L629 191 L512 359 L394 191 Z ' +
  'M218 229 L373 228 L512 425 L650 228 L804 228 L610 512 ' +
  'L805 794 L650 795 L511 598 L373 795 L219 795 L413 511 Z';

const SPHERE_RADIUS = 12;
const CORE_SIZE = 6.5;
const ARC_SEGMENTS = 32;

const THEMES = [
  { name: 'PURE WHITE', base: '#ffffff', core: '#ffffff' },
  { name: 'SOFT CITRON', base: '#c9d87a', core: '#d9e59d' },
  { name: 'CYBER CYAN', base: '#00e5ff', core: '#00bbdd' },
  { name: 'SOLAR GOLD', base: '#ffb700', core: '#ff9200' },
  { name: 'NEON MAGENTA', base: '#ff0055', core: '#ff0033' },
] as const;

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
    const update = (): void => {
      setReduced(media.matches);
    };
    update();
    media.addEventListener('change', update);
    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  return reduced;
}

function detectRenderProfile(): LogoRenderProfile {
  const extendedNavigator = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  return getLogoRenderProfile({
    width: window.innerWidth,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: extendedNavigator.deviceMemory,
    saveData: extendedNavigator.connection?.saveData,
  });
}

function useRenderProfile(): LogoRenderProfile {
  const [profile, setProfile] = useState<LogoRenderProfile>(
    LOGO_RENDER_PROFILES.high
  );

  useEffect(() => {
    const update = (): void => {
      setProfile(detectRenderProfile());
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  return profile;
}

function createLogoTexture(glow: boolean): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (context) {
    if (glow) {
      const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size * 0.42
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0.22)');
      gradient.addColorStop(0.58, 'rgba(255,255,255,0.06)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }

    const path = new Path2D(LOGO_PATH);
    const centerX = (145 + 878) / 2;
    const centerY = (191 + 832) / 2;
    const scale = Math.min(
      (size * 0.9) / (878 - 145),
      (size * 0.9) / (832 - 191)
    );

    context.save();
    context.translate(size / 2, size / 2);
    context.scale(scale, scale);
    context.translate(-centerX, -centerY);
    context.fillStyle = '#ffffff';
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

function createStarGeometry(count: number): THREE.BufferGeometry {
  const random = seededRandom(20260828 + count);
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * 300;
    positions[offset + 1] = (random() - 0.5) * 170;
    positions[offset + 2] = -12 - random() * 250;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function createParticleGeometry(count: number): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(1.1, 1.1);
  const phases = new Float32Array(count);
  const random = seededRandom(861213 + count);
  for (let index = 0; index < count; index += 1) {
    phases[index] = random() * Math.PI * 2;
  }
  geometry.setAttribute(
    'aPhase',
    new THREE.InstancedBufferAttribute(phases, 1)
  );
  return geometry;
}

function createParticleMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#ffffff') },
    },
    vertexShader: `
      attribute float aPhase;
      uniform float uTime;
      varying vec2 vUv;
      varying float vPhase;
      varying vec3 vWorldPos;
      varying float vDepth;
      void main() {
        vUv = uv;
        vPhase = aPhase;
        vec3 instancePosition = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        float scale = length(vec3(instanceMatrix[0][0], instanceMatrix[0][1], instanceMatrix[0][2]));
        instancePosition += normalize(instancePosition) * sin(uTime * 1.2 + aPhase) * 0.38;
        vWorldPos = instancePosition;
        vec4 cameraPosition = viewMatrix * modelMatrix * vec4(instancePosition, 1.0);
        vDepth = clamp(-cameraPosition.z / 48.0, 0.0, 1.0);
        cameraPosition.xy += position.xy * scale;
        gl_Position = projectionMatrix * cameraPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec3 uBaseColor;
      varying vec2 vUv;
      varying float vPhase;
      varying vec3 vWorldPos;
      varying float vDepth;
      void main() {
        vec4 textureColor = texture2D(uTexture, vUv);
        float distanceFromCenter = length(vUv - 0.5);
        float aura = smoothstep(0.5, 0.1, distanceFromCenter) * 0.2;
        float alpha = textureColor.a + aura;
        if (alpha < 0.035) discard;
        float pulse = sin(uTime * 1.8 + vPhase) * 0.5 + 0.5;
        float waveOne = sin(vWorldPos.y * 0.35 + vWorldPos.x * 0.2 - uTime * 3.2);
        float waveTwo = sin(vWorldPos.z * 0.3 - vWorldPos.y * 0.25 + uTime * 2.6);
        float hit = smoothstep(0.68, 1.0, waveOne) * 0.65 + smoothstep(0.72, 1.0, waveTwo) * 0.45;
        vec3 color = mix(uBaseColor * 0.82, uBaseColor * 1.25 + vec3(0.38), pulse * 0.38);
        color += uBaseColor * hit * 1.32 + vec3(1.0) * hit * 0.3;
        float depthFade = 0.55 + 0.45 * (1.0 - vDepth);
        gl_FragColor = vec4(color * depthFade, alpha * (0.52 + pulse * 0.34 + hit * 0.32) * depthFade);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

interface ArcData {
  geometry: THREE.BufferGeometry;
  directions: THREE.Vector3[];
  phases: number[];
  count: number;
}

function createArcData(count: number): ArcData {
  const random = seededRandom(32535409 + count);
  const totalVertices = count * (ARC_SEGMENTS + 1);
  const positions = new Float32Array(totalVertices * 3);
  const alphas = new Float32Array(totalVertices);
  const indices: number[] = [];
  const directions: THREE.Vector3[] = [];
  const phases: number[] = [];

  for (let arc = 0; arc < count; arc += 1) {
    const base = arc * (ARC_SEGMENTS + 1);
    for (let segment = 0; segment < ARC_SEGMENTS; segment += 1) {
      indices.push(base + segment, base + segment + 1);
    }
    const phi = Math.acos(2 * random() - 1);
    const theta = random() * Math.PI * 2;
    directions.push(
      new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).normalize()
    );
    phases.push(random() * Math.PI * 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setIndex(indices);
  return { geometry, directions, phases, count };
}

function createArcMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uBaseColor: { value: new THREE.Color('#ffffff') } },
    vertexShader: `
      attribute float aAlpha;
      varying float vAlpha;
      void main() {
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uBaseColor;
      varying float vAlpha;
      void main() {
        if (vAlpha < 0.01) discard;
        vec3 color = mix(uBaseColor * 1.35, vec3(1.0), vAlpha * 0.8);
        gl_FragColor = vec4(color, vAlpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

interface TravellerConfig {
  axis: THREE.Vector3;
  perpendicular: THREE.Vector3;
  speed: number;
  phase: number;
  radius: number;
}

interface TravellerData {
  geometry: THREE.BufferGeometry;
  configs: TravellerConfig[];
}

function createTravellerData(count: number): TravellerData {
  const random = seededRandom(20260430 + count);
  const positions = new Float32Array(count * 3);
  const configs = Array.from({ length: count }, () => {
    const axis = new THREE.Vector3(
      random() - 0.5,
      random() - 0.5,
      random() - 0.5
    ).normalize();
    const perpendicular = new THREE.Vector3(
      random() - 0.5,
      random() - 0.5,
      random() - 0.5
    )
      .cross(axis)
      .normalize();
    return {
      axis,
      perpendicular,
      speed: 0.35 + random() * 0.8,
      phase: random() * Math.PI * 2,
      radius: SPHERE_RADIUS * (0.91 + random() * 0.1),
    };
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return { geometry, configs };
}

function LogoScene({
  profile,
  hovered,
  theme,
}: {
  profile: LogoRenderProfile;
  hovered: boolean;
  theme: (typeof THEMES)[number];
}): ReactElement {
  const particleRef = useRef<THREE.InstancedMesh>(null);
  const mainGroupRef = useRef<THREE.Group>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const logoRef = useRef<THREE.Sprite>(null);
  const coreMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const haloMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const speedRef = useRef(1);
  const motionTimeRef = useRef(0);
  const { viewport } = useThree();
  const logoOffset = viewport.width > 42 ? 7 : viewport.width > 24 ? 4.2 : 0;

  const logoTexture = useMemo(() => createLogoTexture(false), []);
  const logoGlowTexture = useMemo(() => createLogoTexture(true), []);
  const particleGeometry = useMemo(
    () => createParticleGeometry(profile.particles),
    [profile.particles]
  );
  const particleMaterial = useMemo(
    () => createParticleMaterial(logoTexture),
    [logoTexture]
  );
  const starGeometry = useMemo(
    () => createStarGeometry(profile.stars),
    [profile.stars]
  );
  const arcData = useMemo(() => createArcData(profile.arcs), [profile.arcs]);
  const arcMaterial = useMemo(() => createArcMaterial(), []);
  const travellerData = useMemo(
    () => createTravellerData(profile.travellers),
    [profile.travellers]
  );
  const targetBaseColor = useMemo(
    () => new THREE.Color(theme.base),
    [theme.base]
  );
  const targetCoreColor = useMemo(
    () => new THREE.Color(theme.core),
    [theme.core]
  );
  const travellerQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const travellerPoint = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const mesh = particleRef.current;
    if (!mesh) {
      return;
    }
    const dummy = new THREE.Object3D();
    const random = seededRandom(861213 + profile.particles);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < profile.particles; index += 1) {
      const y = 1 - (index / Math.max(profile.particles - 1, 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * index;
      const radius = SPHERE_RADIUS + (random() - 0.5) * 1.5;
      dummy.position.set(
        Math.cos(theta) * radiusAtY * radius,
        y * radius,
        Math.sin(theta) * radiusAtY * radius
      );
      const scale = 0.45 + random() * 0.72;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [profile.particles]);

  useEffect(
    () => () => {
      logoTexture.dispose();
      logoGlowTexture.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      starGeometry.dispose();
      arcData.geometry.dispose();
      arcMaterial.dispose();
      travellerData.geometry.dispose();
    },
    [
      arcData,
      arcMaterial,
      logoGlowTexture,
      logoTexture,
      particleGeometry,
      particleMaterial,
      starGeometry,
      travellerData,
    ]
  );

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const targetSpeed = hovered ? 3.8 : 1;
    speedRef.current = THREE.MathUtils.damp(
      speedRef.current,
      targetSpeed,
      hovered ? 4.2 : 2.4,
      delta
    );
    motionTimeRef.current += delta * (0.72 + speedRef.current * 0.28);
    const motionTime = motionTimeRef.current;

    const timeUniform = particleMaterial.uniforms['uTime'] as
      | THREE.IUniform<number>
      | undefined;
    const particleColorUniform = particleMaterial.uniforms['uBaseColor'] as
      | THREE.IUniform<THREE.Color>
      | undefined;
    const arcColorUniform = arcMaterial.uniforms['uBaseColor'] as
      | THREE.IUniform<THREE.Color>
      | undefined;
    if (timeUniform) {
      timeUniform.value = motionTime;
    }
    particleColorUniform?.value.lerp(targetBaseColor, 0.055);
    arcColorUniform?.value.lerp(targetBaseColor, 0.055);

    const coreMaterial = coreMaterialRef.current;
    const haloMaterial = haloMaterialRef.current;
    if (coreMaterial) {
      coreMaterial.color.lerp(targetCoreColor, 0.055);
    }
    if (haloMaterial) {
      haloMaterial.color.lerp(targetCoreColor, 0.055);
    }

    const group = mainGroupRef.current;
    if (group) {
      group.rotation.y += delta * 0.09 * speedRef.current;
      group.rotation.z = THREE.MathUtils.damp(
        group.rotation.z,
        state.pointer.x * 0.08,
        2.8,
        delta
      );
      group.rotation.x = THREE.MathUtils.damp(
        group.rotation.x,
        state.pointer.y * 0.1,
        2.8,
        delta
      );
    }

    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y += delta * 0.045 * speedRef.current;
    }

    if (logoRef.current) {
      const pulse = 1 + Math.sin(time * 1.7) * 0.022;
      logoRef.current.scale.set(CORE_SIZE * pulse, CORE_SIZE * pulse, 1);
    }

    const arcPositionAttribute = arcData.geometry.getAttribute(
      'position'
    ) as THREE.BufferAttribute;
    const arcAlphaAttribute = arcData.geometry.getAttribute(
      'aAlpha'
    ) as THREE.BufferAttribute;
    const arcPositions = arcPositionAttribute.array as Float32Array;
    const arcAlphas = arcAlphaAttribute.array as Float32Array;
    for (let arc = 0; arc < arcData.count; arc += 1) {
      const direction = arcData.directions[arc];
      if (!direction) {
        continue;
      }
      const base = arc * (ARC_SEGMENTS + 1);
      const front =
        ((motionTime * 0.75 + (arcData.phases[arc] ?? 0) * 0.55) % 1.6) / 1.6;
      for (let segment = 0; segment <= ARC_SEGMENTS; segment += 1) {
        const progress = segment / ARC_SEGMENTS;
        const radius = progress * SPHERE_RADIUS;
        const vertex = base + segment;
        arcPositions[vertex * 3] = direction.x * radius;
        arcPositions[vertex * 3 + 1] = direction.y * radius;
        arcPositions[vertex * 3 + 2] = direction.z * radius;
        const head = Math.max(0, 1 - Math.abs(progress - front) / 0.16);
        const tail =
          progress < front
            ? Math.max(0, 1 - (front - progress) / 0.62) * 0.55
            : 0;
        arcAlphas[vertex] = Math.min(1, head + tail);
      }
    }
    arcPositionAttribute.needsUpdate = true;
    arcAlphaAttribute.needsUpdate = true;

    const travellerPositionAttribute = travellerData.geometry.getAttribute(
      'position'
    ) as THREE.BufferAttribute;
    const travellerPositions = travellerPositionAttribute.array as Float32Array;
    travellerData.configs.forEach((traveller, index) => {
      travellerQuaternion.setFromAxisAngle(
        traveller.axis,
        motionTime * traveller.speed + traveller.phase
      );
      travellerPoint
        .copy(traveller.perpendicular)
        .applyQuaternion(travellerQuaternion)
        .multiplyScalar(traveller.radius);
      travellerPositions[index * 3] = travellerPoint.x;
      travellerPositions[index * 3 + 1] = travellerPoint.y;
      travellerPositions[index * 3 + 2] = travellerPoint.z;
    });
    travellerPositionAttribute.needsUpdate = true;
  });

  return (
    <>
      <fog attach="fog" args={['#000000', 38, 170]} />
      <points geometry={starGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={0.18}
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <group position={[logoOffset, 0, 0]}>
        <mesh position={[0, 0, -0.3]}>
          <circleGeometry args={[CORE_SIZE * 0.72, 64]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.92} />
        </mesh>
        <sprite
          scale={[CORE_SIZE * 2.6, CORE_SIZE * 2.6, 1]}
          position={[0, 0, -0.12]}
        >
          <spriteMaterial
            ref={haloMaterialRef}
            map={logoGlowTexture}
            color={theme.core}
            transparent
            opacity={0.36}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
        <sprite
          ref={logoRef}
          scale={[CORE_SIZE, CORE_SIZE, 1]}
          position={[0, 0, 0.08]}
        >
          <spriteMaterial
            ref={coreMaterialRef}
            map={logoTexture}
            color={theme.core}
            transparent
            opacity={0.94}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
        <group ref={mainGroupRef}>
          <instancedMesh
            ref={particleRef}
            args={[particleGeometry, undefined, profile.particles]}
            frustumCulled={false}
          >
            <primitive object={particleMaterial} attach="material" />
          </instancedMesh>
          <lineSegments geometry={arcData.geometry} frustumCulled={false}>
            <primitive object={arcMaterial} attach="material" />
          </lineSegments>
          <points geometry={travellerData.geometry} frustumCulled={false}>
            <pointsMaterial
              color={theme.base}
              size={0.19}
              transparent
              opacity={0.96}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              sizeAttenuation
            />
          </points>
          <group ref={ringGroupRef}>
            {[0, 1, 2].map((ring) => (
              <mesh
                key={ring}
                rotation={
                  ring === 0
                    ? [Math.PI / 2, 0, 0]
                    : ring === 1
                      ? [Math.PI / 5, Math.PI / 4, 0]
                      : [-Math.PI / 7, Math.PI / 2, 0]
                }
              >
                <ringGeometry
                  args={[SPHERE_RADIUS * 0.91, SPHERE_RADIUS * 0.935, 128]}
                />
                <meshBasicMaterial
                  color={theme.base}
                  transparent
                  opacity={0.08 - ring * 0.015}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            ))}
          </group>
        </group>
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
  const profile = useRenderProfile();
  const [nearViewport, setNearViewport] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [webGl, setWebGl] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const theme = THEMES[themeIndex] ?? THEMES[0];

  useEffect(() => {
    setWebGl(hasWebGlSupport());
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearViewport(Boolean(entry?.isIntersecting));
      },
      { rootMargin: '260px 0px', threshold: 0.01 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const update = (): void => {
      setPageVisible(document.visibilityState === 'visible');
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const showCanvas = webGl && nearViewport && pageVisible && !reducedMotion;

  return (
    <section
      ref={containerRef}
      className={`rp-logo-finale rp-logo-finale--${profile.quality}`}
      aria-labelledby="rp-logo-finale-title"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          setHovered(true);
        }
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
      data-motion={hovered ? 'accelerated' : 'ambient'}
    >
      <div className="rp-logo-finale__canvas" aria-hidden="true">
        {showCanvas ? (
          <Suspense fallback={<StaticFinale />}>
            <Canvas
              camera={{ position: [0, 0, 38], fov: 42, near: 0.1, far: 400 }}
              dpr={[1, profile.maxDpr]}
              gl={{
                antialias: profile.antialias,
                alpha: false,
                powerPreference:
                  profile.quality === 'low' ? 'low-power' : 'high-performance',
              }}
              onCreated={({ gl }) => {
                gl.setClearColor('#000000', 1);
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 0.82;
              }}
            >
              <LogoScene profile={profile} hovered={hovered} theme={theme} />
            </Canvas>
          </Suspense>
        ) : (
          <StaticFinale />
        )}
      </div>
      <div className="rp-logo-finale__scanlines" aria-hidden="true" />
      <div className="rp-logo-finale__veil" aria-hidden="true" />
      <div className="rp-logo-finale__theme" aria-label="3D 로고 색상 선택">
        <div className="rp-logo-finale__swatches">
          {THEMES.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`${item.name} 테마`}
              aria-pressed={themeIndex === index}
              onClick={() => {
                setThemeIndex(index);
              }}
              style={{ '--theme-color': item.base } as CSSProperties}
            />
          ))}
        </div>
        <span>{theme.name}</span>
      </div>
      <div className="rp-logo-finale__copy">
        <p>EXPLAINABLE INTELLIGENCE FOR WORK</p>
        <h2 id="rp-logo-finale-title">
          근거를 연결해,
          <br />더 나은 결정을 만듭니다.
        </h2>
        <span>XAIKOREA</span>
      </div>
      <div className="rp-logo-finale__stats" aria-hidden="true">
        <span>NODES — {profile.particles}</span>
        <span>QUALITY — {profile.quality.toUpperCase()}</span>
        <span>MOTION — {hovered ? 'ACCELERATED' : 'AMBIENT'}</span>
      </div>
      <div className="rp-logo-finale__index" aria-hidden="true">
        <span>KNOWLEDGE</span>
        <i />
        <span>TRUST</span>
      </div>
    </section>
  );
}
