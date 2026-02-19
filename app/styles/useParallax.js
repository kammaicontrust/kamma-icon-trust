"use client";

import { useEffect } from "react";

export default function useParallax() {
  useEffect(() => {
    const layers = document.querySelectorAll(".parallax");

    if (!layers.length) return;

    function handleScroll() {
      const scrollY = window.scrollY;

      layers.forEach(layer => {
        const speed = layer.dataset.speed || 0.3;
        layer.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}
