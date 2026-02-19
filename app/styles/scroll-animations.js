import { useEffect } from "react";

export default function useScrollAnimations() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    /* ---------------------------
       1. GENERIC FADE-UP ANIMATIONS
    ---------------------------- */
    const fadeElements = document.querySelectorAll(".fade-up");

    const fadeInOnScroll = () => {
      fadeElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 120) {
          el.classList.add("visible");
        }
      });
    };

    window.addEventListener("scroll", fadeInOnScroll);
    fadeInOnScroll();



    /* ---------------------------
       2. ABOUT SECTION SPECIAL LINE + FADE
    ---------------------------- */
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      const revealAbout = () => {
        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight - 150) {
          aboutSection.classList.add("about-visible");
          window.removeEventListener("scroll", revealAbout);
        }
      };

      // Delay activation to avoid hydration mismatch
      setTimeout(() => {
        window.addEventListener("scroll", revealAbout);
        revealAbout();
      }, 300);
    }



    /* ---------------------------
       CLEANUP ON UNMOUNT
    ---------------------------- */
    return () => {
      window.removeEventListener("scroll", fadeInOnScroll);
      window.removeEventListener("scroll", () => {});
    };
  }, []);
}
