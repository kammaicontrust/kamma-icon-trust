"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Network, User } from "lucide-react";

const FilterInput = ({ icon: Icon, placeholder, value, onChange }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF9933] transition-colors">
      <Icon className="w-4 h-4" strokeWidth={1.5} />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl text-[#0A1F44] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/20 focus:border-[#FF9933] focus:bg-white transition-all duration-300 shadow-sm"
    />
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-gray-500">
      <Icon className="w-4 h-4" strokeWidth={1.5} />
      <span className="tracking-wide">{label}</span>
    </div>
    <span className="font-medium text-[#0A1F44] text-right ml-4 truncate">
      {value || "—"}
    </span>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A1F44] py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#FF9933]/20 selection:text-[#0A1F44]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A1F44]"
          >
            Matrimonial Profiles
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-1.5 w-24 bg-gradient-to-r from-[#FF9933] to-[#138808] mx-auto rounded-full"
          />
        </div>

        {/* Search & Filter - Floating Glass Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-5 h-5 text-[#FF9933]" strokeWidth={2} />
            <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-[#0A1F44]/80">Refine Search</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FilterInput 
              icon={User} 
              placeholder="Search by Name" 
              value={filters.name} 
              onChange={(v) => handleFilterChange("name", v)} 
            />
            <FilterInput 
              icon={MapPin} 
              placeholder="Search by Village" 
              value={filters.village} 
              onChange={(v) => handleFilterChange("village", v)} 
            />
            <FilterInput 
              icon={Network} 
              placeholder="Search by Gothram" 
              value={filters.gothram} 
              onChange={(v) => handleFilterChange("gothram", v)} 
            />
            <FilterInput 
              icon={Briefcase} 
              placeholder="Search by Occupation" 
              value={filters.occupation} 
              onChange={(v) => handleFilterChange("occupation", v)} 
            />
          </div>
        </motion.div>

        {/* Profiles Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((u) => (
            <motion.div 
              key={u.id}
              variants={cardVariants}
              whileHover={{ 
                y: -8, 
                boxShadow: "0 20px 40px -10px rgba(10,31,68,0.08)",
                borderColor: "rgba(255,153,51,0.3)"
              }}
              className="relative bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] overflow-hidden group transition-colors duration-300"
            >
              <div className="p-8 flex flex-col items-center">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933] to-[#138808] rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden z-10 bg-gray-100 flex items-center justify-center">
                    {u.photoUrl ? (
                      <img
                        src={u.photoUrl}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-300" />
                    )}
                  </div>
                </div>
                
                {/* Name */}
                <h3 className="text-2xl font-bold text-[#0A1F44] tracking-tight mb-8 text-center group-hover:text-[#FF9933] transition-colors duration-300">
                  {u.name || "Unknown"}
                </h3>

                {/* Details Section */}
                <div className="w-full space-y-4 mb-8">
                  <InfoRow icon={MapPin} label="Village" value={u.village} />
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
                  <InfoRow icon={Network} label="Gothram" value={u.gothram} />
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
                  <InfoRow icon={Briefcase} label="Occupation" value={u.occupation} />
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
                  <InfoRow icon={User} label="Age" value={u.age ? `${u.age} years` : undefined} />
                </div>

                {/* View Profile Button */}
                <Link href={`/profile/${u.id}`} className="w-full mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#ffaa55] text-white font-bold tracking-wide shadow-lg shadow-[#FF9933]/20 hover:shadow-[#FF9933]/40 transition-shadow duration-300 relative overflow-hidden"
                  >
                    <span className="relative z-10">View Profile</span>
                    <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

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