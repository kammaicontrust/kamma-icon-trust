"use client";

import { useEffect, useState, useRef } from "react";
import { DotLottie } from '@lottiefiles/dotlottie-web';

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Ensure loader only shows once per session if user navigates away and back
    const hasLoaded = sessionStorage.getItem("has_loaded_main");
    if (hasLoaded) {
      setLoading(false);
      return;
    }
    sessionStorage.setItem("has_loaded_main", "true");

    let dotLottie = null;
    if (canvasRef.current) {
      dotLottie = new DotLottie({
        autoplay: true,
        loop: true,
        canvas: canvasRef.current,
        src: "https://lottie.host/e8c067d7-6207-4b2f-8b4e-232a2be32bc1/UIPOb9FcWF.lottie",
      });
    }

    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2500);

    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 3100); // 0.6s after fade out

    return () => {
      if (dotLottie) {
        dotLottie.destroy();
      }
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className={`loader-screen ${fade ? "fade-out" : ""}`} style={{ background: '#F7F8FA' }}>
      <div className="flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: 300, height: 300 }}
        />
      </div>
    </div>
  );
}