"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function VideosSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    if (!url) return null;

    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/
    );

    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "videos"));

        const videoData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVideos(videoData);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <section className="bg-black py-24 text-center text-yellow-400 text-xl">
        Loading Videos...
      </section>
    );
  }

  if (!videos.length) return null;

  return (
    <section className="bg-black py-24 px-6">
      
      {/* Section Title */}
      <h2 className="text-center text-5xl font-bold text-yellow-400 mb-20 tracking-wide">
        VIDEOS
      </h2>

      {/* FLEX LAYOUT (Better than grid for dynamic items) */}
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-16">

        {videos.map((video) => {
          const videoId = extractVideoId(video.url);
          if (!videoId) return null;

          return (
            <div
              key={video.id}
              className="
                w-full
                sm:w-[90%]
                md:w-[45%]
                max-w-2xl
                rounded-3xl
                overflow-hidden
                shadow-2xl
                shadow-yellow-500/20
                transform
                transition-all
                duration-500
                hover:scale-105
                hover:shadow-yellow-400/40
              "
            >
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube Video"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </div>
          );
        })}

      </div>

    </section>
  );
}
