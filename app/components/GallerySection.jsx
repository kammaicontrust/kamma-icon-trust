"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } } };

export default function GallerySection() {
  const [images, setImages] = useState([]);

  // Window-level scroll (safe with conditional rendering)
  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const swiperY = useTransform(scrollYProgress, [0, 1], [12, -10]);

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
    <section id="gallery" className="relative overflow-hidden bg-[#F8F9FA] px-4 py-32 sm:px-6 lg:px-8">
      {/* Decorative blurred background */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9933]/5 blur-[120px]" />
      
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
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF9933]">Visual Journey</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-[#0A1F44] sm:text-6xl">OUR GALLERY</h2>
          <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-gradient-to-r from-[#FF9933] to-[#138808]" />
        </motion.div>

        {/* Swiper with parallax offset + enhanced coverflow */}
        <motion.div
          style={{ y: swiperY }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="pb-12"
        >
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            loop={true}
            coverflowEffect={{
              rotate: 20,
              stretch: 0,
              depth: 180,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            className="premium-swiper py-10"
          >
            {images.map((img) => (
              <SwiperSlide key={img.id} className="w-[300px] sm:w-[450px]">
                <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/40 bg-white/30 backdrop-blur-md shadow-[0_16px_48px_-8px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_24px_64px_-12px_rgba(255,153,51,0.15)]">
                  <Image 
                    src={img.imageUrl} 
                    alt="Gallery Image" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  {/* Depth overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      <style jsx global>{`
        .premium-swiper .swiper-pagination-bullet {
          background: #0A1F44 !important;
          opacity: 0.2;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .premium-swiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #FF9933 !important;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
