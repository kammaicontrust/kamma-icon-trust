"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function VideoSection() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const snapshot = await getDocs(collection(db, "videos"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVideos(data);
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
      {videos.map((video) => (
        <div key={video.id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
          
          <video controls className="w-full h-52 object-cover" poster={video.thumbnail}>
            <source src={video.url} type="video/mp4" />
          </video>

          <div className="p-3 text-white">
            {video.title}
          </div>

        </div>
      ))}
    </div>
  );
}