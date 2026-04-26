"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 200 }) {
  const points = useRef();
  const { viewport } = useThree();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(20);
      const y = THREE.MathUtils.randFloatSpread(20);
      const z = THREE.MathUtils.randFloatSpread(10);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      // Slow rotation
      points.current.rotation.y += 0.001;
      points.current.rotation.x += 0.0005;
      
      // Subtle parallax based on mouse
      const x = (state.mouse.x * viewport.width) / 100;
      const y = (state.mouse.y * viewport.height) / 100;
      points.current.position.x = THREE.MathUtils.lerp(points.current.position.x, x, 0.1);
      points.current.position.y = THREE.MathUtils.lerp(points.current.position.y, y, 0.1);
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FF9933"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function PremiumBackground() {
  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <fog attach="fog" args={["#ffffff", 5, 15]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FF9933" />
      
      <Particles count={window?.innerWidth < 768 ? 100 : 300} />
      
      {/* Abstract floating shapes */}
      <mesh position={[2, -2, -5]} rotation={[1, 1, 1]}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial color="#138808" transparent opacity={0.05} wireframe />
      </mesh>
      
      <mesh position={[-3, 3, -8]} rotation={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#0A1F44" transparent opacity={0.03} wireframe />
      </mesh>
    </>
  );
}
