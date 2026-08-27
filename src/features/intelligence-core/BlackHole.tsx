import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  auraFragmentShader,
  auraVertexShader,
  diskFragmentShader,
  diskVertexShader,
  intelligenceStates,
} from './shaders';

const STANDARD_PARTICLES = 3200;
const LOW_POWER_PARTICLES = 1100;
const initialState = intelligenceStates[0];

type BlackHoleProps = {
  stateIndex: number;
  lowPower: boolean;
};

export function BlackHole({
  stateIndex,
  lowPower,
}: BlackHoleProps): ReactElement {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  const cameraDistance = useRef(initialState.cameraDistance);
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);
  const particleCount = lowPower ? LOW_POWER_PARTICLES : STANDARD_PARTICLES;

  const diskUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: initialState.morph },
      uCompression: { value: initialState.compression },
      uIntensity: { value: initialState.intensity },
      uOrbitScale: { value: initialState.orbit },
    }),
    []
  );

  const auraUniforms = useMemo(
    () => ({
      uIntensity: { value: initialState.intensity },
    }),
    []
  );

  const diskMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: diskUniforms,
        vertexShader: diskVertexShader,
        fragmentShader: diskFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [diskUniforms]
  );

  const auraMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: auraUniforms,
        vertexShader: auraVertexShader,
        fragmentShader: auraFragmentShader,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [auraUniforms]
  );

  const streakGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.012, 0.105, 2.15, 3);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  }, []);

  useEffect(() => {
    const mesh = instancesRef.current;
    if (mesh === null) {
      return;
    }

    const object = new THREE.Object3D();
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 5 + Math.pow(Math.random(), 1.28) * 40;
      const angle = Math.random() * Math.PI * 2;
      object.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * (7 / radius),
        Math.sin(angle) * radius
      );
      object.lookAt(
        object.position.x + Math.sin(angle),
        object.position.y,
        object.position.z - Math.cos(angle)
      );
      object.updateMatrix();
      mesh.setMatrixAt(index, object.matrix);
    }
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.instanceMatrix.needsUpdate = true;
  }, [particleCount]);

  useEffect(() => {
    const nextState = intelligenceStates[stateIndex] ?? initialState;
    const controls = controlsRef.current;
    const timeline = gsap.timeline({
      defaults: { duration: 2.35, ease: 'power3.inOut' },
    });

    timeline.to(diskUniforms.uMorph, { value: nextState.morph }, 0);
    timeline.to(diskUniforms.uCompression, { value: nextState.compression }, 0);
    timeline.to(diskUniforms.uIntensity, { value: nextState.intensity }, 0);
    timeline.to(diskUniforms.uOrbitScale, { value: nextState.orbit }, 0);
    timeline.to(auraUniforms.uIntensity, { value: nextState.intensity }, 0);
    timeline.to(camera.position, { y: nextState.cameraY }, 0);
    timeline.to(cameraDistance, { current: nextState.cameraDistance }, 0);
    if (controls !== null) {
      timeline.to(controls, { autoRotateSpeed: nextState.rotation }, 0);
    }

    return () => {
      timeline.kill();
    };
  }, [auraUniforms, camera, diskUniforms, stateIndex]);

  useEffect(
    () => () => {
      diskMaterial.dispose();
      auraMaterial.dispose();
      streakGeometry.dispose();
    },
    [auraMaterial, diskMaterial, streakGeometry]
  );

  useFrame((state) => {
    diskUniforms.uTime.value = state.clock.getElapsedTime();

    const instances = instancesRef.current;
    if (instances !== null) {
      instances.rotation.y += 0.00034;
    }

    const controls = controlsRef.current;
    if (controls !== null) {
      const direction = cameraDirection
        .subVectors(camera.position, controls.target)
        .normalize();
      camera.position.x =
        controls.target.x + direction.x * cameraDistance.current;
      camera.position.z =
        controls.target.z + direction.z * cameraDistance.current;
      controls.update();
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        autoRotate
        autoRotateSpeed={initialState.rotation}
        dampingFactor={0.035}
        enableDamping
        enablePan={false}
        enableRotate={false}
        enableZoom={false}
      />
      <mesh>
        <sphereGeometry args={[4, 48, 48]} />
        <meshBasicMaterial color="#020303" />
      </mesh>
      <mesh material={auraMaterial}>
        <sphereGeometry args={[4.25, 48, 48]} />
      </mesh>
      <instancedMesh
        key={particleCount}
        ref={instancesRef}
        args={[streakGeometry, diskMaterial, particleCount]}
      />
    </>
  );
}
