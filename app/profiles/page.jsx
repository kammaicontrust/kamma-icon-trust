"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";

import ProfileCard from "@/app/components/ProfileCard";
import ProfileFilters from "@/app/components/ProfileFilters";
import ActiveFilterTags, { buildActiveTags, removeTag } from "@/app/components/ActiveFilterTags";

/* ─── Default filter state ───────────────────────────────────────── */
const DEFAULT_FILTERS = {
  gender: "",
  maritalStatuses: [],
  ageRange: [18, 60],
  heightRange: [140, 200],
  education: "",
  location: "",
  occupation: "",
  income: "",
};

/* ─── Height parser: converts strings like "5'8\"" or "172 cm" → cm ─ */
function parseHeightCm(val) {
  if (!val) return null;
  if (typeof val === "number") return val;
  const str = String(val).trim();
  // "5'8"  or  5ft 8in
  const ftInMatch = str.match(/(\d+)[''ft]+\s*(\d*)/i);
  if (ftInMatch) {
    const ft = parseInt(ftInMatch[1], 10);
    const inch = parseInt(ftInMatch[2] || "0", 10);
    return Math.round(ft * 30.48 + inch * 2.54);
  }
  // Pure number or "172 cm"
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/* ─── Income range matcher ───────────────────────────────────────── */
function matchesIncome(raw, filterIncome) {
  if (!filterIncome) return true;
  const val = parseFloat(String(raw || "").replace(/[^\d.]/g, ""));
  if (isNaN(val)) return false; // has filter but no data → exclude
  const map = {
    "Below ₹3L":      [0,   3],
    "₹3L – ₹6L":     [3,   6],
    "₹6L – ₹12L":    [6,  12],
    "₹12L – ₹25L":   [12, 25],
    "₹25L – ₹50L":   [25, 50],
    "Above ₹50L":    [50, Infinity],
  };
  const range = map[filterIncome];
  if (!range) return true;
  const lakhs = val >= 100000 ? val / 100000 : val >= 1000 ? val / 1000 : val; // normalise
  return lakhs >= range[0] && lakhs < range[1];
}

/* ─── Core filter function ───────────────────────────────────────── */
function applyFilters(users, f) {
  return users.filter(u => {
    if (f.gender && u.gender !== f.gender) return false;
    if (f.maritalStatuses.length && !f.maritalStatuses.includes(u.maritalStatus)) return false;

    const age = u.age;
    if (age != null && (age < f.ageRange[0] || age > f.ageRange[1])) return false;

    const hcm = u.heightCm;
    if (hcm != null && (hcm < f.heightRange[0] || hcm > f.heightRange[1])) return false;

    if (f.education && !u.education?.toLowerCase().includes(f.education.toLowerCase())) return false;
    if (f.location && !u.village?.toLowerCase().includes(f.location.toLowerCase())) return false;
    if (f.occupation && !u.occupation?.toLowerCase().includes(f.occupation.toLowerCase())) return false;
    if (!matchesIncome(u.annualIncome, f.income)) return false;

    return true;
  });
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function ProfilesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // pending = what user is tweaking; applied = what drives the grid
  const [pending, setPending] = useState({ ...DEFAULT_FILTERS });
  const [applied, setApplied] = useState({ ...DEFAULT_FILTERS });

  // Mobile bottom sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Parallax header
  const headerRef = useRef(null);
  const { scrollYProgress: headerScroll } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });
  const headerY = useTransform(headerScroll, [0, 1], [0, -60]);
  const headerScale = useTransform(headerScroll, [0, 1], [1, 0.96]);
  const headerOpacity = useTransform(headerScroll, [0, 0.6], [1, 0.3]);

  // Fetch
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const q = query(collection(db, "registrations"), where("profileCompleted", "==", true));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const root = doc.data();
          const profile = root.profile || {};

          let age = null;
          if (profile.dateOfBirth) {
            const dob = new Date(profile.dateOfBirth);
            const diff = Date.now() - dob.getTime();
            age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
          }

          return {
            id: doc.id,
            name: root.name || profile.name || "Kamma Member",
            village: profile.placeOfBirth || profile.village || "Not provided",
            gothram: profile.gotra || profile.gothram || "Not provided",
            age: age || profile.age || null,
            photoUrl: root.profileImageUrl || profile.photoUrl || null,
            gender: profile.gender || null,
            maritalStatus: profile.maritalStatus || null,
            education: profile.education || profile.qualification || null,
            occupation: profile.occupation || profile.job || null,
            heightCm: parseHeightCm(profile.height),
            annualIncome: profile.annualIncome || profile.income || null,
          };
        });
        setUsers(data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError(`Failed to load profiles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Filtered grid (driven by `applied`)
  const filtered = applyFilters(users, applied);

  // Preview count (driven by `pending`, for the live match count in the panel)
  const previewCount = applyFilters(users, pending).length;

  /* ── Handlers ─────────────────────────────────────────────────── */
  const handlePendingChange = useCallback((field, value) => {
    setPending(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleApply = useCallback(() => {
    setApplied({ ...pending });
    setSheetOpen(false);
  }, [pending]);

  const handleReset = useCallback(() => {
    setPending({ ...DEFAULT_FILTERS });
    setApplied({ ...DEFAULT_FILTERS });
    setSheetOpen(false);
  }, []);

  const handleRemoveTag = useCallback((tagKey) => {
    const next = removeTag(applied, tagKey);
    setApplied(next);
    setPending(next);
  }, [applied]);

  const activeTags = buildActiveTags(applied);
  const hasApplied = activeTags.length > 0;

  /* ── Filter panel JSX (shared between desktop + sheet) ─────────── */
  const filterPanelContent = (
    <ProfileFilters
      pending={pending}
      onPendingChange={handlePendingChange}
      onApply={handleApply}
      onReset={handleReset}
      matchCount={previewCount}
      totalCount={users.length}
    />
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A1F44] py-24 px-4 sm:px-6 lg:px-8 selection:bg-[#FF9933]/20 selection:text-[#0A1F44]">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          style={{ y: headerY, scale: headerScale, opacity: headerOpacity }}
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#FF9933] mb-4"
          >
            Matrimonial Service
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl md:text-7xl font-black tracking-tight text-[#0A1F44]"
          >
            Find Your <br />
            <span className="bg-gradient-to-r from-[#FF9933] via-[#0A1F44] to-[#138808] bg-clip-text text-transparent">
              Perfect Match
            </span>
          </motion.h1>
        </motion.div>

        {/* ── Desktop layout: sidebar filter + grid ── */}
        <div className="flex gap-8 items-start">

          {/* Desktop Filter Sidebar */}
          {!isMobile && (
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="hidden md:block w-80 flex-shrink-0 sticky top-24"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933]/5 to-[#138808]/5 rounded-[2.5rem] blur-3xl -z-10" />
                <div className="bg-white/60 backdrop-blur-3xl border border-white/70 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.06)]">
                  {/* Panel Header */}
                  <div className="flex items-center gap-3 mb-7">
                    <div className="p-2.5 rounded-xl bg-[#FF9933]/10 text-[#FF9933]">
                      <SlidersHorizontal className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-[0.15em] text-[#0A1F44]">Filters</h2>
                      {hasApplied && (
                        <p className="text-[11px] text-[#FF9933] font-bold">{activeTags.length} active</p>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-hide">
                    {filterPanelContent}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}

          {/* Main content area */}
          <div className="flex-1 min-w-0">

            {/* Active Filter Tags strip */}
            <AnimatePresence>
              {hasApplied && (
                <ActiveFilterTags
                  applied={applied}
                  onRemoveTag={handleRemoveTag}
                  onClearAll={handleReset}
                />
              )}
            </AnimatePresence>

            {/* Results header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-sm font-bold text-[#0A1F44]/40">
                {loading ? "Loading…" : (
                  <>
                    <span className="text-[#FF9933] text-base font-black">{filtered.length}</span>
                    <span> of {users.length} profiles</span>
                  </>
                )}
              </p>
            </motion.div>

            {/* Profile Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9933]" />
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-medium">{error}</div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                style={{ perspective: "1200px" }}
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((u, i) => (
                    <motion.div
                      key={u.id}
                      layout
                      initial={{ opacity: 0, scale: 0.88, z: -80, rotateX: 6 }}
                      animate={{ opacity: 1, scale: 1, z: 0, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 0.88, z: -80 }}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(i * 0.06, 0.4),
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <ProfileCard user={u} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF9933]/8 mb-5">
                  <Search className="w-8 h-8 text-[#FF9933]/50" />
                </div>
                <p className="text-lg text-[#0A1F44]/50 font-bold mb-2">
                  {users.length === 0 ? "No profiles available yet." : "No profiles match your filters."}
                </p>
                {hasApplied && (
                  <button
                    onClick={handleReset}
                    className="mt-2 text-sm font-bold text-[#FF9933] hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile FAB ── */}
      {isMobile && (
        <button
          onClick={() => setSheetOpen(true)}
          className="filter-fab"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
          Filters
          {hasApplied && (
            <span className="ml-1 bg-white/30 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {activeTags.length}
            </span>
          )}
        </button>
      )}

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Overlay */}
            <div
              className="filter-overlay"
              onClick={() => setSheetOpen(false)}
            />
            {/* Sheet */}
            <div className="filter-sheet" role="dialog" aria-modal="true" aria-label="Filter profiles">
              <div className="filter-sheet-handle" />
              {/* Sheet header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#FF9933]" strokeWidth={2} />
                  <h2 className="text-base font-black uppercase tracking-[0.12em] text-[#0A1F44]">Filters</h2>
                </div>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-2 rounded-full bg-[#0A1F44]/5 text-[#0A1F44]/50 hover:bg-[#0A1F44]/10 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              {filterPanelContent}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}