"use client";

import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminVideos() {
  const [link, setLink] = useState("");

  async function handleAdd() {
    if (!link.trim()) return;

    await addDoc(collection(db, "videos"), {
      link,
      createdAt: serverTimestamp(),
    });

    setLink("");
    alert("Video added successfully!");
  }

  return (
    <div className="max-w-2xl">

      <h1 className="text-2xl font-bold text-yellow-500 mb-8">
        Add YouTube Video
      </h1>

      <div className="bg-white/5 border border-yellow-500/20 
      rounded-2xl p-8 shadow-xl space-y-6">

        <input
          type="text"
          placeholder="Paste YouTube link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full bg-black border border-yellow-500/30 
          rounded-xl px-4 py-3 text-white focus:outline-none 
          focus:ring-2 focus:ring-yellow-500"
        />

        <button
          onClick={handleAdd}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400
          text-black font-semibold py-3 rounded-xl shadow-lg
          hover:scale-105 transition duration-300"
        >
          Add Video
        </button>

      </div>
    </div>
  );
}
