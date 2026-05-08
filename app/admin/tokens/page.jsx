"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  where,
  serverTimestamp,
  doc,
  deleteDoc
} from "firebase/firestore";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  CheckCircle, 
  Clock, 
  Copy, 
  Filter,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TokenManagement() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Bulk Generate Form
  const [bulkCount, setBulkCount] = useState(10);
  const [prefix, setPrefix] = useState("KIT");

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      // We only care about tokens here
      setTokens(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTokens = async () => {
    if (bulkCount > 100) {
      alert("Maximum 100 tokens at a time.");
      return;
    }
    setGenerating(true);
    try {
      const newTokens = [];
      for (let i = 0; i < bulkCount; i++) {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const token = `${prefix}-${randomStr}`;
        
        await addDoc(collection(db, "registrations"), {
          token,
          mobile: "", // Placeholder, will be filled during registration or set by admin
          profileCompleted: false,
          submittedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          isTokenOnly: true // Flag for unused tokens
        });
        newTokens.push(token);
      }
      alert(`Successfully generated ${bulkCount} tokens.`);
      fetchTokens();
    } catch (error) {
      console.error(error);
      alert("Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const deleteToken = async (id) => {
    if (confirm("Delete this unused token?")) {
      try {
        await deleteDoc(doc(db, "registrations", id));
        setTokens(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Token copied!");
  };

  const filteredTokens = tokens.filter(t => 
    t.token?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.mobile?.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header & Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Stats */}
        <div className="lg:col-span-2 bg-[#0A1F44] p-10 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">Token Control</h2>
            <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.2em] mb-10">Manage and issue registration access</p>
            
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-1">Total</p>
                <p className="text-4xl font-black">{tokens.length}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-1">Used</p>
                <p className="text-4xl font-black">{tokens.filter(t => !t.isTokenOnly || t.mobile).length}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-1">Available</p>
                <p className="text-4xl font-black">{tokens.filter(t => t.isTokenOnly && !t.mobile).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generator Form */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-[#0A1F44] tracking-tight uppercase tracking-[0.1em]">Generate Bulk</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
              <input 
                type="number" 
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 outline-none focus:border-[#FFD700] font-bold text-[#0A1F44]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Token Prefix</label>
              <input 
                type="text" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 outline-none focus:border-[#FFD700] font-bold text-[#0A1F44]"
              />
            </div>
            <button 
              onClick={generateTokens}
              disabled={generating}
              className="w-full py-5 bg-[#FFD700] text-[#0A1F44] font-black rounded-2xl shadow-xl shadow-[#FFD700]/10 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "ISSUE TOKENS"}
            </button>
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search tokens or linked mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-[#FFD700]/10 transition-all text-sm font-bold"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="p-4 rounded-2xl bg-gray-50 text-[#0A1F44] hover:bg-gray-100 transition-all">
                <Download className="w-5 h-5" />
             </button>
             <button className="p-4 rounded-2xl bg-gray-50 text-[#0A1F44] hover:bg-gray-100 transition-all">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Token ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Linked Mobile</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Created At</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD700]" /></td></tr>
              ) : filteredTokens.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <p className="font-black text-[#0A1F44] tracking-tight font-mono">{t.token}</p>
                      <button onClick={() => copyToClipboard(t.token)} className="text-gray-300 hover:text-[#FFD700] transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-[#0A1F44]">{t.mobile || "Unassigned"}</p>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t.submittedAt?.toDate().toLocaleDateString() || "N/A"}
                  </td>
                  <td className="px-8 py-5">
                    {(t.mobile || t.name) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        <Clock className="w-3 h-3" />
                        Available
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    {!t.name && (
                      <button 
                        onClick={() => deleteToken(t.id)}
                        className="p-2 rounded-xl text-gray-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
