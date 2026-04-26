"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";

/**
 * useDepthCard — Provides 3D tilt, scale, and shadow depth on hover.
 * Lightweight: uses CSS transforms only (no WebGL).
 * Auto-disables tilt on touch devices to keep gestures smooth.
 *
 * @param {object} options
 * @param {number} options.tiltDeg    – Max tilt in degrees (default 8)
 * @param {number} options.hoverScale – Scale on hover (default 1.03)
 * @param {number} options.perspective – CSS perspective value (default 800)
 * @returns {{ cardRef, style, handlers }}
 */
export function useDepthCard({
  tiltDeg = 8,
  hoverScale = 1.03,
  perspective = 800,
} = {}) {
  const cardRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const springConfig = { stiffness: 200, damping: 20, mass: 0.5 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  const scaleSpring = useSpring(scale, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [`${tiltDeg}deg`, `-${tiltDeg}deg`]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [`-${tiltDeg}deg`, `${tiltDeg}deg`]);

  // Dynamic shadow based on tilt
  const shadowX = useTransform(xSpring, [-0.5, 0.5], [8, -8]);
  const shadowY = useTransform(ySpring, [-0.5, 0.5], [-4, 12]);

  const onMouseMove = useCallback(
    (e) => {
      if (isTouch) return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
      scale.set(hoverScale);
    },
    [isTouch, x, y, scale, hoverScale]
  );

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
  }, [x, y, scale]);

  const style = {
    rotateX: isTouch ? 0 : rotateX,
    rotateY: isTouch ? 0 : rotateY,
    scale: scaleSpring,
    transformStyle: "preserve-3d",
    perspective: `${perspective}px`,
  };

  const handlers = isTouch
    ? {}
    : { onMouseMove, onMouseLeave };

  return { cardRef, style, handlers, shadowX, shadowY };
}

/**
 * useParallaxScroll — Returns a motionValue Y offset driven by scroll.
 * Gives elements a depth-based parallax shift as user scrolls.
 *
 * @param {object} options
 * @param {number} options.speed – Parallax speed factor (default 0.15, negative = upward)
 * @returns {{ ref, yOffset }}
 */
export function useParallaxScroll({ speed = 0.15 } = {}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yOffset = useTransform(scrollYProgress, [0, 1], [60 * speed, -60 * speed]);
  const smoothY = useSpring(yOffset, { stiffness: 80, damping: 20 });

  return { ref, yOffset: smoothY };
}
