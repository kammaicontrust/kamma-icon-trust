"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import { gsap } from "gsap";

export default function GallerySection() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inView, setInView] = useState(false);

  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const floatRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    async function fetchImages() {
      try {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setImages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Gallery fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  // Intersection Observer to trigger entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Initial Stagger Animation & Floating Depth Effect
  useEffect(() => {
    if (inView && !loading && images.length > 0) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        tl.from(".gsap-gallery-title", { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" })
          .from(".gsap-gallery-container", { opacity: 0, scale: 0.95, duration: 0.8, ease: "power3.out" }, "-=0.6")
          .from(".gsap-nav-btn", { opacity: 0, x: (i) => (i === 0 ? -20 : 20), duration: 0.6, ease: "power3.out", stagger: 0.15 }, "-=0.4");

        // Micro floating effect
        if (floatRef.current) {
          gsap.to(floatRef.current, {
            y: -6,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [inView, loading, images.length]);

  // Image Transition Navigation
  const navigate = useCallback(
    (direction) => {
      if (isAnimating.current || images.length <= 1) return;
      isAnimating.current = true;

      const nextIndex = (currentIndex + direction + images.length) % images.length;
      const currentEl = imagesRef.current[currentIndex];
      const nextEl = imagesRef.current[nextIndex];

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            setCurrentIndex(nextIndex);
            isAnimating.current = false;
          },
        });

        const xOffset = 50 * direction;

        gsap.set(nextEl, { zIndex: 2, display: "block" });
        gsap.set(currentEl, { zIndex: 1 });

        tl.to(currentEl, { opacity: 0, scale: 0.95, x: -xOffset, duration: 0.6, ease: "power3.inOut" }, 0)
          .fromTo(nextEl, { opacity: 0, scale: 1.05, x: xOffset }, { opacity: 1, scale: 1, x: 0, duration: 0.6, ease: "power3.inOut" }, 0);
      }, containerRef);

      // We don't revert here because we want the styles to persist until React re-renders
    },
    [currentIndex, images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Swipe gestures
  const touchStart = useRef(0);
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart.current - touchEnd > 50) navigate(1);
    if (touchStart.current - touchEnd < -50) navigate(-1);
  };

  // Parallax Tilt Effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    gsap.to(containerRef.current, {
      rotateY: x * 10,
      rotateX: -y * 10,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, { rotateY: 0, rotateX: 0, duration: 0.5, ease: "power2.out" });
  };

  return (
    <section ref={sectionRef} id="gallery" className="relative overflow-hidden bg-stone-50 px-4 py-32 sm:px-6 lg:px-8">
      {/* Decorative blurred background */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="gsap-gallery-title mb-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Visual Journey</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-stone-900 sm:text-6xl">GALLERY</h2>
          <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" />
        </div>

        {loading ? (
          <div className="mx-auto aspect-[4/3] w-full max-w-3xl animate-pulse rounded-[2rem] bg-stone-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]" />
        ) : images.length === 0 ? (
          <div className="py-20 text-center text-stone-500 font-medium">No images available</div>
        ) : (
          <div
            className="relative mx-auto max-w-4xl px-4 sm:px-16"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ perspective: 1000 }}
          >
            {/* LEFT BUTTON */}
            <button
              onClick={() => navigate(-1)}
              aria-label="Previous image"
              className="gsap-nav-btn absolute left-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/60 text-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95 sm:h-14 sm:w-14"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* MAIN IMAGE CONTAINER */}
            <div ref={containerRef} className="gsap-gallery-container relative aspect-[4/3] w-full" style={{ transformStyle: "preserve-3d" }}>
              <div ref={floatRef} className="h-full w-full overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] bg-white/20 backdrop-blur-sm border border-white/40">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    ref={(el) => (imagesRef.current[idx] = el)}
                    className="absolute inset-0 transition-opacity"
                    style={{
                      opacity: idx === currentIndex ? 1 : 0,
                      zIndex: idx === currentIndex ? 10 : 0,
                      pointerEvents: idx === currentIndex ? "auto" : "none",
                    }}
                  >
                    <Image src={img.imageUrl} alt="Gallery" fill className="object-contain sm:object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT BUTTON */}
            <button
              onClick={() => navigate(1)}
              aria-label="Next image"
              className="gsap-nav-btn absolute right-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/60 text-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95 sm:h-14 sm:w-14"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* IMAGE COUNTER */}
            <div className="mt-8 text-center overflow-hidden">
              <p className="inline-block text-sm font-semibold tracking-widest text-stone-500 bg-stone-200/50 px-4 py-1.5 rounded-full">
                <span className="text-stone-800">{currentIndex + 1}</span> / {images.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
