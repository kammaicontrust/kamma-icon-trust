"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Eye, 
  MousePointer2,
  Zap,
  Activity,
  Loader2,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform ${color}`}>
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex items-center justify-between mb-4">
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
       {trend && <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-[9px] font-black animate-pulse uppercase tracking-widest">{trend}</span>}
    </div>
    <h4 className="text-4xl font-black text-[#0A1F44] tracking-tighter">{value}</h4>
  </div>
);

export default function SuperAdminOverview() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [recentData, setRecentData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    tokens: 0,
    views: 0
  });

  useEffect(() => {
    setMounted(true);
    // Fetch summary stats
    const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentData(docs);
      setStats(prev => ({
        ...prev,
        total: snapshot.size, // This is only recent docs, need better way for total
      }));
      setLoading(false);
    });

    // Mock/Fetch other stats
    // ...

    return () => unsubscribe();
  }, []);

  if (loading || !mounted) return <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" /></div>;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="System Users" value="1,284" icon={Users} color="bg-blue-600" />
        <StatCard title="Live Profiles" value="842" icon={UserCheck} color="bg-emerald-600" trend="Active" />
        <StatCard title="Active Tokens" value="156" icon={Zap} color="bg-[#FFD700]" />
        <StatCard title="Website Health" value="99.9%" icon={Activity} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Activity */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-[#0A1F44] tracking-tight uppercase tracking-widest">Recent Activity</h3>
              <Link href="/super-admin/registrations" className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest hover:underline">View All</Link>
           </div>
           <div className="space-y-6">
              {recentData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0A1F44] text-white flex items-center justify-center font-black">
                         {item.name?.[0] || "T"}
                      </div>
                      <div>
                         <p className="font-black text-[#0A1F44] tracking-tight">{item.name || "Token Generated"}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.token || "Registration"}</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#FFD700] transition-colors" />
                </div>
              ))}
           </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0A1F44] rounded-[4.5rem] p-16 text-white relative overflow-hidden flex flex-col justify-center">
           <div className="absolute top-0 right-0 p-16 opacity-10">
              <Zap className="w-32 h-32" />
           </div>
           <div className="relative z-10 space-y-8">
              <div>
                <h3 className="text-3xl font-black tracking-tight mb-2 uppercase tracking-widest">Control Center</h3>
                <p className="text-white/40 font-bold text-sm tracking-widest">Perform critical system operations.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Link href="/super-admin/content" className="bg-white/5 hover:bg-[#FFD700] hover:text-[#0A1F44] p-8 rounded-[2.5rem] transition-all border border-white/5 group">
                    <TrendingUp className="w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-widest">Update Content</p>
                 </Link>
                 <Link href="/super-admin/media" className="bg-white/5 hover:bg-[#FFD700] hover:text-[#0A1F44] p-8 rounded-[2.5rem] transition-all border border-white/5 group">
                    <Eye className="w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-widest">Manage Media</p>
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
