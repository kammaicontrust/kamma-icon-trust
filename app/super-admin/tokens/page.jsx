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
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { 
  Ticket, 
  Search, 
  Trash2, 
  Plus, 
  Copy,
  Clock,
  Loader2,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TokensManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.isTokenOnly); // Only raw tokens
      setData(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Token copied! 📋");
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this token?")) {
      await deleteDoc(doc(db, "registrations", id));
    }
  };

  const filtered = data.filter(t => t.token?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading || !mounted) return <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-[#0A1F44] tracking-tight">Access Tokens</h1>
            <p className="text-gray-500 font-medium">Generate and manage invitation codes for new users.</p>
         </div>
         <button 
           onClick={generateToken}
           className="bg-[#0A1F44] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0A1F44]/20 hover:scale-105 transition-all flex items-center gap-3"
         >
           <Plus className="w-5 h-5 text-[#FFD700]" />
           NEW TOKEN
         </button>
      </div>

      <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 bg-gray-50/30">
           <div className="relative max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="text" 
                placeholder="Find a token..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-transparent rounded-3xl py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-bold text-[#0A1F44]"
              />
           </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           <AnimatePresence>
             {filtered.map((t) => (
               <motion.div
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 key={t.id}
                 className="bg-gray-50 p-8 rounded-[2.5rem] border border-transparent hover:border-[#FFD700]/30 hover:bg-white hover:shadow-2xl transition-all group relative"
               >
                  <div className="flex items-center justify-between mb-6">
                     <div className="p-3 bg-white rounded-2xl text-[#FFD700]">
                        <Ticket className="w-5 h-5" />
                     </div>
                     <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                  <h3 className="text-2xl font-black text-[#0A1F44] tracking-tighter mb-1">{t.token}</h3>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-6">Unused Access Code</p>
                  <button 
                    onClick={() => copyToClipboard(t.token)}
                    className="w-full bg-[#0A1F44] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#FFD700] hover:text-[#0A1F44] transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </button>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
