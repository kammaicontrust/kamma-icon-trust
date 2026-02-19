"use client";
import { useEffect } from "react";

export default function useScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const elements = document.querySelectorAll(".reveal-card");

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
