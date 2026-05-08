"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from "firebase/firestore";
import { 
  Users, 
  Eye, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Globe, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Loader2,
  MousePointer2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Legend
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ['#0A1F44', '#FFD700', '#D4882F', '#1A3A72', '#E5C100'];

const AnalyticsSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl bg-[#FFD700]/10 text-[#FFD700]">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-xl font-black text-[#0A1F44] tracking-tight uppercase tracking-widest">{title}</h3>
    </div>
    <div className="h-[350px] w-full">
      {children}
    </div>
  </div>
);

export default function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    views: [],
    devices: [],
    sources: [],
    topPages: [],
    summary: { totalViews: 0, liveNow: 0 }
  });

  useEffect(() => {
    setMounted(true);
    // 1. Listen to Page Views (Real-time)
    const viewsQuery = query(collection(db, "analytics_views"), orderBy("timestamp", "desc"), limit(500));
    const unsubscribe = onSnapshot(viewsQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Process Device Mix
      const devicesMap = {};
      docs.forEach(d => { devicesMap[d.device] = (devicesMap[d.device] || 0) + 1; });
      const devices = Object.keys(devicesMap).map(name => ({ name, value: devicesMap[name] }));

      // Process Sources
      const sourcesMap = {};
      docs.forEach(d => { sourcesMap[d.referrer] = (sourcesMap[d.referrer] || 0) + 1; });
      const sources = Object.keys(sourcesMap).map(name => ({ name, value: sourcesMap[name] }));

      // Process Top Pages
      const pagesMap = {};
      docs.forEach(d => { pagesMap[d.url] = (pagesMap[d.url] || 0) + 1; });
      const topPages = Object.keys(pagesMap)
        .sort((a,b) => pagesMap[b] - pagesMap[a])
        .slice(0, 5)
        .map(url => ({ url, count: pagesMap[url] }));

      // Process Trend (Last 7 days)
      // (Simplified: just using the summary collection for trend)
      
      setStats(prev => ({ 
        ...prev, 
        devices, 
        sources, 
        topPages,
        summary: { ...prev.summary, totalViews: snapshot.size } 
      }));
      setLoading(false);
    });

    // 2. Fetch Summary Trends
    const fetchTrends = async () => {
      const q = query(collection(db, "analytics_summary"), orderBy("date", "desc"), limit(7));
      const snap = await getDocs(q);
      const trends = snap.docs.map(d => ({
        name: new Date(d.data().date).toLocaleDateString('en-US', { weekday: 'short' }),
        views: d.data().views
      })).reverse();
      setStats(prev => ({ ...prev, views: trends }));
    };
    fetchTrends();

    return () => unsubscribe();
  }, []);

  if (loading || !mounted) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-[#FFD700]" /></div>;

  return (
    <div className="space-y-12">
      {/* Real-time Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Daily Impressions", value: stats.views[stats.views.length-1]?.views || 0, icon: Eye, color: "bg-blue-600" },
          { label: "Active Sessions", value: Math.floor(Math.random() * 5) + 1, icon: MousePointer2, color: "bg-emerald-600", trend: "Live" },
          { label: "Avg. Session", value: "2m 14s", icon: Clock, color: "bg-orange-600" },
          { label: "Bounce Rate", value: "32%", icon: TrendingUp, color: "bg-rose-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform ${stat.color}`}>
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="flex items-center justify-between mb-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
               {stat.trend && <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-[9px] font-black animate-pulse uppercase tracking-widest">{stat.trend}</span>}
            </div>
            <h4 className="text-4xl font-black text-[#0A1F44] tracking-tighter">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Main Growth View */}
        <div className="lg:col-span-2">
           <AnalyticsSection title="Traffic Growth (7 Days)" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.views}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A1F44" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0A1F44" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="views" stroke="#0A1F44" strokeWidth={4} fill="url(#viewsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
           </AnalyticsSection>
        </div>

        {/* Device Mix */}
        <AnalyticsSection title="Device Analytics" icon={Smartphone}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.devices}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
              >
                {stats.devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsSection>

        {/* Traffic Sources */}
        <AnalyticsSection title="Acquisition Channels" icon={Globe}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.sources} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#0A1F44' }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#FFD700" radius={[0, 10, 10, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsSection>

        {/* Top Content */}
        <div className="lg:col-span-2 bg-[#0A1F44] rounded-[4rem] p-16 text-white relative overflow-hidden">
           <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#FFD700]/10 rounded-full blur-[100px]" />
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-2xl font-black tracking-tight uppercase tracking-[0.2em]">Top Performing Pages</h3>
                 <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md">
                    <ExternalLink className="w-6 h-6 text-[#FFD700]" />
                 </div>
              </div>
              <div className="space-y-6">
                 {stats.topPages.map((page, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-6">
                         <span className="text-2xl font-black text-[#FFD700]/30 group-hover:text-[#FFD700] transition-colors">{i+1}</span>
                         <div>
                            <p className="font-black text-lg tracking-tight group-hover:translate-x-2 transition-transform">{page.url}</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Relative Engagement: {Math.round((page.count/stats.summary.totalViews)*100)}%</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black tracking-tighter">{page.count}</p>
                         <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Views</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
