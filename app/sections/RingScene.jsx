"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function WeddingRing() {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.005;
      ringRef.current.rotation.x += 0.002;
    }
  });

  return (
    <Float
      speed={1.5} 
      rotationIntensity={1} 
      floatIntensity={2}
    >
      <mesh ref={ringRef} castShadow receiveShadow>
        <torusGeometry args={[2, 0.2, 32, 100]} />
        <meshStandardMaterial 
          color="#ffd700" 
          metalness={1} 
          roughness={0.1} 
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
}

export default function RingScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} />

      <Environment preset="city" />

      <WeddingRing />

      <ContactShadows 
        position={[0, -3.5, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2.4} 
        far={4.5} 
      />
    </>
  );
}
