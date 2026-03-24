"use client";

import { useEffect, useState } from "react";

export default function AdPopup() {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAd(true);
    }, 15000); // 15 sec

    return () => clearTimeout(timer);
  }, []);

  if (!showAd) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">

      <div className="pointer-events-auto w-[95%] max-w-sm bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slideUp">

        {/* Close Button */}
        <button
          onClick={() => setShowAd(false)}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* Image */}
        <img
          src="/ads/amerispace.jpeg"
          alt="Amerispace"
          className="w-full h-32 object-contain bg-white"
        />

        {/* Content */}
        <div className="p-3 text-center">

          <h2 className="text-lg font-bold text-gray-800">
            Amerispace Pvt. Ltd.
          </h2>

          <p className="text-xs text-gray-600 mt-1">
            Building Your Future, One Space at a Time
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Premium Plots • Villas • Construction • Resorts
          </p>

          {/* Button */}
          <a
            href="https://amerispace.co.in/"
            target="_blank"
            className="block mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:scale-105 transition"
          >
            Know More →
          </a>

        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.5s ease;
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