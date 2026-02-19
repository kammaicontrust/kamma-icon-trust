import { useEffect } from "react";

export default function useReveal(selector = ".initiative-card", threshold = 0.2) {
  useEffect(() => {
    const cards = document.querySelectorAll(selector);
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [selector, threshold]);
}
