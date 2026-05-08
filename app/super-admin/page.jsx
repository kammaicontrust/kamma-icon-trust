"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Ticket, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Copy,
  Plus,
  Loader2,
  MoreVertical,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.05)] transition-all group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-[1.5rem] ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{trend}</span>
      )}
    </div>
    <p className="text-[11px] font-black text-[#0A1F44]/30 uppercase tracking-[0.2em] mb-2">{title}</p>
    <h3 className="text-4xl font-black text-[#0A1F44] tracking-tight">{value}</h3>
  </motion.div>
);

export default function SuperAdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [activeTab, setActiveTab] = useState("Profiles"); // Profiles or Tokens
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    male: 0,
    female: 0,
    late: 0,
    tokens: 0
  });

  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(docs);
      
      // Calculate Stats
      const total = docs.length;
      const completed = docs.filter(d => d.profileCompleted).length;
      const pending = total - completed;
      const male = docs.filter(d => d.profile?.gender === "Male").length;
      const female = docs.filter(d => d.profile?.gender === "Female").length;
      const late = docs.filter(d => parseInt(d.profile?.age) > 35).length;
      const tokens = docs.filter(d => d.isTokenOnly).length;
      
      setStats({ total, completed, pending, male, female, late, tokens });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProfiles = data.filter(p => {
    if (activeTab === "Profiles" && p.isTokenOnly) return false;
    if (activeTab === "Tokens" && !p.isTokenOnly) return false;

    const matchesSearch = 
      (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.mobile?.includes(searchTerm)) ||
      (p.token?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.profile?.village?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = filterGender === "All" || p.profile?.gender === filterGender;
    
    return matchesSearch && matchesGender;
  });

  const handleDelete = async (id) => {
    if (confirm("Permanently delete this entry?")) {
      await deleteDoc(doc(db, "registrations", id));
    }
  };

  const toggleStatus = async (id, current) => {
    await updateDoc(doc(db, "registrations", id), { profileCompleted: !current });
  };

  const generateToken = async () => {
    const token = `KIT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await addDoc(collection(db, "registrations"), {
      token,
      mobile: "",
      profileCompleted: false,
      submittedAt: serverTimestamp(),
      isTokenOnly: true
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" /></div>;
  }

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Registrations" value={stats.total} icon={Users} color="bg-blue-600" trend="Live" />
        <StatCard title="Male Profiles" value={stats.male} icon={Heart} color="bg-rose-600" />
        <StatCard title="Female Profiles" value={stats.female} icon={Heart} color="bg-fuchsia-600" />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="bg-orange-600" />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[4rem] border border-gray-100 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-10 border-b border-gray-50 bg-gray-50/30">
          <div className="flex flex-col xl:flex-row justify-between gap-8">
            <div className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm self-start">
              {["Profiles", "Tokens"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? "bg-[#0A1F44] text-white shadow-xl shadow-[#0A1F44]/20" 
                      : "text-[#0A1F44]/30 hover:text-[#0A1F44]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-1 max-w-2xl gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A1F44]/20" />
                <input 
                  type="text"
                  placeholder="Search database..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-3xl py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] transition-all font-bold text-[#0A1F44]"
                />
              </div>
              <select 
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="bg-white border border-gray-100 rounded-3xl px-8 py-5 outline-none font-black text-xs uppercase tracking-widest text-[#0A1F44]"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {activeTab === "Tokens" && (
                <button 
                  onClick={generateToken}
                  className="bg-[#FFD700] text-[#0A1F44] p-5 rounded-3xl shadow-xl shadow-[#FFD700]/20 hover:scale-105 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-8 text-[11px] font-black text-[#0A1F44]/30 uppercase tracking-[0.3em]">Identity</th>
                <th className="px-10 py-8 text-[11px] font-black text-[#0A1F44]/30 uppercase tracking-[0.3em]">Professional</th>
                <th className="px-10 py-8 text-[11px] font-black text-[#0A1F44]/30 uppercase tracking-[0.3em]">Status</th>
                <th className="px-10 py-8 text-[11px] font-black text-[#0A1F44]/30 uppercase tracking-[0.3em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredProfiles.map((p) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={p.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          {p.profileImageUrl ? (
                            <img src={p.profileImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#0A1F44]/10 font-black text-2xl">
                              {p.name?.[0] || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-lg text-[#0A1F44] tracking-tight">{p.name || "UNREGISTERED"}</p>
                          <div className="flex items-center gap-4 mt-1">
                             <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">{p.token}</span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                               <MapPin className="w-3 h-3" />
                               {p.profile?.village || "---"}
                             </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <p className="text-sm font-black text-[#0A1F44] tracking-tight truncate max-w-[200px]">
                          {p.profile?.occupation || "No Occupation"}
                        </p>
                        <div className="flex items-center gap-4">
                           <span className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <GraduationCap className="w-3 h-3" />
                             {p.profile?.education || "---"}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {p.profileCompleted ? (
                        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle className="w-3 h-3" />
                          LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">
                          <Clock className="w-3 h-3" />
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/super-admin/registrations/${p.id}`}
                          className="p-3 rounded-2xl bg-white border border-gray-100 text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white transition-all shadow-sm"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => toggleStatus(p.id, p.profileCompleted)}
                          className="p-3 rounded-2xl bg-white border border-gray-100 text-[#0A1F44] hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-3 rounded-2xl bg-white border border-gray-100 text-[#0A1F44] hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const GraduationCap = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
