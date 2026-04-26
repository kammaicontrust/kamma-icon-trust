"use client";

import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";

const CinematicLoader3D = dynamic(() => import("./CinematicLoader3D"), {
  ssr: false,
});

export default function CinematicTransition() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      {/* ── Radial glow behind the 3D scene ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 45%, rgba(255,153,51,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── 3D Canvas ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative h-56 w-56 sm:h-64 sm:w-64"
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 40 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <CinematicLoader3D isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </motion.div>

      {/* ── Text Reveal ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        {/* Title */}
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.35em" }}
          transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
          className="text-[15px] font-bold uppercase text-[#FF9933] sm:text-[17px]"
        >
          Kamma Icon Trust
        </motion.span>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
          className="h-px w-16 origin-center bg-gradient-to-r from-transparent via-[#FF9933]/40 to-transparent"
        />

        {/* Subtitle */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
          className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#138808] sm:text-[13px]"
        >
          Marriage Registration
        </motion.span>
      </motion.div>

      {/* ── Subtle corner vignette for depth ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </motion.div>
  );
}
