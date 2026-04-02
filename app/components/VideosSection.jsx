"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function VideoSection() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("VIDEOS:", data); // 🔥 DEBUG

        setVideos(data);
      } catch (err) {
        console.error("Video fetch error:", err);
      }
    };

    fetchVideos();
  }, []);

  if (videos.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-10">
        No videos yet
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4">
      {videos.map((video) => (
        <div key={video.id} className="bg-gray-900 p-2 rounded-xl">
          <iframe
            width="100%"
            height="250"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title="YouTube video"
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </div>
      ))}
    </div>
  );
}