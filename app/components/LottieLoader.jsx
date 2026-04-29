"use client";

import { useEffect, useState, useCallback } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [dotLottie, setDotLottie] = useState(null);

  useEffect(() => {
    // Check if loader has been shown in this session
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (hasSeenLoader) {
      setLoading(false);
      return;
    }

    // Set flag in session storage
    sessionStorage.setItem("hasSeenLoader", "true");

    // Fallback timeout in case the animation fails to load or complete event is missed
    const fallbackTimer = setTimeout(() => {
      setFade(true);
      setTimeout(() => setLoading(false), 600);
    }, 6000); // Increased fallback to 6 seconds

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (dotLottie) {
      const onComplete = () => {
        setFade(true);
        // Completely remove from DOM after fade transition (0.6s defined in css)
        setTimeout(() => setLoading(false), 600);
      };

      dotLottie.addEventListener('complete', onComplete);

      return () => {
        dotLottie.removeEventListener('complete', onComplete);
      };
    }
  }, [dotLottie]);

  if (!loading) {
    return null;
  }

  return (
    <div 
      className={`loader-screen ${fade ? "fade-out" : ""}`} 
      style={{ backgroundColor: '#F7F8FA' }}
    >
      <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/e8c067d7-6207-4b2f-8b4e-232a2be32bc1/UIPOb9FcWF.lottie"
          autoplay
          loop={false}
          dotLottieRefCallback={setDotLottie}
          renderConfig={{ autoResize: true }}
        />
      </div>
    </div>
  );
}