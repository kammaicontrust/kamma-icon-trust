"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Float, Text, MeshReflectorMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

export default function IntroLogo({ onComplete }) {
  const logoRef = useRef();
  const groupRef = useRef();
  const texture = useTexture("/gallery/logo.png");

  useFrame((state) => {
    if (groupRef.current) {
      // Slow smooth rotation
      groupRef.current.rotation.y += 0.005;
      
      // Zoom-in effect
      if (groupRef.current.scale.x < 1.2) {
        groupRef.current.scale.x += 0.001;
        groupRef.current.scale.y += 0.001;
        groupRef.current.scale.z += 0.001;
      }
    }
  });

  return (
    <>
      <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
        <mesh ref={logoRef}>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={1} 
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Soft Glow behind logo */}
        <mesh position={[0, 0, -0.1]}>
          <circleGeometry args={[2, 32]} />
          <meshBasicMaterial 
            color="#FF9933" 
            transparent 
            opacity={0.15} 
            blur={10} 
          />
        </mesh>
      </group>

      <Environment preset="studio" />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#FF9933" />
    </>
  );
}
