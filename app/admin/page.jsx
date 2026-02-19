"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../lib/firebase";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Convert YouTube link to embed format
const convertToEmbed = (url) => {
  if (!url) return "";

  if (url.includes("youtu.be")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  return url;
};


  useEffect(() => {
    fetchData();
  }, []);

  // ================= FETCH =================
  const fetchData = async () => {
    const imageSnap = await getDocs(collection(db, "gallery"));
    const videoSnap = await getDocs(collection(db, "videos"));

    setImages(
      imageSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    setVideos(
      videoSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  // ================= UPLOAD IMAGE =================
  const handleUploadImage = async () => {
    if (!file) return alert("Select a file first");

    setLoading(true);

    try {
      const storagePath = `gallery/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "gallery"), {
        imageUrl: downloadURL,
        storagePath: storagePath,
        createdAt: serverTimestamp(),
      });

      setFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // ================= ADD VIDEO =================
  const handleAddVideo = async () => {
    if (!videoLink) return alert("Enter video link");

    await addDoc(collection(db, "videos"), {
      url: videoLink,
      createdAt: serverTimestamp(),
    });

    setVideoLink("");
    fetchData();
  };

  // ================= DELETE IMAGE =================
  const deleteImage = async (item) => {
    if (!confirm("Delete this image?")) return;

    try {
      if (item.storagePath) {
        const fileRef = ref(storage, item.storagePath);
        await deleteObject(fileRef);
      }

      await deleteDoc(doc(db, "gallery", item.id));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE VIDEO =================
  const deleteVideo = async (item) => {
    if (!confirm("Delete this video?")) return;

    await deleteDoc(doc(db, "videos", item.id));
    fetchData();
  };

  return (
    <div className="space-y-16">

      {/* ================= UPLOAD SECTION ================= */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Upload Image */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-yellow-400 text-xl mb-4">Upload Image</h2>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4"
          />

          <button
            onClick={handleUploadImage}
            className="bg-yellow-500 px-6 py-2 rounded-full text-black font-semibold"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Add Video */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-yellow-400 text-xl mb-4">Add Video Link</h2>

          <input
            type="text"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="Paste YouTube embed link"
            className="w-full px-4 py-2 mb-4 bg-black border border-gray-700 rounded-lg text-white"
          />

          <button
            onClick={handleAddVideo}
            className="bg-yellow-500 px-6 py-2 rounded-full text-black font-semibold"
          >
            Add Video
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-gray-900 p-6 rounded-xl text-center border border-gray-800">
          <h3 className="text-yellow-400">Total Images</h3>
          <p className="text-4xl font-bold">{images.length}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl text-center border border-gray-800">
          <h3 className="text-yellow-400">Total Videos</h3>
          <p className="text-4xl font-bold">{videos.length}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <Bar
            data={{
              labels: ["Images", "Videos"],
              datasets: [
                {
                  label: "Content Overview",
                  data: [images.length, videos.length],
                  backgroundColor: ["#facc15", "#38bdf8"],
                },
              ],
            }}
          />
        </div>

      </div>

      {/* ================= IMAGE GALLERY ================= */}
      <div>
        <h2 className="text-2xl text-yellow-400 mb-6">Image Gallery</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {images.map((item) => (
            <div key={item.id} className="relative group">
              <img
                src={item.imageUrl}
                alt="Gallery"
                className="w-full h-64 object-cover rounded-xl"
              />

              <button
                onClick={() => deleteImage(item)}
                className="absolute top-2 right-2 bg-red-600 px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= VIDEO GALLERY ================= */}
<div>
  <h2 className="text-2xl text-yellow-400 mb-6">Video Gallery</h2>

  <div className="grid md:grid-cols-2 gap-6">
    {videos.map((item) => (
      <div key={item.id} className="relative group">
        <iframe
          src={convertToEmbed(item.link)}
          className="w-full h-64 rounded-xl"
          allowFullScreen
        />

        <button
          onClick={() => deleteVideo(item)}
          className="absolute top-2 right-2 bg-red-600 px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition"
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
