"use client";

import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Check if loader has been shown in this session
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (hasSeenLoader) {
      setLoading(false);
      return;
    }

    // Set flag in session storage
    sessionStorage.setItem("hasSeenLoader", "true");

    // Fade out quicker, after 1.2 seconds
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1200);

    // Completely remove from DOM after fade transition (0.6s defined in css)
    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

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
          loop
          autoplay
        />
      </div>
    </div>
  );
}