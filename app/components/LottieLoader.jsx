"use client";

import { useEffect, useState, useRef } from "react";
import { DotLottie } from '@lottiefiles/dotlottie-web';

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling while loading
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

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
        src: "/Shri Ram.lottie",
      });
    }

    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2000); // 2 seconds minimum display time

    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 2700); // 0.7s after fade out

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
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#F7F8FA] transition-opacity duration-700 ease-in-out ${fade ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className={`flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${fade ? "scale-95" : "scale-100"}`}>
        <canvas
          ref={canvasRef}
          style={{ width: 300, height: 300 }}
        />
      </div>
    </div>
  );
}