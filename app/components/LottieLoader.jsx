"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [mounted, setMounted] = useState(false);

  const startFadeOut = useCallback(() => {
    setFade(true);
    // Remove from DOM after transition (0.6s as per globals.css + small buffer)
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Check if loader has been shown in this session
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (hasSeenLoader) {
      setLoading(false);
      return;
    }

    // Set flag in session storage
    sessionStorage.setItem("hasSeenLoader", "true");

    // Safety timeout in case the animation fails to fire 'complete'
    const safetyTimer = setTimeout(() => {
      startFadeOut();
    }, 15000);

    return () => clearTimeout(safetyTimer);
  }, [startFadeOut]);

  if (!mounted || !loading) {
    return null;
  }

  return (
    <div 
      className={`loader-screen ${fade ? "fade-out" : ""}`} 
      style={{ backgroundColor: '#F7F8FA', overflow: 'hidden' }}
    >
      <div className="w-full h-full flex items-center justify-center p-4 md:p-12 transition-transform duration-1000 ease-out">
        <DotLottieReact
          src="https://lottie.host/e8c067d7-6207-4b2f-8b4e-232a2be32bc1/UIPOb9FcWF.lottie"
          loop={false}
          autoplay
          style={{ width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none' }}
          renderConfig={{
            freezeOnOffscreen: true,
            devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
            worker: true,
          }}
          dotLottieRefCallback={(dotLottie) => {
            if (dotLottie) {
              dotLottie.addEventListener('complete', () => {
                startFadeOut();
              });
            }
            // To make it feel "Big at starting", we can slightly scale it or just let it fill
          }}
        />
      </div>
    </div>
  );
}