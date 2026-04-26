"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ─── Ambient Particles ─── */
function LoaderParticles({ count = 80 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const saffron = new THREE.Color("#FF9933");
    const white = new THREE.Color("#ffffff");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = THREE.MathUtils.randFloatSpread(12);
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(8);
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(-8, 2);

      const c = Math.random() > 0.4 ? saffron : white;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += 0.0005;
    pointsRef.current.rotation.x += 0.0002;
    // Gentle breathing
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    pointsRef.current.scale.setScalar(s);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Glowing Torus Ring ─── */
function GlowRing() {
  const outerRef = useRef();
  const innerRef = useRef();
  const glowRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 1.2;
      outerRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      outerRef.current.rotation.z = Math.cos(t * 0.25) * 0.1;
    }

    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.8;
      innerRef.current.rotation.z = Math.sin(t * 0.4) * 0.25;
    }

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.08 + Math.sin(t * 1.5) * 0.04;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <group>
        {/* Outer ring — primary */}
        <mesh ref={outerRef}>
          <torusGeometry args={[1.6, 0.1, 16, 48]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transparent
            opacity={0.85}
            emissive="#FF9933"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Inner ring — thinner, counter-rotating */}
        <mesh ref={innerRef}>
          <torusGeometry args={[1.1, 0.04, 12, 40]} />
          <meshPhysicalMaterial
            color="#e8e0d0"
            metalness={0.85}
            roughness={0.12}
            clearcoat={0.8}
            transparent
            opacity={0.5}
            emissive="#138808"
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* Glow sphere behind ring */}
        <mesh ref={glowRef} scale={2.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#FF9933"
            transparent
            opacity={0.08}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ─── Camera Zoom-In Rig ─── */
function CameraZoom() {
  const started = useRef(false);
  const startZ = useRef(6);

  useFrame((state) => {
    if (!started.current) {
      startZ.current = state.camera.position.z;
      started.current = true;
    }

    const t = state.clock.elapsedTime;
    // Smooth zoom from 6 → 4 over ~2s
    const targetZ = THREE.MathUtils.lerp(6, 4, Math.min(t / 2, 1));
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);

    // Subtle sway
    state.camera.position.x = Math.sin(t * 0.2) * 0.15;
    state.camera.position.y = Math.cos(t * 0.15) * 0.1;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Main Exported Scene ─── */
export default function CinematicLoader3D({ isMobile = false }) {
  const particleCount = isMobile ? 40 : 80;

  return (
    <>
      <color attach="background" args={["#0A0A0A"]} />
      <fog attach="fog" args={["#0A0A0A", 4, 14]} />

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 4, 3]} intensity={2.5} color="#FF9933" />
      <directionalLight position={[4, -3, 2]} intensity={2} color="#138808" />
      <pointLight position={[0, 0, 5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-2, 3, -1]} intensity={0.8} color="#FF9933" />
      <pointLight position={[3, -2, -3]} intensity={0.5} color="#138808" />

      {/* Camera zoom effect */}
      <CameraZoom />

      {/* Particles */}
      <LoaderParticles count={particleCount} />

      {/* Main glowing ring */}
      <GlowRing />
    </>
  );
}
