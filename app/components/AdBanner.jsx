"use client";

import { useState } from "react";

export default function AdBanner() {

  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-2 md:right-4 z-50 w-[230px] md:w-[300px] animate-fadeIn">

      <div className="relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full hover:bg-black"
        >
          ✕
        </button>

        {/* AD CARD */}
        <a href="https://example.com" target="_blank">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl hover:scale-105 transition duration-300">

            {/* IMAGE */}
            <img
              src="/amerispace.jpeg"
              className="w-full rounded-lg mb-2"
            />

            {/* TITLE */}
            <h3 className="text-white text-sm md:text-base font-semibold text-center">
              Amerispace Pvt. Ltd.
            </h3>

            {/* TAGLINE */}
            <p className="text-gray-300 text-xs md:text-sm text-center">
              Building Your Future
            </p>

            {/* CTA */}
            <p className="text-yellow-400 text-xs md:text-sm text-center mt-1 font-medium">
              Invest • Build • Grow
            </p>

          </div>
        </a>

      </div>

      {/* ANIMATION */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  );
}