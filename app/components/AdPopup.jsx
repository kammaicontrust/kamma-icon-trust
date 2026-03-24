"use client";

import { useEffect, useState } from "react";

export default function AdPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // show instantly
    const closed = localStorage.getItem("adClosed");

    if (!closed) {
      setShow(true);
    }
  }, []);

  const closeAd = () => {
    setShow(false);
    localStorage.setItem("adClosed", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[9999] px-3">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl relative overflow-hidden animate-fadeIn">

        {/* Close */}
        <button
          onClick={closeAd}
          className="absolute top-2 right-3 text-gray-500 text-lg"
        >
          ✕
        </button>

        {/* Image */}
        <a
          href="https://amerispace.co.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/ads/amerispace.png"
            alt="Amerispace"
            className="w-full h-40 object-contain p-3 cursor-pointer"
          />
        </a>

        {/* Content */}
        <div className="px-4 pb-4 text-center">
          <h2 className="font-semibold text-lg text-gray-800">
            Amerispace Pvt. Ltd.
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Building Your Future, One Space at a Time
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Premium Plots • Villas • Construction • Resorts
          </p>

          {/* Button */}
          <a
            href="https://amerispace.co.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="mt-4 w-full py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium">
              Know More →
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}