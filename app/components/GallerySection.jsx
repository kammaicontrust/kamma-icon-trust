"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const cardFade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } };

export default function GallerySection() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setImages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchImages();
  }, []);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div className="mb-16 text-center" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">Our Work in Action</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">GALLERY</h2>
          <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
        </motion.div>

        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }}>
          {images.map((img) => (
            <motion.div key={img.id} variants={cardFade} className="group relative h-[300px] overflow-hidden rounded-2xl border border-[#0A1F44]/[0.04] shadow-[0_1px_3px_rgba(10,31,68,0.04),0_4px_16px_rgba(10,31,68,0.03)]">
              <Image src={img.imageUrl} alt="Gallery Image" fill sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
