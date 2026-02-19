"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function VideosSection() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(
        collection(db, "videos"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVideos(data);
    };

    fetchVideos();
  }, []);

  if (!videos.length) return null;

  return (
    <section className="bg-black py-24 text-white">
      <h2 className="text-center text-5xl font-bold text-yellow-400 mb-16">
        VIDEOS
      </h2>

      <div className="max-w-7xl mx-auto px-6 
                      grid gap-14
                      grid-cols-1 md:grid-cols-2">

        {videos.map((video) => {
          if (!video?.videoId) return null;

          return (
            <div
              key={video.id}
              className="rounded-3xl overflow-hidden
                         shadow-2xl shadow-yellow-500/20
                         transform transition duration-500
                         hover:scale-105"
            >
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}
