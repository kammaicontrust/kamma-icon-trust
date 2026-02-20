"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function VideosSection() {
  const [videos, setVideos] = useState([]);

  // Extract YouTube ID from URL
  const extractVideoId = (url) => {
    if (!url) return null;

    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/
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
      }
    };

    fetchVideos();
  }, []);

  if (!videos.length) return null;

  return (
    <section className="bg-black py-24 px-6">
      <h2 className="text-center text-5xl font-bold text-yellow-400 mb-16">
        VIDEOS
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">
        {videos.map((video) => {
          const videoId = extractVideoId(video.url);
          if (!videoId) return null;

          return (
            <div
              key={video.id}
              className="rounded-3xl overflow-hidden shadow-2xl shadow-yellow-500/20 transform transition duration-500 hover:scale-105"
            >
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
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
