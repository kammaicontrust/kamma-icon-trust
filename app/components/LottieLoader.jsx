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

    // Fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2500);

    // Completely remove from DOM after fade transition (0.6s defined in css)
    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 3100);

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
      <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/e8c067d7-6207-4b2f-8b4e-232a2be32bc1/UIPOb9FcWF.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}