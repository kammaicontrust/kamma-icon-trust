"use client";

import { useState, useEffect } from "react";

export default function AdPopup() {
  const [showAd, setShowAd] = useState(false);

  // INSTANT SHOW (NO DELAY)
  useEffect(() => {
    const closed = localStorage.getItem("adClosed");

    if (!closed) {
      setShowAd(true);
    }
  }, []);

  const closeAd = () => {
    setShowAd(false);
    localStorage.setItem("adClosed", "true");
  };

  if (!showAd) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[9999] px-3">

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative animate-slideUp">

        {/* CLOSE */}
        <button
          onClick={closeAd}
          className="absolute top-2 right-3 text-gray-500 text-xl"
        >
          ✕
        </button>

        {/* IMAGE */}
        <img
          src="/ads/amerispace.jpeg"
          alt="Amerispace"
          onClick={() =>
            window.open("https://amerispace.co.in/", "_blank")
          }
          className="w-full h-36 object-contain bg-white cursor-pointer"
        />

        {/* TEXT */}
        <div className="p-4 text-center">

          <h2 className="text-lg font-bold text-gray-800">
            Amerispace Pvt. Ltd.
          </h2>

          <p className="text-sm text-gray-600">
            Building Your Future, One Space at a Time
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Premium Plots • Villas • Construction • Resorts
          </p>

          {/* BUTTON */}
          <button
            onClick={() =>
              window.open("https://amerispace.co.in/", "_blank")
            }
            className="mt-4 w-full py-3 rounded-xl text-white font-semibold 
            bg-gradient-to-r from-yellow-400 to-orange-500"
          >
            Know More →
          </button>

        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(80px);
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