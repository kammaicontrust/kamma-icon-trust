"use client";

import { useEffect, useState } from "react";

export default function AdPopup() {
  const [showAd, setShowAd] = useState(false);

  // Show immediately (but only if not closed before)
  useEffect(() => {
    const closed = localStorage.getItem("adClosed");

    if (!closed) {
      setShowAd(true);
    }
  }, []);

  // Close function (save in localStorage)
  const closeAd = () => {
    setShowAd(false);
    localStorage.setItem("adClosed", "true");
  };

  if (!showAd) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-3">

      <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden animate-slideUp relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={closeAd}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        {/* LOGO (CLICKABLE) */}
        <img
          src="/amerispace.jpeg"
          alt="Amerispace"
          onClick={() =>
            window.open(
              "https://amerispace.co.in/",
              "_blank",
              "noopener,noreferrer"
            )
          }
          className="w-full h-32 object-contain bg-white cursor-pointer hover:scale-105 transition duration-300"
        />

        {/* CONTENT */}
        <div className="p-4 text-center">

          <h2 className="text-lg font-bold text-gray-800">
            Amerispace Pvt. Ltd.
          </h2>

          <p className="text-xs text-gray-600 mt-1">
            Building Your Future, One Space at a Time
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Premium Plots • Villas • Construction • Resorts
          </p>

          {/* BUTTON */}
          <button
            onClick={() =>
              window.open(
                "https://amerispace.co.in/",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="mt-4 w-full py-2 rounded-xl text-sm font-semibold text-white 
            bg-gradient-to-r from-yellow-400 to-orange-500 
            active:scale-95 transition duration-200 shadow-md"
          >
            Know More →
          </button>

        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
}