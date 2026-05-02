"use client";

import { useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export default function IntroLogo() {
  const logoRef = useRef();
  const groupRef = useRef();
  const glowRef = useRef();
  const texture = useTexture("/gallery/logo.png");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" }
      });

      // Initial state: hidden and tilted
      gsap.set(groupRef.current.scale, { x: 0, y: 0, z: 0 });
      gsap.set(groupRef.current.rotation, { x: 0.5, y: -0.5, z: 0.1 });
      gsap.set(logoRef.current.material, { opacity: 0 });
      if (glowRef.current) gsap.set(glowRef.current.scale, { x: 0, y: 0, z: 0 });

      // The "Cinematic Reveal"
      tl.to(groupRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.8,
        ease: "expo.out"
      })
      .to(groupRef.current.rotation, {
        x: 0, y: 0, z: 0,
        duration: 2.5,
        ease: "power2.inOut"
      }, 0.2)
      .to(logoRef.current.material, {
        opacity: 1,
        duration: 1.2
      }, 0.5)
      .to(glowRef.current.scale, {
        x: 1.2, y: 1.2, z: 1.2,
        duration: 2,
        ease: "elastic.out(1, 0.5)"
      }, 0.8);

      // Subtle continuous floating and tilting
      gsap.to(groupRef.current.position, {
        y: 0.15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(groupRef.current.rotation, {
        y: 0.1,
        x: 0.05,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, groupRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <group ref={groupRef}>
        {/* Main Logo Plane */}
        <mesh ref={logoRef} position={[0, 0, 0.2]}>
          <planeGeometry args={[3.2, 3.2]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={0} 
            side={THREE.DoubleSide}
            alphaTest={0.01}
          />
        </mesh>
        
        {/* Premium Glow / Backdrop */}
        <mesh ref={glowRef} position={[0, 0, -0.1]}>
          <circleGeometry args={[2.2, 64]} />
          <MeshDistortMaterial
            color="#FF9933"
            speed={2}
            distort={0.2}
            radius={1}
            transparent
            opacity={0.1}
          />
        </mesh>

        {/* Outer Ring Glow */}
        <mesh position={[0, 0, -0.2]}>
          <ringGeometry args={[2.3, 2.35, 64]} />
          <meshBasicMaterial 
            color="#138808" 
            transparent 
            opacity={0.05} 
          />
        </mesh>
      </group>

      <Environment preset="studio" />
      <ambientLight intensity={0.8} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#FF9933" 
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#138808" />
    </>
  );
}

