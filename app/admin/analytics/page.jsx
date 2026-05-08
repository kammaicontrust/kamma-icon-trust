"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Filter,
  Loader2
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

const COLORS = ['#0A1F44', '#FFD700', '#E5C100', '#1A3A72', '#CBD5E1'];

const AnalyticsCard = ({ title, children, fullWidth = false }) => (
  <div className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm ${fullWidth ? 'lg:col-span-3' : ''}`}>
    <h3 className="text-lg font-black text-[#0A1F44] tracking-tight uppercase tracking-[0.1em] mb-8">{title}</h3>
    <div className="h-[300px] w-full">
      {children}
    </div>
  </div>
);

export default function AdminAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    trends: [],
    gender: [],
    marital: [],
    age: [],
    education: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "registrations"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setData(docs);

        // Process Trends (Daily for last 14 days)
        const dailyTrends = {};
        docs.forEach(doc => {
          const date = doc.submittedAt?.toDate().toISOString().split('T')[0];
          if (date) dailyTrends[date] = (dailyTrends[date] || 0) + 1;
        });
        const trends = Object.keys(dailyTrends).sort().slice(-14).map(date => ({
          name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: dailyTrends[date]
        }));

        // Process Gender
        const genderCounts = { Male: 0, Female: 0 };
        docs.forEach(doc => {
          const g = doc.profile?.gender;
          if (g) genderCounts[g] = (genderCounts[g] || 0) + 1;
        });
        const gender = Object.keys(genderCounts).map(name => ({ name, value: genderCounts[name] }));

        // Process Marital Status
        const maritalCounts = {};
        docs.forEach(doc => {
          const m = doc.profile?.maritalStatus;
          if (m) maritalCounts[m] = (maritalCounts[m] || 0) + 1;
        });
        const marital = Object.keys(maritalCounts).map(name => ({ name, value: maritalCounts[name] }));

        // Process Education (Top 5)
        const eduCounts = {};
        docs.forEach(doc => {
          const e = doc.profile?.education;
          if (e) eduCounts[e] = (eduCounts[e] || 0) + 1;
        });
        const education = Object.keys(eduCounts)
          .sort((a,b) => eduCounts[b] - eduCounts[a])
          .slice(0, 5)
          .map(name => ({ name, count: eduCounts[name] }));

        // Process Age Groups
        const ageGroups = { '18-25': 0, '26-30': 0, '31-35': 0, '36+': 0 };
        docs.forEach(doc => {
          const age = parseInt(doc.profile?.age);
          if (age) {
            if (age <= 25) ageGroups['18-25']++;
            else if (age <= 30) ageGroups['26-30']++;
            else if (age <= 35) ageGroups['31-35']++;
            else ageGroups['36+']++;
          }
        });
        const age = Object.keys(ageGroups).map(name => ({ name, count: ageGroups[name] }));

        setAnalytics({ trends, gender, marital, age, education });

      } catch (error) {
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A1F44] tracking-tight">Data Insights</h1>
          <p className="text-gray-500 font-medium">Demographic breakdown and platform growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-[#0A1F44] border border-gray-100 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" />
            Full Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Chart */}
        <AnalyticsCard title="Registration Growth (Last 14 Days)" fullWidth>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.trends}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A1F44" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0A1F44" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="count" stroke="#0A1F44" strokeWidth={3} fillOpacity={1} fill="url(#analyticsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Gender Distribution */}
        <AnalyticsCard title="Gender Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.gender}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.gender.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Marital Status */}
        <AnalyticsCard title="Marital Status Split">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.marital}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.marital.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Age Distribution */}
        <AnalyticsCard title="Age Groups">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.age}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#FFD700" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>
    </div>
  );
}
