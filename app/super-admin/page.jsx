"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/app/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { 
  Users, 
  UserCheck, 
  Clock, 
  Zap,
  Activity,
  Loader2,
  ChevronRight,
  ShieldAlert,
  ClipboardList,
  EyeOff,
  Eye,
  Settings,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.01)] relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-8 md:p-10 opacity-5 group-hover:scale-125 transition-transform ${color}`}>
      <Icon className="w-14 h-14 md:w-16 md:h-16" />
    </div>
    <div className="flex items-center justify-between mb-4">
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
    <h4 className="text-3xl md:text-4xl font-black text-[#0A1F44] tracking-tighter">{value}</h4>
    {description && <p className="text-[10px] font-bold text-gray-400 mt-2">{description}</p>}
  </div>
);

export default function SuperAdminOverview() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    setMounted(true);

    // Sync registrations
    const qReg = query(collection(db, "registrations"), orderBy("submittedAt", "desc"));
    const unsubscribeReg = onSnapshot(qReg, 
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRegistrations(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Dashboard registrations sync failed:", error);
        toast.error("Failed to sync dashboard metrics.");
        setLoading(false);
      }
    );

    // Sync audit logs
    const qLogs = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribeLogs = onSnapshot(qLogs, 
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRecentLogs(docs);
      },
      (error) => {
        console.error("Dashboard logs sync failed:", error);
      }
    );

    return () => {
      unsubscribeReg();
      unsubscribeLogs();
    };
  }, [toast]);

  // Compute stats locally based on full registrations list
  const stats = useMemo(() => {
    let totalProfiles = 0;
    let approvedLive = 0;
    let pendingReview = 0;
    let hiddenProfiles = 0;
    let unusedTokens = 0;

    registrations.forEach(r => {
      if (r.deleted === true) return;

      if (r.isTokenOnly) {
        unusedTokens++;
      } else {
        totalProfiles++;
        const isApproved = r.approved === true && r.profileCompleted === true && r.visible === true;
        if (isApproved) {
          approvedLive++;
        } else if (r.visible === false) {
          hiddenProfiles++;
        } else {
          pendingReview++;
        }
      }
    });

    return {
      totalProfiles,
      approvedLive,
      pendingReview,
      hiddenProfiles,
      unusedTokens
    };
  }, [registrations]);

  const recentRegistrations = useMemo(() => {
    return registrations
      .filter(r => !r.isTokenOnly && r.deleted !== true)
      .slice(0, 5);
  }, [registrations]);

  if (loading || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#FFD700]" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Operations Center</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Candidates" 
          value={stats.totalProfiles} 
          icon={Users} 
          color="bg-[#0A1F44]" 
          description="Registered profiles in database"
        />
        <StatCard 
          title="Approved & Live" 
          value={stats.approvedLive} 
          icon={UserCheck} 
          color="bg-emerald-600" 
          description="Profiles visible to public"
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pendingReview} 
          icon={Clock} 
          color="bg-amber-600" 
          description="Awaiting administrator verification"
        />
        <StatCard 
          title="Invitation Tokens" 
          value={stats.unusedTokens} 
          icon={Zap} 
          color="bg-purple-600" 
          description="Unused access codes available"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Recent Registrations */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.01)] flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-black text-[#0A1F44] tracking-tight uppercase tracking-wider">Awaiting Verification</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Latest user sign ups</p>
            </div>
            <Link 
              href="/super-admin/registrations" 
              className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {recentRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">No profiles registered yet</p>
              </div>
            ) : (
              recentRegistrations.map((item) => {
                const isApproved = item.approved === true && item.profileCompleted === true && item.visible === true;
                const isHidden = item.visible === false;

                return (
                  <Link
                    key={item.id}
                    href={`/super-admin/registrations/${item.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 hover:border-gray-100/80 transition-all border border-transparent"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shadow-inner border border-gray-200/50 shrink-0">
                        {item.profileImageUrl ? (
                          <img src={item.profileImageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-[#0A1F44]/15 text-lg">
                            {item.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-[#0A1F44] tracking-tight truncate">{item.name || "Unnamed Profile"}</p>
                        <p className="text-[9px] font-bold text-[#FFD700] uppercase mt-0.5 tracking-wider">{item.token}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isApproved ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-wider">Live</span>
                      ) : isHidden ? (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[8px] font-black uppercase tracking-wider">Hidden</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-wider">Pending</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFD700] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Control Center & Activity Audit Logs */}
        <div className="space-y-8 flex flex-col">
          {/* Quick Actions (Control Center) */}
          <div className="bg-[#0A1F44] rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shrink-0 shadow-2xl shadow-[#0A1F44]/20">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Activity className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase tracking-wider">Control Center</h3>
                <p className="text-white/40 font-bold text-xs tracking-wider uppercase mt-1">Quick operational links</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/super-admin/tokens" className="bg-white/5 hover:bg-[#FFD700] hover:text-[#0A1F44] p-5 rounded-2xl transition-all border border-white/5 group">
                  <Zap className="w-5 h-5 mb-2.5 text-[#FFD700] group-hover:scale-110 transition-transform" />
                  <p className="font-black text-[10px] uppercase tracking-widest">Create Access Codes</p>
                </Link>
                <Link href="/super-admin/media" className="bg-white/5 hover:bg-[#FFD700] hover:text-[#0A1F44] p-5 rounded-2xl transition-all border border-white/5 group">
                  <ImageIcon className="w-5 h-5 mb-2.5 text-[#FFD700] group-hover:scale-110 transition-transform" />
                  <p className="font-black text-[10px] uppercase tracking-widest">Manage Gallery</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Real-time Audit Logs Feed */}
          <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.01)] flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-[#0A1F44]/5 text-[#0A1F44]">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-[#0A1F44]">Admin Audit Logs</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time action history</p>
              </div>
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[250px] scrollbar-hide">
              {recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 text-center text-gray-400">
                  <ShieldAlert className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="font-bold text-[10px] uppercase tracking-widest">No activities logged yet</p>
                </div>
              ) : (
                recentLogs.map((log) => {
                  let badgeColor = "bg-blue-50 text-blue-600";
                  if (log.action === "approve") badgeColor = "bg-emerald-50 text-emerald-600";
                  if (log.action === "reject" || log.action === "soft_delete") badgeColor = "bg-rose-50 text-rose-600";
                  if (log.action === "hide") badgeColor = "bg-amber-50 text-amber-600";

                  const formattedDate = log.timestamp?.toDate 
                    ? new Date(log.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Just now";

                  return (
                    <div key={log.id} className="p-3.5 bg-gray-50/50 border border-gray-100/50 rounded-2xl flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md font-black text-[8px] uppercase tracking-wider ${badgeColor}`}>
                            {log.action}
                          </span>
                          <span className="font-black text-[#0A1F44] tracking-tight truncate max-w-[120px]">
                            {log.targetName}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight truncate">
                          By: {log.adminEmail}
                        </p>
                      </div>
                      <span className="text-[9px] font-black text-gray-300 shrink-0 uppercase tracking-wider">
                        {formattedDate}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
