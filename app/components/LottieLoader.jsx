"use client";

import { useEffect, useState, useCallback } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  const startFadeOut = useCallback(() => {
    setFade(true);
    // Remove from DOM after transition (0.6s as per globals.css + small buffer)
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
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
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [startFadeOut]);

  if (!loading) {
    return null;
  }

  return (
    <div 
      className={`loader-screen ${fade ? "fade-out" : ""}`} 
      style={{ backgroundColor: '#F7F8FA' }}
    >
      <div className="w-[95vw] h-[95vh] max-w-[900px] max-h-[900px] flex items-center justify-center transform scale-110">
        <DotLottieReact
          src="https://lottie.host/e8c067d7-6207-4b2f-8b4e-232a2be32bc1/UIPOb9FcWF.lottie"
          loop={false}
          autoplay
          renderConfig={{
            freezeOnOffscreen: true,
          }}
          dotLottieRefCallback={(dotLottie) => {
            dotLottie.addEventListener('complete', () => {
              startFadeOut();
            });
          }}
        />
      </div>
    </div>
  );
}