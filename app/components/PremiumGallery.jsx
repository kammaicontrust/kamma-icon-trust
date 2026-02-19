"use client";

import { useState } from "react";

export default function PremiumGallery({ images }) {
  const [index, setIndex] = useState(0);

  function prev() {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function next() {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function getPosition(i) {
    if (i === index) return "center";
    if (i === (index - 1 + images.length) % images.length) return "left";
    if (i === (index + 1) % images.length) return "right";
    return "hidden";
  }

  return (
    <section className="py-24 bg-black text-white overflow-hidden">
      <h2 className="text-4xl font-bold text-center mb-16 text-yellow-500">
        GALLERY
      </h2>

      <div className="relative flex items-center justify-center">

        {images.map((img, i) => {
          const position = getPosition(i);

          return (
            <img
              key={i}
              src={img}
              alt="gallery"
              className={`absolute transition-all duration-700 ease-in-out rounded-3xl shadow-2xl
                ${
                  position === "center"
                    ? "w-[380px] md:w-[500px] scale-100 z-30 opacity-100"
                    : position === "left"
                    ? "w-[300px] md:w-[380px] -translate-x-80 md:-translate-x-96 scale-90 blur-sm opacity-60 z-20"
                    : position === "right"
                    ? "w-[300px] md:w-[380px] translate-x-80 md:translate-x-96 scale-90 blur-sm opacity-60 z-20"
                    : "opacity-0 scale-75 z-0"
                }
              `}
            />
          );
        })}

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-5 md:left-20 bg-yellow-500 text-black w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition"
        >
          ‹
        </button>

        <button
          onClick={next}
          className="absolute right-5 md:right-20 bg-yellow-500 text-black w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition"
        >
          ›
        </button>
      </div>
    </section>
  );
}
