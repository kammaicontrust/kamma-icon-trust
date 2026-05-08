"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import HeroOverlay from "../components/HeroOverlay";
import CinematicTransition from "../components/CinematicTransition";
import useWebsiteConfig from "../hooks/useWebsiteConfig";

const IntroLogo = dynamic(() => import("./IntroLogo"), { ssr: false });
const CinematicScene = dynamic(() => import("./CinematicScene"), { ssr: false });

export default function HeroPremium() {
  const config = useWebsiteConfig();
  const [stage, setStage] = useState("intro"); // "intro" | "hero"
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const router = useRouter();

  const handleRegisterClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/register");
    }, 2200);
  };

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Low-end device detection
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        if (renderer.includes("swiftshader") || renderer.includes("llvmpipe") || renderer.includes("mesa")) {
          setIsLowEnd(true);
        }
      }
    }

    // Auto transition from intro to hero
    const timer = setTimeout(() => setStage("hero"), 4000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  /* ── Fallback for low-end devices ── */
  if (isLowEnd) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#fafafa]">
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,153,51,0.08),transparent_60%),radial-gradient(ellipse_at_70%_80%,rgba(19,136,8,0.06),transparent_50%)]" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <div className="h-px w-8 bg-[#FF9933]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#FF9933]">
              Kamma Icon Trust
            </span>
            <div className="h-px w-8 bg-[#138808]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="mb-8 text-5xl font-black leading-[1.1] tracking-tight text-[#0A1F44] sm:text-7xl lg:text-8xl"
          >
            {config.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-[#0A1F44]/60 sm:text-xl"
          >
            {config.heroSubtitle}
          </motion.p>

          <HeroOverlay
            onRegisterClick={handleRegisterClick}
            isNavigating={isNavigating}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#fafafa]">
      <AnimatePresence mode="wait">
        {stage === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#fafafa]"
          >
            <div className="h-full w-full">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                  <IntroLogo />
                </Suspense>
              </Canvas>
            </div>

            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 0.4, letterSpacing: "0.5em" }}
              transition={{ delay: 1, duration: 2, ease: "power2.out" }}
              className="absolute bottom-12 text-[10px] uppercase text-[#0A1F44]"
            >
              Initializing Experience
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative h-full w-full"
          >
            {/* ── Cinematic 3D Background ── */}
            <div className="absolute inset-0 z-0">
              <Canvas
                camera={{ position: [0, 0, 8], fov: 40 }}
                dpr={isMobile ? [1, 1.5] : [1, 2]}
                gl={{ antialias: true, alpha: false }}
              >
                <Suspense fallback={null}>
                  <CinematicScene isMobile={isMobile} />
                </Suspense>
              </Canvas>
            </div>

            {/* ── Soft vignette overlay for text readability ── */}
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(250,250,250,0.5)_0%,rgba(250,250,250,0.3)_35%,rgba(250,250,250,0.15)_70%,transparent_100%)]" />

            {/* ── Main Content Overlay ── */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  show: { transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 1 } },
                  }}
                  className="mb-6 flex items-center justify-center gap-4"
                >
                  <div className="h-px w-8 bg-[#FF9933]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#FF9933]">
                    Kamma Icon Trust
                  </span>
                  <div className="h-px w-8 bg-[#138808]" />
                </motion.div>

                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
                    },
                  }}
                  className="mb-8 text-5xl font-black leading-[1.1] tracking-tight text-[#0A1F44] sm:text-7xl lg:text-8xl"
                >
                  {config.heroTitle}
                </motion.h1>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 1 } },
                  }}
                  className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-[#0A1F44]/60 sm:text-xl"
                >
                  {config.heroSubtitle}
                </motion.p>

                <HeroOverlay
                  onRegisterClick={handleRegisterClick}
                  isNavigating={isNavigating}
                />
              </motion.div>
            </div>

            {/* ── Scroll Indicator ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0A1F44]/30">
                Scroll
              </span>
              <div className="h-12 w-px bg-gradient-to-b from-[#0A1F44]/20 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cinematic Register Transition ── */}
      <AnimatePresence>
        {isNavigating && <CinematicTransition />}
      </AnimatePresence>
    </div>
  );
}
