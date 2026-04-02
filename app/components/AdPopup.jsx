"use client";

import { useState, useEffect } from "react";

let adShown = false; // 🔥 GLOBAL LOCK

export default function AdPopup() {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    if (adShown) return; // 🚫 stop duplicate

    adShown = true;

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

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl relative">

        {/* CLOSE */}
        <button
          onClick={closeAd}
          className="absolute top-2 right-3 text-gray-500 text-lg"
        >
          ✕
        </button>

        {/* IMAGE */}
        <img
          src="/ads/amerispace.png"
          alt="Amerispace"
          className="w-full h-36 object-contain cursor-pointer"
          onClick={() => window.open("https://amerispace.co.in/", "_blank")}
        />

        {/* TEXT */}
        <div className="p-4 text-center">
          <h2 className="font-bold text-gray-800">
            Amerispace Pvt. Ltd.
          </h2>

          <p className="text-sm text-gray-600">
            Building Your Future, One Space at a Time
          </p>

          <button
            onClick={() => window.open("https://amerispace.co.in/", "_blank")}
            className="mt-3 w-full py-2 rounded-lg text-white 
            bg-gradient-to-r from-yellow-400 to-orange-500"
          >
            Know More →
          </button>
        </div>

      </div>
    </div>
  );
}