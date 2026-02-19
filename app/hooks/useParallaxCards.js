"use client";
import { useEffect } from "react";

export default function useParallaxCards() {
  useEffect(() => {
    const cards = document.querySelectorAll(".parallax-card");

    const onScroll = () => {
      const viewportHeight = window.innerHeight;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const progress = (rect.top - viewportHeight) / viewportHeight;

        // subtle depth movement
        const translateY = progress * -20;

        card.style.transform = `translateY(${translateY}px)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
