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

              

                {/* Frame */}
                <div className="relative bg-gray-900 p-3 rounded-2xl shadow-2xl border border-yellow-500/20">

                  <div className="relative w-full pb-[56.25%] overflow-hidden rounded-xl">

                    <div className="flex justify-center">
  <div className="w-full max-w-5xl group">

    {/* Glow background */}
    <div className="absolute blur-3xl opacity-30 bg-yellow-500 rounded-3xl w-full h-full group-hover:opacity-50 transition duration-500"></div>

    {/* Frame */}
    <div className="relative bg-gradient-to-br from-gray-900 to-black p-4 rounded-3xl border border-yellow-500/20 shadow-[0_0_40px_rgba(255,215,0,0.2)] group-hover:shadow-[0_0_60px_rgba(255,215,0,0.4)] transition duration-500">

      {/* Video */}
      <div className="relative w-full pb-[56.25%] overflow-hidden rounded-2xl">

        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}?rel=0`}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

      </div>

    </div>
  </div>
</div>

                  </div>
                </div>
              </div>
            </div>

            {/* VIDEO TITLE */}
            <h2 className="mt-6 text-xl md:text-2xl text-yellow-400 font-bold tracking-wide drop-shadow-lg">
              ATP SHIVARATRI 2026 SRI CHALLA LAKSHMI PRASAD GARU (APIIC DIRECTOR)
            </h2>

          </div>
        ))}

      </div>

    </div>
  );
}