"use client";
import { useEffect } from "react";

export default function useCursor() {
  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window) return;

    // Create cursor
    const cursor = document.createElement("div");
    cursor.id = "custom-cursor";
    cursor.innerHTML = `
      <div class="cursor-ring"></div>
      <div class="cursor-dot"></div>
    `;
    document.body.appendChild(cursor);

    const dot = cursor.querySelector(".cursor-dot");
    const ring = cursor.querySelector(".cursor-ring");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    // Track mouse
    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot = instant
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    };

    // Smooth ring (very small lag)
    const animate = () => {
      ringX += (mouseX - ringX) * 0.35;
      ringY += (mouseY - ringY) * 0.35;

      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";

      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    animate();

    /* ===== EFFECTS ===== */

    // Hover grow (links + buttons)
    const addHover = () => ring.classList.add("cursor-hover");
    const removeHover = () => ring.classList.remove("cursor-hover");

    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    // Button color (gold)
    const addButton = () => ring.classList.add("cursor-button");
    const removeButton = () => ring.classList.remove("cursor-button");

    document.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("mouseenter", addButton);
      btn.addEventListener("mouseleave", removeButton);
    });

    // Click pulse
    const click = () => {
      ring.classList.add("cursor-click");
      setTimeout(() => ring.classList.remove("cursor-click"), 150);
    };
    window.addEventListener("mousedown", click);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", click);
      cursor.remove();
    };
  }, []);
}
