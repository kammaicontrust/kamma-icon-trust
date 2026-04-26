"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─────────── Floating Particles ─────────── */
function Particles({ count = 300 }) {
  const pointsRef = useRef();
  const { viewport } = useThree();

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = THREE.MathUtils.randFloatSpread(30);
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(20);
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(-15, 5);
      sz[i] = THREE.MathUtils.randFloat(0.02, 0.08);
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    // Very slow drift
    pointsRef.current.rotation.y += 0.0003;
    pointsRef.current.rotation.x += 0.0001;

    // Subtle parallax from pointer
    const mx = (state.pointer.x * viewport.width) / 80;
    const my = (state.pointer.y * viewport.height) / 80;
    pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, mx, 0.02);
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, my, 0.02);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FF9933"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────── Secondary Particles (green) ─────────── */
function ParticlesGreen({ count = 150 }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = THREE.MathUtils.randFloatSpread(25);
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(18);
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(-12, 3);
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y -= 0.0002;
    pointsRef.current.rotation.z += 0.0001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#138808"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────── Light Rays (volumetric lines) ─────────── */
function LightRay({ position, rotation, color, opacity = 0.06, scale = [0.03, 8, 0.03] }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.material.opacity = opacity + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <cylinderGeometry args={[1, 1, 1, 4]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─────────── Central Ring ─────────── */
function CinematicRing() {
  const ringRef = useRef();
  const innerRingRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      // Slow cinematic rotation
      ringRef.current.rotation.y += delta * 0.3;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
      ringRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.1) * 0.08;
    }
    if (innerRingRef.current) {
      // Counter-rotate the inner ring
      innerRingRef.current.rotation.y -= delta * 0.5;
      innerRingRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
      <group position={[0, 0, -8]} scale={0.55}>
        {/* Main outer ring */}
        <mesh ref={ringRef} castShadow>
          <torusGeometry args={[1.8, 0.12, 16, 80]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Inner ring (smaller, counter-rotating) */}
        <mesh ref={innerRingRef}>
          <torusGeometry args={[1.2, 0.06, 12, 64]} />
          <meshPhysicalMaterial
            color="#e8e0d0"
            metalness={0.8}
            roughness={0.15}
            envMapIntensity={1.5}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ─────────── Background Shapes (ghost wireframes for depth) ─────────── */
function BackgroundShapes() {
  const s1 = useRef();
  const s2 = useRef();

  useFrame((state) => {
    if (s1.current) {
      s1.current.rotation.y += 0.001;
      s1.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
    if (s2.current) {
      s2.current.rotation.z += 0.0008;
      s2.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.08) * 0.1;
    }
  });

  return (
    <>
      <mesh ref={s1} position={[4, -2, -10]} scale={1.5}>
        <icosahedronGeometry args={[2, 1]} />
        <meshBasicMaterial color="#FF9933" transparent opacity={0.03} wireframe />
      </mesh>
      <mesh ref={s2} position={[-5, 3, -12]} scale={2}>
        <octahedronGeometry args={[2, 0]} />
        <meshBasicMaterial color="#138808" transparent opacity={0.025} wireframe />
      </mesh>
    </>
  );
}

/* ─────────── Camera Rig ─────────── */
function CameraRig() {
  useFrame((state) => {
    // Slow cinematic sway
    const t = state.clock.elapsedTime;
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      Math.sin(t * 0.12) * 0.4 + state.pointer.x * 0.2,
      0.02
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      Math.cos(t * 0.1) * 0.25 + state.pointer.y * 0.15,
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─────────── Main Scene ─────────── */
export default function CinematicScene({ isMobile = false }) {
  const particleCount = isMobile ? 120 : 300;
  const greenParticleCount = isMobile ? 60 : 150;

  return (
    <>
      <color attach="background" args={["#fafafa"]} />
      <fog attach="fog" args={["#fafafa", 6, 22]} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[-6, 6, 4]} intensity={1.8} color="#FF9933" />
      <directionalLight position={[6, -4, 3]} intensity={1.4} color="#138808" />
      <pointLight position={[0, 0, 6]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 5, -2]} intensity={0.5} color="#FF9933" />
      <pointLight position={[4, -3, -4]} intensity={0.4} color="#138808" />

      {/* Environment for realistic reflections */}
      <Environment preset="studio" environmentIntensity={0.6} />

      {/* Camera movement */}
      <CameraRig />

      {/* Particles */}
      <Particles count={particleCount} />
      <ParticlesGreen count={greenParticleCount} />

      {/* Light Rays */}
      <LightRay position={[-4, 0, -3]} rotation={[0, 0, 0.3]} color="#FF9933" opacity={0.04} scale={[0.04, 14, 0.04]} />
      <LightRay position={[3, 2, -5]} rotation={[0, 0, -0.2]} color="#138808" opacity={0.035} scale={[0.03, 12, 0.03]} />
      <LightRay position={[0, -1, -4]} rotation={[0, 0, 0.1]} color="#ffffff" opacity={0.03} scale={[0.02, 10, 0.02]} />

      {/* Central Ring */}
      <CinematicRing />

      {/* Background Shapes */}
      <BackgroundShapes />
    </>
  );
}
