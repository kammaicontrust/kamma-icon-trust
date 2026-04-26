"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Play } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } } };

export default function VideosSection() {
  const [videos, setVideos] = useState([]);

  // Window-level scroll (safe with conditional rendering)
  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const swiperY = useTransform(scrollYProgress, [0, 1], [10, -8]);

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
    <section id="videos" className="bg-white px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header with parallax */}
        <motion.div
          style={{ y: headerY }}
          className="mb-20 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#138808]">Media Center</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0A1F44] sm:text-6xl">LATEST VIDEOS</h2>
          <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-gradient-to-r from-[#138808] to-[#0A1F44]" />
        </motion.div>

        {/* Swiper with parallax + depth entrance */}
        <motion.div
          style={{ y: swiperY }}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            centeredSlides={false}
            breakpoints={{
              640: { slidesPerView: 1.5, centeredSlides: true },
              1024: { slidesPerView: 2.5, centeredSlides: false },
            }}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="video-swiper pb-16"
          >
            {videos.map((video) => (
              <SwiperSlide key={video.id}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="group relative overflow-hidden rounded-[2.5rem] bg-[#0A1F44] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] transition-shadow duration-500 hover:shadow-[0_24px_60px_-12px_rgba(19,136,8,0.15)]"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    {/* YouTube Thumbnail */}
                    <img 
                      src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`} 
                      alt="Video Thumbnail"
                      className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40"
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF9933] text-white shadow-[0_8px_30px_rgba(255,153,51,0.4)] transition-all group-hover:bg-[#138808] group-hover:shadow-[0_8px_30px_rgba(19,136,8,0.4)]"
                      >
                        <Play className="ml-1 h-8 w-8 fill-current" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white group-hover:text-[#FF9933] transition-colors">
                      {video.title || "KIT Community Initiative"}
                    </h3>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      <style jsx global>{`
        .video-swiper .swiper-pagination-bullet {
          background: #0A1F44 !important;
          opacity: 0.2;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .video-swiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #138808 !important;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
