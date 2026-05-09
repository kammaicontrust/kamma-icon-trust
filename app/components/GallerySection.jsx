"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import { gsap } from "gsap";

// ── Shimmer skeleton ──
const Shimmer = ({ className }) => (
  <div className={`relative overflow-hidden bg-stone-200/60 ${className}`}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
    <style jsx>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
  </div>
);

export default function GallerySection() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const floatRef = useRef(null);
  const isAnimating = useRef(false);
  const navTimerRef = useRef(null);
  const thumbStripRef = useRef(null);

  // ── Fetch images with order ASC → createdAt DESC fallback ──
  useEffect(() => {
    async function fetchImages() {
      try {
        let q;
        try {
          q = query(collection(db, "gallery"), orderBy("order", "asc"));
          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          // Sort: items with order first, then by createdAt desc
          docs.sort((a, b) => {
            if (a.order != null && b.order != null) return a.order - b.order;
            if (a.order != null) return -1;
            if (b.order != null) return 1;
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });
          setImages(docs);
        } catch {
          // Fallback if order index doesn't exist
          q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          setImages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Gallery fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  // ── Intersection Observer ──
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Entrance animation (minimal GSAP, only once) ──
  useEffect(() => {
    if (!inView || loading || images.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(".gsap-gallery-title", { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" });
      gsap.from(".gsap-gallery-container", { opacity: 0, scale: 0.97, duration: 0.8, ease: "power3.out", delay: 0.2 });
      gsap.from(".gsap-nav-btn", { opacity: 0, scale: 0.8, duration: 0.5, ease: "power3.out", delay: 0.4, stagger: 0.1 });
      gsap.from(".gsap-thumb-strip", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out", delay: 0.5 });

      // Subtle float (only one tween, lightweight)
      if (floatRef.current) {
        gsap.to(floatRef.current, { y: -5, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [inView, loading, images.length]);

  // ── Auto-hide nav on mobile (3s timeout) ──
  const resetNavTimer = useCallback(() => {
    setNavVisible(true);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => setNavVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetNavTimer();
    return () => { if (navTimerRef.current) clearTimeout(navTimerRef.current); };
  }, [resetNavTimer]);

  // ── GSAP image transition ──
  const navigate = useCallback(
    (direction) => {
      if (isAnimating.current || images.length <= 1) return;
      isAnimating.current = true;
      resetNavTimer();

      const nextIndex = (currentIndex + direction + images.length) % images.length;
      const currentEl = imagesRef.current[currentIndex];
      const nextEl = imagesRef.current[nextIndex];
      if (!currentEl || !nextEl) { isAnimating.current = false; return; }

      const xOffset = 40 * direction;

      gsap.set(nextEl, { zIndex: 2, display: "block" });
      gsap.set(currentEl, { zIndex: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentIndex(nextIndex);
          isAnimating.current = false;
        },
      });

      tl.to(currentEl, { opacity: 0, scale: 0.96, x: -xOffset, duration: 0.5, ease: "power3.inOut" }, 0)
        .fromTo(nextEl,
          { opacity: 0, scale: 1.02, x: xOffset },
          { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: "power3.inOut" },
          0
        );
    },
    [currentIndex, images.length, resetNavTimer]
  );

  // ── Direct jump to index ──
  const jumpTo = useCallback((idx) => {
    if (isAnimating.current || idx === currentIndex) return;
    const direction = idx > currentIndex ? 1 : -1;
    isAnimating.current = true;
    resetNavTimer();

    const currentEl = imagesRef.current[currentIndex];
    const nextEl = imagesRef.current[idx];
    if (!currentEl || !nextEl) { isAnimating.current = false; return; }

    gsap.set(nextEl, { zIndex: 2, display: "block" });
    gsap.set(currentEl, { zIndex: 1 });

    const tl = gsap.timeline({
      onComplete: () => { setCurrentIndex(idx); isAnimating.current = false; },
    });

    tl.to(currentEl, { opacity: 0, scale: 0.96, duration: 0.4, ease: "power3.inOut" }, 0)
      .fromTo(nextEl, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.inOut" }, 0);
  }, [currentIndex, resetNavTimer]);

  // ── Keyboard navigation ──
  useEffect(() => {
    const h = (e) => { if (e.key === "ArrowLeft") navigate(-1); if (e.key === "ArrowRight") navigate(1); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [navigate]);

  // ── Swipe gestures ──
  const touchStart = useRef(0);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; resetNavTimer(); };
  const handleTouchEnd = (e) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 40) navigate(1);
    if (diff < -40) navigate(-1);
  };

  // ── Parallax tilt (desktop only, skip on mobile for performance) ──
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    gsap.to(containerRef.current, { rotateY: x * 6, rotateX: -y * 6, duration: 0.4, ease: "power2.out", transformPerspective: 1000 });
  };
  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, { rotateY: 0, rotateX: 0, duration: 0.4, ease: "power2.out" });
  };

  // ── Preload adjacent images ──
  const preloadIndices = useMemo(() => {
    if (images.length <= 1) return [];
    const prev = (currentIndex - 1 + images.length) % images.length;
    const next = (currentIndex + 1) % images.length;
    return [prev, next];
  }, [currentIndex, images.length]);

  // ── Scroll thumbnail strip to keep active thumb visible ──
  useEffect(() => {
    if (thumbStripRef.current) {
      const activeThumb = thumbStripRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentIndex]);

  return (
    <section ref={sectionRef} id="gallery" className="relative overflow-hidden bg-stone-50 px-4 py-32 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="gsap-gallery-title mb-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Visual Journey</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-stone-900 sm:text-6xl">GALLERY</h2>
          <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" />
        </div>

        {loading ? (
          /* Shimmer skeleton */
          <div className="mx-auto max-w-3xl space-y-6">
            <Shimmer className="aspect-[4/3] w-full rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]" />
            <div className="flex justify-center gap-3">
              {[1,2,3,4,5].map(i => <Shimmer key={i} className="w-16 h-16 rounded-xl" />)}
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="py-20 text-center text-stone-500 font-medium">No images available</div>
        ) : (
          <div
            className="relative mx-auto max-w-4xl px-4 sm:px-16"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={resetNavTimer}
            style={{ perspective: 1000 }}
          >
            {/* LEFT BUTTON */}
            <button
              onClick={() => navigate(-1)}
              aria-label="Previous image"
              className={`gsap-nav-btn absolute left-0 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/60 text-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95 ${navVisible ? "opacity-100" : "opacity-0 pointer-events-none"} sm:opacity-100 sm:pointer-events-auto`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* MAIN IMAGE CONTAINER */}
            <div ref={containerRef} className="gsap-gallery-container relative aspect-[4/3] w-full" style={{ transformStyle: "preserve-3d" }}>
              <div ref={floatRef} className="h-full w-full overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] bg-white/20 backdrop-blur-sm border border-white/40">
                {images.map((img, idx) => {
                  const isActive = idx === currentIndex;
                  const isAdjacent = preloadIndices.includes(idx);
                  // Only render current + adjacent images for memory efficiency
                  if (!isActive && !isAdjacent && images.length > 6) return (
                    <div key={img.id} ref={(el) => (imagesRef.current[idx] = el)} className="absolute inset-0" style={{ opacity: 0, zIndex: 0, pointerEvents: "none" }} />
                  );

                  return (
                    <div
                      key={img.id}
                      ref={(el) => (imagesRef.current[idx] = el)}
                      className="absolute inset-0"
                      style={{
                        opacity: isActive ? 1 : 0,
                        zIndex: isActive ? 10 : 0,
                        pointerEvents: isActive ? "auto" : "none",
                      }}
                    >
                      <Image
                        src={img.imageUrl}
                        alt={img.title || "Gallery"}
                        fill
                        className="object-contain sm:object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                        priority={isActive}
                        loading={isActive ? "eager" : "lazy"}
                        placeholder={img.blurDataURL ? "blur" : "empty"}
                        blurDataURL={img.blurDataURL || undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT BUTTON */}
            <button
              onClick={() => navigate(1)}
              aria-label="Next image"
              className={`gsap-nav-btn absolute right-0 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/60 text-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95 ${navVisible ? "opacity-100" : "opacity-0 pointer-events-none"} sm:opacity-100 sm:pointer-events-auto`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* THUMBNAIL STRIP */}
            <div className="gsap-thumb-strip mt-8 flex justify-center">
              <div
                ref={thumbStripRef}
                className="flex gap-3 overflow-x-auto max-w-full px-2 py-2 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => jumpTo(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      idx === currentIndex
                        ? "border-amber-400 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                        : "border-transparent opacity-50 hover:opacity-80 hover:border-stone-300"
                    }`}
                  >
                    <img
                      src={img.thumbnailUrl || img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* IMAGE COUNTER */}
            <div className="mt-4 text-center">
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
