"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function VideosAdmin() {
  const [link, setLink] = useState("");
  const [videos, setVideos] = useState([]);

  async function loadVideos() {
    const snapshot = await getDocs(collection(db, "videos"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVideos(data);
  }

  useEffect(() => {
    loadVideos();
  }, []);

  async function addVideo() {
    if (!link.trim()) return alert("Paste YouTube link");

    await addDoc(collection(db, "videos"), {
      link,
      createdAt: serverTimestamp(),
    });

    setLink("");
    loadVideos();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this video?")) return;
    await deleteDoc(doc(db, "videos", id));
    loadVideos();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-10">
        Video Manager
      </h1>

      {/* Add Video */}
      <div className="bg-black/60 p-8 rounded-2xl border border-yellow-500/20 mb-12">
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste YouTube link"
          className="w-full p-3 rounded-lg mb-4 bg-gray-900 text-white"
        />

        <button
          onClick={addVideo}
          className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:scale-105 transition"
        >
          Add Video
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="flex justify-between items-center bg-black/60 p-4 rounded-lg border border-yellow-500/20"
          >
            <p className="truncate w-3/4">{vid.link}</p>

            <button
              onClick={() => handleDelete(vid.id)}
              className="px-4 py-2 bg-red-600 rounded-lg text-white"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
