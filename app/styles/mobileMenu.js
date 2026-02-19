"use client";
import { useEffect } from "react";

export default function useMobileMenu() {
  useEffect(() => {
    const mobileMenu = document.getElementById("mobileMenu");

    const toggleMenu = () => {
      mobileMenu.classList.toggle("hidden");
    };

    // Attach to window so JSX can access it
    window.toggleMenu = toggleMenu;

    return () => {
      delete window.toggleMenu;
    };
  }, []);
}
