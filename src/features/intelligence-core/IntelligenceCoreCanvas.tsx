import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import * as THREE from 'three';
import { BlackHole } from './BlackHole';

type IntelligenceCoreCanvasProps = {
  stateIndex: number;
};

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function IntelligenceCoreCanvas({
  stateIndex,
}: IntelligenceCoreCanvasProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [lowPower, setLowPower] = useState(true);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const limitedCpu = navigator.hardwareConcurrency <= 4;
    setLowPower(window.innerWidth < 900 || limitedCpu);
    setCanRender(!reducedMotion && supportsWebGL());
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null || !canRender) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry?.isIntersecting ?? false);
      },
      { rootMargin: '220px 0px', threshold: 0 }
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
    };
  }, [canRender]);

  return (
    <div
      ref={rootRef}
      className={`ra-intelligence-core${isReady ? ' is-ready' : ''}`}
      aria-hidden="true"
    >
      {canRender && isNearViewport ? (
        <Canvas
          camera={{ fov: 40, position: [54, 22, 54], near: 0.1, far: 400 }}
          dpr={lowPower ? 1 : [1, 1.25]}
          fallback={null}
          gl={{
            antialias: !lowPower,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.28,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#080b0b', 1);
            setIsReady(true);
          }}
        >
          <BlackHole stateIndex={stateIndex} lowPower={lowPower} />
          <EffectComposer multisampling={lowPower ? 0 : 2}>
            <Bloom
              intensity={lowPower ? 0.42 : 0.62}
              luminanceSmoothing={0.72}
              luminanceThreshold={0.28}
              mipmapBlur={!lowPower}
            />
          </EffectComposer>
        </Canvas>
      ) : null}
    </div>
  );
}
