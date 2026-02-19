import { useEffect } from "react";

export default function GlobalParticles() {
  useEffect(() => {
    const container = document.getElementById("particles-bg");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 40; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.animationDelay = Math.random() * 20 + "s";
      p.style.animationDuration = 15 + Math.random() * 20 + "s";
      container.appendChild(p);
    }
  }, []);

  return null;
}
