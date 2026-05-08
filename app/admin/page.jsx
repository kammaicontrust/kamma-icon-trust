"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  ArrowUpRight,
  UserPlus
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import Link from "next/link";

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight className="w-3 h-3" />
          <span className="text-[10px] font-bold tracking-wider">{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-bold text-[#0A1F44]/40 uppercase tracking-[0.15em] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-[#0A1F44] tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    male: 0,
    female: 0,
    today: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const q = query(collection(db, "registrations"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        const now = new Date();
        const todayStart = new Date(now.setHours(0,0,0,0));

        const total = docs.length;
        const completed = docs.filter(d => d.profileCompleted).length;
        const pending = total - completed;
        const male = docs.filter(d => d.profile?.gender === "Male").length;
        const female = docs.filter(d => d.profile?.gender === "Female").length;
        const today = docs.filter(d => d.submittedAt?.toDate() >= todayStart).length;

        setStats({ total, completed, pending, male, female, today });

        // Chart Data (Last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const trendData = last7Days.map(date => {
          const count = docs.filter(d => {
            const subDate = d.submittedAt?.toDate();
            return subDate && subDate.toISOString().split('T')[0] === date;
          }).length;
          return { date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), count };
        });
        setChartData(trendData);

        // Recent registrations
        const recentQ = query(collection(db, "registrations"), orderBy("submittedAt", "desc"), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentRegistrations(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A1F44] tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 font-medium">Monitoring KIT Matrimonial registrations in real-time.</p>
        </div>
        <Link 
          href="/admin/registrations"
          className="flex items-center gap-2 bg-[#0A1F44] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-[#0A1F44]/10 hover:scale-[1.02] transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Manage All Profiles
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Registered" value={stats.total} icon={Users} trend="+12%" color="bg-blue-500" />
        <StatCard title="Completed Profiles" value={stats.completed} icon={UserCheck} trend="+8%" color="bg-emerald-500" />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} trend="-5%" color="bg-orange-500" />
        <StatCard title="Male / Female" value={`${stats.male} / ${stats.female}`} icon={TrendingUp} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-[#0A1F44] tracking-tight uppercase tracking-[0.1em]">Registration Trends</h3>
            <span className="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 px-3 py-1 rounded-full uppercase tracking-wider">Last 7 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1.5rem', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '1rem'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#FFD700" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-[#0A1F44] tracking-tight uppercase tracking-[0.1em] mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentRegistrations.map((user) => (
              <div key={user.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#0A1F44]/20 font-black">
                      {user.name?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#0A1F44] truncate tracking-tight">{user.name || "Untitled"}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.token || "No Token"}</p>
                </div>
                <Link href={`/admin/registrations/${user.id}`} className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#FFD700] group-hover:text-[#0A1F44] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
            {recentRegistrations.length === 0 && (
              <p className="text-center py-10 text-gray-400 font-bold text-sm">No recent activity</p>
            )}
            <Link 
              href="/admin/registrations"
              className="block w-full py-4 text-center text-xs font-black text-[#0A1F44]/40 uppercase tracking-[0.2em] border-t border-gray-100 hover:text-[#0A1F44] transition-colors mt-4"
            >
              View All Registrations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
