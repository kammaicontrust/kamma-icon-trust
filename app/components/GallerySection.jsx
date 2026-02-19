"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";

export default function GallerySection() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchImages() {
      const q = query(
        collection(db, "gallery"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(data);
    }

    fetchImages();
  }, []);

  function prevSlide() {
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }

  function nextSlide() {
    setCurrent((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }

  return (
    <section
      id="gallery"
      className="py-28 bg-black text-white overflow-hidden"
    >
      <h2 className="text-4xl font-bold text-center text-yellow-500 mb-16 tracking-wide">
        GALLERY
      </h2>

      <div className="relative flex items-center justify-center">

        {/* LEFT BUTTON */}
        <button
  onClick={prevSlide}
  className="absolute left-8 z-20 group"
>
  <div className="relative w-14 h-14 flex items-center justify-center
  rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600
  shadow-lg shadow-yellow-500/30
  transition-all duration-300 group-hover:scale-110">

    <span className="text-black text-2xl font-bold transition-all duration-300 group-hover:-translate-x-1">
      ‹
    </span>

    <div className="absolute inset-0 rounded-full
      bg-yellow-400 blur-xl opacity-0
      group-hover:opacity-40 transition-all duration-300">
    </div>
  </div>
</button>


        {/* SLIDER */}
        <div className="relative flex items-center justify-center w-full h-[480px] perspective-1000">

          {images.map((img, index) => {
            const position = index - current;

            return (
              <div
                key={img.id}
                className={`absolute transition-all duration-700 ease-in-out rounded-3xl overflow-hidden shadow-2xl
                ${
                  position === 0
                    ? "z-10 scale-100 translate-x-0 rotate-0"
                    : position === -1
                    ? "z-0 scale-90 -translate-x-[280px] -rotate-6 opacity-70"
                    : position === 1
                    ? "z-0 scale-90 translate-x-[280px] rotate-6 opacity-70"
                    : "opacity-0 scale-75"
                }`}
              >
                <div className="w-[300px] md:w-[360px] lg:w-[420px] h-[360px] md:h-[400px] lg:h-[420px] relative">

                  <Image
                    src={img.imageUrl}
                    alt="Gallery Image"
                    fill
                    sizes="(max-width:768px) 300px,
                           (max-width:1024px) 360px,
                           420px"
                    className="object-cover rounded-3xl"
                    priority={position === 0}
                  />

                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT BUTTON */}
        <button
  onClick={nextSlide}
  className="absolute right-8 z-20 group"
>
  <div className="relative w-14 h-14 flex items-center justify-center
  rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600
  shadow-lg shadow-yellow-500/30
  transition-all duration-300 group-hover:scale-110">

    <span className="text-black text-2xl font-bold transition-all duration-300 group-hover:translate-x-1">
      ›
    </span>

    <div className="absolute inset-0 rounded-full
      bg-yellow-400 blur-xl opacity-0
      group-hover:opacity-40 transition-all duration-300">
    </div>
  </div>
</button>

      </div>
    </section>
  );
}
