"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  ArrowUpRight,
  UserPlus,
  CalendarClock,
  Sparkles,
  BadgeCheck,
  AlertTriangle,
  CircleDashed,
  UserCircle2
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

const StatCard = ({ title, value, icon: Icon, helper, accentClass, iconClass }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-slate-200/60"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="mt-3 text-3xl font-black text-[#0A1F44] tracking-tight">{value}</h3>
        {helper && <p className="mt-2 text-sm text-slate-500 font-medium">{helper}</p>}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass}`}>
        <Icon className={`w-6 h-6 ${iconClass}`} />
      </div>
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
  const [recentSummary, setRecentSummary] = useState({
    thisWeek: 0,
    completionRate: 0,
    malePercentage: 0,
  });

  const profileQueue = useMemo(() => {
    return recentRegistrations.map((user) => ({
      ...user,
      displayName: user.name || "Untitled profile",
      location: user.profile?.village || user.profile?.placeOfBirth || "Location not set",
      details: [user.profile?.gender, user.profile?.age ? `${user.profile.age} yrs` : null]
        .filter(Boolean)
        .join(" • ") || "Profile details pending",
      statusLabel: user.profileCompleted ? "Approved" : "Needs review",
      statusClass: user.profileCompleted
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-amber-50 text-amber-700 border-amber-100",
      statusIcon: user.profileCompleted ? BadgeCheck : CircleDashed,
    }));
  }, [recentRegistrations]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const q = query(collection(db, "registrations"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 6);

        const total = docs.length;
        const completed = docs.filter(d => d.profileCompleted).length;
        const pending = total - completed;
        const male = docs.filter(d => d.profile?.gender === "Male").length;
        const female = docs.filter(d => d.profile?.gender === "Female").length;
        const today = docs.filter(d => d.submittedAt?.toDate() >= todayStart).length;
        const thisWeek = docs.filter((d) => d.submittedAt?.toDate() >= weekStart).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const malePercentage = total > 0 ? Math.round((male / total) * 100) : 0;

        setStats({ total, completed, pending, male, female, today });
        setRecentSummary({ thisWeek, completionRate, malePercentage });

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
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-[#0A1F44] via-[#102B5F] to-[#153774] p-6 md:p-8 text-white shadow-[0_24px_60px_-30px_rgba(10,31,68,0.7)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              Daily overview
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Keep registrations moving without hunting for context.</h1>
            <p className="mt-3 max-w-xl text-sm font-medium text-white/70 md:text-base">
              Review the queue, spot incomplete profiles early, and jump straight into the work that needs attention.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">Today</p>
              <p className="mt-2 text-2xl font-black">{stats.today}</p>
              <p className="mt-1 text-sm text-white/65">New registrations received</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">This week</p>
              <p className="mt-2 text-2xl font-black">{recentSummary.thisWeek}</p>
              <p className="mt-1 text-sm text-white/65">Profiles created in the last 7 days</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">Completion rate</p>
              <p className="mt-2 text-2xl font-black">{recentSummary.completionRate}%</p>
              <p className="mt-1 text-sm text-white/65">Profiles ready for review</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link 
            href="/admin/registrations"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFD700] px-5 py-3 font-bold text-[#0A1F44] shadow-lg shadow-[#FFD700]/20 transition-transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            Review profiles
          </Link>
          <Link 
            href="/admin/analytics"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3 font-bold text-white transition-colors hover:bg-white/12"
          >
            <TrendingUp className="w-4 h-4" />
            View analytics
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Registered"
          value={stats.total}
          icon={Users}
          helper="All profiles in the system"
          accentClass="bg-blue-50"
          iconClass="text-blue-600"
        />
        <StatCard
          title="Completed Profiles"
          value={stats.completed}
          icon={UserCheck}
          helper={`${recentSummary.completionRate}% of the total queue`}
          accentClass="bg-emerald-50"
          iconClass="text-emerald-600"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={AlertTriangle}
          helper="Profiles that still need moderation"
          accentClass="bg-amber-50"
          iconClass="text-amber-600"
        />
        <StatCard
          title="Male / Female"
          value={`${stats.male} / ${stats.female}`}
          icon={UserCircle2}
          helper={`${recentSummary.malePercentage}% male registrations`}
          accentClass="bg-purple-50"
          iconClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        {/* Registration Chart */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-[#0A1F44] tracking-tight">Registration Trends</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">A quick read on daily intake across the last week.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7D6] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#9A7A00]">
              <CalendarClock className="w-3.5 h-3.5" />
              Last 7 days
            </div>
          </div>
          <div className="mt-6 h-[300px] w-full">
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
                    borderRadius: '1rem', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 16px 40px -24px rgb(15 23 42 / 0.35)',
                    padding: '0.75rem'
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

        {/* Work Queue */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-black text-[#0A1F44] tracking-tight">Review Queue</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Recent submissions with their current moderation status.</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Live
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {profileQueue.map((user) => {
              const StatusIcon = user.statusIcon;
              return (
                <Link
                  key={user.id}
                  href={`/admin/registrations/${user.id}`}
                  className="flex items-center gap-4 rounded-[1.5rem] border border-slate-200 px-4 py-4 transition-all hover:border-[#FFD700]/50 hover:bg-[#FFFDF3]"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-100 flex-shrink-0">
                    {user.profileImageUrl ? (
                      <Image src={user.profileImageUrl} alt="" fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#0A1F44]/30 font-black">
                        {user.displayName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-black tracking-tight text-[#0A1F44]">{user.displayName}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${user.statusClass}`}>
                        <StatusIcon className="w-3 h-3" />
                        {user.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{user.token || "No token assigned"}</p>
                    <p className="mt-2 text-sm font-medium text-slate-500">{user.location}</p>
                    <p className="text-xs font-semibold text-slate-400">{user.details}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-300" />
                </Link>
              );
            })}
            {profileQueue.length === 0 && (
              <p className="rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-semibold text-slate-400">
                No recent registrations yet.
              </p>
            )}
          </div>

          <Link 
            href="/admin/registrations"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0A1F44] transition-colors hover:text-[#9A7A00]"
          >
            Open full moderation list
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#0A1F44] tracking-tight">What needs attention</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">A plain-language summary of the current queue.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Backlog</p>
              <p className="mt-2 text-2xl font-black text-[#0A1F44]">{stats.pending}</p>
              <p className="mt-1 text-sm text-slate-500">Profiles are still waiting for review.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Approved</p>
              <p className="mt-2 text-2xl font-black text-[#0A1F44]">{stats.completed}</p>
              <p className="mt-1 text-sm text-slate-500">Profiles currently marked complete.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">New today</p>
              <p className="mt-2 text-2xl font-black text-[#0A1F44]">{stats.today}</p>
              <p className="mt-1 text-sm text-slate-500">Fresh submissions added since midnight.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#FFE7A3] bg-[#FFFBEA] p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A7A00]">Quick next step</p>
          <h3 className="mt-2 text-lg font-black tracking-tight text-[#0A1F44]">Start with incomplete profiles</h3>
          <p className="mt-2 text-sm font-medium text-[#5C5A4F]">
            That queue has the highest chance of needing a follow-up or manual cleanup before profiles can go live.
          </p>
          <Link
            href="/admin/registrations"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0A1F44] px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Open registrations
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
