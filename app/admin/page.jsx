"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export default function AdminDashboard() {
  const [file, setFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // Fetch Data
  // =========================
  const fetchData = async () => {
    try {
      const videoQuery = query(
        collection(db, "videos"),
        orderBy("createdAt", "desc")
      );
      const videoSnapshot = await getDocs(videoQuery);
      setVideos(videoSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const imageQuery = query(
        collection(db, "gallery"),
        orderBy("createdAt", "desc")
      );
      const imageSnapshot = await getDocs(imageQuery);
      setImages(imageSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // Image Upload
  // =========================
  const handleUploadImage = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const imageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      await addDoc(collection(db, "gallery"), {
        imageUrl: downloadURL,
        createdAt: new Date(),
      });

      alert("Image uploaded successfully");
      setFile(null);
      fetchData();
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Extract YouTube ID
  // =========================
  const extractVideoId = (url) => {
    if (!url || typeof url !== "string") return null;

    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
    );

    return match ? match[1] : null;
  };

  // =========================
  // Add Video
  // =========================
 const handleAddVideo = async () => {
  if (!videoLink.trim()) {
    alert("Paste Cloudinary video URL");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      videoUrl: videoLink.trim(),
      createdAt: new Date(),
    });

    alert("Video added successfully");
    setVideoLink("");
    fetchData();
  } catch (error) {
    console.error("Video add error:", error);
    alert("Failed to add video");
  }
};

  // =========================
  // Delete Video
  // =========================
  const deleteVideo = async (id) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      fetchData();
    } catch (error) {
      console.error("Delete video error:", error);
    }
  };

  // =========================
  // Delete Image
  // =========================
  const deleteImage = async (id, imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      await deleteDoc(doc(db, "gallery", id));
      fetchData();
    } catch (error) {
      console.error("Delete image error:", error);
    }
  };

  return (
    <div className="p-10 space-y-10 bg-black min-h-screen text-white">
      <h1 className="text-3xl text-yellow-400 font-bold">
        Admin Dashboard
      </h1>

      {/* ================= IMAGE UPLOAD ================= */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="text-xl text-yellow-400 mb-4">Upload Image</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={handleUploadImage}
          className="bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* ================= ADD VIDEO ================= */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="text-xl text-yellow-400 mb-4">Add Video Link</h2>

        <input
  type="text"
  value={videoLink}
  onChange={(e) => setVideoLink(e.target.value)}
  placeholder="Paste Cloudinary video URL"
/>

        <button
          onClick={handleAddVideo}
          className="bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold"
        >
          Add Video
        </button>
      </div>

      {/* ================= VIDEO LIST ================= */}
      <div>
        <h2 className="text-xl text-yellow-400 mb-4">Existing Videos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-gray-900 p-4 rounded-xl">
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${video.videoId}`}
                allowFullScreen
              ></iframe>

              <button
                onClick={() => deleteVideo(video.id)}
                className="mt-3 bg-red-600 px-4 py-1 rounded-full"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= IMAGE LIST ================= */}
      <div>
        <h2 className="text-xl text-yellow-400 mb-4">Gallery Images</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-gray-900 p-4 rounded-xl">
              <img
                src={img.imageUrl}
                className="w-full h-48 object-cover rounded-lg"
              />

              <button
                onClick={() => deleteImage(img.id, img.imageUrl)}
                className="mt-3 bg-red-600 px-4 py-1 rounded-full"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
