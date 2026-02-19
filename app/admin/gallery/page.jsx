"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const storage = getStorage();

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((galleryDoc) => ({
        id: galleryDoc.id,
        ...galleryDoc.data(),
      }));
      setImages(list);
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    const storageRef = ref(storage, `gallery/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, "gallery"), {
      imageUrl: downloadURL,
      createdAt: serverTimestamp(),
    });

    setFile(null);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "gallery", id));
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-yellow-500 mb-10">
        Upload Gallery Image
      </h1>

      {/* Upload Section */}
      <div className="bg-black/60 p-8 rounded-2xl border border-yellow-500/20 mb-12">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 text-white"
        />

        <button
          onClick={handleUpload}
          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-black transition"
        >
          Upload Image
        </button>
      </div>

      {/* Uploaded Images */}
      <h2 className="text-3xl text-yellow-400 mb-6">Uploaded Images</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-black/60 p-4 rounded-xl border border-yellow-500/20"
          >
            <img
              src={img.imageUrl}
              alt=""
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <button
              onClick={() => handleDelete(img.id)}
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
