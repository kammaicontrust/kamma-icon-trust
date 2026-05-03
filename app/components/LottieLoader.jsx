"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

export default function LottieLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  const startFadeOut = useCallback(() => {
    setFade(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    setMounted(true);
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (hasSeenLoader) {
      setLoading(false);
      return;
    }

    sessionStorage.setItem("hasSeenLoader", "true");

    // Safety timeout
    const safetyTimer = setTimeout(() => {
      startFadeOut();
    }, 6000);

    return () => clearTimeout(safetyTimer);
  }, [startFadeOut]);

  // GSAP Animation Timeline
  useEffect(() => {
    if (!mounted || !loading || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(startFadeOut, 400);
        },
      });

      // 1. Rings fade in + start rotating
      tl.fromTo(
        ".intro-ring-left",
        { opacity: 0, scale: 0.6, x: 30 },
        { opacity: 1, scale: 1, x: 0, duration: 0.8, ease: "power2.out" },
        0
      )
        .fromTo(
          ".intro-ring-right",
          { opacity: 0, scale: 0.6, x: -30 },
          { opacity: 1, scale: 1, x: 0, duration: 0.8, ease: "power2.out" },
          0.1
        )
        // 2. Golden light sweep across rings
        .fromTo(
          ".ring-light-sweep",
          { x: "-120%" },
          { x: "120%", duration: 1.2, ease: "power1.inOut" },
          0.5
        )
        // 3. Logo entrance
        .fromTo(
          ".intro-logo",
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
          0.6
        )
        // 4. Logo soft glow pulse
        .fromTo(
          ".intro-logo-glow",
          { opacity: 0, scale: 0.8 },
          { opacity: 0.6, scale: 1.1, duration: 0.8, ease: "power1.out" },
          0.7
        )
        // 5. Title text
        .fromTo(
          ".intro-title",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          1.1
        )
        // 6. Subtitle text
        .fromTo(
          ".intro-subtitle",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          1.4
        )
        // 7. Gentle floating for logo
        .to(
          ".intro-logo",
          { y: -4, duration: 1.5, yoyo: true, repeat: 1, ease: "sine.inOut" },
          1.2
        );
    }, containerRef);

    return () => ctx.revert();
  }, [mounted, loading, startFadeOut]);

  if (!mounted || !loading) return null;

  return (
    <div
      ref={containerRef}
      className={`loader-screen ${fade ? "fade-out" : ""}`}
      style={{ overflow: "hidden" }}
    >
      {/* Soft cream gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(255,243,224,0.9) 0%, rgba(255,249,244,0.95) 40%, #fffaf5 100%)",
        }}
      />

      {/* Very subtle texture dots */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(212,136,47,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "24px",
        }}
      >
        {/* Wedding Rings */}
        <div
          style={{
            position: "relative",
            width: 120,
            height: 80,
            marginBottom: 28,
          }}
        >
          {/* Left Ring */}
          <div
            className="intro-ring-left"
            style={{
              position: "absolute",
              left: 4,
              top: 8,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3.5px solid transparent",
              backgroundImage:
                "linear-gradient(#fffaf5, #fffaf5), linear-gradient(135deg, #d4a54a, #f5d98e, #c9933a, #f0ce6e)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              opacity: 0,
              animation: "ringRotateLeft 6s ease-in-out infinite",
            }}
          />

          {/* Right Ring */}
          <div
            className="intro-ring-right"
            style={{
              position: "absolute",
              right: 4,
              top: 8,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3.5px solid transparent",
              backgroundImage:
                "linear-gradient(#fffaf5, #fffaf5), linear-gradient(315deg, #c9933a, #f5d98e, #d4a54a, #f0ce6e)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              opacity: 0,
              animation: "ringRotateRight 6s ease-in-out infinite",
            }}
          />

          {/* Golden light sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              borderRadius: 999,
              pointerEvents: "none",
            }}
          >
            <div
              className="ring-light-sweep"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "40%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(245,217,142,0.5), transparent)",
                transform: "translateX(-120%)",
              }}
            />
          </div>
        </div>

        {/* Logo with glow */}
        <div
          style={{
            position: "relative",
            marginBottom: 20,
          }}
        >
          {/* Glow behind logo */}
          <div
            className="intro-logo-glow"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 140,
              height: 140,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(212,166,47,0.25) 0%, rgba(245,217,142,0.1) 60%, transparent 80%)",
              opacity: 0,
              filter: "blur(10px)",
            }}
          />

          {/* Logo image */}
          <Image
            className="intro-logo"
            src="/logo.png"
            alt="Kamma Icon Trust"
            width={100}
            height={100}
            priority
            style={{
              position: "relative",
              zIndex: 1,
              opacity: 0,
              objectFit: "contain",
            }}
          />
        </div>

        {/* Title */}
        <h1
          className="intro-title"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: "#3d2415",
            marginBottom: 6,
            opacity: 0,
            textAlign: "center",
          }}
        >
          Kamma Icon Trust
        </h1>

        {/* Subtitle */}
        <p
          className="intro-subtitle"
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#b8874a",
            opacity: 0,
            textAlign: "center",
          }}
        >
          Marriage Registration
        </p>
      </div>

      {/* Keyframe animations for 3D ring rotation */}
      <style jsx>{`
        @keyframes ringRotateLeft {
          0% {
            transform: perspective(400px) rotateY(0deg) rotateX(5deg);
          }
          50% {
            transform: perspective(400px) rotateY(15deg) rotateX(-5deg);
          }
          100% {
            transform: perspective(400px) rotateY(0deg) rotateX(5deg);
          }
        }
        @keyframes ringRotateRight {
          0% {
            transform: perspective(400px) rotateY(0deg) rotateX(-5deg);
          }
          50% {
            transform: perspective(400px) rotateY(-15deg) rotateX(5deg);
          }
          100% {
            transform: perspective(400px) rotateY(0deg) rotateX(-5deg);
          }
        }
      `}</style>
    </div>
  );
}