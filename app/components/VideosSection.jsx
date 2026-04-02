"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function GalleryPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(
          collection(db, "videos"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVideos(list);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white px-6 py-16">

      {/* MAIN TITLE */}
      <h1 className="text-center text-4xl font-bold text-yellow-400 mb-16">
        VIDEOS
      </h1>

      {/* VIDEOS */}
      <div className="space-y-20">

        {videos.map((video) => (
          <div key={video.id} className="text-center">

            {/* VIDEO FRAME */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-4xl">

                {/* Glow */}
                <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-2xl"></div>

                {/* Frame */}
                <div className="relative bg-gray-900 p-3 rounded-2xl shadow-2xl border border-yellow-500/20">

                  <div className="relative w-full pb-[56.25%] overflow-hidden rounded-xl">

                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>

                  </div>
                </div>
              </div>
            </div>

            {/* VIDEO TITLE */}
            <h2 className="mt-6 text-lg md:text-xl text-yellow-300 font-semibold">
              ATP SHIVARATRI 2026 SRI CHALLA LAKSHMI PRASAD GARU (APIIC DIRECTOR)
            </h2>

          </div>
        ))}

      </div>

    </div>
  );
}