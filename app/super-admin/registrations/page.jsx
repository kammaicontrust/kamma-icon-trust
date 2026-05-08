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
  updateDoc
} from "firebase/firestore";
import { 
  Users, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock,
  MapPin,
  GraduationCap,
  Loader2,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function RegistrationsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All");

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => !d.isTokenOnly); // Filter out raw tokens
      setData(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = data.filter(p => {
    const matchesSearch = 
      (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.mobile?.includes(searchTerm)) ||
      (p.token?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.profile?.village?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = filterGender === "All" || p.profile?.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  const handleDelete = async (id) => {
    if (confirm("Delete this profile permanently?")) {
      await deleteDoc(doc(db, "registrations", id));
    }
  };

  const toggleStatus = async (id, current) => {
    await updateDoc(doc(db, "registrations", id), { profileCompleted: !current });
  };

  if (loading || !mounted) return <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-[#0A1F44] tracking-tight">Profile Database</h1>
            <p className="text-gray-500 font-medium">Manage user registrations and profile verification.</p>
         </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="text" 
                placeholder="Search profiles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-transparent rounded-3xl py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-bold text-[#0A1F44]"
              />
           </div>
           <select 
             value={filterGender}
             onChange={(e) => setFilterGender(e.target.value)}
             className="bg-white border border-transparent rounded-3xl px-10 py-5 outline-none font-black text-xs uppercase tracking-widest text-[#0A1F44]"
           >
             <option value="All">All Genders</option>
             <option value="Male">Male</option>
             <option value="Female">Female</option>
           </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-8 text-[11px] font-black text-gray-300 uppercase tracking-widest">User</th>
                <th className="px-10 py-8 text-[11px] font-black text-gray-300 uppercase tracking-widest">Career</th>
                <th className="px-10 py-8 text-[11px] font-black text-gray-300 uppercase tracking-widest">Status</th>
                <th className="px-10 py-8 text-[11px] font-black text-gray-300 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filtered.map((p) => (
                  <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={p.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 overflow-hidden shadow-inner">
                             {p.profileImageUrl ? <img src={p.profileImageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-[#0A1F44]/10 text-2xl">{p.name?.[0]}</div>}
                          </div>
                          <div>
                             <p className="font-black text-[#0A1F44] tracking-tight text-lg">{p.name}</p>
                             <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="text-[#FFD700]">{p.token}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.profile?.village || "Location unknown"}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-black text-sm text-[#0A1F44] tracking-tight mb-1">{p.profile?.occupation || "Not Specified"}</p>
                       <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {p.profile?.education || "---"}
                       </p>
                    </td>
                    <td className="px-10 py-8">
                       {p.profileCompleted ? (
                         <span className="px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
                       ) : (
                         <span className="px-5 py-2 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">Pending</span>
                       )}
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <Link href={`/super-admin/registrations/${p.id}`} className="p-3 rounded-2xl bg-white border border-gray-100 text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white transition-all shadow-sm">
                             <Eye className="w-5 h-5" />
                          </Link>
                          <button onClick={() => toggleStatus(p.id, p.profileCompleted)} className="p-3 rounded-2xl bg-white border border-gray-100 text-[#0A1F44] hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                             <CheckCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-3 rounded-2xl bg-white border border-gray-100 text-[#0A1F44] hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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
