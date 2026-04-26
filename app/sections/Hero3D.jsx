"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";

// Dynamically import the 3D scene to prevent SSR issues
const RingScene = dynamic(() => import("./RingScene"), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
};

export default function Hero3D() {
  return (
    <section className="relative h-[95vh] w-full overflow-hidden bg-transparent">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <RingScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.h1
            variants={fadeUp}
            className="mb-4 text-4xl font-black leading-tight text-[#0A1F44] sm:text-6xl lg:text-7xl"
          >
            Welcome to <br />
            <span className="bg-gradient-to-r from-[#D4882F] to-[#B87025] bg-clip-text text-transparent">
              Kamma Icon Trust
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-10 max-w-2xl text-lg font-medium text-[#0A1F44]/60 sm:text-xl"
          >
            Connecting Communities, Building Futures
          </motion.p>

          <motion.div variants={fadeUp}>
            <button className="group relative overflow-hidden rounded-full bg-[#0A1F44] px-10 py-4 text-[13px] font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-[#D4882F] hover:shadow-2xl hover:shadow-[#D4882F]/20">
              <span className="relative z-10">Register for Marriage</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative gradient blur */}
      <div className="absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#D4882F]/10 blur-[100px] pointer-events-none" />
    </section>
  );
}
