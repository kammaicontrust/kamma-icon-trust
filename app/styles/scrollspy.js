"use client";

import { useEffect } from "react";

export default function useScrollSpy() {
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav a[href^='#']");

    function onScroll() {
      let scrollPos = window.scrollY + 150;

      sections.forEach((section) => {
        if (
          scrollPos >= section.offsetTop &&
          scrollPos < section.offsetTop + section.offsetHeight
        ) {
          navLinks.forEach((link) =>
            link.classList.remove("text-yellow-500")
          );

          const activeLink = document.querySelector(
            `nav a[href="#${section.id}"]`
          );
          if (activeLink) activeLink.classList.add("text-yellow-500");
        }
      });
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
