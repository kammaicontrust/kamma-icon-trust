"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

export default function VideosSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  function extractId(url) {
    const reg =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&]+)/;
    const match = url.match(reg);
    return match ? match[1] : null;
  }

  return (
    <section id="videos" className="mt-32 max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold mb-12 text-center text-yellow-500 tracking-wide">
        VIDEOS
      </h2>

      {loading && (
        <p className="text-center text-gray-400">
          Loading videos...
        </p>
      )}

      {!loading && videos.length === 0 && (
        <p className="text-center text-gray-400">
          No videos added yet.
        </p>
      )}

      <div
        className={`grid gap-10 ${
          videos.length === 1
            ? "grid-cols-1 justify-items-center"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {videos.map((video) => {
          const id = extractId(video.link);
          if (!id) return null;

          return (
            <div
              key={video.id}
              className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-yellow-500/40"
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${id}`}
                title="YouTube video"
                allowFullScreen
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
