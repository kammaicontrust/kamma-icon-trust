"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

export default function RingLoader3D() {
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      // Continuous smooth rotation on Y-axis
      ringRef.current.rotation.y += delta * 1.5;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      
      // Small camera movement for depth
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(state.clock.elapsedTime * 0.3) * 0.5, 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, Math.cos(state.clock.elapsedTime * 0.3) * 0.5, 0.05);
      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      {/* Saffron light */}
      <directionalLight position={[-5, 5, 2]} intensity={3} color="#FF9933" />
      {/* Green light */}
      <directionalLight position={[5, -5, 2]} intensity={3} color="#138808" />
      {/* Soft fill light */}
      <pointLight position={[0, 0, 5]} intensity={1} color="#ffffff" />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={ringRef} castShadow receiveShadow>
          <torusGeometry args={[1.5, 0.15, 16, 64]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>
    </>
  );
}
