"use client";

import { useEffect, useState } from "react";

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFade(true);

      setTimeout(() => {
        setShowLogo(true);
      }, 600);

      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }, 3000);
  }, []);

  if (loading) {
    return (
      <div className={`loader-screen ${fade ? "fade-out" : ""}`}>
        {!showLogo ? (
          <div className="loader-content">
            <div className="figma-wave-container">
              <div className="wave-item color-1"></div>
              <div className="wave-item color-2"></div>
              <div className="wave-item color-3"></div>
              <div className="wave-item color-4"></div>
              <div className="wave-item color-5 center"></div>
              <div className="wave-item color-4"></div>
              <div className="wave-item color-3"></div>
              <div className="wave-item color-2"></div>
              <div className="wave-item color-1"></div>
            </div>

            <h2 className="loader-title">LOADING</h2>
          </div>
        ) : (
          <div className="logo-reveal">
            <img src="/gallery/logo.png" className="reveal-logo" alt="Kamma Icon Trust Logo" />
            <h1>KAMMA ICON TRUST</h1>
          </div>
        )}
      </div>
    );
  }

  return null;
}