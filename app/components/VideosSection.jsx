"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const cardFade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } };

export default function VideosSection() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setVideos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
      }
    };
    fetchVideos();
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div className="mb-16 text-center" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">Watch & Learn</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">VIDEOS</h2>
          <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
        </motion.div>

        <motion.div className="grid gap-8 lg:grid-cols-2" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {videos.map((video) => (
            <motion.div key={video.id} variants={cardFade}>
              <div className="overflow-hidden rounded-2xl border border-[#0A1F44]/[0.04] shadow-[0_1px_3px_rgba(10,31,68,0.04),0_6px_24px_rgba(10,31,68,0.04)]">
                <div className="relative w-full pb-[56.25%]">
                  <iframe src={`https://www.youtube.com/embed/${video.videoId}?rel=0`} className="absolute left-0 top-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              </div>
              <h3 className="mt-5 text-[15px] font-bold tracking-[-0.01em] text-[#0A1F44]/65">
                ATP SHIVARATRI 2026 SRI CHALLA LAKSHMI PRASAD GARU (APIIC DIRECTOR)
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
