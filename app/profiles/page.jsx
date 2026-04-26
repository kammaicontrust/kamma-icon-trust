"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, MapPin, Briefcase, Network, User } from "lucide-react";

import ProfileCard from "@/app/components/ProfileCard";

const FilterInput = ({ icon: Icon, placeholder, value, onChange }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0A1F44]/40 group-focus-within:text-[#FF9933] transition-colors">
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-11 pr-4 py-3.5 bg-white/40 border border-white/50 rounded-2xl text-[#0A1F44] placeholder-[#0A1F44]/40 focus:outline-none focus:ring-4 focus:ring-[#FF9933]/10 focus:border-[#FF9933]/40 focus:bg-white transition-all duration-300"
    />
  </div>
);

export default function ProfilesPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    village: "",
    gothram: "",
    occupation: "",
  });

  // Parallax for header section
  const headerRef = useRef(null);
  const { scrollYProgress: headerScroll } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });
  const headerY = useTransform(headerScroll, [0, 1], [0, -60]);
  const headerScale = useTransform(headerScroll, [0, 1], [1, 0.96]);
  const headerOpacity = useTransform(headerScroll, [0, 0.6], [1, 0.3]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    (filters.name === "" || u.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.village === "" || u.village?.toLowerCase().includes(filters.village.toLowerCase())) &&
    (filters.gothram === "" || u.gothram?.toLowerCase().includes(filters.gothram.toLowerCase())) &&
    (filters.occupation === "" || u.occupation?.toLowerCase().includes(filters.occupation.toLowerCase()))
  );

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A1F44] py-24 px-4 sm:px-6 lg:px-8 selection:bg-[#FF9933]/20 selection:text-[#0A1F44]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section — Parallax */}
        <motion.div
          ref={headerRef}
          style={{ y: headerY, scale: headerScale, opacity: headerOpacity }}
          className="text-center mb-24"
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
            <span className="bg-gradient-to-r from-[#FF9933] via-[#0A1F44] to-[#138808] bg-clip-text text-transparent">Perfect Match</span>
          </motion.h1>
        </motion.div>

        {/* Search & Filter Panel — Depth entrance */}
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 4 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ perspective: "1000px" }}
          className="relative z-20 mb-24"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933]/5 to-[#138808]/5 rounded-[3rem] blur-3xl -z-10" />
          <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-2xl bg-[#FF9933]/10 text-[#FF9933]">
                <Search className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#0A1F44]/40">Filter Profiles</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FilterInput 
                icon={User} 
                placeholder="Full Name" 
                value={filters.name} 
                onChange={(v) => handleFilterChange("name", v)} 
              />
              <FilterInput 
                icon={MapPin} 
                placeholder="Village / Location" 
                value={filters.village} 
                onChange={(v) => handleFilterChange("village", v)} 
              />
              <FilterInput 
                icon={Network} 
                placeholder="Gothram" 
                value={filters.gothram} 
                onChange={(v) => handleFilterChange("gothram", v)} 
              />
              <FilterInput 
                icon={Briefcase} 
                placeholder="Occupation" 
                value={filters.occupation} 
                onChange={(v) => handleFilterChange("occupation", v)} 
              />
            </div>
          </div>
        </motion.div>

        {/* Profiles Grid — Z-axis staggered entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" style={{ perspective: "1200px" }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, scale: 0.88, z: -80, rotateX: 6 }}
                animate={{ opacity: 1, scale: 1, z: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.88, z: -80 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.07,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <ProfileCard user={u} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && users.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 font-medium">No profiles match your search criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}